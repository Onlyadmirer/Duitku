import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Trash2, TriangleAlert } from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";
import { formatRupiah } from "@/lib/formatterRupiah";

export interface DeletableTransactionInfo {
  id: number;
  title: string;
  category: string;
  wallet: string;
  amount: number;
  type: "income" | "expense";
  dateLabel?: string;
}

interface DeleteTransactionModalProps {
  visible: boolean;
  transaction: DeletableTransactionInfo | null;
  onCancel: () => void;
  onConfirmDelete: (id: number) => void;
}

const DeleteTransactionModal = ({
  visible,
  transaction,
  onCancel,
  onConfirmDelete,
}: DeleteTransactionModalProps) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;
  const previewBg = isDark ? "#161F33" : "#F3F4F6";

  if (!transaction) return null;

  const isIncome = transaction.type === "income";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={[
            styles.modalCard,
            { backgroundColor: cardBg, borderColor: theme.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Danger Icon Header */}
          <View style={styles.iconBadgeOuter}>
            <View style={styles.iconBadgeInner}>
              <TriangleAlert size={26} color="#F87171" strokeWidth={2.2} />
            </View>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            Hapus Transaksi Ini?
          </Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Data transaksi yang dihapus tidak dapat dikembalikan dan saldo
            dompet akan disesuaikan otomatis.
          </Text>

          {/* Transaction Preview Box */}
          <View
            style={[
              styles.previewCard,
              { backgroundColor: previewBg, borderColor: theme.border },
            ]}
          >
            <View style={styles.previewLeft}>
              <Text
                style={[styles.previewTitle, { color: theme.text }]}
                numberOfLines={1}
              >
                {transaction.title}
              </Text>
              <Text
                style={[styles.previewMeta, { color: theme.textMuted }]}
                numberOfLines={1}
              >
                {transaction.category} • {transaction.wallet}
              </Text>
            </View>

            <Text
              style={[
                styles.previewAmount,
                { color: isIncome ? theme.primaryText : "#F87171" },
              ]}
            >
              {isIncome ? "+" : "-"}Rp{" "}
              {formatRupiah(String(transaction.amount))}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCancel}
              style={[
                styles.cancelBtn,
                {
                  backgroundColor: isDark ? "#182235" : "#E5E7EB",
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.cancelBtnText, { color: theme.text }]}>
                Batal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => onConfirmDelete(transaction.id)}
              style={styles.deleteBtn}
            >
              <Trash2 size={16} color="#FFFFFF" strokeWidth={2.3} />
              <Text style={styles.deleteBtnText}>Ya, Hapus</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default DeleteTransactionModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.68)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    alignItems: "center",
  },
  iconBadgeOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(248, 113, 113, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  iconBadgeInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(248, 113, 113, 0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 16,
  },
  previewCard: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    gap: 10,
  },
  previewLeft: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  previewMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  previewAmount: {
    fontSize: 14,
    fontWeight: "800",
  },
  actionsRow: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 999,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
