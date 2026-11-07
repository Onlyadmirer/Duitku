import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "@/constants/useTheme";
import { formatRupiah } from "@/lib/formatterRupiah";

interface WalletFormModalProps {
  visible: boolean;
  isEditing: boolean;
  walletName: string;
  onChangeWalletName: (val: string) => void;
  walletInitialBalance: string;
  onChangeInitialBalance: (val: string) => void;
  onClose: () => void;
  onSave: () => void;
  isSubmitting?: boolean;
}

const WalletFormModal = ({
  visible,
  isEditing,
  walletName,
  onChangeWalletName,
  walletInitialBalance,
  onChangeInitialBalance,
  onClose,
  onSave,
  isSubmitting = false,
}: WalletFormModalProps) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;
  const subBg = isDark ? "#182235" : "#F3F4F6";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modalCard,
            { backgroundColor: cardBg, borderColor: theme.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            {isEditing ? "Edit Dompet" : "Tambah Dompet Baru"}
          </Text>

          <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
            Nama Dompet (mis. Cash, BTN, GoPay)
          </Text>
          <TextInput
            value={walletName}
            onChangeText={onChangeWalletName}
            placeholder="Contoh: GoPay"
            placeholderTextColor={theme.textMuted}
            style={[
              styles.textInput,
              {
                backgroundColor: subBg,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
          />

          <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
            Saldo Awal (Rp)
          </Text>
          <TextInput
            value={walletInitialBalance}
            onChangeText={(val) => onChangeInitialBalance(formatRupiah(val))}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={theme.textMuted}
            style={[
              styles.textInput,
              {
                backgroundColor: subBg,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.cancelModalBtn,
                { backgroundColor: subBg, borderColor: theme.border },
              ]}
            >
              <Text style={{ color: theme.text, fontWeight: "700" }}>
                Batal
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSave}
              disabled={isSubmitting}
              style={[
                styles.saveModalBtn,
                {
                  backgroundColor: theme.primary,
                  opacity: isSubmitting ? 0.75 : 1,
                },
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#0A1402" />
              ) : (
                <Text style={{ color: "#0A1402", fontWeight: "800" }}>
                  Simpan
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default WalletFormModal;

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
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    width: "100%",
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
  },
  saveModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
});
