import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/constants/useTheme";
import HomeHeader from "@/components/home/HomeHeader";
import ActiveBalanceCard, {
  WalletSummaryItem,
} from "@/components/home/ActiveBalanceCard";
import IncomeExpenseSummary from "@/components/home/IncomeExpenseSummary";
import MonthlyTrendCard, {
  MonthlyTrendItem,
} from "@/components/home/MonthlyTrendCard";
import MonthlyBudgetSection, {
  BudgetOverviewItem,
  resolveCategoryIcon,
} from "@/components/home/MonthlyBudgetSection";
import RecentTransactionsSection, {
  RecentTransactionItem,
  resolveTransactionIcon,
} from "@/components/home/RecentTransactionsSection";
import SavingTipsBanner from "@/components/home/SavingTipsBanner";
import {
  useMonthlyTrends,
  useReportByCategory,
  useReportSummary,
  useWalletBalances,
} from "@/services/reports/hooks/useReports";
import { useTransactions } from "@/services/transactions/hooks/useTransactions";
import { monthFormatter } from "@/services/reports/plugin";
import {
  formatCompactRupiah,
  formatRupiah,
  formatShortThousand,
} from "@/lib/formatterRupiah";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const MONTHS_FULL = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const resolveWalletType = (name: string): WalletSummaryItem["type"] => {
  const lower = name.toLowerCase();
  if (
    lower.includes("cash") ||
    lower.includes("tunai") ||
    lower.includes("dompet")
  ) {
    return "cash";
  }
  if (
    lower.includes("gopay") ||
    lower.includes("ovo") ||
    lower.includes("dana") ||
    lower.includes("shopeepay") ||
    lower.includes("linkaja")
  ) {
    return "ewallet";
  }
  return "bank";
};

const formatDateIndonesian = (isoOrDate: string): string => {
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) {
    return isoOrDate;
  }
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
};

const HomeScreen = () => {
  const { theme, isDark } = useTheme();

  const now = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(
    now.getMonth()
  );
  const [monthModalVisible, setMonthModalVisible] = useState(false);

  const selectedMonthKey = `${selectedYear}-${String(
    selectedMonthIdx + 1
  ).padStart(2, "0")}`;

  const { start, end } = useMemo(
    () => monthFormatter(selectedMonthKey),
    [selectedMonthKey]
  );

  // 1. Summary & Active Balance
  const { data: summaryData } = useReportSummary(selectedMonthKey);

  // 2. Wallets
  const { data: walletRows = [] } = useWalletBalances();

  // 3. 12-Month Trend
  const { data: trendReport } = useMonthlyTrends(selectedYear);

  // 4. Monthly Budgets by Category
  const { data: categoryReport } = useReportByCategory(selectedMonthKey);

  // 5. Recent Transactions (latest 5 in selected month)
  const { data: txData } = useTransactions({
    from: start,
    to: end,
    limit: 5,
    page: 1,
  });

  // Format total active balance
  const totalBalanceFormatted = useMemo(() => {
    const bal = summaryData?.balance ?? 0;
    const prefix = bal < 0 ? "-Rp " : "Rp ";
    return `${prefix}${formatRupiah(String(Math.abs(bal)))}`;
  }, [summaryData?.balance]);

  // Format wallets for ActiveBalanceCard
  const walletItems: WalletSummaryItem[] = useMemo(() => {
    return walletRows.map((w) => ({
      id: String(w.id),
      name: w.name,
      balanceLabel: formatCompactRupiah(w.balance),
      type: resolveWalletType(w.name),
    }));
  }, [walletRows]);

  // Format income & expense summary
  const incomeFormatted = useMemo(() => {
    const inc = summaryData?.income ?? 0;
    return `+Rp ${formatRupiah(String(inc))}`;
  }, [summaryData?.income]);

  const expenseFormatted = useMemo(() => {
    const exp = summaryData?.expense ?? 0;
    return `Rp ${formatRupiah(String(exp))}`;
  }, [summaryData?.expense]);

  // Format 12-month trend data & peak label
  const { trendItems, peakLabel } = useMemo(() => {
    const raw = trendReport?.data ?? [];
    const items: MonthlyTrendItem[] = MONTHS_SHORT.map((label, idx) => {
      const found = raw[idx];
      return {
        label,
        income: found?.income ?? 0,
        expense: found?.expense ?? 0,
        isActive: idx === selectedMonthIdx,
      };
    });

    let maxExpense = 0;
    let peakMonth = MONTHS_SHORT[selectedMonthIdx];
    items.forEach((item) => {
      if (item.expense > maxExpense) {
        maxExpense = item.expense;
        peakMonth = item.label;
      }
    });

    const peak =
      maxExpense > 0
        ? `Puncak: ${peakMonth} (${formatShortThousand(maxExpense)})`
        : `Puncak: - (Rp 0)`;

    return { trendItems: items, peakLabel: peak };
  }, [trendReport?.data, selectedMonthIdx]);

  // Format budget items (prioritize categories with a budget set, otherwise show categories with spending or all expense categories)
  const budgetItems: BudgetOverviewItem[] = useMemo(() => {
    const rawItems = categoryReport?.items ?? [];
    const withLimit = rawItems.filter((item) => item.limit !== null);
    const sourceList = withLimit.length > 0 ? withLimit : rawItems;

    return sourceList.map((item) => ({
      id: String(item.id),
      name: item.name,
      spent: typeof item.spent === "number" ? item.spent : 0,
      limit: item.limit,
      icon: resolveCategoryIcon(item.name),
      status: item.status,
    }));
  }, [categoryReport?.items]);

  // Format recent transactions
  const recentTxItems: RecentTransactionItem[] = useMemo(() => {
    const rows = txData?.items ?? [];
    return rows.map((tx) => {
      const category = tx.categoryName ?? "Lainnya";
      const title = tx.note?.trim() ? tx.note : category;
      const wallet = tx.walletName ?? "Dompet";
      return {
        id: String(tx.id),
        title,
        category,
        wallet,
        dateLabel: formatDateIndonesian(tx.date),
        amount: tx.amount,
        type: tx.type,
        icon: resolveTransactionIcon(title, category, tx.type),
      };
    });
  }, [txData?.items]);

  // Dynamic saving tip
  const savingTipText = useMemo(() => {
    const overBudget = budgetItems.find(
      (b) => b.status === "melebihi" || b.status === "habis"
    );
    if (overBudget) {
      return `Anggaran ${overBudget.name.toLowerCase()} sisa 0%. Yuk tahan pengeluaran di kategori ini!`;
    }
    if ((summaryData?.expense ?? 0) > (summaryData?.income ?? 0)) {
      return "Pengeluaran bulan ini melebihi pemasukan. Catat setiap belanja agar tetap terkontrol!";
    }
    return "Keuanganmu bulan ini terkendali dengan baik. Pertahankan kebiasaan menabung!";
  }, [budgetItems, summaryData?.expense, summaryData?.income]);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <HomeHeader
          income={summaryData?.income ?? 0}
          expense={summaryData?.expense ?? 0}
          selectedMonthShort={MONTHS_SHORT[selectedMonthIdx]}
          selectedYear={String(selectedYear)}
          selectedMonthFull={`${MONTHS_FULL[selectedMonthIdx]} ${selectedYear}`}
          onPressMonthSelector={() => setMonthModalVisible(true)}
        />

        <ActiveBalanceCard
          totalBalance={totalBalanceFormatted}
          wallets={walletItems}
        />

        <IncomeExpenseSummary
          incomeAmount={incomeFormatted}
          incomeCount={summaryData?.incomeCount ?? 0}
          expenseAmount={expenseFormatted}
          expenseCount={summaryData?.expenseCount ?? 0}
        />

        <MonthlyTrendCard
          periodLabel={`Jan ${selectedYear} - Des ${selectedYear}`}
          peakLabel={peakLabel}
          data={trendItems}
          onPressDetail={() => router.push("/transaction")}
        />

        <MonthlyBudgetSection items={budgetItems} />

        <RecentTransactionsSection items={recentTxItems} />

        <SavingTipsBanner description={savingTipText} />
      </ScrollView>

      {/* Month Picker Modal */}
      <Modal
        visible={monthModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMonthModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setMonthModalVisible(false)}
        >
          <Pressable
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? "#0F1523" : theme.card,
                borderColor: theme.border,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.yearRow}>
              <TouchableOpacity
                onPress={() => setSelectedYear((y) => y - 1)}
                style={[styles.yearBtn, { borderColor: theme.border }]}
              >
                <Text style={{ color: theme.text, fontWeight: "700" }}>
                  {"<"}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.yearTitle, { color: theme.text }]}>
                {selectedYear}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedYear((y) => y + 1)}
                style={[styles.yearBtn, { borderColor: theme.border }]}
              >
                <Text style={{ color: theme.text, fontWeight: "700" }}>
                  {">"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.monthsGrid}>
              {MONTHS_SHORT.map((label, idx) => {
                const isSelected = idx === selectedMonthIdx;
                return (
                  <TouchableOpacity
                    key={label}
                    style={[
                      styles.monthChip,
                      {
                        backgroundColor: isSelected
                          ? theme.primary
                          : isDark
                            ? "#182235"
                            : "#F3F4F6",
                      },
                    ]}
                    onPress={() => {
                      setSelectedMonthIdx(idx);
                      setMonthModalVisible(false);
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected ? "#0A1402" : theme.text,
                        fontWeight: isSelected ? "800" : "600",
                        fontSize: 13,
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
  },
  yearRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  yearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  yearTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  monthsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
  },
  monthChip: {
    width: "30%",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
});
