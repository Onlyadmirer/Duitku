import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import {
  Dumbbell,
  Film,
  Fuel,
  GraduationCap,
  HeartPulse,
  MoreHorizontal,
  ShoppingBag,
  Soup,
  TriangleAlert,
  Utensils,
  Wallet,
  Zap,
} from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";
import { formatRupiah } from "@/lib/formatterRupiah";

export type BudgetIconKey =
  | "zap"
  | "wallet"
  | "fuel"
  | "graduation"
  | "utensils"
  | "snack"
  | "shopping"
  | "health"
  | "entertainment"
  | "sport"
  | "other";

export interface BudgetOverviewItem {
  id: string;
  name: string;
  color?: string;
  spent: number;
  limit: number | null;
  icon: BudgetIconKey;
  status: "aman" | "hampir habis" | "habis" | "melebihi" | "tanpa anggaran";
}

interface MonthlyBudgetSectionProps {
  items: BudgetOverviewItem[];
}

export const resolveCategoryIcon = (name: string): BudgetIconKey => {
  const lower = name.toLowerCase();
  if (lower.includes("listrik") || lower.includes("tagihan")) return "zap";
  if (lower.includes("cadangan") || lower.includes("darurat")) return "wallet";
  if (lower.includes("bensin") || lower.includes("transport")) return "fuel";
  if (lower.includes("kampus") || lower.includes("pendidikan"))
    return "graduation";
  if (lower.includes("makan") || lower.includes("minum")) return "utensils";
  if (lower.includes("jajan") || lower.includes("kopi")) return "snack";
  if (
    lower.includes("belanja") ||
    lower.includes("kebutuhan") ||
    lower.includes("pribadi")
  )
    return "shopping";
  if (lower.includes("sehat") || lower.includes("obat")) return "health";
  if (lower.includes("hiburan") || lower.includes("nonton"))
    return "entertainment";
  if (lower.includes("olahraga") || lower.includes("gym")) return "sport";
  return "other";
};

const MonthlyBudgetSection = ({ items }: MonthlyBudgetSectionProps) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;

  const renderCategoryIcon = (icon: BudgetIconKey, color: string) => {
    const size = 16;
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
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Anggaran Bulan Ini
          </Text>
        </View>

        <Link
          href='/budget'
          style={[styles.seeAllText, { color: theme.primaryText }]}
        >
          Lihat Semua
        </Link>
      </View>

      {/* Budget List Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor: theme.border },
        ]}
      >
        {items.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Belum ada anggaran yang diatur untuk bulan ini.
            </Text>
          </View>
        ) : (
          items.map((item, idx) => {
            const hasLimit = item.limit !== null && item.limit > 0;
            const limitVal = item.limit ?? 0;
            const isOver =
              item.status === "melebihi" || (hasLimit && item.spent > limitVal);
            const categoryColor = item.color || theme.primary;
            const progressColor = isOver ? "#F87171" : categoryColor;
            const iconBg = `${categoryColor}20`;
            const badgeBg = isOver
              ? "rgba(248, 113, 113, 0.1)"
              : theme.primarySoftBg;
            const badgeBorder = isOver
              ? "rgba(248, 113, 113, 0.35)"
              : theme.primarySoftBorder;

            const ratio = hasLimit
              ? Math.min((item.spent / limitVal) * 100, 100)
              : 0;
            const remainingVal = hasLimit ? limitVal - item.spent : 0;
            const usedPct = hasLimit
              ? Math.round((item.spent / limitVal) * 100)
              : 0;
            const isLast = idx === items.length - 1;

            return (
              <View
                key={item.id}
                style={[
                  styles.itemWrap,
                  !isLast && {
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? "#182132" : theme.border,
                  },
                ]}
              >
                <View style={styles.itemTopRow}>
                  <View style={styles.itemLeftRow}>
                    <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                      {renderCategoryIcon(item.icon, categoryColor)}
                    </View>

                    <View style={styles.itemTextCol}>
                      <Text style={[styles.itemName, { color: theme.text }]}>
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.itemAmounts,
                          {
                            color: isOver ? "#F87171" : theme.textMuted,
                            fontWeight: isOver ? "600" : "400",
                          },
                        ]}
                      >
                        Rp{" "}
                        {item.spent === 0
                          ? "0"
                          : formatRupiah(String(item.spent))}
                        {hasLimit
                          ? ` / Rp ${formatRupiah(String(limitVal))}`
                          : " (Tanpa batas anggaran)"}
                      </Text>
                    </View>
                  </View>

                  {/* Status Pill */}
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: badgeBg,
                        borderColor: badgeBorder,
                      },
                    ]}
                  >
                    {isOver ? (
                      <>
                        <TriangleAlert size={11} color='#F87171' />
                        <Text style={[styles.statusText, { color: "#F87171" }]}>
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
                </View>

                {/* Progress Bar */}
                <View
                  style={[
                    styles.progressTrack,
                    { backgroundColor: isDark ? "#182132" : "#E5E7EB" },
                  ]}
                >
                  {item.spent === 0 ? (
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
                          width: isOver
                            ? "100%"
                            : `${Math.max(hasLimit ? ratio : 20, 4)}%`,
                          backgroundColor: progressColor,
                        },
                      ]}
                    />
                  )}
                </View>

                {hasLimit && (
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
                )}
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};

export default MonthlyBudgetSection;

const styles = StyleSheet.create({
  section: {
    marginBottom: 22,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
  },
  card: {
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
  itemWrap: {
    paddingVertical: 14,
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  itemLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  itemTextCol: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
  },
  itemAmounts: {
    fontSize: 11,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
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
