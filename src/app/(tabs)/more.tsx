import React, { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/constants/useTheme";
import { CardListSkeleton } from "@/components/ui/LoadingState";
import { formatRupiah, parseRupiah } from "@/lib/formatterRupiah";
import { useWalletBalances } from "@/services/reports/hooks/useReports";
import {
  useAddWallet,
  useRemovewallet,
  useTransferWallet,
  useUpdateWallet,
} from "@/services/wallets/hooks/useWallets";
import {
  useAddCategory,
  useCategories,
  useRemoveCategory,
  useUpdateCategory,
} from "@/services/categories/hooks/useCategories";
import FinancialReportMenuCard from "@/components/more/FinancialReportMenuCard";
import WalletManagementSection, {
  WalletBalanceItem,
} from "@/components/more/WalletManagementSection";
import CategoryManagementSection, {
  CategoryManageItem,
} from "@/components/more/CategoryManagementSection";
import WalletFormModal from "@/components/more/WalletFormModal";
import TransferWalletModal from "@/components/more/TransferWalletModal";
import ExportDataModal from "@/components/more/ExportDataModal";
import ImportJsonModal from "@/components/more/ImportJsonModal";
import CategoryFormModal, {
  CATEGORY_COLORS,
} from "@/components/more/CategoryFormModal";
import ConfirmDeleteItemModal, {
  DeleteTargetItem,
} from "@/components/more/ConfirmDeleteItemModal";
import {
  TRANSFER_IN_CATEGORY_NAME,
  TRANSFER_OUT_CATEGORY_NAME,
} from "@/services/wallets/wallets";

const MoreScreen = () => {
  const { theme } = useTheme();

  // Wallets & Categories from SQLite
  const {
    data: walletBalances = [],
    isLoading: isWalletsLoading,
    refetch: refetchWallets,
  } = useWalletBalances();
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    refetch: refetchCategories,
  } = useCategories();

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchWallets(), refetchCategories()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchWallets, refetchCategories]);

  const { mutateAsync: addWallet, isPending: isAddingWallet } = useAddWallet();
  const { mutateAsync: updateWallet, isPending: isUpdatingWallet } =
    useUpdateWallet();
  const { mutateAsync: removeWallet, isPending: isRemovingWallet } =
    useRemovewallet();
  const { mutateAsync: transferWallet, isPending: isTransferringWallet } =
    useTransferWallet();

  const { mutateAsync: addCategory, isPending: isAddingCategory } =
    useAddCategory();
  const { mutateAsync: updateCategory, isPending: isUpdatingCategory } =
    useUpdateCategory();
  const { mutateAsync: removeCategory, isPending: isRemovingCategory } =
    useRemoveCategory();

  // Wallet Modal State
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [editingWalletId, setEditingWalletId] = useState<number | null>(null);
  const [walletName, setWalletName] = useState("");
  const [walletInitialBalance, setWalletInitialBalance] = useState("");

  // Category Modal State
  const [categoryTab, setCategoryTab] = useState<"expense" | "income">(
    "expense"
  );
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState<"expense" | "income">(
    "expense"
  );
  const [categoryColor, setCategoryColor] = useState(CATEGORY_COLORS[0]);

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<DeleteTargetItem | null>(
    null
  );

  const openAddWallet = () => {
    setEditingWalletId(null);
    setWalletName("");
    setWalletInitialBalance("");
    setWalletModalVisible(true);
  };

  const openEditWallet = (w: WalletBalanceItem) => {
    setEditingWalletId(w.id);
    setWalletName(w.name);
    setWalletInitialBalance(
      w.initialBalance > 0 ? formatRupiah(String(w.initialBalance)) : "0"
    );
    setWalletModalVisible(true);
  };

  const handleSaveWallet = async () => {
    if (!walletName.trim()) return;
    const initBal = parseRupiah(walletInitialBalance);

    if (editingWalletId !== null) {
      await updateWallet({
        id: editingWalletId,
        data: { name: walletName.trim(), initialBalance: initBal },
      });
    } else {
      await addWallet({
        name: walletName.trim(),
        initialBalance: initBal,
      });
    }
    setWalletModalVisible(false);
  };

  const openAddCategory = () => {
    setEditingCategoryId(null);
    setCategoryName("");
    setCategoryType(categoryTab);
    setCategoryColor(CATEGORY_COLORS[0]);
    setCategoryModalVisible(true);
  };

  const openEditCategory = (c: CategoryManageItem) => {
    setEditingCategoryId(c.id);
    setCategoryName(c.name);
    setCategoryType(c.type);
    setCategoryColor(c.color || CATEGORY_COLORS[0]);
    setCategoryModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) return;

    if (editingCategoryId !== null) {
      await updateCategory({
        id: editingCategoryId,
        data: {
          name: categoryName.trim(),
          type: categoryType,
          color: categoryColor,
        },
      });
    } else {
      await addCategory({
        name: categoryName.trim(),
        type: categoryType,
        color: categoryColor,
      });
    }
    setCategoryModalVisible(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.kind === "wallet") {
        await removeWallet(deleteTarget.id);
      } else {
        await removeCategory(deleteTarget.id);
      }
    } finally {
      setDeleteTarget(null);
    }
  };

  const userCategories = categories.filter(
    (c) =>
      c.name !== TRANSFER_IN_CATEGORY_NAME &&
      c.name !== TRANSFER_OUT_CATEGORY_NAME
  );

  const handleTransferSubmit = async (payload: {
    fromWalletId: number;
    toWalletId: number;
    amount: number;
    adminFee: number;
    note: string;
  }) => {
    await transferWallet(payload);
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
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: theme.text }]}>
            Laporan & Pengaturan
          </Text>
          <Text style={[styles.pageSubtitle, { color: theme.textMuted }]}>
            Ringkasan laporan keuangan, sumber dana, dan kategori pencatatanmu
          </Text>
        </View>

        <FinancialReportMenuCard
          onPress={() => router.push("/financialReport")}
          onPressExport={() => setExportModalVisible(true)}
          onPressImport={() => setImportModalVisible(true)}
        />

        {isWalletsLoading || isCategoriesLoading ? (
          <CardListSkeleton rows={4} label="Memuat dompet & kategori..." />
        ) : (
          <>
            <WalletManagementSection
              wallets={walletBalances}
              onPressAdd={openAddWallet}
              onPressTransfer={() => setTransferModalVisible(true)}
              onPressEdit={openEditWallet}
              onPressDelete={(w) =>
                setDeleteTarget({ kind: "wallet", id: w.id, name: w.name })
              }
            />

            <CategoryManagementSection
              categories={userCategories}
              activeTab={categoryTab}
              onChangeTab={setCategoryTab}
              onPressAdd={openAddCategory}
              onPressEdit={openEditCategory}
              onPressDelete={(c) =>
                setDeleteTarget({ kind: "category", id: c.id, name: c.name })
              }
            />
          </>
        )}
      </ScrollView>

      <WalletFormModal
        visible={walletModalVisible}
        isEditing={editingWalletId !== null}
        walletName={walletName}
        onChangeWalletName={setWalletName}
        walletInitialBalance={walletInitialBalance}
        onChangeInitialBalance={setWalletInitialBalance}
        onClose={() => setWalletModalVisible(false)}
        onSave={handleSaveWallet}
        isSubmitting={isAddingWallet || isUpdatingWallet}
      />

      <TransferWalletModal
        visible={transferModalVisible}
        wallets={walletBalances}
        onClose={() => setTransferModalVisible(false)}
        onSubmit={handleTransferSubmit}
        isSubmitting={isTransferringWallet}
      />

      <ExportDataModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
      />

      <ImportJsonModal
        visible={importModalVisible}
        onClose={() => setImportModalVisible(false)}
      />

      <CategoryFormModal
        visible={categoryModalVisible}
        isEditing={editingCategoryId !== null}
        categoryName={categoryName}
        onChangeCategoryName={setCategoryName}
        categoryColor={categoryColor}
        onSelectCategoryColor={setCategoryColor}
        onClose={() => setCategoryModalVisible(false)}
        onSave={handleSaveCategory}
        isSubmitting={isAddingCategory || isUpdatingCategory}
      />

      <ConfirmDeleteItemModal
        target={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isRemovingWallet || isRemovingCategory}
      />
    </View>
  );
};

export default MoreScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
  },
  pageHeader: {
    marginBottom: 18,
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
});
