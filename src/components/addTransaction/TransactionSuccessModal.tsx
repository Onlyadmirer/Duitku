import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CheckCircle2, Plus, Wallet } from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";
import { formatRupiah } from "@/lib/formatterRupiah";

export interface SavedTransactionSuccessInfo {
  isEditing: boolean;
  type: "income" | "expense";
  amount: number;
  categoryName: string;
  walletName: string;
  dateLabel: string;
  note?: string;
}

interface TransactionSuccessModalProps {
  visible: boolean;
  info: SavedTransactionSuccessInfo | null;
  onClose: () => void;
  onAddAnother: () => void;
}

const TransactionSuccessModal = ({
  visible,
  info,
  onClose,
  onAddAnother,
}: TransactionSuccessModalProps) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;
  const subBg = isDark ? "#182235" : "#F3F4F6";

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!info) return null;

  const isIncome = info.type === "income";
  const amountColor = isIncome ? theme.primaryText : "#F87171";
  const amountPrefix = isIncome ? "+Rp " : "-Rp ";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropDismiss} onPress={onClose} />

        <Animated.View
          style={[
            styles.modalCard,
            {
              backgroundColor: cardBg,
              borderColor: theme.border,
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Check Icon Badge */}
          <View
            style={[
              styles.iconRing,
              {
                backgroundColor: theme.primarySoftBg,
                borderColor: theme.primarySoftBorder,
              },
            ]}
          >
            <CheckCircle2
              size={34}
              color={theme.primaryText}
              strokeWidth={2.3}
            />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            {info.isEditing
              ? "Transaksi Berhasil Diperbarui!"
              : "Transaksi Berhasil Dibuat!"}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Catatan keuanganmu sudah tersimpan dan saldo dompet telah diperbarui
          </Text>

          {/* Amount Highlight */}
          <Text style={[styles.amountText, { color: amountColor }]}>
            {amountPrefix}
            {formatRupiah(String(info.amount))}
          </Text>

          {/* Detail Box */}
          <View
            style={[
              styles.detailCard,
              { backgroundColor: subBg, borderColor: theme.border },
            ]}
          >
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                Tipe Transaksi
              </Text>
              <Text
                style={[
                  styles.detailVal,
                  { color: isIncome ? theme.primaryText : "#F87171" },
                ]}
              >
                {isIncome ? "Pemasukan" : "Pengeluaran"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                Kategori
              </Text>
              <Text style={[styles.detailVal, { color: theme.text }]}>
                {info.categoryName}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                Sumber Dompet
              </Text>
              <View style={styles.walletValRow}>
                <Wallet size={12} color={theme.primaryText} />
                <Text style={[styles.detailVal, { color: theme.text }]}>
                  {info.walletName}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                Tanggal
              </Text>
              <Text style={[styles.detailVal, { color: theme.text }]}>
                {info.dateLabel}
              </Text>
            </View>

            {info.note?.trim() ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                  Catatan
                </Text>
                <Text
                  style={[
                    styles.detailVal,
                    { color: theme.text, maxWidth: "65%", textAlign: "right" },
                  ]}
                  numberOfLines={2}
                >
                  {info.note.trim()}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onAddAnother}
              style={[
                styles.secondaryBtn,
                { backgroundColor: subBg, borderColor: theme.border },
              ]}
            >
              <Plus size={15} color={theme.text} />
              <Text style={[styles.secondaryBtnText, { color: theme.text }]}>
                Tambah Lagi
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onClose}
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.primaryBtnText}>Selesai</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default TransactionSuccessModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  backdropDismiss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: "100%",
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    alignItems: "center",
  },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 17,
    paddingHorizontal: 8,
  },
  amountText: {
    fontSize: 24,
    fontWeight: "900",
    marginTop: 14,
    marginBottom: 14,
    letterSpacing: -0.4,
  },
  detailCard: {
    width: "100%",
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  detailVal: {
    fontSize: 12,
    fontWeight: "700",
  },
  walletValRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionsRow: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  primaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0A1402",
  },
});
