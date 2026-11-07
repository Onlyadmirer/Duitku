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
import { Trash2 } from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";
import { formatRupiah } from "@/lib/formatterRupiah";

const QUICK_BUDGET_AMOUNTS = [
  { label: "50rb", value: 50000 },
  { label: "100rb", value: 100000 },
  { label: "200rb", value: 200000 },
  { label: "500rb", value: 500000 },
];

export interface EditingBudgetCategory {
  categoryId: number;
  budgetId: number | null;
  name: string;
  currentLimit: number | null;
}

interface BudgetFormModalProps {
  visible: boolean;
  editingCategory: EditingBudgetCategory | null;
  periodLabel: string;
  limitInput: string;
  onChangeLimitInput: (val: string) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  isSubmitting?: boolean;
}

const BudgetFormModal = ({
  visible,
  editingCategory,
  periodLabel,
  limitInput,
  onChangeLimitInput,
  onClose,
  onSave,
  onDelete,
  isSubmitting = false,
}: BudgetFormModalProps) => {
  const { theme, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modalCard,
            {
              backgroundColor: isDark ? "#0F1523" : theme.card,
              borderColor: theme.border,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Atur Anggaran: {editingCategory?.name}
          </Text>
          <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
            Periode {periodLabel}
          </Text>

          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: isDark ? "#182235" : "#F3F4F6",
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.rpPrefix, { color: theme.text }]}>Rp</Text>
            <TextInput
              value={limitInput}
              onChangeText={(val) => onChangeLimitInput(formatRupiah(val))}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.textMuted}
              style={[styles.amountInput, { color: theme.text }]}
            />
          </View>

          <View style={styles.quickRow}>
            {QUICK_BUDGET_AMOUNTS.map((q) => (
              <TouchableOpacity
                key={q.value}
                onPress={() => onChangeLimitInput(formatRupiah(String(q.value)))}
                style={[
                  styles.quickChip,
                  {
                    backgroundColor: isDark ? "#182235" : "#F3F4F6",
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={[styles.quickChipText, { color: theme.text }]}>
                  {q.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalActionsRow}>
            {editingCategory?.budgetId ? (
              <TouchableOpacity
                onPress={onDelete}
                style={styles.deleteBudgetBtn}
              >
                <Trash2 size={16} color="#F87171" />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={onSave}
              disabled={isSubmitting}
              style={[
                styles.saveBudgetBtn,
                {
                  backgroundColor: theme.primary,
                  opacity: isSubmitting ? 0.75 : 1,
                },
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#0A1402" />
              ) : (
                <Text style={styles.saveBudgetBtnText}>Simpan Anggaran</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default BudgetFormModal;

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 16,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  rpPrefix: {
    fontSize: 16,
    fontWeight: "800",
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    paddingVertical: 2,
  },
  quickRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    marginBottom: 18,
  },
  quickChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  modalActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  deleteBudgetBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(248, 113, 113, 0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  saveBudgetBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBudgetBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0A1402",
  },
});
