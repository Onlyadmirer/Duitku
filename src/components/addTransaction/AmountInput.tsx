import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useModalTransactionContext } from "@/context/ModalTransactionContext";
import { useState } from "react";

export const QUICK_AMOUNTS = [
  { label: "25rb", value: 25000 },
  { label: "50rb", value: 50000 },
  { label: "100rb", value: 100000 },
  { label: "250rb", value: 250000 },
];

const AmountInput = () => {
  const {
    theme,
    isDark,
    amount,
    handleChangeNominal,
    selectedAmount,
    handlePress,
  } = useModalTransactionContext();

  return (
    <View
      style={[
        styles.inputGroup,
        {
          backgroundColor: theme.backgroundCardModal,
          borderColor: theme.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: theme.textMuted }]}>
        NOMINAL TRANSAKSI
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: "900" }}>
          Rp
        </Text>
        <TextInput
          style={[
            styles.amountInput,
            { backgroundColor: theme.backgroundCardModal, color: theme.text },
          ]}
          placeholder='0'
          placeholderTextColor={theme.textMuted}
          keyboardType='numeric'
          value={amount}
          onChangeText={handleChangeNominal}
        />
      </View>

      <View style={[styles.quickAmount]}>
        {QUICK_AMOUNTS.map((item) => {
          const isSelected = selectedAmount === item.value;

          return (
            <TouchableOpacity
              key={item.value}
              onPress={() => handlePress(item.value)}
            >
              <Text
                style={[
                  styles.amount,
                  {
                    color: isSelected && isDark ? theme.background : theme.text,
                    borderColor: theme.borderQuickAmount,
                    backgroundColor: isSelected
                      ? theme.tabActive
                      : theme.backgroundCardModal,
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default AmountInput;

const styles = StyleSheet.create({
  inputGroup: {
    flexDirection: "column",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 1,
    marginVertical: 20,
    alignItems: "center",
    paddingVertical: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 8,
  },
  amountInput: {
    borderRadius: 10,
    fontSize: 24,
    padding: 10,
    fontWeight: "bold",
    maxWidth: 200,
  },

  quickAmount: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  amount: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    fontSize: 12,
    borderRadius: 20,
  },
});
