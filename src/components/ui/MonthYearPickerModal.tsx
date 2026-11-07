import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "@/constants/useTheme";

export const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export const MONTHS_FULL = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

interface MonthYearPickerModalProps {
  visible: boolean;
  selectedYear: number;
  selectedMonthIdx: number;
  onChangeYear: (year: number) => void;
  onSelectMonth: (monthIdx: number) => void;
  onClose: () => void;
}

const MonthYearPickerModal = ({
  visible,
  selectedYear,
  selectedMonthIdx,
  onChangeYear,
  onSelectMonth,
  onClose,
}: MonthYearPickerModalProps) => {
  const { theme, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
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
          <View style={styles.yearRow}>
            <TouchableOpacity
              onPress={() => onChangeYear(selectedYear - 1)}
              style={[styles.yearBtn, { borderColor: theme.border }]}
            >
              <Text style={{ color: theme.text, fontWeight: "700" }}>
                {"<"}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.yearTitle, { color: theme.text }]}>
              {selectedYear}
            </Text>
            <TouchableOpacity
              onPress={() => onChangeYear(selectedYear + 1)}
              style={[styles.yearBtn, { borderColor: theme.border }]}
            >
              <Text style={{ color: theme.text, fontWeight: "700" }}>
                {">"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.monthsGrid}>
            {MONTHS_SHORT.map((label, idx) => {
              const isSelected = idx === selectedMonthIdx;
              return (
                <TouchableOpacity
                  key={label}
                  style={[
                    styles.monthChip,
                    {
                      backgroundColor: isSelected
                        ? theme.primary
                        : isDark
                          ? "#182235"
                          : "#F3F4F6",
                    },
                  ]}
                  onPress={() => {
                    onSelectMonth(idx);
                    onClose();
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? "#0A1402" : theme.text,
                      fontWeight: isSelected ? "800" : "600",
                      fontSize: 13,
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default MonthYearPickerModal;

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
    maxWidth: 340,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
  },
  yearRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  yearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  yearTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  monthsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
  },
  monthChip: {
    width: "30%",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
});
