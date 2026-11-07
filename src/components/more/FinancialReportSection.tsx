import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  ChevronDown,
  PieChart as PieChartIcon,
  TrendingUp,
} from "lucide-react-native";
import {
  BarChart,
  barDataItem,
  PieChart,
  pieDataItem,
} from "react-native-gifted-charts";
import { useTheme } from "@/constants/useTheme";
import { formatCompactRupiah, formatRupiah } from "@/lib/formatterRupiah";
import { MONTHS_SHORT } from "@/components/ui/MonthYearPickerModal";

export interface CategoryBreakdownItem {
  id: number;
  name: string;
  color: string;
  spent: number;
  limit: number | null;
}

export interface MonthlyRecapItem {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface FinancialReportSectionProps {
  selectedMonthShort: string;
  selectedMonthFull: string;
  selectedYear: number;
  selectedMonthIdx: number;
  income: number;
  expense: number;
  incomeCount: number;
  expenseCount: number;
  categories: CategoryBreakdownItem[];
  monthlyTrends: MonthlyRecapItem[];
  onPressMonthSelector: () => void;
}

const FinancialReportSection = ({
  selectedMonthShort,
  selectedMonthFull,
  selectedYear,
  selectedMonthIdx,
  income,
  expense,
  incomeCount,
  expenseCount,
  categories,
  monthlyTrends,
  onPressMonthSelector,
}: FinancialReportSectionProps) => {
  const { theme, isDark } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const cardBg = isDark ? "#0F1523" : theme.card;
  const subBg = isDark ? "#182235" : "#F3F4F6";
  const inactiveBarColor = isDark ? "#1C2536" : "#E5E7EB";
  const expenseActiveColor = isDark ? "#F87171" : "#F87171";

  const [reportView, setReportView] = useState<"monthly" | "yearly">("monthly");

  const net = income - expense;
  const isNetPositive = net >= 0;

  // Savings Rate & Average Daily Expense
  const { savingsRate, avgDailyExpense, daysInMonth } = useMemo(() => {
    const days = new Date(selectedYear, selectedMonthIdx + 1, 0).getDate();
    const avgDaily = days > 0 ? Math.round(expense / days) : 0;
    const rate =
      income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

    return {
      savingsRate: rate,
      avgDailyExpense: avgDaily,
      daysInMonth: days,
    };
  }, [income, expense, selectedYear, selectedMonthIdx]);

  // Top Expense Categories sorted descending by spent
  const sortedExpenseCategories = useMemo(() => {
    return [...categories]
      .filter((c) => c.spent > 0)
      .sort((a, b) => b.spent - a.spent);
  }, [categories]);

  // Pie / Donut Chart Data
  const pieChartData: pieDataItem[] = useMemo(() => {
    if (sortedExpenseCategories.length === 0) return [];
    return sortedExpenseCategories.map((cat) => ({
      value: cat.spent,
      color: cat.color || theme.primary,
    }));
  }, [sortedExpenseCategories, theme.primary]);

  // Yearly totals
  const yearlyTotals = useMemo(() => {
    let inc = 0;
    let exp = 0;
    for (const m of monthlyTrends) {
      inc += m.income;
      exp += m.expense;
    }
    return {
      income: inc,
      expense: exp,
      net: inc - exp,
    };
  }, [monthlyTrends]);

  // Yearly 12-Month BarChart data
  const { yearlyBarData, yearlyMaxVal, chartWidth } = useMemo(() => {
    const availableWidth = Math.max(screenWidth - 68, 260);
    const rawMax = Math.max(
      ...MONTHS_SHORT.map((_, idx) => {
        const m = monthlyTrends[idx];
        return Math.max(m?.income ?? 0, m?.expense ?? 0);
      }),
      0,
    );
    const maxV = rawMax > 0 ? rawMax * 1.15 : 100;

    const barW = 5.5;
    const pairGap = 2;
    const perMonthBarsWidth = barW * 2 + pairGap;
    const calculatedSpacing = Math.max(
      Math.floor((availableWidth - perMonthBarsWidth * 12) / 12),
      8,
    );

    const minStubIncome = maxV * 0.08;
    const minStubExpense = maxV * 0.14;
    const items: barDataItem[] = [];

    MONTHS_SHORT.forEach((label, idx) => {
      const m = monthlyTrends[idx] ?? { income: 0, expense: 0, net: 0 };
      const hasIncome = m.income > 0;
      const hasExpense = m.expense > 0;
      const isSelected = idx === selectedMonthIdx;

      items.push({
        value: hasIncome ? Math.max(m.income, maxV * 0.12) : minStubIncome,
        label,
        spacing: pairGap,
        labelWidth: perMonthBarsWidth + calculatedSpacing - 2,
        labelTextStyle: {
          color: isSelected ? theme.primaryText : theme.textMuted,
          fontSize: 10,
          fontWeight: isSelected ? "800" : "500",
          textAlign: "center",
        },
        frontColor: hasIncome ? theme.chartIncome : inactiveBarColor,
      });

      items.push({
        value: hasExpense ? Math.max(m.expense, maxV * 0.12) : minStubExpense,
        spacing: idx === MONTHS_SHORT.length - 1 ? 0 : calculatedSpacing,
        frontColor: hasExpense ? expenseActiveColor : inactiveBarColor,
      });
    });

    return {
      yearlyBarData: items,
      yearlyMaxVal: maxV,
      chartWidth: availableWidth,
    };
  }, [
    monthlyTrends,
    screenWidth,
    selectedMonthIdx,
    theme.primaryText,
    theme.chartIncome,
    theme.textMuted,
    inactiveBarColor,
    expenseActiveColor,
  ]);

  return (
    <View style={styles.section}>
      {/* Section Header with Month Picker Chip */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <BarChart3 size={18} color={theme.primaryText} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Laporan Keuangan
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

      {/* Switcher: Ringkasan Bulan Ini vs Rekap 12 Bulan */}
      <View
        style={[
          styles.viewTabsContainer,
          { backgroundColor: cardBg, borderColor: theme.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => setReportView("monthly")}
          style={[
            styles.viewTabBtn,
            reportView === "monthly" && { backgroundColor: theme.primary },
          ]}
        >
          <PieChartIcon
            size={13}
            color={reportView === "monthly" ? "#0A1402" : theme.textMuted}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: reportView === "monthly" ? "800" : "600",
              color: reportView === "monthly" ? "#0A1402" : theme.textMuted,
            }}
          >
            Laporan Bulanan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setReportView("yearly")}
          style={[
            styles.viewTabBtn,
            reportView === "yearly" && { backgroundColor: theme.primary },
          ]}
        >
          <TrendingUp
            size={13}
            color={reportView === "yearly" ? "#0A1402" : theme.textMuted}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: reportView === "yearly" ? "800" : "600",
              color: reportView === "yearly" ? "#0A1402" : theme.textMuted,
            }}
          >
            Rekap Tahunan
          </Text>
        </TouchableOpacity>
      </View>

      {reportView === "monthly" ? (
        <>
          {/* Main Monthly Report Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: cardBg, borderColor: theme.border },
            ]}
          >
            <Text
              style={[styles.periodHeaderLabel, { color: theme.textMuted }]}
            >
              RINGKASAN ARUS KAS • {selectedMonthFull.toUpperCase()}{" "}
              {selectedYear}
            </Text>

            <Text
              style={[
                styles.netValueText,
                { color: isNetPositive ? theme.primaryText : "#F87171" },
              ]}
            >
              {isNetPositive ? "+" : "-"}Rp{" "}
              {formatRupiah(String(Math.abs(net)))}
            </Text>

            <Text style={[styles.netStatusSub, { color: theme.textMuted }]}>
              {isNetPositive
                ? "Surplus (Pemasukan mencukupi pengeluaran bulan ini)"
                : "Defisit (Pengeluaran melebihi pemasukan bulan ini)"}
            </Text>

            {/* Income & Expense Grid */}
            <View style={styles.incExpGrid}>
              <View
                style={[
                  styles.incExpBox,
                  { backgroundColor: subBg, borderColor: theme.border },
                ]}
              >
                <View style={styles.incExpHeader}>
                  <View
                    style={[
                      styles.incomeIconCircle,
                      { backgroundColor: theme.primarySoftBg },
                    ]}
                  >
                    <ArrowDown
                      size={13}
                      color={theme.primaryText}
                      strokeWidth={2.5}
                    />
                  </View>
                  <Text
                    style={[styles.incExpLabel, { color: theme.textMuted }]}
                  >
                    Pemasukan
                  </Text>
                </View>
                <Text
                  style={[styles.incExpAmount, { color: theme.primaryText }]}
                  numberOfLines={1}
                >
                  +Rp {formatRupiah(String(income))}
                </Text>
                <Text style={[styles.incExpCount, { color: theme.textMuted }]}>
                  {incomeCount} Transaksi
                </Text>
              </View>

              <View
                style={[
                  styles.incExpBox,
                  { backgroundColor: subBg, borderColor: theme.border },
                ]}
              >
                <View style={styles.incExpHeader}>
                  <View style={styles.expenseIconCircle}>
                    <ArrowUp size={13} color='#F87171' strokeWidth={2.5} />
                  </View>
                  <Text
                    style={[styles.incExpLabel, { color: theme.textMuted }]}
                  >
                    Pengeluaran
                  </Text>
                </View>
                <Text
                  style={[styles.incExpAmount, { color: "#F87171" }]}
                  numberOfLines={1}
                >
                  -Rp {formatRupiah(String(expense))}
                </Text>
                <Text style={[styles.incExpCount, { color: theme.textMuted }]}>
                  {expenseCount} Transaksi
                </Text>
              </View>
            </View>

            {/* Key Financial Ratios */}
            <View
              style={[
                styles.ratiosRow,
                { borderTopColor: isDark ? "#1A2234" : theme.border },
              ]}
            >
              <View style={styles.ratioCol}>
                <Text style={[styles.ratioLabel, { color: theme.textMuted }]}>
                  Rasio Tabungan
                </Text>
                <Text
                  style={[
                    styles.ratioValue,
                    {
                      color:
                        income > 0 && savingsRate >= 0
                          ? theme.primaryText
                          : income > 0
                            ? "#F87171"
                            : theme.text,
                    },
                  ]}
                >
                  {income > 0 ? `${savingsRate}%` : "0%"}
                </Text>
              </View>

              <View
                style={[
                  styles.ratioVerticalDivider,
                  { backgroundColor: isDark ? "#1A2234" : theme.border },
                ]}
              />

              <View style={styles.ratioCol}>
                <Text style={[styles.ratioLabel, { color: theme.textMuted }]}>
                  Rata-rata Pengeluaran ({daysInMonth} hr)
                </Text>
                <Text style={[styles.ratioValue, { color: theme.text }]}>
                  Rp {formatRupiah(String(avgDailyExpense))} / hari
                </Text>
              </View>
            </View>
          </View>

          {/* Category Expense Breakdown Card with Donut Chart */}
          <View
            style={[
              styles.card,
              styles.breakdownCard,
              { backgroundColor: cardBg, borderColor: theme.border },
            ]}
          >
            <View style={styles.breakdownHeader}>
              <Text style={[styles.breakdownTitle, { color: theme.text }]}>
                Distribusi Pengeluaran per Kategori
              </Text>
              <Text
                style={[styles.breakdownSubtitle, { color: theme.textMuted }]}
              >
                Proporsi belanja terhadap total pengeluaran bulan ini
              </Text>
            </View>

            {sortedExpenseCategories.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                  Belum ada pengeluaran pada bulan {selectedMonthFull}{" "}
                  {selectedYear}.
                </Text>
              </View>
            ) : (
              <>
                {/* Donut Chart */}
                <View style={styles.donutContainer}>
                  <PieChart
                    data={pieChartData}
                    donut
                    radius={78}
                    innerRadius={52}
                    innerCircleColor={cardBg}
                    isAnimated
                    animationDuration={400}
                    centerLabelComponent={() => (
                      <View style={styles.donutCenter}>
                        <Text
                          style={[
                            styles.donutCenterLabel,
                            { color: theme.textMuted },
                          ]}
                        >
                          Total Keluar
                        </Text>
                        <Text
                          style={[
                            styles.donutCenterValue,
                            { color: theme.text },
                          ]}
                          numberOfLines={1}
                        >
                          {formatCompactRupiah(expense)}
                        </Text>
                      </View>
                    )}
                  />
                </View>

                {sortedExpenseCategories.map((cat, idx) => {
                  const pct =
                    expense > 0
                      ? ((cat.spent / expense) * 100).toFixed(1)
                      : "0";
                  const widthPct =
                    expense > 0
                      ? Math.min((cat.spent / expense) * 100, 100)
                      : 0;
                  const isLast = idx === sortedExpenseCategories.length - 1;
                  const barColor = cat.color || theme.primary;

                  return (
                    <View
                      key={cat.id}
                      style={[
                        styles.catBreakdownRow,
                        !isLast && {
                          borderBottomWidth: 1,
                          borderBottomColor: isDark ? "#182132" : theme.border,
                        },
                      ]}
                    >
                      <View style={styles.catTopLine}>
                        <View style={styles.catLeft}>
                          <View
                            style={[
                              styles.catColorDot,
                              { backgroundColor: barColor },
                            ]}
                          />
                          <Text
                            style={[styles.catNameText, { color: theme.text }]}
                            numberOfLines={1}
                          >
                            {cat.name}
                          </Text>
                          <View
                            style={[
                              styles.pctBadge,
                              { backgroundColor: subBg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.pctBadgeText,
                                { color: theme.text },
                              ]}
                            >
                              {pct.replace(".", ",")}%
                            </Text>
                          </View>
                        </View>

                        <Text
                          style={[styles.catSpentText, { color: theme.text }]}
                        >
                          Rp {formatRupiah(String(cat.spent))}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.catProgressTrack,
                          { backgroundColor: isDark ? "#182132" : "#E5E7EB" },
                        ]}
                      >
                        <View
                          style={[
                            styles.catProgressFill,
                            {
                              width: `${Math.max(widthPct, 3)}%`,
                              backgroundColor: barColor,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        </>
      ) : (
        /* Yearly 12-Month Recap Card with BarChart */
        <View
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: theme.border },
          ]}
        >
          <View style={styles.yearlySummaryHeader}>
            <View>
              <Text
                style={[styles.periodHeaderLabel, { color: theme.textMuted }]}
              >
                TOTAL SELISIH TAHUN {selectedYear}
              </Text>
              <Text
                style={[
                  styles.netValueText,
                  {
                    color:
                      yearlyTotals.net >= 0 ? theme.primaryText : "#F87171",
                  },
                ]}
              >
                {yearlyTotals.net >= 0 ? "+" : "-"}Rp{" "}
                {formatRupiah(String(Math.abs(yearlyTotals.net)))}
              </Text>
            </View>

            <View style={styles.yearlyTotalsRight}>
              <Text
                style={{
                  fontSize: 11,
                  color: theme.primaryText,
                  fontWeight: "700",
                }}
              >
                Masuk: +Rp {formatRupiah(String(yearlyTotals.income))}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "#F87171",
                  fontWeight: "700",
                  marginTop: 3,
                }}
              >
                Keluar: -Rp {formatRupiah(String(yearlyTotals.expense))}
              </Text>
            </View>
          </View>

          {/* 12-Month Grouped BarChart */}
          <View style={styles.yearlyChartWrap}>
            <BarChart
              data={yearlyBarData}
              width={chartWidth}
              height={95}
              barWidth={5.5}
              barBorderRadius={3}
              maxValue={yearlyMaxVal}
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

          <View
            style={[
              styles.yearlyTableDivider,
              { backgroundColor: isDark ? "#1A2234" : theme.border },
            ]}
          />

          {MONTHS_SHORT.map((monthLabel, idx) => {
            const mData = monthlyTrends[idx] ?? {
              income: 0,
              expense: 0,
              net: 0,
            };
            const isCurrentSelected = idx === selectedMonthIdx;
            const isLast = idx === MONTHS_SHORT.length - 1;

            return (
              <View
                key={monthLabel}
                style={[
                  styles.monthRecapRow,
                  !isLast && {
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? "#182132" : theme.border,
                  },
                ]}
              >
                <View style={styles.monthRecapLeft}>
                  <View
                    style={[
                      styles.monthTag,
                      {
                        backgroundColor: isCurrentSelected
                          ? theme.primary
                          : subBg,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "800",
                        color: isCurrentSelected ? "#0A1402" : theme.text,
                      }}
                    >
                      {monthLabel}
                    </Text>
                  </View>

                  <View>
                    <Text style={{ fontSize: 11, color: theme.textMuted }}>
                      Masuk:{" "}
                      <Text
                        style={{ color: theme.primaryText, fontWeight: "700" }}
                      >
                        Rp {formatRupiah(String(mData.income))}
                      </Text>
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: theme.textMuted,
                        marginTop: 2,
                      }}
                    >
                      Keluar:{" "}
                      <Text style={{ color: "#F87171", fontWeight: "700" }}>
                        Rp {formatRupiah(String(mData.expense))}
                      </Text>
                    </Text>
                  </View>
                </View>

                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "800",
                    color:
                      mData.net > 0
                        ? theme.primaryText
                        : mData.net < 0
                          ? "#F87171"
                          : theme.textMuted,
                  }}
                >
                  {mData.net >= 0 ? "+" : "-"}Rp{" "}
                  {formatRupiah(String(Math.abs(mData.net)))}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default FinancialReportSection;

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
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
  viewTabsContainer: {
    flexDirection: "row",
    borderRadius: 999,
    borderWidth: 1,
    padding: 4,
    marginBottom: 12,
  },
  viewTabBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
  },
  breakdownCard: {
    marginTop: 12,
  },
  periodHeaderLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  netValueText: {
    fontSize: 24,
    fontWeight: "900",
    marginTop: 6,
    letterSpacing: -0.5,
  },
  netStatusSub: {
    fontSize: 11,
    marginTop: 3,
    marginBottom: 14,
  },
  incExpGrid: {
    flexDirection: "row",
    gap: 10,
  },
  incExpBox: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  incExpHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  incomeIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(180, 240, 0, 0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  expenseIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(248, 113, 113, 0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  incExpLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  incExpAmount: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 8,
  },
  incExpCount: {
    fontSize: 10,
    marginTop: 2,
  },
  ratiosRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  ratioCol: {
    flex: 1,
  },
  ratioVerticalDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 12,
  },
  ratioLabel: {
    fontSize: 11,
  },
  ratioValue: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 3,
  },
  breakdownHeader: {
    marginBottom: 8,
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  breakdownSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  donutContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  donutCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  donutCenterLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  donutCenterValue: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
  },
  emptyWrap: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 12,
  },
  catBreakdownRow: {
    paddingVertical: 12,
  },
  catTopLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  catLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  catColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catNameText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  pctBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  pctBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  catSpentText: {
    fontSize: 13,
    fontWeight: "800",
  },
  catProgressTrack: {
    height: 6,
    borderRadius: 999,
    marginTop: 8,
    overflow: "hidden",
  },
  catProgressFill: {
    height: "100%",
    borderRadius: 999,
  },
  yearlySummaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  yearlyTotalsRight: {
    alignItems: "flex-end",
  },
  yearlyChartWrap: {
    marginTop: 16,
    alignItems: "center",
    overflow: "hidden",
  },
  yearlyTableDivider: {
    height: 1,
    marginVertical: 14,
  },
  monthRecapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  monthRecapLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  monthTag: {
    width: 44,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
  },
});
