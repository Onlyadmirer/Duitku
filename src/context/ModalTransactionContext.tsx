import { Colors } from "@/constants/Colors";
import { useTheme } from "@/constants/useTheme";
import { formatRupiah, parseRupiah } from "@/lib/formatterRupiah";
import { useCategories } from "@/services/categories/hooks/useCategories";
import {
  useAddTransaction,
  useUpdateTransaction,
} from "@/services/transactions/hooks/useTransactions";
import { useWallets } from "@/services/wallets/hooks/useWallets";
import { DateTimePickerChangeEvent } from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";
import TransactionSuccessModal, {
  SavedTransactionSuccessInfo,
} from "@/components/addTransaction/TransactionSuccessModal";

export type addTransactionType = {
  walletId: number;
  categoryId: number;
  amount: number;
  type: "income" | "expense";
  note?: string;
  date: string;
};

export interface EditableTransactionPayload {
  id: number;
  walletId: number;
  categoryId: number;
  amount: number;
  type: "income" | "expense";
  note?: string | null;
  date: string;
}

export type ThemeColors = (typeof Colors)[keyof typeof Colors];

interface TransactionContextType {
  theme: ThemeColors;
  editingId: number | null;
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
    selectedDate: Date
  ) => void;
  handleOnDismiss: () => void;
  handleSave: () => void;
  isSaving: boolean;
  selectedAmount: number | null;
  setSelectedAmount: (val: number | null) => void;
  handlePress: (val: number) => void;
  openAddModal: () => void;
  openEditModal: (tx: EditableTransactionPayload) => void;
  resetForm: () => void;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export function ModalTransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, isDark } = useTheme();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState<string>("");
  const [walletId, setWalletId] = useState<number>(1);
  const [categoryId, setCategoryId] = useState<number>(4);
  const [note, setNote] = useState<string>("");

  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [successInfo, setSuccessInfo] =
    useState<SavedTransactionSuccessInfo | null>(null);

  // fetch categories & wallets
  const { data: categories = [] } = useCategories(type);
  const { data: wallets = [] } = useWallets();

  useEffect(() => {
    if (
      categories.length > 0 &&
      !categories.some((cat) => cat.id === categoryId)
    ) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  useEffect(() => {
    if (wallets.length > 0 && !wallets.some((w) => w.id === walletId)) {
      setWalletId(wallets[0].id);
    }
  }, [wallets, walletId]);

  const resetForm = () => {
    setEditingId(null);
    setType("expense");
    setAmount("");
    setNote("");
    setDate(new Date());
    setSelectedAmount(null);
  };

  const openAddModal = () => {
    resetForm();
    router.push("/addTransactionModal");
  };

  const openEditModal = (tx: EditableTransactionPayload) => {
    setEditingId(tx.id);
    setType(tx.type);
    setWalletId(tx.walletId);
    setCategoryId(tx.categoryId);
    setAmount(formatRupiah(String(tx.amount)));
    setNote(tx.note ?? "");
    const parsedDate = new Date(tx.date);
    setDate(Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate);
    setSelectedAmount(null);
    router.push("/addTransactionModal");
  };

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
  const handleDateChange = useCallback(
    (event: DateTimePickerChangeEvent, selectedDate: Date) => {
      if (Platform.OS === "android") {
        setShowPicker(false);
      }
      if (selectedDate) {
        setDate(selectedDate);
      }
    },
    []
  );

  const handleOnDismiss = useCallback(() => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
  }, []);

  // tampilan selected date
  const formattedDate = date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // mutations
  const { mutateAsync: addTxAsync, isPending: isAdding } = useAddTransaction();
  const { mutateAsync: updateTxAsync, isPending: isUpdating } =
    useUpdateTransaction();
  const isSaving = isAdding || isUpdating;

  // send tx (create or update)
  const handleSave = async () => {
    if (isSaving) return;
    const parsedAmount = parseRupiah(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    const selectedCategoryName =
      categories.find((c) => c.id === categoryId)?.name ?? "Lainnya";
    const selectedWalletName =
      wallets.find((w) => w.id === walletId)?.name ?? "Dompet";
    const wasEditing = editingId !== null;

    if (wasEditing) {
      await updateTxAsync({
        id: editingId,
        data: {
          walletId,
          categoryId,
          amount: parsedAmount,
          type,
          note,
          date: date.toISOString(),
        },
      });
    } else {
      const newTransaction: addTransactionType = {
        walletId,
        categoryId,
        amount: parsedAmount,
        type,
        note,
        date: date.toISOString(),
      };
      await addTxAsync(newTransaction);
    }

    const savedSummary: SavedTransactionSuccessInfo = {
      isEditing: wasEditing,
      type,
      amount: parsedAmount,
      categoryName: selectedCategoryName,
      walletName: selectedWalletName,
      dateLabel: formattedDate,
      note,
    };

    resetForm();

    if (router.canGoBack()) {
      router.back();
    }

    setTimeout(() => {
      setSuccessInfo(savedSummary);
    }, 180);
  };

  return (
    <TransactionContext.Provider
      value={{
        editingId,
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
        isSaving,
        selectedAmount,
        setSelectedAmount,
        handlePress,
        openAddModal,
        openEditModal,
        resetForm,
      }}
    >
      {children}

      <TransactionSuccessModal
        visible={successInfo !== null}
        info={successInfo}
        onClose={() => setSuccessInfo(null)}
        onAddAnother={() => {
          setSuccessInfo(null);
          setTimeout(() => {
            openAddModal();
          }, 150);
        }}
      />
    </TransactionContext.Provider>
  );
}

export function useModalTransactionContext() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useModalTransactionContext harus digunakan di dalam ModalTransactionProvider"
    );
  }
  return context;
}
