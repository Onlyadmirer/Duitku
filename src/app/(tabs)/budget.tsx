import React, { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@/constants/useTheme";
import { CardListSkeleton } from "@/components/ui/LoadingState";
import { formatRupiah, parseRupiah } from "@/lib/formatterRupiah";
import { useReportByCategory } from "@/services/reports/hooks/useReports";
import {
  useRemoveBudget,
  useUpsertBudget,
} from "@/services/budgets/hooks/useBudgets";
import BudgetHeroCard from "@/components/budget/BudgetHeroCard";
import BudgetFilterTabs, {
  BudgetFilterTab,
} from "@/components/budget/BudgetFilterTabs";
import BudgetCategoryList from "@/components/budget/BudgetCategoryList";
import BudgetFormModal, {
  EditingBudgetCategory,
} from "@/components/budget/BudgetFormModal";
import MonthYearPickerModal, {
  MONTHS_FULL,
  MONTHS_SHORT,
} from "@/components/ui/MonthYearPickerModal";

const BudgetScreen = () => {
  const { theme } = useTheme();

  const now = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(
    now.getMonth()
  );
  const [monthModalVisible, setMonthModalVisible] = useState(false);
  const [filterTab, setFilterTab] = useState<BudgetFilterTab>("all");

  // Edit/Add Budget Modal State
  const [editingCategory, setEditingCategory] =
    useState<EditingBudgetCategory | null>(null);
  const [limitInput, setLimitInput] = useState("");

  const selectedMonthKey = `${selectedYear}-${String(
    selectedMonthIdx + 1
  ).padStart(2, "0")}`;

  const {
    data: categoryReport,
    isLoading: isBudgetLoading,
    refetch: refetchBudgets,
  } = useReportByCategory(selectedMonthKey);
  const { mutateAsync: upsertBudget, isPending: isUpserting } =
    useUpsertBudget();
  const { mutateAsync: deleteBudget, isPending: isDeletingBudget } =
    useRemoveBudget();

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchBudgets();
    } finally {
      setRefreshing(false);
    }
  }, [refetchBudgets]);

  const {
    filteredItems,
    totalLimit,
    totalBudgetedSpent,
    safeCount,
    overCount,
  } = useMemo(() => {
    const raw = categoryReport?.items ?? [];
    let sumLimit = 0;
    let sumSpent = 0;
    let safe = 0;
    let over = 0;

    for (const item of raw) {
      const spentVal = typeof item.spent === "number" ? item.spent : 0;
      if (item.limit !== null && item.limit > 0) {
        sumLimit += item.limit;
        sumSpent += spentVal;
        if (spentVal > item.limit) {
          over += 1;
        } else {
          safe += 1;
        }
      }
    }

    const filtered = raw.filter((item) => {
      const hasBudget = item.limit !== null && item.limit > 0;
      const spentVal = typeof item.spent === "number" ? item.spent : 0;
      const isOver = hasBudget && spentVal > (item.limit ?? 0);

      if (filterTab === "active") return hasBudget;
      if (filterTab === "over") return isOver;
      if (filterTab === "unbudgeted") return !hasBudget;
      return true;
    });

    return {
      filteredItems: filtered,
      totalLimit: sumLimit,
      totalBudgetedSpent: sumSpent,
      safeCount: safe,
      overCount: over,
    };
  }, [categoryReport?.items, filterTab]);

  const openEditModal = (item: {
    id: number;
    budgetId: number | null;
    name: string;
    limit: number | null;
  }) => {
    setEditingCategory({
      categoryId: item.id,
      budgetId: item.budgetId ?? null,
      name: item.name,
      currentLimit: item.limit,
    });
    setLimitInput(item.limit ? formatRupiah(String(item.limit)) : "");
  };

  const handleSaveBudget = async () => {
    if (!editingCategory) return;
    const parsed = parseRupiah(limitInput);
    if (!parsed || parsed <= 0) return;

    await upsertBudget({
      categoryId: editingCategory.categoryId,
      month: selectedMonthKey,
      limitAmount: parsed,
    });
    setEditingCategory(null);
    setLimitInput("");
  };

  const handleRemoveBudget = async () => {
    if (!editingCategory?.budgetId) return;
    await deleteBudget(editingCategory.budgetId);
    setEditingCategory(null);
    setLimitInput("");
  };

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
        <BudgetHeroCard
          selectedMonthShort={MONTHS_SHORT[selectedMonthIdx]}
          selectedYear={String(selectedYear)}
          selectedMonthFull={MONTHS_FULL[selectedMonthIdx]}
          totalBudgetedSpent={totalBudgetedSpent}
          totalLimit={totalLimit}
          safeCount={safeCount}
          overCount={overCount}
          onPressMonthSelector={() => setMonthModalVisible(true)}
        />

        <BudgetFilterTabs activeTab={filterTab} onSelectTab={setFilterTab} />

        {isBudgetLoading ? (
          <CardListSkeleton rows={4} label="Memuat anggaran kategori..." />
        ) : (
          <BudgetCategoryList
            items={filteredItems}
            onPressEditBudget={openEditModal}
          />
        )}
      </ScrollView>

      <BudgetFormModal
        visible={editingCategory !== null}
        editingCategory={editingCategory}
        periodLabel={`${MONTHS_FULL[selectedMonthIdx]} ${selectedYear}`}
        limitInput={limitInput}
        onChangeLimitInput={setLimitInput}
        onClose={() => setEditingCategory(null)}
        onSave={handleSaveBudget}
        onDelete={handleRemoveBudget}
        isSubmitting={isUpserting || isDeletingBudget}
      />

      <MonthYearPickerModal
        visible={monthModalVisible}
        selectedYear={selectedYear}
        selectedMonthIdx={selectedMonthIdx}
        onChangeYear={setSelectedYear}
        onSelectMonth={setSelectedMonthIdx}
        onClose={() => setMonthModalVisible(false)}
      />
    </View>
  );
};

export default BudgetScreen;

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
