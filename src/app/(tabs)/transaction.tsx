import React, { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@/constants/useTheme";
import { CardListSkeleton } from "@/components/ui/LoadingState";
import TransactionSummaryCard from "@/components/transaction/TransactionSummaryCard";
import TransactionFilterBar, {
  FilterTxType,
} from "@/components/transaction/TransactionFilterBar";
import TransactionGroupList, {
  TransactionDateGroup,
  TransactionRowItem,
  resolveTransactionIcon,
} from "@/components/transaction/TransactionGroupList";
import MonthYearPickerModal, {
  MONTHS_FULL,
  MONTHS_SHORT,
} from "@/components/ui/MonthYearPickerModal";
import ExportDataModal from "@/components/more/ExportDataModal";
import {
  useRemoveTransaction,
  useTransactions,
} from "@/services/transactions/hooks/useTransactions";
import { useCategories } from "@/services/categories/hooks/useCategories";
import { useWallets } from "@/services/wallets/hooks/useWallets";
import { monthFormatter } from "@/services/reports/plugin";
import { useModalTransactionContext } from "@/context/ModalTransactionContext";

const DAYS_INDO = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const formatDateGroupHeader = (isoOrDate: string) => {
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) {
    return {
      key: isoOrDate.slice(0, 10),
      label: isoOrDate.slice(0, 10),
    };
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const dayName = DAYS_INDO[d.getDay()];
  const monthShort = MONTHS_SHORT[d.getMonth()];

  return {
    key: `${yyyy}-${mm}-${dd}`,
    label: `${dayName}, ${d.getDate()} ${monthShort} ${yyyy}`,
  };
};

const TransactionScreen = () => {
  const { theme } = useTheme();
  const { openAddModal, openEditModal } = useModalTransactionContext();

  const now = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(
    now.getMonth()
  );
  const [monthModalVisible, setMonthModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<FilterTxType>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(undefined);
  const [selectedWalletId, setSelectedWalletId] = useState<number | undefined>(
    undefined
  );

  const selectedMonthKey = `${selectedYear}-${String(
    selectedMonthIdx + 1
  ).padStart(2, "0")}`;

  const { start, end } = useMemo(
    () => monthFormatter(selectedMonthKey),
    [selectedMonthKey]
  );

  // Fetch Categories & Wallets for filter chips
  const { data: categories = [] } = useCategories();
  const { data: wallets = [] } = useWallets();

  // Fetch Filtered Transactions from SQLite
  const {
    data: txData,
    isLoading: isTxLoading,
    refetch: refetchTx,
  } = useTransactions({
    from: start,
    to: end,
    type: selectedType === "all" ? undefined : selectedType,
    categoryId: selectedCategoryId,
    walletId: selectedWalletId,
    search: search.trim() ? search.trim() : undefined,
    limit: 200,
    page: 1,
  });

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchTx();
    } finally {
      setRefreshing(false);
    }
  }, [refetchTx]);

  const { mutate: deleteTransaction } = useRemoveTransaction();

  // Compute Summary & Grouped Transactions from the fetched SQLite rows
  const { groups, filteredIncome, filteredExpense, totalCount } =
    useMemo(() => {
      const rows = txData?.items ?? [];
      let inc = 0;
      let exp = 0;

      const groupMap = new Map<string, TransactionDateGroup>();

      for (const tx of rows) {
        if (tx.type === "income") {
          inc += tx.amount;
        } else {
          exp += tx.amount;
        }

        const category = tx.categoryName ?? "Lainnya";
        const title = tx.note?.trim() ? tx.note : category;
        const wallet = tx.walletName ?? "Dompet";
        const { key, label } = formatDateGroupHeader(tx.date);

        const item: TransactionRowItem = {
          id: tx.id,
          walletId: tx.walletId,
          categoryId: tx.categoryId,
          note: tx.note,
          title,
          category,
          categoryColor: tx.categoryColor,
          wallet,
          dateIso: tx.date,
          dateGroupKey: key,
          dateGroupLabel: label,
          amount: tx.amount,
          type: tx.type,
          icon: resolveTransactionIcon(title, category, tx.type),
        };

        const existing = groupMap.get(key);
        const signedAmount = tx.type === "income" ? tx.amount : -tx.amount;

        if (existing) {
          existing.items.push(item);
          existing.dailyNet += signedAmount;
        } else {
          groupMap.set(key, {
            dateKey: key,
            dateLabel: label,
            dailyNet: signedAmount,
            items: [item],
          });
        }
      }

      const sortedGroups = Array.from(groupMap.values()).sort((a, b) =>
        b.dateKey.localeCompare(a.dateKey)
      );

      return {
        groups: sortedGroups,
        filteredIncome: inc,
        filteredExpense: exp,
        totalCount: rows.length,
      };
    }, [txData?.items]);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
        <TransactionSummaryCard
          selectedMonthShort={MONTHS_SHORT[selectedMonthIdx]}
          selectedYear={String(selectedYear)}
          selectedMonthFull={`${MONTHS_FULL[selectedMonthIdx]} ${selectedYear}`}
          income={filteredIncome}
          expense={filteredExpense}
          totalCount={totalCount}
          onPressMonthSelector={() => setMonthModalVisible(true)}
          onPressExport={() => setExportModalVisible(true)}
        />

        <TransactionFilterBar
          search={search}
          onChangeSearch={setSearch}
          selectedType={selectedType}
          onSelectType={setSelectedType}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          wallets={wallets}
          selectedWalletId={selectedWalletId}
          onSelectWallet={setSelectedWalletId}
        />

        {isTxLoading ? (
          <CardListSkeleton rows={4} label="Memuat riwayat transaksi..." />
        ) : (
          <TransactionGroupList
            groups={groups}
            onAddTransaction={openAddModal}
            onEditTransaction={openEditModal}
            onDeleteTransaction={(id) => deleteTransaction(id)}
          />
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

      <ExportDataModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        defaultYear={selectedYear}
        defaultMonthIdx={selectedMonthIdx}
      />
    </View>
  );
};

export default TransactionScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
  },
});
