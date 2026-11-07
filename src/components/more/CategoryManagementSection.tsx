import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Layers, Pencil, Plus, Trash2 } from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";

export interface CategoryManageItem {
  id: number;
  name: string;
  type: "income" | "expense";
  color: string;
}

interface CategoryManagementSectionProps {
  categories: CategoryManageItem[];
  activeTab: "expense" | "income";
  onChangeTab: (tab: "expense" | "income") => void;
  onPressAdd: () => void;
  onPressEdit: (cat: CategoryManageItem) => void;
  onPressDelete: (cat: CategoryManageItem) => void;
}

const CategoryManagementSection = ({
  categories,
  activeTab,
  onChangeTab,
  onPressAdd,
  onPressEdit,
  onPressDelete,
}: CategoryManagementSectionProps) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;
  const subBg = isDark ? "#182235" : "#F3F4F6";

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Layers size={18} color={theme.primaryText} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Kategori
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressAdd}
          style={[styles.addPillBtn, { backgroundColor: theme.primary }]}
        >
          <Plus size={14} color='#0A1402' strokeWidth={2.5} />
          <Text style={styles.addPillText}>Tambah Kategori</Text>
        </TouchableOpacity>
      </View>

      {/* Toggle Expense / Income Categories */}
      <View
        style={[
          styles.tabsContainer,
          { backgroundColor: cardBg, borderColor: theme.border },
        ]}
      >
        {(
          [
            { key: "expense", label: "Pengeluaran" },
            { key: "income", label: "Pemasukan" },
          ] as const
        ).map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onChangeTab(tab.key)}
              style={[
                styles.tabBtn,
                active && { backgroundColor: theme.primary },
              ]}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: active ? "800" : "600",
                  color: active ? "#0A1402" : theme.textMuted,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor: theme.border },
        ]}
      >
        {filteredCategories.map((c, idx) => {
          const isLast = idx === filteredCategories.length - 1;
          return (
            <View
              key={c.id}
              style={[
                styles.itemRow,
                !isLast && {
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? "#182132" : theme.border,
                },
              ]}
            >
              <View style={styles.itemLeft}>
                <View
                  style={[
                    styles.colorDotBox,
                    { backgroundColor: `${c.color}22` },
                  ]}
                >
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: c.color || theme.primary },
                    ]}
                  />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: theme.text }]}>
                    {c.name}
                  </Text>
                  <Text style={[styles.itemMeta, { color: theme.textMuted }]}>
                    {c.type === "expense"
                      ? "Kategori Pengeluaran"
                      : "Kategori Pemasukan"}
                  </Text>
                </View>
              </View>

              <View style={styles.actionBtns}>
                <TouchableOpacity
                  onPress={() => onPressEdit(c)}
                  style={[
                    styles.actionBtn,
                    { backgroundColor: subBg, borderColor: theme.border },
                  ]}
                >
                  <Pencil size={13} color={theme.text} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onPressDelete(c)}
                  style={styles.deleteBtn}
                >
                  <Trash2 size={13} color='#F87171' />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default CategoryManagementSection;

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
  addPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  addPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0A1402",
  },
  tabsContainer: {
    flexDirection: "row",
    borderRadius: 999,
    borderWidth: 1,
    padding: 4,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
  },
  card: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    gap: 10,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  colorDotBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
  },
  itemMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  actionBtns: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(248, 113, 113, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});
