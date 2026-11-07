import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { ArrowRight } from "lucide-react-native";
import { BarChart, barDataItem } from "react-native-gifted-charts";
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

const MonthlyTrendCard = ({
  periodLabel = "Jan 2026 - Des 2026",
  peakLabel = "Puncak: Nov (Rp 658k)",
  data = DEFAULT_TREND_DATA,
  onPressDetail,
}: MonthlyTrendCardProps) => {
  const { theme, isDark } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const cardBg = isDark ? "#0F1523" : theme.card;
  const inactiveBarColor = isDark ? "#1C2536" : "#E5E7EB";
  const expenseActiveColor = isDark ? "#F87171" : "#F87171";

  const maxValue = useMemo(() => {
    const rawMax = Math.max(
      ...data.map((d) => Math.max(d.income, d.expense)),
      0,
    );
    return rawMax > 0 ? rawMax * 1.15 : 100;
  }, [data]);

  const { barData, groupSpacing, chartWidth } = useMemo(() => {
    const availableWidth = Math.max(screenWidth - 68, 260);
    const barW = 5.5;
    const pairGap = 2;
    const perMonthBarsWidth = barW * 2 + pairGap;
    const calculatedSpacing = Math.max(
      Math.floor((availableWidth - perMonthBarsWidth * 12) / 12),
      8,
    );

    const minStubIncome = maxValue * 0.08;
    const minStubExpense = maxValue * 0.14;

    const items: barDataItem[] = [];

    data.forEach((item, index) => {
      const hasIncome = item.income > 0;
      const hasExpense = item.expense > 0;

      items.push({
        value: hasIncome
          ? Math.max(item.income, maxValue * 0.12)
          : minStubIncome,
        label: item.label,
        spacing: pairGap,
        labelWidth: perMonthBarsWidth + calculatedSpacing - 2,
        labelTextStyle: {
          color: item.isActive ? theme.primaryText : theme.textMuted,
          fontSize: 10,
          fontWeight: item.isActive ? "800" : "500",
          textAlign: "center",
        },
        frontColor: hasIncome ? theme.chartIncome : inactiveBarColor,
      });

      items.push({
        value: hasExpense
          ? Math.max(item.expense, maxValue * 0.12)
          : minStubExpense,
        spacing: index === data.length - 1 ? 0 : calculatedSpacing,
        frontColor: hasExpense ? expenseActiveColor : inactiveBarColor,
      });
    });

    return {
      barData: items,
      groupSpacing: calculatedSpacing,
      chartWidth: availableWidth,
    };
  }, [
    data,
    screenWidth,
    maxValue,
    theme.primaryText,
    theme.chartIncome,
    theme.textMuted,
    inactiveBarColor,
    expenseActiveColor,
  ]);

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
              style={[styles.legendDot, { backgroundColor: theme.chartIncome }]}
            />
            <Text style={[styles.legendText, { color: theme.textMuted }]}>
              Masuk
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: expenseActiveColor },
              ]}
            />
            <Text style={[styles.legendText, { color: theme.textMuted }]}>
              Keluar
            </Text>
          </View>
        </View>
      </View>

      {/* Gifted Charts BarChart Area */}
      <View style={styles.chartWrapper}>
        <BarChart
          data={barData}
          width={chartWidth}
          height={86}
          barWidth={5.5}
          barBorderRadius={3}
          maxValue={maxValue}
          noOfSections={2}
          hideYAxisText
          yAxisThickness={0}
          xAxisThickness={0}
          rulesType='dashed'
          rulesColor={isDark ? "#1E293B" : "#E5E7EB"}
          dashWidth={4}
          dashGap={4}
          initialSpacing={4}
          endSpacing={4}
          disableScroll
          isAnimated
          animationDuration={400}
        />
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
          <Text style={[styles.detailLinkText, { color: theme.primaryText }]}>
            Lihat rincian data tren
          </Text>
          <ArrowRight size={13} color={theme.primaryText} strokeWidth={2.5} />
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
  chartWrapper: {
    marginTop: 14,
    marginBottom: 10,
    alignItems: "center",
    overflow: "hidden",
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
