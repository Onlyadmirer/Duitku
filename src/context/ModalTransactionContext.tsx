import { QUICK_AMOUNTS } from "@/components/addTransaction/AmountInput";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/constants/useTheme";
import { formatRupiah, parseRupiah } from "@/lib/formatterRupiah";
import { useCategories } from "@/services/categories/hooks/useCategories";
import { useAddTransaction } from "@/services/transactions/hooks/useTransactions";
import { useWallets } from "@/services/wallets/hooks/useWallets";
import { DateTimePickerChangeEvent } from "@react-native-community/datetimepicker";
import { createContext, useContext, useState } from "react";
import { Platform } from "react-native";

export type addTransactionType = {
  walletId: number;
  categoryId: number;
  amount: number;
  type: "income" | "expense";
  note?: string;
  date: string;
};

export type ThemeColors = (typeof Colors)[keyof typeof Colors];

interface TransactionContextType {
  theme: ThemeColors;
  type: "expense" | "income";
  walletId: number;
  setWalletId: (id: number) => void;
  categoryId: number;
  setCategoryId: (id: number) => void;
  note: string;
  setNote: (text: string) => void;
  showPicker: boolean;
  setShowPicker: (bool: boolean) => void;
  setType: (type: "expense" | "income") => void;
  amount: string;
  setAmount: (amount: string) => void;
  date: Date;
  isDark: boolean;
  setDate: (date: Date) => void;
  formattedDate: string;
  categories: {
    id: number;
    name: string;
    type: "income" | "expense";
    color: string;
    createdAt: Date;
  }[];
  wallets: {
    id: number;
    name: string;
    initialBalance: number;
    createdAt: Date;
  }[];
  handleChangeNominal: (val: string) => void;
  handleDateChange: (
    event: DateTimePickerChangeEvent,
    selectedDate: Date,
  ) => void;
  handleOnDismiss: () => void;
  handleSave: () => void;
  selectedAmount: number | null;
  setSelectedAmount: (val: number | null) => void;
  handlePress: (val: number) => void;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export function ModalTransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, isDark } = useTheme();

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState<string>("");
  const [walletId, setWalletId] = useState<number>(1);
  const [categoryId, setCategoryId] = useState<number>(1);
  const [note, setNote] = useState<string>("");

  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  // amount
  const handleChangeNominal = (value: string) => {
    const numericValue = formatRupiah(value);
    setAmount(numericValue);

    if (
      selectedAmount !== null &&
      parseRupiah(numericValue) !== selectedAmount
    ) {
      setSelectedAmount(null);
    }
  };

  // quick amount
  const handlePress = (value: number) => {
    if (selectedAmount === value) {
      setSelectedAmount(null);
      setAmount("");
    } else {
      setSelectedAmount(value);
      setAmount(formatRupiah(String(value)));
    }
  };

  // date picker
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

  //
  const handleOnDismiss = () => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
  };

  // tampilan selected date
  const formattedDate = date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // fetch categories & wallets
  const { data: categories = [] } = useCategories(type);
  const { data: wallets = [] } = useWallets();

  // fetch /addTransaction
  const { mutateAsync, isError, isPending } = useAddTransaction();

  // send tx
  const handleSave = async () => {
    setAmount("0");
    setNote("");
    const newTransaction: addTransactionType = {
      walletId,
      categoryId,
      amount: parseRupiah(amount),
      type,
      note,
      date: date.toISOString(),
    };

    console.log("Data Disimpan:", newTransaction);
    // TODO: Panggil fungsi mutasi TanStack Query di sini

    await mutateAsync(newTransaction);

    setAmount("");
    setNote("");
    setSelectedAmount(null);
  };

  return (
    <TransactionContext.Provider
      value={{
        type,
        setType,
        theme,
        amount,
        setAmount,
        walletId,
        setWalletId,
        categoryId,
        setCategoryId,
        note,
        setNote,
        date,
        setDate,
        showPicker,
        setShowPicker,
        handleChangeNominal,
        handleDateChange,
        handleOnDismiss,
        formattedDate,
        categories,
        wallets,
        isDark,
        handleSave,
        selectedAmount,
        setSelectedAmount,
        handlePress,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useModalTransactionContext() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useModalTransactionContext harus digunakan di dalam ModalTransactionProvider",
    );
  }
  return context;
}
