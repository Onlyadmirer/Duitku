import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ArrowDown, ArrowUp } from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";

interface IncomeExpenseSummaryProps {
  incomeAmount?: string;
  incomeCount?: number;
  expenseAmount?: string;
  expenseCount?: number;
}

const IncomeExpenseSummary = ({
  incomeAmount,
  expenseAmount,
}: IncomeExpenseSummaryProps) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;

  return (
    <View style={styles.row}>
      {/* Pemasukan Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor: theme.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.label, { color: theme.textMuted }]}>
            Pemasukan
          </Text>
          <View
            style={[
              styles.incomeIconBadge,
              { backgroundColor: theme.primarySoftBg },
            ]}
          >
            <ArrowDown size={14} color={theme.primaryText} strokeWidth={2.5} />
          </View>
        </View>
        <Text
          style={[styles.amountText, { color: theme.primaryText }]}
          numberOfLines={1}
        >
          {incomeAmount}
        </Text>
      </View>

      {/* Pengeluaran Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor: theme.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.label, { color: theme.textMuted }]}>
            Pengeluaran
          </Text>
          <View style={styles.expenseIconBadge}>
            <ArrowUp size={14} color='#F87171' strokeWidth={2.5} />
          </View>
        </View>
        <Text style={[styles.amountText, styles.expenseText]} numberOfLines={1}>
          {expenseAmount}
        </Text>
      </View>
    </View>
  );
};

export default IncomeExpenseSummary;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  incomeIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(180, 240, 0, 0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  expenseIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(248, 113, 113, 0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  amountText: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 10,
    letterSpacing: -0.3,
  },
  expenseText: {
    color: "#F87171",
  },
  countText: {
    fontSize: 11,
    marginTop: 4,
  },
});
