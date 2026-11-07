import React, { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { ArrowLeftRight, ChevronRight } from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";
import { CardListSkeleton } from "@/components/ui/LoadingState";
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
import MonthYearPickerModal, {
  MONTHS_FULL,
  MONTHS_SHORT,
} from "@/components/ui/MonthYearPickerModal";
import {
  useMonthlyTrends,
  useReportByCategory,
  useReportSummary,
  useWalletBalances,
} from "@/services/reports/hooks/useReports";
import { useTransferWallet } from "@/services/wallets/hooks/useWallets";
import { useTransactions } from "@/services/transactions/hooks/useTransactions";
import TransferWalletModal from "@/components/more/TransferWalletModal";
import { monthFormatter } from "@/services/reports/plugin";
import {
  formatCompactRupiah,
  formatRupiah,
  formatShortThousand,
} from "@/lib/formatterRupiah";

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
    now.getMonth(),
  );
  const [monthModalVisible, setMonthModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { mutateAsync: transferWallet, isPending: isTransferringWallet } =
    useTransferWallet();

  const selectedMonthKey = `${selectedYear}-${String(
    selectedMonthIdx + 1,
  ).padStart(2, "0")}`;

  const { start, end } = useMemo(
    () => monthFormatter(selectedMonthKey),
    [selectedMonthKey],
  );

  // 1. Summary & Active Balance
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useReportSummary(selectedMonthKey);

  // 2. Wallets
  const { data: walletRows = [], refetch: refetchWallets } =
    useWalletBalances();

  // 3. 12-Month Trend
  const { data: trendReport, refetch: refetchTrends } =
    useMonthlyTrends(selectedYear);

  // 4. Monthly Budgets by Category
  const {
    data: categoryReport,
    isLoading: isCategoryLoading,
    refetch: refetchCategories,
  } = useReportByCategory(selectedMonthKey);

  // 5. Recent Transactions (latest 5 in selected month)
  const {
    data: txData,
    isLoading: isTxLoading,
    refetch: refetchTx,
  } = useTransactions({
    from: start,
    to: end,
    limit: 5,
    page: 1,
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchSummary(),
        refetchWallets(),
        refetchTrends(),
        refetchCategories(),
        refetchTx(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [
    refetchSummary,
    refetchWallets,
    refetchTrends,
    refetchCategories,
    refetchTx,
  ]);

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

  // Format budget items
  const budgetItems: BudgetOverviewItem[] = useMemo(() => {
    const rawItems = categoryReport?.items ?? [];
    const withLimit = rawItems.filter((item) => item.limit !== null);
    const sourceList = withLimit.length > 0 ? withLimit : rawItems;

    return sourceList.map((item) => ({
      id: String(item.id),
      name: item.name,
      color: item.color,
      spent: typeof item.spent === "number" ? item.spent : 0,
      limit: item.limit,
      icon: resolveCategoryIcon(item.name),
      status: item.status,
    }));
  }, [categoryReport?.items]);

  // Format recent transactions (informational only)
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
        categoryColor: tx.categoryColor,
        wallet,
        dateLabel: formatDateIndonesian(tx.date),
        amount: tx.amount,
        type: tx.type,
        icon: resolveTransactionIcon(title, category, tx.type),
      };
    });
  }, [txData?.items]);

  const isInitialLoading = isSummaryLoading && isCategoryLoading && isTxLoading;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primaryText}
            colors={[theme.primaryText]}
          />
        }
      >
        <HomeHeader
          income={summaryData?.income ?? 0}
          expense={summaryData?.expense ?? 0}
          selectedMonthShort={MONTHS_SHORT[selectedMonthIdx]}
          selectedYear={String(selectedYear)}
          selectedMonthFull={`${MONTHS_FULL[selectedMonthIdx]} ${selectedYear}`}
          onPressMonthSelector={() => setMonthModalVisible(true)}
        />

        {isInitialLoading ? (
          <CardListSkeleton rows={4} label='Memuat ringkasan beranda...' />
        ) : (
          <>
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
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setTransferModalVisible(true)}
              style={[
                styles.transferBannerCard,
                {
                  backgroundColor: isDark ? "#0F1523" : theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.transferBannerLeft}>
                <View
                  style={[
                    styles.transferBannerIconBox,
                    { backgroundColor: theme.primarySoftBg },
                  ]}
                >
                  <ArrowLeftRight
                    size={16}
                    color={theme.primaryText}
                    strokeWidth={2.3}
                  />
                </View>
                <View style={styles.transferBannerTextCol}>
                  <Text
                    style={[styles.transferBannerTitle, { color: theme.text }]}
                  >
                    Pindah Dana Antar Dompet
                  </Text>
                  <Text
                    style={[
                      styles.transferBannerSub,
                      { color: theme.textMuted },
                    ]}
                  >
                    Transfer saldo antar dompet tanpa mengubah laporan pemasukan
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.transferBannerChevron,
                  {
                    backgroundColor: isDark ? "#182235" : "#F3F4F6",
                    borderColor: theme.border,
                  },
                ]}
              >
                <ChevronRight size={15} color={theme.text} />
              </View>
            </TouchableOpacity>

            <MonthlyTrendCard
              periodLabel={`Jan ${selectedYear} - Des ${selectedYear}`}
              peakLabel={peakLabel}
              data={trendItems}
              onPressDetail={() => router.push("/financialReport")}
            />

            <MonthlyBudgetSection items={budgetItems} />

            <RecentTransactionsSection items={recentTxItems} />
          </>
        )}
      </ScrollView>

      <MonthYearPickerModal
        visible={monthModalVisible}
        selectedYear={selectedYear}
        selectedMonthIdx={selectedMonthIdx}
        onChangeYear={setSelectedYear}
        onSelectMonth={setSelectedMonthIdx}
        onClose={() => setMonthModalVisible(false)}
      />

      <TransferWalletModal
        visible={transferModalVisible}
        wallets={walletRows}
        onClose={() => setTransferModalVisible(false)}
        onSubmit={async (payload) => {
          await transferWallet(payload);
        }}
        isSubmitting={isTransferringWallet}
      />
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
  transferBannerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    gap: 10,
  },
  transferBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    flex: 1,
  },
  transferBannerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  transferBannerTextCol: {
    flex: 1,
  },
  transferBannerTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  transferBannerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  transferBannerChevron: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
