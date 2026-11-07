import { Alert } from "react-native";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import { and, desc, eq, gte, lt } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, transactions, wallets } from "@/db/schema";
import { formatRupiah } from "@/lib/formatterRupiah";
import { monthFormatter } from "@/services/reports/plugin";
import { byCategory, walletBalances } from "@/services/reports/reports";
import {
  TRANSFER_IN_CATEGORY_NAME,
  TRANSFER_OUT_CATEGORY_NAME,
} from "@/services/wallets/wallets";

export type ExportFormat = "csv" | "excel" | "pdf";
export type ExportScope = "month" | "year" | "all";

export interface ExportFinancialOptions {
  format: ExportFormat;
  scope: ExportScope;
  monthKey: string; // YYYY-MM
  year: number;
  periodLabel: string;
}

const escapeCsvCell = (val: string | number | null | undefined): string => {
  const str = String(val ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const escapeHtml = (val: string | number | null | undefined): string => {
  return String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

const formatDisplayDate = (isoOrDate: string): string => {
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) {
    return isoOrDate.slice(0, 10);
  }
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const formatRpSigned = (amount: number): string => {
  const prefix = amount < 0 ? "-Rp " : "Rp ";
  return `${prefix}${formatRupiah(String(Math.abs(Math.round(amount))))}`;
};

/**
 * Pure JS Base64 -> Uint8Array decoder (works in Hermes without atob/Buffer)
 */
const base64ToUint8Array = (base64: string): Uint8Array => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  const clean = base64.replace(/[^A-Za-z0-9+/=]/g, "");
  const len = clean.length;
  let bufferLength = (len * 3) >>> 2;
  if (clean[len - 1] === "=") bufferLength--;
  if (clean[len - 2] === "=") bufferLength--;

  const bytes = new Uint8Array(bufferLength);
  let p = 0;

  for (let i = 0; i < len; i += 4) {
    const encoded1 = lookup[clean.charCodeAt(i)];
    const encoded2 = lookup[clean.charCodeAt(i + 1)];
    const encoded3 = lookup[clean.charCodeAt(i + 2)];
    const encoded4 = lookup[clean.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (p < bufferLength) {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (p < bufferLength) {
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
  }

  return bytes;
};

/**
 * Escapes text for PDF literal strings (...) and strips non-ASCII characters
 */
const escapePdfText = (input: string): string => {
  return input
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
};

const truncateText = (str: string, maxLen: number): string => {
  const clean = str.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, Math.max(0, maxLen - 3))}...`;
};

/**
 * Pure-JS PDF 1.4 binary generator fallback (zero native dependencies, works 100% offline in Expo Go)
 */
const generateFallbackPdfBytes = (params: {
  periodLabel: string;
  monthKey: string;
  scope: ExportScope;
  totalWalletBalance: number;
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  walletsData: Array<{
    name: string;
    initialBalance: number;
    income: number;
    expense: number;
    balance: number;
  }>;
  budgetItems: Array<{
    name: string;
    spent: number;
    limit: number | null;
    percent: number;
    status: string;
  }>;
  txRows: Array<{
    date: string;
    type: "income" | "expense";
    categoryName: string | null;
    walletName: string | null;
    note: string | null;
    amount: number;
  }>;
}): Uint8Array => {
  const PAGE_W = 595; // A4 width pt
  const PAGE_H = 842; // A4 height pt
  const MARGIN_X = 36;
  const CONTENT_W = PAGE_W - MARGIN_X * 2;

  const pages: string[][] = [[]];
  let curY = PAGE_H - 42;

  const currentStream = () => pages[pages.length - 1];

  const addNewPage = () => {
    pages.push([]);
    curY = PAGE_H - 42;
  };

  const ensureSpace = (neededPt: number) => {
    if (curY - neededPt < 44) {
      addNewPage();
    }
  };

  const drawRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    g: number,
    b: number
  ) => {
    currentStream().push(
      `${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(2)} rg ${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re f`
    );
  };

  const drawText = (
    text: string,
    x: number,
    y: number,
    size = 9,
    bold = false,
    r = 0.06,
    g = 0.09,
    b = 0.16
  ) => {
    const font = bold ? "/F2" : "/F1";
    currentStream().push(
      `BT ${font} ${size} Tf ${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(2)} rg 1 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)} Tm (${escapePdfText(text)}) Tj ET`
    );
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
    currentStream().push(
      `0.82 0.85 0.90 RG 0.6 w ${x1.toFixed(1)} ${y1.toFixed(1)} m ${x2.toFixed(1)} ${y2.toFixed(1)} l S`
    );
  };

  // Header Banner
  drawRect(MARGIN_X, curY - 36, CONTENT_W, 44, 0.08, 0.5, 0.24);
  drawText(
    "DUITKU - LAPORAN KEUANGAN",
    MARGIN_X + 14,
    curY - 12,
    14,
    true,
    1,
    1,
    1
  );
  drawText(
    `Periode: ${params.periodLabel}   |   Diekspor: ${formatDisplayDate(new Date().toISOString())}`,
    MARGIN_X + 14,
    curY - 27,
    8.5,
    false,
    0.9,
    0.98,
    0.92
  );
  curY -= 56;

  // 1. Ringkasan Keuangan
  drawText("1. RINGKASAN KEUANGAN", MARGIN_X, curY, 11, true, 0.06, 0.09, 0.16);
  curY -= 16;

  const summaryItems = [
    ["Total Saldo Aktif Dompet", formatRpSigned(params.totalWalletBalance)],
    ["Total Pemasukan", `+${formatRpSigned(params.totalIncome)}`],
    ["Total Pengeluaran", `-${formatRpSigned(params.totalExpense)}`],
    ["Arus Kas Bersih (Net)", formatRpSigned(params.netCashflow)],
  ];

  drawRect(MARGIN_X, curY - 58, CONTENT_W, 64, 0.95, 0.97, 0.99);
  summaryItems.forEach(([label, val], idx) => {
    const rowY = curY - 10 - idx * 14;
    drawText(label, MARGIN_X + 10, rowY, 9, false, 0.28, 0.33, 0.41);
    drawText(val, MARGIN_X + 240, rowY, 9.5, true, 0.06, 0.09, 0.16);
  });
  curY -= 76;

  // 2. Daftar Saldo Dompet
  ensureSpace(60);
  drawText("2. POSISI SALDO DOMPET", MARGIN_X, curY, 11, true, 0.06, 0.09, 0.16);
  curY -= 16;

  drawRect(MARGIN_X, curY - 14, CONTENT_W, 18, 0.91, 0.94, 0.97);
  drawText("Nama Dompet", MARGIN_X + 6, curY - 9, 8.5, true);
  drawText("Saldo Awal", MARGIN_X + 150, curY - 9, 8.5, true);
  drawText("Total Masuk", MARGIN_X + 260, curY - 9, 8.5, true);
  drawText("Total Keluar", MARGIN_X + 370, curY - 9, 8.5, true);
  drawText("Saldo Aktif", MARGIN_X + 455, curY - 9, 8.5, true);
  curY -= 18;

  for (const w of params.walletsData) {
    ensureSpace(20);
    drawText(truncateText(w.name, 22), MARGIN_X + 6, curY - 9, 8.5, false);
    drawText(formatRpSigned(w.initialBalance), MARGIN_X + 150, curY - 9, 8, false);
    drawText(formatRpSigned(w.income), MARGIN_X + 260, curY - 9, 8, false, 0.08, 0.5, 0.24);
    drawText(formatRpSigned(w.expense), MARGIN_X + 370, curY - 9, 8, false, 0.86, 0.15, 0.15);
    drawText(formatRpSigned(w.balance), MARGIN_X + 455, curY - 9, 8.5, true);
    drawLine(MARGIN_X, curY - 13, MARGIN_X + CONTENT_W, curY - 13);
    curY -= 16;
  }
  curY -= 12;

  // 3. Rekap Anggaran Kategori (jika bulanan)
  if (params.scope === "month" && params.budgetItems.length > 0) {
    ensureSpace(60);
    drawText(
      `3. REKAP ANGGARAN & PENGELUARAN KATEGORI (${params.monthKey})`,
      MARGIN_X,
      curY,
      11,
      true
    );
    curY -= 16;

    drawRect(MARGIN_X, curY - 14, CONTENT_W, 18, 0.91, 0.94, 0.97);
    drawText("Kategori", MARGIN_X + 6, curY - 9, 8.5, true);
    drawText("Terpakai", MARGIN_X + 150, curY - 9, 8.5, true);
    drawText("Batas Anggaran", MARGIN_X + 255, curY - 9, 8.5, true);
    drawText("Sisa Anggaran", MARGIN_X + 365, curY - 9, 8.5, true);
    drawText("Status", MARGIN_X + 465, curY - 9, 8.5, true);
    curY -= 18;

    for (const c of params.budgetItems) {
      ensureSpace(20);
      const hasLimit = c.limit !== null && c.limit > 0;
      const limitVal = c.limit ?? 0;
      const remainingVal = hasLimit ? limitVal - c.spent : 0;

      drawText(truncateText(c.name, 22), MARGIN_X + 6, curY - 9, 8.5, false);
      drawText(formatRpSigned(c.spent), MARGIN_X + 150, curY - 9, 8, false);
      drawText(
        hasLimit ? formatRpSigned(limitVal) : "Tanpa Batas",
        MARGIN_X + 255,
        curY - 9,
        8,
        false
      );
      drawText(
        hasLimit ? formatRpSigned(remainingVal) : "-",
        MARGIN_X + 365,
        curY - 9,
        8,
        false,
        remainingVal < 0 ? 0.86 : 0.08,
        remainingVal < 0 ? 0.15 : 0.5,
        remainingVal < 0 ? 0.15 : 0.24
      );
      drawText(
        truncateText(c.status.toUpperCase(), 12),
        MARGIN_X + 465,
        curY - 9,
        8,
        true
      );
      drawLine(MARGIN_X, curY - 13, MARGIN_X + CONTENT_W, curY - 13);
      curY -= 16;
    }
    curY -= 12;
  }

  // 4. Riwayat Transaksi
  ensureSpace(60);
  const txSecNum = params.scope === "month" ? "4" : "3";
  drawText(
    `${txSecNum}. RIWAYAT TRANSAKSI (${params.txRows.length} TRANSAKSI)`,
    MARGIN_X,
    curY,
    11,
    true
  );
  curY -= 16;

  const drawTxTableHeader = () => {
    drawRect(MARGIN_X, curY - 14, CONTENT_W, 18, 0.91, 0.94, 0.97);
    drawText("Tanggal", MARGIN_X + 6, curY - 9, 8.5, true);
    drawText("Tipe", MARGIN_X + 68, curY - 9, 8.5, true);
    drawText("Kategori", MARGIN_X + 135, curY - 9, 8.5, true);
    drawText("Dompet", MARGIN_X + 230, curY - 9, 8.5, true);
    drawText("Catatan", MARGIN_X + 305, curY - 9, 8.5, true);
    drawText("Nominal", MARGIN_X + 440, curY - 9, 8.5, true);
    curY -= 18;
  };

  drawTxTableHeader();

  if (params.txRows.length === 0) {
    drawText(
      "Tidak ada data transaksi pada periode ini.",
      MARGIN_X + 6,
      curY - 10,
      8.5,
      false,
      0.4,
      0.45,
      0.52
    );
    curY -= 18;
  } else {
    for (const tx of params.txRows) {
      if (curY - 20 < 44) {
        addNewPage();
        drawTxTableHeader();
      }
      const isTransfer =
        tx.categoryName === TRANSFER_IN_CATEGORY_NAME ||
        tx.categoryName === TRANSFER_OUT_CATEGORY_NAME;
      const typeLabel = isTransfer
        ? "Transfer"
        : tx.type === "income"
          ? "Masuk"
          : "Keluar";
      const prefix = tx.type === "income" ? "+" : "-";

      drawText(formatDisplayDate(tx.date), MARGIN_X + 6, curY - 9, 8, false);
      drawText(typeLabel, MARGIN_X + 68, curY - 9, 8, false);
      drawText(
        truncateText(tx.categoryName ?? "Lainnya", 16),
        MARGIN_X + 135,
        curY - 9,
        8,
        false
      );
      drawText(
        truncateText(tx.walletName ?? "Dompet", 12),
        MARGIN_X + 230,
        curY - 9,
        8,
        false
      );
      drawText(
        truncateText(tx.note || "-", 22),
        MARGIN_X + 305,
        curY - 9,
        8,
        false
      );
      drawText(
        `${prefix}${formatRpSigned(tx.amount)}`,
        MARGIN_X + 440,
        curY - 9,
        8,
        true,
        tx.type === "income" ? 0.08 : 0.86,
        tx.type === "income" ? 0.5 : 0.15,
        tx.type === "income" ? 0.24 : 0.15
      );
      drawLine(MARGIN_X, curY - 13, MARGIN_X + CONTENT_W, curY - 13);
      curY -= 16;
    }
  }

  // Assemble valid PDF 1.4 document
  const objects: string[] = [];
  // Obj 1: Catalog
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
  // Obj 2: Pages placeholder (filled after creating page objects)
  objects.push("");
  // Obj 3: Font Regular
  objects.push(
    "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj"
  );
  // Obj 4: Font Bold
  objects.push(
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj"
  );

  const pageObjIds: number[] = [];
  for (const pageOps of pages) {
    const streamContent = pageOps.join("\n");
    const contentObjId = objects.length + 1;
    objects.push(
      `${contentObjId} 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj`
    );

    const pageObjId = objects.length + 1;
    pageObjIds.push(pageObjId);
    objects.push(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj`
    );
  }

  const kidsRef = pageObjIds.map((id) => `${id} 0 R`).join(" ");
  objects[1] = `2 0 obj\n<< /Type /Pages /Kids [${kidsRef}] /Count ${pageObjIds.length} >>\nendobj`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += `${obj}\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const out = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) {
    out[i] = pdf.charCodeAt(i) & 0xff;
  }
  return out;
};

export const exportFinancialData = async (
  options: ExportFinancialOptions
): Promise<void> => {
  const { format, scope, monthKey, year, periodLabel } = options;

  // 1. Build date range filter
  const conditions = [];
  if (scope === "month") {
    const { start, end } = monthFormatter(monthKey);
    conditions.push(gte(transactions.date, start), lt(transactions.date, end));
  } else if (scope === "year") {
    conditions.push(
      gte(transactions.date, `${year}-01-01`),
      lt(transactions.date, `${year + 1}-01-01`)
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // 2. Query transactions, wallet balances, and category budgets
  const [txRows, walletsData, categoryReport] = await Promise.all([
    db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        type: transactions.type,
        note: transactions.note,
        date: transactions.date,
        createdAt: transactions.createdAt,
        categoryName: categories.name,
        walletName: wallets.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .leftJoin(wallets, eq(transactions.walletId, wallets.id))
      .where(whereClause)
      .orderBy(desc(transactions.date), desc(transactions.createdAt)),
    walletBalances(),
    byCategory(monthKey),
  ]);

  // 3. Calculate summary totals (excluding internal transfers from income/expense report totals)
  let totalIncome = 0;
  let totalExpense = 0;
  let totalTransferVolume = 0;

  for (const row of txRows) {
    const isTransfer =
      row.categoryName === TRANSFER_IN_CATEGORY_NAME ||
      row.categoryName === TRANSFER_OUT_CATEGORY_NAME;

    if (isTransfer) {
      if (row.categoryName === TRANSFER_OUT_CATEGORY_NAME) {
        totalTransferVolume += row.amount;
      }
      continue;
    }

    if (row.type === "income") {
      totalIncome += row.amount;
    } else {
      totalExpense += row.amount;
    }
  }

  const netCashflow = totalIncome - totalExpense;
  const totalWalletBalance = walletsData.reduce((acc, w) => acc + w.balance, 0);
  const safePeriodSlug = periodLabel
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_");

  const isSharingAvailable = await Sharing.isAvailableAsync();
  if (!isSharingAvailable) {
    Alert.alert(
      "Tidak Didukung",
      "Fitur berbagi/ekspor file tidak tersedia di perangkat ini."
    );
    return;
  }

  // ============================================================================
  // FORMAT 1: CSV (.csv)
  // ============================================================================
  if (format === "csv") {
    const lines: string[] = [];

    lines.push("LAPORAN KEUANGAN DUITKU");
    lines.push(`Periode,${escapeCsvCell(periodLabel)}`);
    lines.push(
      `Tanggal Ekspor,${escapeCsvCell(formatDisplayDate(new Date().toISOString()))}`
    );
    lines.push("");

    lines.push("RINGKASAN ARUS KAS");
    lines.push("Metrik,Nominal (Rp)");
    lines.push(`Total Saldo Aktif Semua Dompet,${totalWalletBalance}`);
    lines.push(`Total Pemasukan,${totalIncome}`);
    lines.push(`Total Pengeluaran,${totalExpense}`);
    lines.push(`Arus Kas Bersih (Net),${netCashflow}`);
    if (totalTransferVolume > 0) {
      lines.push(`Total Pindah Dana Antar Dompet,${totalTransferVolume}`);
    }
    lines.push("");

    lines.push("DAFTAR SALDO DOMPET");
    lines.push(
      "Nama Dompet,Saldo Awal (Rp),Total Masuk (Rp),Total Keluar (Rp),Saldo Aktif (Rp)"
    );
    for (const w of walletsData) {
      lines.push(
        [
          escapeCsvCell(w.name),
          w.initialBalance,
          w.income,
          w.expense,
          w.balance,
        ].join(",")
      );
    }
    lines.push("");

    if (scope === "month" && categoryReport.items.length > 0) {
      lines.push(`ANGGARAN & PENGELUARAN KATEGORI (${monthKey})`);
      lines.push(
        "Kategori,Terpakai (Rp),Batas Anggaran (Rp),Sisa Anggaran (Rp),Persentase (%),Status"
      );
      for (const c of categoryReport.items) {
        const limitVal = c.limit ?? 0;
        const remainingVal = c.limit !== null ? limitVal - c.spent : 0;
        lines.push(
          [
            escapeCsvCell(c.name),
            c.spent,
            c.limit !== null ? limitVal : "Tanpa Batas",
            c.limit !== null ? remainingVal : "-",
            c.limit !== null ? Math.round(c.percent) : "-",
            escapeCsvCell(c.status.toUpperCase()),
          ].join(",")
        );
      }
      lines.push("");
    }

    lines.push("RIWAYAT TRANSAKSI");
    lines.push("No,Tanggal,Tipe,Kategori,Dompet,Catatan,Nominal (Rp)");
    txRows.forEach((tx, idx) => {
      const isTransfer =
        tx.categoryName === TRANSFER_IN_CATEGORY_NAME ||
        tx.categoryName === TRANSFER_OUT_CATEGORY_NAME;
      const typeLabel = isTransfer
        ? "Pindah Dana"
        : tx.type === "income"
          ? "Pemasukan"
          : "Pengeluaran";

      lines.push(
        [
          idx + 1,
          escapeCsvCell(formatDisplayDate(tx.date)),
          escapeCsvCell(typeLabel),
          escapeCsvCell(tx.categoryName ?? "Lainnya"),
          escapeCsvCell(tx.walletName ?? "Dompet"),
          escapeCsvCell(tx.note ?? "-"),
          tx.type === "income" ? tx.amount : -tx.amount,
        ].join(",")
      );
    });

    const csvContent = `\uFEFF${lines.join("\r\n")}`;
    const fileName = `Laporan_Duitku_${safePeriodSlug}.csv`;
    const file = new File(Paths.cache, fileName);
    if (file.exists) {
      file.delete();
    }
    await file.write(csvContent);

    await Sharing.shareAsync(file.uri, {
      mimeType: "text/csv",
      UTI: "public.comma-separated-values-text",
      dialogTitle: `Ekspor CSV - ${periodLabel}`,
    });
    return;
  }

  // ============================================================================
  // HTML Generator shared by Excel (.xls) & PDF (.pdf)
  // ============================================================================
  const walletRowsHtml = walletsData
    .map(
      (w) => `
      <tr>
        <td><strong>${escapeHtml(w.name)}</strong></td>
        <td class="num">${formatRpSigned(w.initialBalance)}</td>
        <td class="num income">${formatRpSigned(w.income)}</td>
        <td class="num expense">${formatRpSigned(w.expense)}</td>
        <td class="num"><strong>${formatRpSigned(w.balance)}</strong></td>
      </tr>`
    )
    .join("");

  const budgetRowsHtml =
    scope === "month"
      ? categoryReport.items
          .map((c) => {
            const hasLimit = c.limit !== null && c.limit > 0;
            const limitVal = c.limit ?? 0;
            const remainingVal = hasLimit ? limitVal - c.spent : 0;
            return `
            <tr>
              <td><strong>${escapeHtml(c.name)}</strong></td>
              <td class="num">${formatRpSigned(c.spent)}</td>
              <td class="num">${hasLimit ? formatRpSigned(limitVal) : "Belum diatur"}</td>
              <td class="num ${remainingVal < 0 ? "expense" : "income"}">
                ${hasLimit ? formatRpSigned(remainingVal) : "-"}
              </td>
              <td class="center">${hasLimit ? `${Math.round(c.percent)}%` : "-"}</td>
              <td class="center">${escapeHtml(c.status.toUpperCase())}</td>
            </tr>`;
          })
          .join("")
      : "";

  const txRowsHtml =
    txRows.length === 0
      ? `<tr><td colspan="7" class="center">Tidak ada data transaksi pada periode ini.</td></tr>`
      : txRows
          .map((tx, idx) => {
            const isTransfer =
              tx.categoryName === TRANSFER_IN_CATEGORY_NAME ||
              tx.categoryName === TRANSFER_OUT_CATEGORY_NAME;
            const typeLabel = isTransfer
              ? "Pindah Dana"
              : tx.type === "income"
                ? "Pemasukan"
                : "Pengeluaran";
            const amountClass =
              tx.type === "income" ? "num income" : "num expense";
            const prefix = tx.type === "income" ? "+" : "-";

            return `
            <tr>
              <td class="center">${idx + 1}</td>
              <td>${escapeHtml(formatDisplayDate(tx.date))}</td>
              <td>${escapeHtml(typeLabel)}</td>
              <td>${escapeHtml(tx.categoryName ?? "Lainnya")}</td>
              <td>${escapeHtml(tx.walletName ?? "Dompet")}</td>
              <td>${escapeHtml(tx.note || "-")}</td>
              <td class="${amountClass}"><strong>${prefix}${formatRpSigned(tx.amount)}</strong></td>
            </tr>`;
          })
          .join("");

  const htmlDocument = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Laporan Keuangan Duitku - ${escapeHtml(periodLabel)}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0F172A;
            margin: 24px;
            font-size: 12px;
          }
          .header {
            border-bottom: 2px solid #65A30D;
            padding-bottom: 12px;
            margin-bottom: 18px;
          }
          .brand {
            font-size: 22px;
            font-weight: 800;
            color: #15803D;
            margin: 0;
          }
          .subtitle {
            font-size: 12px;
            color: #475569;
            margin-top: 4px;
          }
          h2 {
            font-size: 14px;
            font-weight: 700;
            color: #0F172A;
            margin-top: 20px;
            margin-bottom: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          th, td {
            border: 1px solid #CBD5E1;
            padding: 7px 9px;
            text-align: left;
          }
          th {
            background-color: #F1F5F9;
            font-weight: 700;
            color: #1E293B;
          }
          .num {
            text-align: right;
            white-space: nowrap;
          }
          .center {
            text-align: center;
          }
          .income {
            color: #15803D;
          }
          .expense {
            color: #DC2626;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <p class="brand">Duitku — Laporan Keuangan</p>
          <p class="subtitle">
            Periode: <strong>${escapeHtml(periodLabel)}</strong> • Diekspor pada ${escapeHtml(formatDisplayDate(new Date().toISOString()))}
          </p>
        </div>

        <h2>1. Ringkasan Keuangan</h2>
        <table>
          <thead>
            <tr>
              <th>Total Saldo Aktif Dompet</th>
              <th>Total Pemasukan</th>
              <th>Total Pengeluaran</th>
              <th>Arus Kas Bersih (Net)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="num"><strong>${formatRpSigned(totalWalletBalance)}</strong></td>
              <td class="num income"><strong>+${formatRpSigned(totalIncome)}</strong></td>
              <td class="num expense"><strong>-${formatRpSigned(totalExpense)}</strong></td>
              <td class="num ${netCashflow >= 0 ? "income" : "expense"}">
                <strong>${formatRpSigned(netCashflow)}</strong>
              </td>
            </tr>
          </tbody>
        </table>

        <h2>2. Posisi Saldo Dompet</h2>
        <table>
          <thead>
            <tr>
              <th>Nama Dompet</th>
              <th class="num">Saldo Awal</th>
              <th class="num">Total Masuk</th>
              <th class="num">Total Keluar</th>
              <th class="num">Saldo Aktif</th>
            </tr>
          </thead>
          <tbody>
            ${walletRowsHtml}
          </tbody>
        </table>

        ${
          scope === "month"
            ? `
        <h2>3. Rekap Anggaran & Pengeluaran Kategori (${escapeHtml(monthKey)})</h2>
        <table>
          <thead>
            <tr>
              <th>Kategori</th>
              <th class="num">Terpakai</th>
              <th class="num">Batas Anggaran</th>
              <th class="num">Sisa Anggaran</th>
              <th class="center">Pemakaian</th>
              <th class="center">Status</th>
            </tr>
          </thead>
          <tbody>
            ${budgetRowsHtml}
          </tbody>
        </table>`
            : ""
        }

        <h2>${scope === "month" ? "4" : "3"}. Riwayat Transaksi (${txRows.length} Transaksi)</h2>
        <table>
          <thead>
            <tr>
              <th class="center">No</th>
              <th>Tanggal</th>
              <th>Tipe</th>
              <th>Kategori</th>
              <th>Dompet</th>
              <th>Catatan</th>
              <th class="num">Nominal</th>
            </tr>
          </thead>
          <tbody>
            ${txRowsHtml}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // ============================================================================
  // FORMAT 2: EXCEL (.xls)
  // ============================================================================
  if (format === "excel") {
    const fileName = `Laporan_Duitku_${safePeriodSlug}.xls`;
    const file = new File(Paths.cache, fileName);
    if (file.exists) {
      file.delete();
    }
    await file.write(htmlDocument);

    await Sharing.shareAsync(file.uri, {
      mimeType: "application/vnd.ms-excel",
      UTI: "com.microsoft.excel.xls",
      dialogTitle: `Ekspor Excel - ${periodLabel}`,
    });
    return;
  }

  // ============================================================================
  // FORMAT 3: PDF (.pdf)
  // ============================================================================
  const fileName = `Laporan_Duitku_${safePeriodSlug}.pdf`;
  const destFile = new File(Paths.cache, fileName);
  if (destFile.exists) {
    destFile.delete();
  }

  let pdfBytes: Uint8Array | null = null;

  // Try native ExpoPrint with base64: true so the PDF bytes can be written inside Paths.cache
  // (avoids Expo Go FilePermissionService denial on root context.cacheDir/Print)
  try {
    const Print = await import("expo-print");
    const result = await Print.printToFileAsync({
      html: htmlDocument,
      base64: true,
    });
    if (result?.base64) {
      pdfBytes = base64ToUint8Array(result.base64);
    }
  } catch {
    // Fallback to pure-JS PDF 1.4 binary generator below
    pdfBytes = null;
  }

  if (!pdfBytes) {
    pdfBytes = generateFallbackPdfBytes({
      periodLabel,
      monthKey,
      scope,
      totalWalletBalance,
      totalIncome,
      totalExpense,
      netCashflow,
      walletsData,
      budgetItems: categoryReport.items,
      txRows,
    });
  }

  await destFile.write(pdfBytes);

  await Sharing.shareAsync(destFile.uri, {
    mimeType: "application/pdf",
    UTI: ".pdf",
    dialogTitle: `Ekspor PDF - ${periodLabel}`,
  });
};
