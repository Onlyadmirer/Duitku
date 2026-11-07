import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar, ChevronDown } from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";
import { formatRupiah } from "@/lib/formatterRupiah";

interface HomeHeaderProps {
  userName?: string;
  income?: number;
  expense?: number;
  selectedMonthShort: string;
  selectedYear: string;
  selectedMonthFull: string;
  onPressMonthSelector?: () => void;
}

const HomeHeader = ({
  userName = "akmal",
  income = 0,
  expense = 0,
  selectedMonthShort,
  selectedYear,
  selectedMonthFull,
  onPressMonthSelector,
}: HomeHeaderProps) => {
  const { theme, isDark } = useTheme();

  const diff = Math.abs(expense - income);
  const diffFormatted = `Rp ${formatRupiah(String(diff))}`;
  const isExpenseGreater = expense > income;
  const isIncomeGreater = income > expense;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.greetingCol}>
          <Text style={[styles.greetingText, { color: theme.text }]}>
            Halo, {userName} ✨
          </Text>
          {isExpenseGreater ? (
            <Text style={[styles.subtitleText, { color: theme.textMuted }]}>
              Pengeluaran lebih besar{" "}
              <Text style={styles.highlightDanger}>{diffFormatted}</Text> bulan
              ini
            </Text>
          ) : isIncomeGreater ? (
            <Text style={[styles.subtitleText, { color: theme.textMuted }]}>
              Pemasukan lebih besar{" "}
              <Text style={{ color: theme.primary, fontWeight: "700" }}>
                {diffFormatted}
              </Text>{" "}
              bulan ini
            </Text>
          ) : (
            <Text style={[styles.subtitleText, { color: theme.textMuted }]}>
              Belum ada selisih transaksi bulan ini
            </Text>
          )}
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
          <View style={styles.monthTextWrap}>
            <Text style={[styles.monthSelectorText, { color: theme.text }]}>
              {selectedMonthShort}
            </Text>
            <Text style={[styles.monthSelectorText, { color: theme.text }]}>
              {selectedYear}
            </Text>
          </View>
          <ChevronDown size={14} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.summaryBadge,
          {
            backgroundColor: isDark ? "#111726" : theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.calendarIconWrap}>
          <Calendar size={12} color={theme.primary} />
        </View>
        <Text style={[styles.summaryBadgeText, { color: theme.textMuted }]}>
          Menampilkan ringkasan{" "}
          <Text style={[styles.summaryBadgeBold, { color: theme.text }]}>
            {selectedMonthFull}
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  greetingCol: {
    flex: 1,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  highlightDanger: {
    color: "#F87171",
    fontWeight: "700",
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  monthTextWrap: {
    alignItems: "center",
  },
  monthSelectorText: {
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
  },
  summaryBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  calendarIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "rgba(180, 240, 0, 0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryBadgeText: {
    fontSize: 11,
    lineHeight: 15,
  },
  summaryBadgeBold: {
    fontWeight: "700",
  },
});
