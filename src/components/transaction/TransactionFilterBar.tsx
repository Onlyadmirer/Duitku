import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Search, Wallet, X } from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";

export type FilterTxType = "all" | "expense" | "income";

interface CategoryFilterOption {
  id: number;
  name: string;
  type: "income" | "expense";
}

interface WalletFilterOption {
  id: number;
  name: string;
}

interface TransactionFilterBarProps {
  search: string;
  onChangeSearch: (text: string) => void;
  selectedType: FilterTxType;
  onSelectType: (type: FilterTxType) => void;
  categories: CategoryFilterOption[];
  selectedCategoryId?: number;
  onSelectCategory: (id?: number) => void;
  wallets: WalletFilterOption[];
  selectedWalletId?: number;
  onSelectWallet: (id?: number) => void;
}

const TransactionFilterBar = ({
  search,
  onChangeSearch,
  selectedType,
  onSelectType,
  categories,
  selectedCategoryId,
  onSelectCategory,
  wallets,
  selectedWalletId,
  onSelectWallet,
}: TransactionFilterBarProps) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;
  const chipBg = isDark ? "#151D2E" : "#F3F4F6";

  const filteredCategories = categories.filter((c) =>
    selectedType === "all" ? true : c.type === selectedType,
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View
        style={[
          styles.searchBar,
          { backgroundColor: cardBg, borderColor: theme.border },
        ]}
      >
        <Search size={16} color={theme.textMuted} />
        <TextInput
          value={search}
          onChangeText={onChangeSearch}
          placeholder='Cari catatan atau kategori transaksi...'
          placeholderTextColor={theme.textMuted}
          style={[styles.searchInput, { color: theme.text }]}
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeSearch("")}
            style={styles.clearBtn}
          >
            <X size={15} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Type Tabs: Semua / Pengeluaran / Pemasukan */}
      <View
        style={[
          styles.typeTabsContainer,
          { backgroundColor: cardBg, borderColor: theme.border },
        ]}
      >
        {(
          [
            { key: "all", label: "Semua" },
            { key: "expense", label: "Pengeluaran" },
            { key: "income", label: "Pemasukan" },
          ] as const
        ).map((tab) => {
          const isActive = selectedType === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.8}
              onPress={() => {
                onSelectType(tab.key);
                onSelectCategory(undefined);
              }}
              style={[
                styles.typeTabBtn,
                isActive && { backgroundColor: theme.primary },
              ]}
            >
              <Text
                style={[
                  styles.typeTabText,
                  {
                    color: isActive ? "#0e2300" : theme.textMuted,
                    fontWeight: isActive ? "800" : "600",
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Wallet & Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        {/* All Chip */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            onSelectCategory(undefined);
            onSelectWallet(undefined);
          }}
          style={[
            styles.chip,
            {
              backgroundColor:
                selectedCategoryId === undefined &&
                selectedWalletId === undefined
                  ? theme.primarySoftBg
                  : chipBg,
              borderColor:
                selectedCategoryId === undefined &&
                selectedWalletId === undefined
                  ? theme.primarySoftBorder
                  : theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.chipText,
              {
                color:
                  selectedCategoryId === undefined &&
                  selectedWalletId === undefined
                    ? theme.primaryText
                    : theme.textMuted,
                fontWeight:
                  selectedCategoryId === undefined &&
                  selectedWalletId === undefined
                    ? "700"
                    : "500",
              },
            ]}
          >
            Semua Kategori
          </Text>
        </TouchableOpacity>

        {/* Wallet Chips (if multiple wallets exist) */}
        {wallets.length > 1 &&
          wallets.map((w) => {
            const isSelected = selectedWalletId === w.id;
            return (
              <TouchableOpacity
                key={`wallet-${w.id}`}
                activeOpacity={0.8}
                onPress={() => onSelectWallet(isSelected ? undefined : w.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? theme.primarySoftBg : chipBg,
                    borderColor: isSelected
                      ? theme.primarySoftBorder
                      : theme.border,
                  },
                ]}
              >
                <Wallet
                  size={12}
                  color={isSelected ? theme.primaryText : theme.textMuted}
                />
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isSelected ? theme.primaryText : theme.textMuted,
                      fontWeight: isSelected ? "700" : "500",
                    },
                  ]}
                >
                  {w.name}
                </Text>
              </TouchableOpacity>
            );
          })}

        {/* Category Chips */}
        {filteredCategories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <TouchableOpacity
              key={`cat-${cat.id}`}
              activeOpacity={0.8}
              onPress={() => onSelectCategory(isSelected ? undefined : cat.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? theme.primarySoftBg : chipBg,
                  borderColor: isSelected
                    ? theme.primarySoftBorder
                    : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? theme.primaryText : theme.textMuted,
                    fontWeight: isSelected ? "700" : "500",
                  },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default TransactionFilterBar;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    gap: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 2,
  },
  typeTabsContainer: {
    flexDirection: "row",
    borderRadius: 999,
    borderWidth: 1,
    padding: 4,
  },
  typeTabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  typeTabText: {
    fontSize: 12,
  },
  chipsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
  },
});
