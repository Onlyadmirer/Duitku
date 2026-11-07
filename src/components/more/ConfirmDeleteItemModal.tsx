import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TriangleAlert } from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";

export interface DeleteTargetItem {
  kind: "wallet" | "category";
  id: number;
  name: string;
}

interface ConfirmDeleteItemModalProps {
  target: DeleteTargetItem | null;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const ConfirmDeleteItemModal = ({
  target,
  onCancel,
  onConfirm,
  isDeleting = false,
}: ConfirmDeleteItemModalProps) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;
  const subBg = isDark ? "#182235" : "#F3F4F6";

  return (
    <Modal
      visible={target !== null}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={[
            styles.modalCard,
            {
              backgroundColor: cardBg,
              borderColor: theme.border,
              alignItems: "center",
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.dangerIconWrap}>
            <TriangleAlert size={24} color="#F87171" />
          </View>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Hapus {target?.kind === "wallet" ? "Dompet" : "Kategori"}?
          </Text>
          <Text
            style={{
              color: theme.textMuted,
              fontSize: 12,
              textAlign: "center",
              marginTop: 6,
              marginBottom: 18,
            }}
          >
            Yakin ingin menghapus &ldquo;{target?.name}&rdquo; dari daftar?
          </Text>

          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={onCancel}
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
              onPress={onConfirm}
              disabled={isDeleting}
              style={[
                styles.saveModalBtn,
                {
                  backgroundColor: "#EF4444",
                  opacity: isDeleting ? 0.75 : 1,
                },
              ]}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>
                  Ya, Hapus
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ConfirmDeleteItemModal;

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
  },
  dangerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(248, 113, 113, 0.16)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
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
