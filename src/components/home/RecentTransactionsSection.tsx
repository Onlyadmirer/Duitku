import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import {
  Car,
  CupSoda,
  Drumstick,
  Gem,
  Receipt,
  Sandwich,
  ShoppingBag,
  Soup,
} from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";
import { formatRupiah } from "@/lib/formatterRupiah";

export type RecentTxIconKey =
  | "gem"
  | "soup"
  | "sandwich"
  | "drink"
  | "drumstick"
  | "shopping"
  | "transport"
  | "receipt";

export interface RecentTransactionItem {
  id: string;
  title: string;
  category: string;
  wallet: string;
  dateLabel: string;
  amount: number;
  type: "income" | "expense";
  icon: RecentTxIconKey;
}

interface RecentTransactionsSectionProps {
  items: RecentTransactionItem[];
}

export const resolveTransactionIcon = (
  title: string,
  category: string,
  type: "income" | "expense"
): RecentTxIconKey => {
  if (type === "income") return "gem";
  const text = `${title} ${category}`.toLowerCase();
  if (text.includes("es ") || text.includes("jeruk") || text.includes("minum") || text.includes("kopi"))
    return "drink";
  if (text.includes("bakso") || text.includes("ayam")) return "drumstick";
  if (text.includes("gacoan") || text.includes("mie") || text.includes("jajan"))
    return "soup";
  if (text.includes("nasi") || text.includes("makan")) return "sandwich";
  if (text.includes("belanja") || text.includes("kebutuhan")) return "shopping";
  if (text.includes("bensin") || text.includes("transport") || text.includes("parkir"))
    return "transport";
  return "receipt";
};

const RecentTransactionsSection = ({
  items,
}: RecentTransactionsSectionProps) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;

  const renderIcon = (icon: RecentTxIconKey, isIncome: boolean) => {
    const color = isIncome ? theme.primary : "#93C5FD";
    const size = 18;
    switch (icon) {
      case "gem":
        return <Gem size={size} color={color} />;
      case "soup":
        return <Soup size={size} color={color} />;
      case "sandwich":
        return <Sandwich size={size} color={color} />;
      case "drink":
        return <CupSoda size={size} color={color} />;
      case "drumstick":
        return <Drumstick size={size} color={color} />;
      case "shopping":
        return <ShoppingBag size={size} color={color} />;
      case "transport":
        return <Car size={size} color={color} />;
      case "receipt":
        return <Receipt size={size} color={color} />;
    }
  };

  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Transaksi Terbaru
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
            Aktivitas keuangan paling mutakhir
          </Text>
        </View>

        <Link
          href="/transaction"
          style={[styles.seeAllText, { color: theme.primary }]}
        >
          Lihat Semua
        </Link>
      </View>

      {/* Transactions Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor: theme.border },
        ]}
      >
        {items.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Belum ada transaksi tercatat pada periode ini.
            </Text>
          </View>
        ) : (
          items.map((item) => {
            const isIncome = item.type === "income";
            const iconBg = isIncome
              ? "rgba(180, 240, 0, 0.14)"
              : isDark
                ? "#182235"
                : "#F3F4F6";

            return (
              <View key={item.id} style={styles.txRow}>
                <View style={styles.txLeft}>
                  <View
                    style={[styles.iconCircle, { backgroundColor: iconBg }]}
                  >
                    {renderIcon(item.icon, isIncome)}
                  </View>

                  <View style={styles.txInfo}>
                    <Text
                      style={[styles.txTitle, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[styles.txMeta, { color: theme.textMuted }]}
                      numberOfLines={2}
                    >
                      {item.category} • {item.wallet} • {item.dateLabel}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.txAmount,
                    { color: isIncome ? theme.primary : theme.text },
                  ]}
                >
                  {isIncome ? "+" : "-"}Rp {formatRupiah(String(item.amount))}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};

export default RecentTransactionsSection;

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
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
    paddingVertical: 8,
    borderWidth: 1,
  },
  emptyWrap: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 12,
  },
  txRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  txLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  txMeta: {
    fontSize: 11,
    marginTop: 3,
    lineHeight: 15,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
  },
});
