import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  Dumbbell,
  Film,
  Fuel,
  GraduationCap,
  HeartPulse,
  MoreHorizontal,
  Pencil,
  Plus,
  ShoppingBag,
  Soup,
  TriangleAlert,
  Utensils,
  Wallet,
  Zap,
} from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";
import { formatRupiah } from "@/lib/formatterRupiah";
import {
  BudgetIconKey,
  resolveCategoryIcon,
} from "@/components/home/MonthlyBudgetSection";

export interface BudgetCategoryRowItem {
  id: number;
  budgetId?: number | null;
  name: string;
  color: string;
  limit: number | null;
  spent: number | string;
  status: string;
}

interface BudgetCategoryListProps {
  items: BudgetCategoryRowItem[];
  onPressEditBudget: (item: {
    id: number;
    budgetId: number | null;
    name: string;
    limit: number | null;
  }) => void;
}

const BudgetCategoryList = ({
  items,
  onPressEditBudget,
}: BudgetCategoryListProps) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;

  const renderCategoryIcon = (icon: BudgetIconKey, color: string) => {
    const size = 17;
    switch (icon) {
      case "zap":
        return <Zap size={size} color={color} />;
      case "wallet":
        return <Wallet size={size} color={color} />;
      case "fuel":
        return <Fuel size={size} color={color} />;
      case "graduation":
        return <GraduationCap size={size} color={color} />;
      case "utensils":
        return <Utensils size={size} color={color} />;
      case "snack":
        return <Soup size={size} color={color} />;
      case "shopping":
        return <ShoppingBag size={size} color={color} />;
      case "health":
        return <HeartPulse size={size} color={color} />;
      case "entertainment":
        return <Film size={size} color={color} />;
      case "sport":
        return <Dumbbell size={size} color={color} />;
      case "other":
        return <MoreHorizontal size={size} color={color} />;
    }
  };

  return (
    <View
      style={[
        styles.listCard,
        { backgroundColor: cardBg, borderColor: theme.border },
      ]}
    >
      {items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            Tidak ada kategori yang sesuai dengan filter ini.
          </Text>
        </View>
      ) : (
        items.map((item, idx) => {
          const spentVal = typeof item.spent === "number" ? item.spent : 0;
          const hasLimit = item.limit !== null && item.limit > 0;
          const limitVal = item.limit ?? 0;
          const isOver = hasLimit && spentVal > limitVal;
          const categoryColor = item.color || theme.primary;
          const progressColor = isOver ? "#F87171" : categoryColor;
          const iconKey = resolveCategoryIcon(item.name);
          const ratio = hasLimit
            ? Math.min((spentVal / limitVal) * 100, 100)
            : 0;
          const remainingVal = hasLimit ? limitVal - spentVal : 0;
          const usedPct = hasLimit
            ? Math.round((spentVal / limitVal) * 100)
            : 0;
          const isLast = idx === items.length - 1;

          return (
            <View
              key={item.id}
              style={[
                styles.itemRowWrap,
                !isLast && {
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? "#182132" : theme.border,
                },
              ]}
            >
              <View style={styles.itemTopRow}>
                <View style={styles.itemLeft}>
                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor: `${categoryColor}20`,
                      },
                    ]}
                  >
                    {renderCategoryIcon(iconKey, categoryColor)}
                  </View>

                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: theme.text }]}>
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.itemSubText,
                        {
                          color: isOver ? "#F87171" : theme.textMuted,
                          fontWeight: isOver ? "600" : "400",
                        },
                      ]}
                    >
                      Rp {spentVal === 0 ? "0" : formatRupiah(String(spentVal))}
                      {hasLimit
                        ? ` / Rp ${formatRupiah(String(limitVal))}`
                        : " • Belum ada batas"}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemRightActions}>
                  {hasLimit && (
                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor: isOver
                            ? "rgba(248, 113, 113, 0.1)"
                            : theme.primarySoftBg,
                          borderColor: isOver
                            ? "rgba(248, 113, 113, 0.35)"
                            : theme.primarySoftBorder,
                        },
                      ]}
                    >
                      {isOver ? (
                        <>
                          <TriangleAlert size={11} color='#F87171' />
                          <Text
                            style={[styles.statusText, { color: "#F87171" }]}
                          >
                            Melebihi
                          </Text>
                        </>
                      ) : (
                        <>
                          <View
                            style={[
                              styles.statusDot,
                              { backgroundColor: theme.primaryText },
                            ]}
                          />
                          <Text
                            style={[
                              styles.statusText,
                              { color: theme.primaryText },
                            ]}
                          >
                            Aman
                          </Text>
                        </>
                      )}
                    </View>
                  )}

                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() =>
                      onPressEditBudget({
                        id: item.id,
                        budgetId: item.budgetId ?? null,
                        name: item.name,
                        limit: item.limit,
                      })
                    }
                    style={[
                      styles.editBtn,
                      {
                        backgroundColor: isDark ? "#182235" : "#F3F4F6",
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    {hasLimit ? (
                      <Pencil size={13} color={theme.text} />
                    ) : (
                      <>
                        <Plus size={13} color={theme.primaryText} />
                        <Text
                          style={[
                            styles.setBudgetText,
                            { color: theme.primaryText },
                          ]}
                        >
                          Atur
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Progress Bar & Remaining Budget */}
              {hasLimit && (
                <>
                  <View
                    style={[
                      styles.progressTrack,
                      { backgroundColor: isDark ? "#182132" : "#E5E7EB" },
                    ]}
                  >
                    {spentVal === 0 ? (
                      <View
                        style={[
                          styles.progressZeroDot,
                          { backgroundColor: categoryColor },
                        ]}
                      />
                    ) : (
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: isOver ? "100%" : `${Math.max(ratio, 4)}%`,
                            backgroundColor: progressColor,
                          },
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.remainingRow}>
                    <Text
                      style={[
                        styles.remainingLabel,
                        { color: isOver ? "#F87171" : theme.textMuted },
                      ]}
                    >
                      {isOver ? (
                        <>
                          Sisa Rp 0{" • "}
                          <Text style={styles.overBudgetStrong}>
                            Lebih Rp{" "}
                            {formatRupiah(String(Math.abs(remainingVal)))}
                          </Text>
                        </>
                      ) : (
                        <>
                          Sisa :{" "}
                          <Text
                            style={[
                              styles.remainingStrong,
                              { color: theme.primaryText },
                            ]}
                          >
                            Rp{" "}
                            {remainingVal === 0
                              ? "0"
                              : formatRupiah(String(remainingVal))}
                          </Text>
                        </>
                      )}
                    </Text>

                    <Text
                      style={[
                        styles.usedPctText,
                        { color: isOver ? "#F87171" : theme.textMuted },
                      ]}
                    >
                      {usedPct}% terpakai
                    </Text>
                  </View>
                </>
              )}
            </View>
          );
        })
      )}
    </View>
  );
};

export default BudgetCategoryList;

const styles = StyleSheet.create({
  listCard: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
  },
  emptyWrap: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 12,
  },
  itemRowWrap: {
    paddingVertical: 14,
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
  },
  itemSubText: {
    fontSize: 11,
    marginTop: 2,
  },
  itemRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  setBudgetText: {
    fontSize: 11,
    fontWeight: "700",
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    marginTop: 10,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  progressZeroDot: {
    width: 7,
    height: 6,
    borderRadius: 999,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  remainingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 7,
  },
  remainingLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  remainingStrong: {
    fontWeight: "700",
  },
  overBudgetStrong: {
    color: "#F87171",
    fontWeight: "700",
  },
  usedPctText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
