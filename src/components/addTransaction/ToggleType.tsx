import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useModalTransactionContext } from "@/context/ModalTransactionContext";

const ToggleType = () => {
  const { theme, type, setType } = useModalTransactionContext();

  return (
    <View
      style={[
        styles.toggleContainer,
        {
          backgroundColor: theme.backgroundCardModal,
          borderColor: theme.border,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.toggleBtn,
          type === "expense" && { backgroundColor: theme.toggleType },
        ]}
        onPress={() => setType("expense")}
      >
        <ArrowUpRight
          size={18}
          color={type === "expense" ? theme.textType : theme.textMuted}
        />
        <Text
          style={[
            styles.toggleText,
            type === "expense"
              ? { color: theme.textType }
              : { color: theme.textMuted },
          ]}
        >
          Pengeluaran
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.toggleBtn,
          type === "income" && { backgroundColor: theme.toggleType },
        ]}
        onPress={() => setType("income")}
      >
        <ArrowDownLeft
          size={18}
          color={type === "income" ? theme.textType : theme.textMuted}
        />
        <Text
          style={[
            styles.toggleText,
            type === "income"
              ? { color: theme.textType }
              : { color: theme.textMuted },
          ]}
        >
          Pemasukan
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ToggleType;

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: "row",
    borderWidth: 1,
    padding: 6,
    borderRadius: 100,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    padding: 20,
    gap: 4,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
