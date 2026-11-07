import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@/constants/useTheme";

export type BudgetFilterTab = "all" | "active" | "over" | "unbudgeted";

interface BudgetFilterTabsProps {
  activeTab: BudgetFilterTab;
  onSelectTab: (tab: BudgetFilterTab) => void;
}

const TABS: { key: BudgetFilterTab; label: string }[] = [
  { key: "all", label: "Semua Kategori" },
  { key: "active", label: "Sudah Diatur" },
  { key: "over", label: "Melebihi Batas" },
  { key: "unbudgeted", label: "Belum Diatur" },
];

const BudgetFilterTabs = ({
  activeTab,
  onSelectTab,
}: BudgetFilterTabsProps) => {
  const { theme, isDark } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterTabsRow}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.8}
            onPress={() => onSelectTab(tab.key)}
            style={[
              styles.filterChip,
              {
                backgroundColor: isActive
                  ? theme.primary
                  : isDark
                    ? "#111726"
                    : theme.card,
                borderColor: isActive ? theme.primary : theme.border,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: isActive ? "800" : "600",
                color: isActive ? "#0A1402" : theme.textMuted,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default BudgetFilterTabs;

const styles = StyleSheet.create({
  filterTabsRow: {
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
});
