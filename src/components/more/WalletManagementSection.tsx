import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  ArrowLeftRight,
  Banknote,
  Landmark,
  Pencil,
  Plus,
  Smartphone,
  Trash2,
  Wallet,
} from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";
import { formatRupiah } from "@/lib/formatterRupiah";

export interface WalletBalanceItem {
  id: number;
  name: string;
  initialBalance: number;
  income: number;
  expense: number;
  balance: number;
}

interface WalletManagementSectionProps {
  wallets: WalletBalanceItem[];
  onPressAdd: () => void;
  onPressTransfer?: () => void;
  onPressEdit: (wallet: WalletBalanceItem) => void;
  onPressDelete: (wallet: WalletBalanceItem) => void;
}

const WalletManagementSection = ({
  wallets,
  onPressAdd,
  onPressTransfer,
  onPressEdit,
  onPressDelete,
}: WalletManagementSectionProps) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;
  const subBg = isDark ? "#182235" : "#F3F4F6";

  const renderWalletIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (
      lower.includes("cash") ||
      lower.includes("tunai") ||
      lower.includes("dompet")
    ) {
      return <Banknote size={18} color={theme.primaryText} />;
    }
    if (
      lower.includes("gopay") ||
      lower.includes("ovo") ||
      lower.includes("dana") ||
      lower.includes("shopeepay")
    ) {
      return <Smartphone size={18} color={theme.primaryText} />;
    }
    return <Landmark size={18} color={theme.primaryText} />;
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Wallet size={18} color={theme.primaryText} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Daftar Dompet
          </Text>
        </View>

        <View style={styles.headerRightBtns}>
          {onPressTransfer && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onPressTransfer}
              style={[
                styles.transferPillBtn,
                {
                  backgroundColor: theme.primarySoftBg,
                  borderColor: theme.primarySoftBorder,
                },
              ]}
            >
              <ArrowLeftRight
                size={13}
                color={theme.primaryText}
                strokeWidth={2.3}
              />
              <Text
                style={[styles.transferPillText, { color: theme.primaryText }]}
              >
                Pindah Dana
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPressAdd}
            style={[styles.addPillBtn, { backgroundColor: theme.primary }]}
          >
            <Plus size={14} color='#0A1402' strokeWidth={2.5} />
            <Text style={styles.addPillText}>Tambah</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor: theme.border },
        ]}
      >
        {wallets.map((w, idx) => {
          const isLast = idx === wallets.length - 1;
          return (
            <View
              key={w.id}
              style={[
                styles.itemRow,
                !isLast && {
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? "#182132" : theme.border,
                },
              ]}
            >
              <View style={styles.itemLeft}>
                <View
                  style={[
                    styles.walletIconBox,
                    { backgroundColor: theme.primarySoftBg },
                  ]}
                >
                  {renderWalletIcon(w.name)}
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: theme.text }]}>
                    {w.name}
                  </Text>
                  <Text style={[styles.itemMeta, { color: theme.textMuted }]}>
                    Saldo Aktif:{" "}
                    <Text
                      style={{ color: theme.primaryText, fontWeight: "700" }}
                    >
                      {w.balance < 0 ? "-Rp " : "Rp "}
                      {formatRupiah(String(Math.abs(w.balance)))}
                    </Text>
                  </Text>
                </View>
              </View>

              <View style={styles.actionBtns}>
                <TouchableOpacity
                  onPress={() => onPressEdit(w)}
                  style={[
                    styles.actionBtn,
                    { backgroundColor: subBg, borderColor: theme.border },
                  ]}
                >
                  <Pencil size={13} color={theme.text} />
                </TouchableOpacity>

                {wallets.length > 1 && (
                  <TouchableOpacity
                    onPress={() => onPressDelete(w)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={13} color='#F87171' />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default WalletManagementSection;

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  headerRightBtns: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  transferPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  transferPillText: {
    fontSize: 11,
    fontWeight: "800",
  },
  addPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  addPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0A1402",
  },
  card: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    gap: 10,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  walletIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(180, 240, 0, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
  },
  itemMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  actionBtns: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(248, 113, 113, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});
