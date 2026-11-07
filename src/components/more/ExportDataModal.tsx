import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Table,
  X,
} from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";
import {
  ExportFormat,
  ExportScope,
  exportFinancialData,
} from "@/services/export/exportData";
import { MONTHS_FULL } from "@/components/ui/MonthYearPickerModal";

interface ExportDataModalProps {
  visible: boolean;
  onClose: () => void;
  defaultYear?: number;
  defaultMonthIdx?: number;
}

const ExportDataModal = ({
  visible,
  onClose,
  defaultYear,
  defaultMonthIdx,
}: ExportDataModalProps) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;
  const subBg = isDark ? "#182235" : "#F3F4F6";

  const now = new Date();
  const year = defaultYear ?? now.getFullYear();
  const monthIdx = defaultMonthIdx ?? now.getMonth();
  const monthKey = `${year}-${String(monthIdx + 1).padStart(2, "0")}`;
  const monthLabel = `${MONTHS_FULL[monthIdx]} ${year}`;

  const [scope, setScope] = useState<ExportScope>("month");
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const periodLabel =
    scope === "month"
      ? monthLabel
      : scope === "year"
        ? `Tahun ${year}`
        : "Semua Waktu";

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportFinancialData({
        format,
        scope,
        monthKey,
        year,
        periodLabel,
      });
      onClose();
    } catch (err: any) {
      Alert.alert(
        "Gagal Mengekspor Data",
        err?.message ?? "Terjadi kesalahan saat membuat file laporan."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.backdropDismiss} onPress={onClose} />

        <View
          style={[
            styles.modalCard,
            { backgroundColor: cardBg, borderColor: theme.border },
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View
                style={[
                  styles.headerIconBox,
                  { backgroundColor: theme.primarySoftBg },
                ]}
              >
                <Download size={17} color={theme.primaryText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Ekspor Data Keuangan
                </Text>
                <Text
                  style={[styles.modalSubtitle, { color: theme.textMuted }]}
                >
                  Unduh atau bagikan laporan dalam format CSV, Excel, atau PDF
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: subBg, borderColor: theme.border },
              ]}
            >
              <X size={16} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Pilih Rentang Waktu */}
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
            Rentang Periode Data
          </Text>
          <View style={styles.scopeRow}>
            {(
              [
                { key: "month", label: monthLabel },
                { key: "year", label: `Tahun ${year}` },
                { key: "all", label: "Semua Waktu" },
              ] as const
            ).map((opt) => {
              const active = scope === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.8}
                  onPress={() => setScope(opt.key)}
                  style={[
                    styles.scopeChip,
                    {
                      backgroundColor: active ? theme.primarySoftBg : subBg,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.scopeChipText,
                      { color: active ? theme.primaryText : theme.text },
                    ]}
                    numberOfLines={1}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Pilih Format File */}
          <Text
            style={[
              styles.sectionLabel,
              { color: theme.textMuted, marginTop: 14 },
            ]}
          >
            Format File Ekspor
          </Text>
          <View style={styles.formatList}>
            {[
              {
                key: "pdf" as ExportFormat,
                title: "Dokumen PDF (.pdf)",
                desc: "Laporan rapi berisi ringkasan, saldo dompet, anggaran & tabel transaksi siap cetak",
                icon: <FileText size={18} color="#EF4444" />,
                badgeBg: "rgba(239, 68, 68, 0.12)",
              },
              {
                key: "excel" as ExportFormat,
                title: "Microsoft Excel (.xls)",
                desc: "Spreadsheet tabel lengkap untuk dibuka di Excel, WPS, atau Google Sheets",
                icon: <FileSpreadsheet size={18} color="#10B981" />,
                badgeBg: "rgba(16, 185, 129, 0.12)",
              },
              {
                key: "csv" as ExportFormat,
                title: "File CSV (.csv)",
                desc: "Data teks terpisah koma ringan untuk olah data & impor ke aplikasi lain",
                icon: <Table size={18} color="#0EA5E9" />,
                badgeBg: "rgba(14, 165, 233, 0.12)",
              },
            ].map((item) => {
              const selected = format === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.8}
                  onPress={() => setFormat(item.key)}
                  style={[
                    styles.formatCard,
                    {
                      backgroundColor: selected ? theme.primarySoftBg : subBg,
                      borderColor: selected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.formatIconWrap,
                      { backgroundColor: item.badgeBg },
                    ]}
                  >
                    {item.icon}
                  </View>
                  <View style={styles.formatInfo}>
                    <Text
                      style={[
                        styles.formatTitle,
                        { color: selected ? theme.primaryText : theme.text },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[styles.formatDesc, { color: theme.textMuted }]}
                    >
                      {item.desc}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isExporting}
            onPress={handleExport}
            style={[
              styles.exportBtn,
              {
                backgroundColor: theme.primary,
                opacity: isExporting ? 0.65 : 1,
              },
            ]}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#0A1402" />
            ) : (
              <>
                <Download size={16} color="#0A1402" strokeWidth={2.4} />
                <Text style={styles.exportBtnText}>
                  Ekspor {format.toUpperCase()} ({periodLabel})
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ExportDataModal;

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  backdropDismiss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  modalSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  scopeRow: {
    flexDirection: "row",
    gap: 8,
  },
  scopeChip: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.2,
    alignItems: "center",
    justifyContent: "center",
  },
  scopeChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  formatList: {
    gap: 8,
  },
  formatCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.2,
  },
  formatIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  formatInfo: {
    flex: 1,
  },
  formatTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  formatDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  exportBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  exportBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0A1402",
  },
});
