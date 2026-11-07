import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Text,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import AmountInput from "@/components/addTransaction/AmountInput";
import { SafeAreaView } from "react-native-safe-area-context";
import ToggleType from "@/components/addTransaction/ToggleType";
import { useModalTransactionContext } from "@/context/ModalTransactionContext";
import FormInput from "@/components/addTransaction/FormInput";
import { Save } from "lucide-react-native";

export default function AddTransactionModal() {
  const { theme, handleSave } = useModalTransactionContext();
  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.background,
          borderColor: theme.text,
        },
      ]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ flex: 1 }} // ← wajib
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40, // ruang ekstra
          }}
          nestedScrollEnabled
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        >
          <View
            style={{
              width: 40,
              height: 5,
              borderRadius: 999,
              backgroundColor: "#71717A",
              alignSelf: "center",
              marginBottom: 16,
            }}
          />
          {/* Toggle Type (Income / Expense) */}
          <ToggleType />
          {/* Amount Input */}
          <AmountInput />
          {/* {form input} */}
          <FormInput />

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
            onPress={() => handleSave()}
          >
            <Save size={18} />
            <Text
              style={[styles.submitButtonText, { color: theme.background }]}
            >
              Simpan Transaksi
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    borderRadius: 20,
    borderTopWidth: 0.1,
    borderLeftWidth: 0.1,
    borderRightWidth: 0.1,
    borderBottomWidth: 0,
  },
  submitButton: {
    flexDirection: "row",
    borderRadius: 999,
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
