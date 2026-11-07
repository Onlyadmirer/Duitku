import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BarChart3, ChevronRight, Download, Upload } from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";

interface FinancialReportMenuCardProps {
  onPress: () => void;
  onPressExport?: () => void;
  onPressImport?: () => void;
}

const FinancialReportMenuCard = ({
  onPress,
  onPressExport,
  onPressImport,
}: FinancialReportMenuCardProps) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;

  return (
    <View style={styles.section}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor: theme.border },
        ]}
      >
        <View
          style={[
            styles.iconBox,
            { backgroundColor: theme.primarySoftBg },
          ]}
        >
          <BarChart3 size={22} color={theme.primaryText} />
        </View>

        <View style={styles.textCol}>
          <Text style={[styles.title, { color: theme.text }]}>
            Laporan Keuangan
          </Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Analisis arus kas, distribusi pengeluaran kategori & rekap tahunan
          </Text>
        </View>

        <View
          style={[
            styles.chevronBox,
            {
              backgroundColor: isDark ? "#182235" : "#F3F4F6",
              borderColor: theme.border,
            },
          ]}
        >
          <ChevronRight size={18} color={theme.text} />
        </View>
      </TouchableOpacity>

      {onPressExport && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressExport}
          style={[
            styles.exportCard,
            { backgroundColor: cardBg, borderColor: theme.border },
          ]}
        >
          <View
            style={[
              styles.exportIconBox,
              { backgroundColor: theme.primarySoftBg },
            ]}
          >
            <Download size={19} color={theme.primaryText} />
          </View>

          <View style={styles.textCol}>
            <Text style={[styles.exportTitle, { color: theme.text }]}>
              Ekspor Data (CSV / Excel / PDF)
            </Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Unduh & bagikan rekap transaksi, dompet, serta anggaran keuanganmu
            </Text>
          </View>

          <View
            style={[
              styles.exportBadge,
              {
                backgroundColor: theme.primarySoftBg,
                borderColor: theme.primarySoftBorder,
              },
            ]}
          >
            <Text
              style={[styles.exportBadgeText, { color: theme.primaryText }]}
            >
              Ekspor
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {onPressImport && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressImport}
          style={[
            styles.exportCard,
            { backgroundColor: cardBg, borderColor: theme.border },
          ]}
        >
          <View
            style={[
              styles.exportIconBox,
              { backgroundColor: theme.primarySoftBg },
            ]}
          >
            <Upload size={19} color={theme.primaryText} />
          </View>

          <View style={styles.textCol}>
            <Text style={[styles.exportTitle, { color: theme.text }]}>
              Impor Data Web (JSON)
            </Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Migrasi & ganti data aplikasi menggunakan file `duitku-export` JSON
            </Text>
          </View>

          <View
            style={[
              styles.exportBadge,
              {
                backgroundColor: theme.primarySoftBg,
                borderColor: theme.primarySoftBorder,
              },
            ]}
          >
            <Text
              style={[styles.exportBadgeText, { color: theme.primaryText }]}
            >
              Impor
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default FinancialReportMenuCard;

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  exportCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  exportIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
  },
  exportTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },
  chevronBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  exportBadge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  exportBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
});
