import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ArrowDown, ArrowUp, Calendar, ChevronDown } from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";
import { formatRupiah } from "@/lib/formatterRupiah";

interface TransactionSummaryCardProps {
  selectedMonthShort: string;
  selectedYear: string;
  selectedMonthFull: string;
  income: number;
  expense: number;
  totalCount: number;
  onPressMonthSelector: () => void;
  onPressExport?: () => void;
}

const TransactionSummaryCard = ({
  selectedMonthShort,
  selectedYear,
  selectedMonthFull,
  income,
  expense,
  totalCount,
  onPressMonthSelector,
}: TransactionSummaryCardProps) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;
  const net = income - expense;
  const isNetPositive = net >= 0;

  return (
    <View style={styles.container}>
      {/* Page Title & Month Selector */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={[styles.pageTitle, { color: theme.text }]}>
            Riwayat Transaksi
          </Text>
          <Text style={[styles.pageSubtitle, { color: theme.textMuted }]}>
            Pantau seluruh aktivitas pemasukan & pengeluaran
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

      {/* Summary Bento Card */}
      <View
        style={[
          styles.summaryCard,
          { backgroundColor: cardBg, borderColor: theme.border },
        ]}
      >
        <View style={styles.summaryTopCol}>
          <View style={styles.periodBadgeRow}>
            <Calendar size={12} color={theme.primaryText} />
            <Text style={[styles.periodLabelText, { color: theme.textMuted }]}>
              SELISIH ARUS KAS ({selectedMonthFull.toUpperCase()})
            </Text>
          </View>
          <Text
            style={[
              styles.netAmountText,
              { color: isNetPositive ? theme.primaryText : "#F87171" },
            ]}
          >
            {isNetPositive ? "+" : "-"}Rp {formatRupiah(String(Math.abs(net)))}
          </Text>

          <View style={styles.badgesBottomRow}>
            <View
              style={[
                styles.txCountBadge,
                {
                  backgroundColor: isDark ? "#182235" : "#F3F4F6",
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.txCountText, { color: theme.text }]}>
                {totalCount} Transaksi
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: isDark ? "#1A2234" : theme.border },
          ]}
        />

        <View style={styles.metricsRow}>
          {/* Income Metric */}
          <View style={styles.metricItem}>
            <View
              style={[
                styles.incomeBadge,
                { backgroundColor: theme.primarySoftBg },
              ]}
            >
              <ArrowDown
                size={14}
                color={theme.primaryText}
                strokeWidth={2.5}
              />
            </View>
            <View style={styles.metricTextCol}>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
                Pemasukan
              </Text>
              <Text
                style={[styles.metricValue, { color: theme.primaryText }]}
                numberOfLines={1}
              >
                +Rp {formatRupiah(String(income))}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.verticalDivider,
              { backgroundColor: isDark ? "#1A2234" : theme.border },
            ]}
          />

          {/* Expense Metric */}
          <View style={styles.metricItem}>
            <View style={styles.expenseBadge}>
              <ArrowUp size={14} color='#F87171' strokeWidth={2.5} />
            </View>
            <View style={styles.metricTextCol}>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
                Pengeluaran
              </Text>
              <Text
                style={[styles.metricValue, { color: "#F87171" }]}
                numberOfLines={1}
              >
                -Rp {formatRupiah(String(expense))}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TransactionSummaryCard;

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
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
  summaryCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
  },
  summaryTopCol: {
    alignItems: "flex-start",
  },
  periodBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  periodLabelText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  netAmountText: {
    fontSize: 24,
    fontWeight: "900",
    marginTop: 6,
    letterSpacing: -0.5,
  },
  badgesBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
    gap: 8,
  },
  txCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  txCountText: {
    fontSize: 11,
    fontWeight: "700",
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  exportBtnText: {
    fontSize: 11,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  verticalDivider: {
    width: 1,
    height: 32,
    marginHorizontal: 12,
  },
  incomeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(180, 240, 0, 0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  expenseBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(248, 113, 113, 0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  metricTextCol: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
  },
});
