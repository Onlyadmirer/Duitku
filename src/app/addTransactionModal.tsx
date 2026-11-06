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
  ScrollView,
} from "react-native";
import DateTimePicker, {
  DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import ThemedView from "@/components/ThemedView";
import { useAddTransaction } from "@/services/transactions/hooks/useTransactions";
import { useCategories } from "@/services/categories/hooks/useCategories";
import { Dropdown } from "react-native-element-dropdown";
import { useWallets } from "@/services/wallets/hooks/useWallets";
import { formatRupiah } from "@/lib/formatterRupiah";

export type addTransactionType = {
  walletId: number;
  categoryId: number;
  amount: number;
  type: "income" | "expense";
  note?: string;
  date: string;
};

export default function AddTransactionModal() {
  // Inisialisasi state sesuai dengan type yang diberikan
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState<string>("");
  const [walletId, setWalletId] = useState<number>(1); // Mock default ID
  const [categoryId, setCategoryId] = useState<number>(1); // Mock default ID
  const [note, setNote] = useState<string>("");

  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleChangeNominal = (value: string) => {
    setAmount(formatRupiah(value));
  };

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

  const { data: categories = [] } = useCategories(type);
  const { data: wallets = [] } = useWallets();

  const { mutateAsync, isError, isPending } = useAddTransaction();

  const handleSave = async () => {
    setAmount("0");
    setNote("");
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
      <ScrollView style={{ paddingHorizontal: 20 }}>
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
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              type === "expense" && styles.expenseActive,
            ]}
            onPress={() => setType("expense")}
          >
            <Text
              style={[
                styles.toggleText,
                type === "expense" && styles.activeText,
              ]}
            >
              Pengeluaran
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, type === "income" && styles.incomeActive]}
            onPress={() => setType("income")}
          >
            <Text
              style={[
                styles.toggleText,
                type === "income" && styles.activeText,
              ]}
            >
              Pemasukan
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Nominal</ThemedText>
          <TextInput
            style={styles.amountInput}
            placeholder='0'
            keyboardType='numeric'
            value={amount}
            onChangeText={handleChangeNominal}
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
          <View style={{ marginRight: 8 }}>
            <ThemedText style={styles.label}>Dompet</ThemedText>
            <Dropdown
              data={wallets.map((wallet) => ({
                label: wallet.name,
                value: wallet.id,
              }))}
              style={styles.input}
              containerStyle={{
                borderRadius: 12,
              }}
              labelField='label'
              valueField='value'
              maxHeight={300}
              placeholder='Pilih kategori'
              value={walletId}
              onChange={(item) => setWalletId(item.value)}
            />
          </View>
          <View style={{ marginRight: 8 }}>
            <ThemedText style={styles.label}>Kategori</ThemedText>
            <Dropdown
              data={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
              containerStyle={{
                borderRadius: 12,
              }}
              style={styles.input}
              labelField='label'
              valueField='value'
              placeholder='Pilih kategori'
              dropdownPosition='auto'
              value={categoryId}
              onChange={(item) => setCategoryId(item.value)}
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
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
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
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: 8,
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
