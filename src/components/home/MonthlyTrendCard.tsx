import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";

export interface MonthlyTrendItem {
  label: string;
  income: number;
  expense: number;
  isActive?: boolean;
}

interface MonthlyTrendCardProps {
  periodLabel?: string;
  peakLabel?: string;
  data?: MonthlyTrendItem[];
  onPressDetail?: () => void;
}

const DEFAULT_TREND_DATA: MonthlyTrendItem[] = [
  { label: "Jan", income: 0, expense: 0 },
  { label: "Feb", income: 0, expense: 0 },
  { label: "Mar", income: 0, expense: 0 },
  { label: "Apr", income: 0, expense: 0 },
  { label: "Mei", income: 0, expense: 0 },
  { label: "Jun", income: 0, expense: 0 },
  { label: "Jul", income: 0, expense: 0 },
  { label: "Agu", income: 0, expense: 0 },
  { label: "Sep", income: 0, expense: 0 },
  { label: "Okt", income: 0, expense: 0 },
  { label: "Nov", income: 26366, expense: 658813, isActive: true },
  { label: "Des", income: 0, expense: 0 },
];

const MAX_BAR_HEIGHT = 68;

const MonthlyTrendCard = ({
  periodLabel = "Jan 2026 - Des 2026",
  peakLabel = "Puncak: Nov (Rp 658k)",
  data = DEFAULT_TREND_DATA,
  onPressDetail,
}: MonthlyTrendCardProps) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;

  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.income, d.expense)),
    1
  );

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor: theme.border },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>
            Tren 12 Bulan
          </Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            {periodLabel}
          </Text>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: theme.primary }]}
            />
            <Text style={[styles.legendText, { color: theme.textMuted }]}>
              Masuk
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: isDark ? "#FFFFFF" : "#111111" },
              ]}
            />
            <Text style={[styles.legendText, { color: theme.textMuted }]}>
              Keluar
            </Text>
          </View>
        </View>
      </View>

      {/* Chart Area */}
      <View style={styles.chartContainer}>
        {/* Dashed Mid Grid Line */}
        <View
          style={[
            styles.dashedLine,
            { borderColor: isDark ? "#1E293B" : "#E5E7EB" },
          ]}
        />

        <View style={styles.barsRow}>
          {data.map((item) => {
            const hasIncome = item.income > 0;
            const hasExpense = item.expense > 0;

            const incomeHeight = hasIncome
              ? Math.max((item.income / maxValue) * MAX_BAR_HEIGHT, 18)
              : 8;
            const expenseHeight = hasExpense
              ? Math.max((item.expense / maxValue) * MAX_BAR_HEIGHT, 18)
              : 13;

            const inactiveBarColor = isDark ? "#1C2536" : "#E5E7EB";

            return (
              <View key={item.label} style={styles.monthColumn}>
                <View style={styles.barPairWrap}>
                  {/* Income Bar */}
                  <View
                    style={[
                      styles.bar,
                      {
                        height: incomeHeight,
                        backgroundColor: hasIncome
                          ? theme.primary
                          : inactiveBarColor,
                      },
                    ]}
                  />
                  {/* Expense Bar */}
                  <View
                    style={[
                      styles.bar,
                      {
                        height: expenseHeight,
                        backgroundColor: hasExpense
                          ? isDark
                            ? "#FFFFFF"
                            : "#111111"
                          : inactiveBarColor,
                      },
                      hasExpense && styles.activeExpenseBarGlow,
                    ]}
                  />
                </View>

                <Text
                  style={[
                    styles.monthLabel,
                    {
                      color: item.isActive ? theme.primary : theme.textMuted,
                      fontWeight: item.isActive ? "800" : "500",
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Footer */}
      <View
        style={[
          styles.footerRow,
          { borderTopColor: isDark ? "#1A2234" : theme.border },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onPressDetail}
          style={styles.detailLinkBtn}
        >
          <Text style={[styles.detailLinkText, { color: theme.primary }]}>
            Lihat rincian data tren
          </Text>
          <ArrowRight size={13} color={theme.primary} strokeWidth={2.5} />
        </TouchableOpacity>

        <Text style={[styles.peakText, { color: theme.textMuted }]}>
          {peakLabel}
        </Text>
      </View>
    </View>
  );
};

export default MonthlyTrendCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    marginBottom: 22,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 2,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: "500",
  },
  chartContainer: {
    marginTop: 22,
    marginBottom: 14,
    position: "relative",
    justifyContent: "flex-end",
  },
  dashedLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 34,
    borderBottomWidth: 1,
    borderStyle: "dashed",
  },
  barsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  monthColumn: {
    alignItems: "center",
    flex: 1,
  },
  barPairWrap: {
    height: MAX_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  bar: {
    width: 5.5,
    borderRadius: 3,
  },
  activeExpenseBarGlow: {
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 5,
  },
  monthLabel: {
    fontSize: 10,
    marginTop: 8,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  detailLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailLinkText: {
    fontSize: 11,
    fontWeight: "700",
  },
  peakText: {
    fontSize: 11,
  },
});
