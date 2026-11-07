import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";
import { formatRupiah } from "@/lib/formatterRupiah";

interface BudgetHeroCardProps {
  selectedMonthShort: string;
  selectedYear: string;
  selectedMonthFull: string;
  totalBudgetedSpent: number;
  totalLimit: number;
  safeCount: number;
  overCount: number;
  onPressMonthSelector: () => void;
}

const BudgetHeroCard = ({
  selectedMonthShort,
  selectedYear,
  selectedMonthFull,
  totalBudgetedSpent,
  totalLimit,
  safeCount,
  overCount,
  onPressMonthSelector,
}: BudgetHeroCardProps) => {
  const { theme, isDark } = useTheme();

  const totalRemaining = totalLimit - totalBudgetedSpent;
  const totalProgressPct =
    totalLimit > 0 ? Math.min((totalBudgetedSpent / totalLimit) * 100, 100) : 0;

  return (
    <View>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={[styles.pageTitle, { color: theme.text }]}>
            Anggaran Bulan Ini
          </Text>
          <Text style={[styles.pageSubtitle, { color: theme.textMuted }]}>
            Kelola batas pengeluaran periode {selectedMonthFull} {selectedYear}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressMonthSelector}
          style={[
            styles.monthSelector,
            {
              backgroundColor: isDark ? "#111726" : theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <Text
            style={[styles.monthSelectorText, { color: theme.text }]}
            numberOfLines={1}
          >
            {selectedMonthShort} {selectedYear}
          </Text>
          <ChevronDown size={14} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Hero Summary Card */}
      <View style={[styles.heroCard, { backgroundColor: theme.primary }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroLabelRow}>
            <View style={styles.heroDot} />
            <Text style={styles.heroLabel}>TOTAL ANGGARAN AKTIF</Text>
          </View>
          <Text style={styles.heroPctText}>
            {Math.round(totalProgressPct)}% Terpakai
          </Text>
        </View>

        <Text style={styles.heroMainAmount}>
          Rp {formatRupiah(String(totalBudgetedSpent))}{" "}
          <Text style={styles.heroLimitSub}>
            / Rp {formatRupiah(String(totalLimit))}
          </Text>
        </Text>

        <View style={styles.heroProgressTrack}>
          <View
            style={[
              styles.heroProgressFill,
              {
                width: `${totalProgressPct}%`,
                backgroundColor:
                  totalBudgetedSpent > totalLimit ? "#DC2626" : "#0A1402",
              },
            ]}
          />
        </View>

        <View style={styles.heroMiniRow}>
          <View style={styles.heroMiniCard}>
            <Text style={styles.heroMiniLabel}>Sisa Anggaran</Text>
            <Text
              style={[
                styles.heroMiniVal,
                totalRemaining < 0 && { color: "#DC2626" },
              ]}
            >
              {totalRemaining < 0 ? "-Rp " : "Rp "}
              {formatRupiah(String(Math.abs(totalRemaining)))}
            </Text>
          </View>

          <View style={styles.heroMiniCard}>
            <Text style={styles.heroMiniLabel}>Kategori Aman</Text>
            <Text style={styles.heroMiniVal}>{safeCount} Kategori</Text>
          </View>

          <View style={styles.heroMiniCard}>
            <Text style={styles.heroMiniLabel}>Melebihi</Text>
            <Text
              style={[
                styles.heroMiniVal,
                overCount > 0 && { color: "#DC2626" },
              ]}
            >
              {overCount} Kategori
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default BudgetHeroCard;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  titleCol: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  monthSelectorText: {
    fontSize: 12,
    fontWeight: "700",
  },
  heroCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1A2E05",
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: "#1A2E05",
  },
  heroPctText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1A2E05",
  },
  heroMainAmount: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0A1402",
    marginTop: 6,
  },
  heroLimitSub: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2E470B",
  },
  heroProgressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(0, 0, 0, 0.14)",
    marginTop: 12,
    marginBottom: 14,
    overflow: "hidden",
  },
  heroProgressFill: {
    height: "100%",
    borderRadius: 999,
  },
  heroMiniRow: {
    flexDirection: "row",
    gap: 8,
  },
  heroMiniCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  heroMiniLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4B5563",
  },
  heroMiniVal: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
  },
});
