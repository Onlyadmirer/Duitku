import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Car,
  CupSoda,
  Drumstick,
  Gem,
  Pencil,
  Plus,
  Receipt,
  ReceiptText,
  Sandwich,
  ShoppingBag,
  Soup,
  Trash2,
} from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";
import { formatRupiah } from "@/lib/formatterRupiah";
import {
  RecentTxIconKey,
  resolveTransactionIcon,
} from "@/components/home/RecentTransactionsSection";
import DeleteTransactionModal, {
  DeletableTransactionInfo,
} from "./DeleteTransactionModal";
import { EditableTransactionPayload } from "@/context/ModalTransactionContext";

export interface TransactionRowItem {
  id: number;
  walletId: number;
  categoryId: number;
  note: string | null;
  title: string;
  category: string;
  categoryColor?: string | null;
  wallet: string;
  dateIso: string;
  dateGroupKey: string;
  dateGroupLabel: string;
  amount: number;
  type: "income" | "expense";
  icon: RecentTxIconKey;
}

export interface TransactionDateGroup {
  dateKey: string;
  dateLabel: string;
  dailyNet: number;
  items: TransactionRowItem[];
}

interface TransactionGroupListProps {
  groups: TransactionDateGroup[];
  onAddTransaction: () => void;
  onEditTransaction: (tx: EditableTransactionPayload) => void;
  onDeleteTransaction: (id: number) => void;
}

const TransactionGroupList = ({
  groups,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}: TransactionGroupListProps) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;
  const actionBtnBg = isDark ? "#182235" : "#F3F4F6";

  const [deletingTx, setDeletingTx] = useState<DeletableTransactionInfo | null>(
    null
  );

  const renderIcon = (
    icon: RecentTxIconKey,
    isIncome: boolean,
    categoryColor?: string | null,
  ) => {
    const color =
      categoryColor || (isIncome ? theme.primaryText : "#3B82F6");
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

  if (groups.length === 0) {
    return (
      <View
        style={[
          styles.emptyCard,
          { backgroundColor: cardBg, borderColor: theme.border },
        ]}
      >
        <View
          style={[
            styles.emptyIconCircle,
            { backgroundColor: theme.primarySoftBg },
          ]}
        >
          <ReceiptText size={28} color={theme.primaryText} />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>
          Belum Ada Transaksi
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
          Tidak ada catatan transaksi yang cocok dengan filter atau periode ini.
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onAddTransaction}
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
        >
          <Plus size={16} color="#0A1402" strokeWidth={2.5} />
          <Text style={styles.addBtnText}>Catat Transaksi Baru</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <View style={styles.groupsContainer}>
        {groups.map((group) => {
          const isDailyPositive = group.dailyNet >= 0;
          return (
            <View key={group.dateKey} style={styles.groupBlock}>
              {/* Date Group Header */}
              <View style={styles.groupHeader}>
                <Text
                  style={[styles.groupDateText, { color: theme.textMuted }]}
                >
                  {group.dateLabel}
                </Text>
                <Text
                  style={[
                    styles.groupNetText,
                    {
                      color: isDailyPositive
                        ? theme.primaryText
                        : theme.textMuted,
                    },
                  ]}
                >
                  {isDailyPositive ? "+" : "-"}Rp{" "}
                  {formatRupiah(String(Math.abs(group.dailyNet)))}
                </Text>
              </View>

              {/* Transactions Card for this date */}
              <View
                style={[
                  styles.groupCard,
                  { backgroundColor: cardBg, borderColor: theme.border },
                ]}
              >
                {group.items.map((item, idx) => {
                  const isIncome = item.type === "income";
                  const isLast = idx === group.items.length - 1;
                  const iconBg = item.categoryColor
                    ? `${item.categoryColor}20`
                    : isIncome
                      ? "rgba(180, 240, 0, 0.14)"
                      : isDark
                        ? "#182235"
                        : "#F3F4F6";

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.txRow,
                        !isLast && {
                          borderBottomWidth: 1,
                          borderBottomColor: isDark ? "#182132" : theme.border,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        activeOpacity={0.75}
                        style={styles.txLeft}
                        onPress={() =>
                          onEditTransaction({
                            id: item.id,
                            walletId: item.walletId,
                            categoryId: item.categoryId,
                            amount: item.amount,
                            type: item.type,
                            note: item.note,
                            date: item.dateIso,
                          })
                        }
                      >
                        <View
                          style={[
                            styles.iconCircle,
                            { backgroundColor: iconBg },
                          ]}
                        >
                          {renderIcon(item.icon, isIncome, item.categoryColor)}
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
                            numberOfLines={1}
                          >
                            {item.category} • {item.wallet}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <View style={styles.txRight}>
                        <Text
                          style={[
                            styles.txAmount,
                            { color: isIncome ? theme.primaryText : theme.text },
                          ]}
                        >
                          {isIncome ? "+" : "-"}Rp{" "}
                          {formatRupiah(String(item.amount))}
                        </Text>

                        <View style={styles.actionBtnsWrap}>
                          <TouchableOpacity
                            activeOpacity={0.75}
                            onPress={() =>
                              onEditTransaction({
                                id: item.id,
                                walletId: item.walletId,
                                categoryId: item.categoryId,
                                amount: item.amount,
                                type: item.type,
                                note: item.note,
                                date: item.dateIso,
                              })
                            }
                            style={[
                              styles.actionIconBtn,
                              {
                                backgroundColor: actionBtnBg,
                                borderColor: theme.border,
                              },
                            ]}
                          >
                            <Pencil size={13} color={theme.text} />
                          </TouchableOpacity>

                          <TouchableOpacity
                            activeOpacity={0.75}
                            onPress={() =>
                              setDeletingTx({
                                id: item.id,
                                title: item.title,
                                category: item.category,
                                wallet: item.wallet,
                                amount: item.amount,
                                type: item.type,
                              })
                            }
                            style={styles.deleteIconBtn}
                          >
                            <Trash2 size={13} color="#F87171" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>

      {/* Custom Delete Confirmation Popup */}
      <DeleteTransactionModal
        visible={deletingTx !== null}
        transaction={deletingTx}
        onCancel={() => setDeletingTx(null)}
        onConfirmDelete={(id) => {
          onDeleteTransaction(id);
          setDeletingTx(null);
        }}
      />
    </>
  );
};

export { resolveTransactionIcon };
export default TransactionGroupList;

const styles = StyleSheet.create({
  groupsContainer: {
    gap: 18,
  },
  groupBlock: {
    gap: 8,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  groupDateText: {
    fontSize: 12,
    fontWeight: "700",
  },
  groupNetText: {
    fontSize: 12,
    fontWeight: "700",
  },
  groupCard: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
  },
  txRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    gap: 10,
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
  },
  txRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
  },
  actionBtnsWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(248, 113, 113, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCard: {
    borderRadius: 22,
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(180, 240, 0, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0A1402",
  },
});
