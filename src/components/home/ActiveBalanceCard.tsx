import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  Banknote,
  Eye,
  EyeOff,
  Landmark,
  Smartphone,
  Wallet,
} from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";

export interface WalletSummaryItem {
  id: string;
  name: string;
  balanceLabel: string;
  type: "cash" | "bank" | "ewallet";
}

interface ActiveBalanceCardProps {
  totalBalance?: string;
  wallets?: WalletSummaryItem[];
}

const DEFAULT_WALLETS: WalletSummaryItem[] = [
  { id: "1", name: "Cash", balanceLabel: "Rp 291 rb", type: "cash" },
  { id: "2", name: "BTN", balanceLabel: "Rp 3,2 jt", type: "bank" },
  { id: "3", name: "GoPay", balanceLabel: "Rp 65 rb", type: "ewallet" },
];

const ActiveBalanceCard = ({
  totalBalance = "Rp 3.570.819",
  wallets = DEFAULT_WALLETS,
}: ActiveBalanceCardProps) => {
  const { theme } = useTheme();
  const [isHidden, setIsHidden] = useState(false);

  const renderWalletIcon = (type: WalletSummaryItem["type"]) => {
    switch (type) {
      case "cash":
        return <Banknote size={12} color="#374151" />;
      case "bank":
        return <Landmark size={12} color="#374151" />;
      case "ewallet":
        return <Smartphone size={12} color="#374151" />;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.primary }]}>
      {/* Decorative Wallet Watermark */}
      <View style={styles.watermarkWrap} pointerEvents="none">
        <Wallet size={120} color="#000000" strokeWidth={1.5} />
      </View>

      {/* Top Row */}
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <View style={styles.dot} />
          <Text style={styles.cardTitle}>TOTAL SALDO AKTIF</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setIsHidden((prev) => !prev)}
          style={styles.eyeButton}
        >
          {isHidden ? (
            <EyeOff size={16} color="#1A2E05" />
          ) : (
            <Eye size={16} color="#1A2E05" />
          )}
        </TouchableOpacity>
      </View>

      {/* Main Balance */}
      <Text style={styles.balanceText}>
        {isHidden ? "Rp ••••••••" : totalBalance}
      </Text>

      {/* Wallet Mini Cards */}
      <View style={styles.walletsRow}>
        {wallets.map((wallet) => (
          <View key={wallet.id} style={styles.walletMiniCard}>
            <View style={styles.walletHeader}>
              {renderWalletIcon(wallet.type)}
              <Text style={styles.walletName} numberOfLines={1}>
                {wallet.name}
              </Text>
            </View>
            <Text style={styles.walletBalance} numberOfLines={1}>
              {isHidden ? "Rp •••" : wallet.balanceLabel}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ActiveBalanceCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    overflow: "hidden",
    position: "relative",
    marginBottom: 14,
  },
  watermarkWrap: {
    position: "absolute",
    right: -18,
    top: 22,
    opacity: 0.1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1A2E05",
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: "#1A2E05",
  },
  eyeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  balanceText: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0A1402",
    marginTop: 4,
    marginBottom: 18,
    letterSpacing: -0.6,
  },
  walletsRow: {
    flexDirection: "row",
    gap: 8,
  },
  walletMiniCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  walletName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
  },
  walletBalance: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
});
