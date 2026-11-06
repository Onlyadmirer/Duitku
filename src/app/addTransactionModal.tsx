import ThemedText from "@/components/ThemedText";
import { Calendar, X } from "lucide-react-native";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import DateTimePicker, {
  DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import ThemedView from "@/components/ThemedView";
import { useAddTransaction } from "@/services/transactions/hooks/useTransactions";

export type addTransactionType = {
  walletId: number;
  categoryId: number;
  amount: number;
  type: "income" | "expense";
  note?: string;
  date: string;
};

export type amountType = {};

export default function AddTransactionModal() {
  // Inisialisasi state sesuai dengan type yang diberikan
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState<string>("");
  const [walletId, setWalletId] = useState<number>(1); // Mock default ID
  const [categoryId, setCategoryId] = useState<number>(1); // Mock default ID
  const [note, setNote] = useState<string>("");

  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (
    event: DateTimePickerChangeEvent,
    selectedDate: Date,
  ) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleOnDismiss = () => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
  };

  const formattedDate = date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const { mutateAsync, isError, isPending } = useAddTransaction();

  const handleSave = async () => {
    const newTransaction: addTransactionType = {
      walletId,
      categoryId,
      amount: parseFloat(amount) || 0,
      type,
      note,
      date: date.toISOString(),
    };

    console.log("Data Disimpan:", newTransaction);
    // TODO: Panggil fungsi mutasi TanStack Query di sini

    await mutateAsync(newTransaction);
  };

  return (
    <ThemedView style={styles.safeArea}>
      {/* Header Modal */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <ThemedText style={{ fontSize: 20, fontWeight: "bold" }}>
          Tambah Transaksi
        </ThemedText>

        {/* Tombol Close */}
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <X color='#A1A1AA' size={24} />
        </Pressable>
      </View>
      {/* Toggle Type (Income / Expense) */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleBtn, type === "expense" && styles.expenseActive]}
          onPress={() => setType("expense")}
        >
          <Text
            style={[styles.toggleText, type === "expense" && styles.activeText]}
          >
            Pengeluaran
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, type === "income" && styles.incomeActive]}
          onPress={() => setType("income")}
        >
          <Text
            style={[styles.toggleText, type === "income" && styles.activeText]}
          >
            Pemasukan
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount Input */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Jumlah (Rp)</ThemedText>
        <TextInput
          style={styles.amountInput}
          placeholder='0'
          keyboardType='numeric'
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      {/* Date Input */}
      <View style={{ marginVertical: 12 }}>
        <ThemedText style={styles.label}>Tanggal</ThemedText>
        <Pressable
          onPress={() => setShowPicker(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            padding: 14,
            borderRadius: 12,
            backgroundColor: "#919191",
            borderWidth: 1,
            borderColor: "#27272A",
          }}
        >
          <Calendar size={20} />
          <ThemedText>{formattedDate}</ThemedText>
        </Pressable>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode='date'
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onValueChange={handleDateChange}
            onDismiss={handleOnDismiss}
            maximumDate={new Date()}
          ></DateTimePicker>
        )}
      </View>

      {/* Wallet & Category Mocks (Biasanya menggunakan Picker/Dropdown) */}
      <View style={styles.rowGroup}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <ThemedText style={styles.label}>Dompet (ID)</ThemedText>
          <TextInput
            style={styles.input}
            keyboardType='numeric'
            value={walletId.toString()}
            onChangeText={(val) => setWalletId(parseInt(val) || 0)}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <ThemedText style={styles.label}>Kategori (ID)</ThemedText>
          <TextInput
            style={styles.input}
            keyboardType='numeric'
            value={categoryId.toString()}
            onChangeText={(val) => setCategoryId(parseInt(val) || 0)}
          />
        </View>
      </View>

      {/* Note Input */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Catatan (Opsional)</ThemedText>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder='Makan siang, bensin, dll...'
          multiline
          numberOfLines={3}
          value={note}
          onChangeText={setNote}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
        <ThemedText style={styles.submitButtonText}>
          Simpan Transaksi
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 20,
  },
  container: {
    padding: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0", // slate-200
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  expenseActive: {
    backgroundColor: "#EF4444", // red-500
  },
  incomeActive: {
    backgroundColor: "#10B981", // emerald-500
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B", // slate-500
  },
  activeText: {
    color: "#FFFFFF",
  },
  inputGroup: {
    marginBottom: 16,
  },
  rowGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1", // slate-300
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0F172A", // slate-900
  },
  amountInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F172A",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top", // Penting untuk Android agar teks mulai dari atas
  },
  submitButton: {
    backgroundColor: "#4F46E5", // indigo-600
    borderRadius: 10,
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
