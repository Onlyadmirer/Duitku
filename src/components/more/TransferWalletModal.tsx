import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpDown,
  CheckCircle2,
  Wallet,
  X,
} from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";
import { formatRupiah, parseRupiah } from "@/lib/formatterRupiah";
import { MONTHS_SHORT } from "@/components/ui/MonthYearPickerModal";
import { WalletBalanceItem } from "./WalletManagementSection";

interface TransferSuccessInfo {
  fromWalletName: string;
  toWalletName: string;
  amount: number;
  adminFee: number;
  totalDeducted: number;
  dateLabel: string;
  note?: string;
}

interface TransferWalletModalProps {
  visible: boolean;
  wallets: WalletBalanceItem[];
  onClose: () => void;
  onSubmit: (payload: {
    fromWalletId: number;
    toWalletId: number;
    amount: number;
    adminFee: number;
    note: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

const TransferWalletModal = ({
  visible,
  wallets,
  onClose,
  onSubmit,
  isSubmitting = false,
}: TransferWalletModalProps) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;
  const subBg = isDark ? "#182235" : "#F3F4F6";

  const [fromWalletId, setFromWalletId] = useState<number | null>(null);
  const [toWalletId, setToWalletId] = useState<number | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [adminFeeInput, setAdminFeeInput] = useState("");
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<TransferSuccessInfo | null>(
    null
  );

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && !successInfo) {
      const first = wallets[0]?.id ?? null;
      const second = wallets[1]?.id ?? wallets[0]?.id ?? null;
      setFromWalletId((prev) => prev ?? first);
      setToWalletId((prev) => prev ?? second);
      setAmountInput("");
      setAdminFeeInput("");
      setNote("");
      setErrorMsg(null);
    }
  }, [visible, wallets, successInfo]);

  useEffect(() => {
    if (successInfo) {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [successInfo, scaleAnim, opacityAnim]);

  const handleSwapWallets = () => {
    setFromWalletId(toWalletId);
    setToWalletId(fromWalletId);
    setErrorMsg(null);
  };

  const amountVal = parseRupiah(amountInput);
  const adminFeeVal = parseRupiah(adminFeeInput);
  const totalDeducted = amountVal + adminFeeVal;

  const fromWallet = wallets.find((w) => w.id === fromWalletId);
  const toWallet = wallets.find((w) => w.id === toWalletId);

  const handleDismissAll = () => {
    setSuccessInfo(null);
    onClose();
  };

  const handleTransferAgain = () => {
    setAmountInput("");
    setAdminFeeInput("");
    setNote("");
    setErrorMsg(null);
    setSuccessInfo(null);
  };

  const handleConfirm = async () => {
    setErrorMsg(null);
    if (wallets.length < 2) {
      setErrorMsg(
        "Tambahkan minimal 2 dompet terlebih dahulu untuk pindah dana."
      );
      return;
    }
    if (!fromWalletId || !toWalletId) {
      setErrorMsg("Pilih dompet asal dan dompet tujuan.");
      return;
    }
    if (fromWalletId === toWalletId) {
      setErrorMsg("Dompet asal dan tujuan tidak boleh sama.");
      return;
    }
    if (!amountVal || amountVal <= 0) {
      setErrorMsg("Masukkan nominal transfer lebih dari Rp 0.");
      return;
    }

    const fromName = fromWallet?.name ?? "Dompet Asal";
    const toName = toWallet?.name ?? "Dompet Tujuan";
    const now = new Date();
    const dateLabel = `${now.getDate()} ${
      MONTHS_SHORT[now.getMonth()]
    } ${now.getFullYear()}`;
    const trimmedNote = note.trim();

    try {
      await onSubmit({
        fromWalletId,
        toWalletId,
        amount: amountVal,
        adminFee: adminFeeVal,
        note: trimmedNote,
      });

      setSuccessInfo({
        fromWalletName: fromName,
        toWalletName: toName,
        amount: amountVal,
        adminFee: adminFeeVal,
        totalDeducted,
        dateLabel,
        note: trimmedNote || undefined,
      });
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Gagal memindahkan dana.");
    }
  };

  return (
    <Modal
      visible={visible || Boolean(successInfo)}
      transparent
      animationType="fade"
      onRequestClose={handleDismissAll}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalBackdrop}
      >
        <Pressable style={styles.backdropDismiss} onPress={handleDismissAll} />

        {successInfo ? (
          <Animated.View
            style={[
              styles.successCard,
              {
                backgroundColor: cardBg,
                borderColor: theme.border,
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Check Icon Badge */}
            <View
              style={[
                styles.successIconRing,
                {
                  backgroundColor: theme.primarySoftBg,
                  borderColor: theme.primarySoftBorder,
                },
              ]}
            >
              <CheckCircle2
                size={34}
                color={theme.primaryText}
                strokeWidth={2.3}
              />
            </View>

            <Text style={[styles.successTitle, { color: theme.text }]}>
              Pindah Dana Berhasil!
            </Text>
            <Text style={[styles.successSubtitle, { color: theme.textMuted }]}>
              Saldo antar dompet telah diperbarui tanpa mengubah laporan
              pemasukan bulanan
            </Text>

            {/* Amount Highlight */}
            <Text
              style={[styles.successAmountText, { color: theme.primaryText }]}
            >
              Rp {formatRupiah(String(successInfo.amount))}
            </Text>

            {/* Wallet Route Badge */}
            <View
              style={[
                styles.routeBadge,
                {
                  backgroundColor: theme.primarySoftBg,
                  borderColor: theme.primarySoftBorder,
                },
              ]}
            >
              <View style={styles.routeWalletPill}>
                <Wallet size={13} color={theme.primaryText} />
                <Text
                  style={[styles.routeWalletText, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {successInfo.fromWalletName}
                </Text>
              </View>
              <ArrowRight size={14} color={theme.primaryText} />
              <View style={styles.routeWalletPill}>
                <Wallet size={13} color={theme.primaryText} />
                <Text
                  style={[styles.routeWalletText, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {successInfo.toWalletName}
                </Text>
              </View>
            </View>

            {/* Detail Box */}
            <View
              style={[
                styles.detailCard,
                { backgroundColor: subBg, borderColor: theme.border },
              ]}
            >
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                  Dipotong dari {successInfo.fromWalletName}
                </Text>
                <Text style={[styles.detailVal, { color: "#F87171" }]}>
                  -Rp {formatRupiah(String(successInfo.totalDeducted))}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                  Masuk ke {successInfo.toWalletName}
                </Text>
                <Text
                  style={[styles.detailVal, { color: theme.primaryText }]}
                >
                  +Rp {formatRupiah(String(successInfo.amount))}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                  Biaya Admin
                </Text>
                <Text style={[styles.detailVal, { color: theme.text }]}>
                  {successInfo.adminFee > 0
                    ? `Rp ${formatRupiah(String(successInfo.adminFee))}`
                    : "Gratis"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                  Tanggal
                </Text>
                <Text style={[styles.detailVal, { color: theme.text }]}>
                  {successInfo.dateLabel}
                </Text>
              </View>

              {successInfo.note ? (
                <View style={styles.detailRow}>
                  <Text
                    style={[styles.detailLabel, { color: theme.textMuted }]}
                  >
                    Catatan
                  </Text>
                  <Text
                    style={[
                      styles.detailVal,
                      {
                        color: theme.text,
                        maxWidth: "65%",
                        textAlign: "right",
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {successInfo.note}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Actions */}
            <View style={styles.successActionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleTransferAgain}
                style={[
                  styles.secondaryBtn,
                  { backgroundColor: subBg, borderColor: theme.border },
                ]}
              >
                <ArrowLeftRight size={14} color={theme.text} />
                <Text style={[styles.secondaryBtnText, { color: theme.text }]}>
                  Pindah Lagi
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleDismissAll}
                style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.primaryBtnText}>Selesai</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ) : (
          <View
            style={[
              styles.modalCard,
              { backgroundColor: cardBg, borderColor: theme.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.headerTitleRow}>
                <View
                  style={[
                    styles.headerIconBox,
                    { backgroundColor: theme.primarySoftBg },
                  ]}
                >
                  <ArrowLeftRight size={17} color={theme.primaryText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    Pindah Dana Antar Dompet
                  </Text>
                  <Text
                    style={[styles.modalSubtitle, { color: theme.textMuted }]}
                  >
                    Transfer saldo antar dompet tanpa mengubah pemasukan bulanan
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleDismissAll}
                style={[
                  styles.closeBtn,
                  { backgroundColor: subBg, borderColor: theme.border },
                ]}
              >
                <X size={16} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollBody}
            >
              {wallets.length < 2 ? (
                <View
                  style={[
                    styles.warningBox,
                    {
                      backgroundColor: "rgba(245, 158, 11, 0.12)",
                      borderColor: "rgba(245, 158, 11, 0.35)",
                    },
                  ]}
                >
                  <Text style={styles.warningText}>
                    Kamu baru memiliki {wallets.length} dompet. Silakan tambah
                    dompet baru terlebih dahulu agar bisa memindahkan dana antar
                    dompet.
                  </Text>
                </View>
              ) : null}

              {/* Dari Dompet */}
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                Dari Dompet (Sumber Dana)
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.walletSelectorRow}
              >
                {wallets.map((w) => {
                  const selected = w.id === fromWalletId;
                  return (
                    <TouchableOpacity
                      key={`from-${w.id}`}
                      activeOpacity={0.8}
                      onPress={() => {
                        setFromWalletId(w.id);
                        if (w.id === toWalletId) {
                          const other = wallets.find(
                            (item) => item.id !== w.id
                          );
                          if (other) setToWalletId(other.id);
                        }
                        setErrorMsg(null);
                      }}
                      style={[
                        styles.walletOptionCard,
                        {
                          backgroundColor: selected
                            ? theme.primarySoftBg
                            : subBg,
                          borderColor: selected ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <View style={styles.walletOptionTop}>
                        <Wallet
                          size={14}
                          color={selected ? theme.primaryText : theme.textMuted}
                        />
                        <Text
                          style={[
                            styles.walletOptionName,
                            {
                              color: selected ? theme.primaryText : theme.text,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {w.name}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.walletOptionBalance,
                          { color: theme.textMuted },
                        ]}
                        numberOfLines={1}
                      >
                        Rp {formatRupiah(String(Math.max(0, w.balance)))}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Swap Button */}
              <View style={styles.swapDividerRow}>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: theme.border },
                  ]}
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSwapWallets}
                  style={[
                    styles.swapBtn,
                    {
                      backgroundColor: subBg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <ArrowUpDown size={14} color={theme.primaryText} />
                  <Text
                    style={[styles.swapBtnText, { color: theme.primaryText }]}
                  >
                    Tukar Posisi
                  </Text>
                </TouchableOpacity>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: theme.border },
                  ]}
                />
              </View>

              {/* Ke Dompet */}
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                Ke Dompet (Tujuan)
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.walletSelectorRow}
              >
                {wallets.map((w) => {
                  const selected = w.id === toWalletId;
                  return (
                    <TouchableOpacity
                      key={`to-${w.id}`}
                      activeOpacity={0.8}
                      onPress={() => {
                        setToWalletId(w.id);
                        if (w.id === fromWalletId) {
                          const other = wallets.find(
                            (item) => item.id !== w.id
                          );
                          if (other) setFromWalletId(other.id);
                        }
                        setErrorMsg(null);
                      }}
                      style={[
                        styles.walletOptionCard,
                        {
                          backgroundColor: selected
                            ? theme.primarySoftBg
                            : subBg,
                          borderColor: selected ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <View style={styles.walletOptionTop}>
                        <Wallet
                          size={14}
                          color={selected ? theme.primaryText : theme.textMuted}
                        />
                        <Text
                          style={[
                            styles.walletOptionName,
                            {
                              color: selected ? theme.primaryText : theme.text,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {w.name}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.walletOptionBalance,
                          { color: theme.textMuted },
                        ]}
                        numberOfLines={1}
                      >
                        Rp {formatRupiah(String(Math.max(0, w.balance)))}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Nominal Transfer */}
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.textMuted, marginTop: 14 },
                ]}
              >
                Nominal Pindah Dana (Rp)
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  { backgroundColor: subBg, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.rpPrefix, { color: theme.primaryText }]}>
                  Rp
                </Text>
                <TextInput
                  value={amountInput}
                  onChangeText={(txt) => {
                    setAmountInput(formatRupiah(txt));
                    setErrorMsg(null);
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.amountInput, { color: theme.text }]}
                />
              </View>

              {/* Biaya Admin (Opsional) */}
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.textMuted, marginTop: 12 },
                ]}
              >
                Biaya Admin / Transfer (Opsional)
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  { backgroundColor: subBg, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.rpPrefix, { color: theme.textMuted }]}>
                  Rp
                </Text>
                <TextInput
                  value={adminFeeInput}
                  onChangeText={(txt) => setAdminFeeInput(formatRupiah(txt))}
                  keyboardType="numeric"
                  placeholder="0 (Kosongkan jika gratis)"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.textInput, { color: theme.text }]}
                />
              </View>

              {/* Catatan */}
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.textMuted, marginTop: 12 },
                ]}
              >
                Catatan (Opsional)
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  { backgroundColor: subBg, borderColor: theme.border },
                ]}
              >
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Contoh: Top up e-wallet / Tarik tunai"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.textInput, { color: theme.text }]}
                />
              </View>

              {/* Summary Preview */}
              {amountVal > 0 && fromWallet && toWallet && (
                <View
                  style={[
                    styles.summaryBox,
                    {
                      backgroundColor: theme.primarySoftBg,
                      borderColor: theme.primarySoftBorder,
                    },
                  ]}
                >
                  <View style={styles.summaryRow}>
                    <Text
                      style={[styles.summaryLabel, { color: theme.textMuted }]}
                    >
                      Dipotong dari {fromWallet.name}
                    </Text>
                    <Text style={[styles.summaryVal, { color: "#F87171" }]}>
                      -Rp {formatRupiah(String(totalDeducted))}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text
                      style={[styles.summaryLabel, { color: theme.textMuted }]}
                    >
                      Masuk ke {toWallet.name}
                    </Text>
                    <Text
                      style={[styles.summaryVal, { color: theme.primaryText }]}
                    >
                      +Rp {formatRupiah(String(amountVal))}
                    </Text>
                  </View>
                </View>
              )}

              {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

              <TouchableOpacity
                activeOpacity={0.85}
                disabled={isSubmitting || wallets.length < 2}
                onPress={handleConfirm}
                style={[
                  styles.submitBtn,
                  {
                    backgroundColor: theme.primary,
                    opacity: isSubmitting || wallets.length < 2 ? 0.6 : 1,
                  },
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#0A1402" />
                ) : (
                  <>
                    <ArrowLeftRight
                      size={16}
                      color="#0A1402"
                      strokeWidth={2.4}
                    />
                    <Text style={styles.submitBtnText}>
                      Pindahkan Dana Sekarang
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default TransferWalletModal;

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  backdropDismiss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    maxHeight: "88%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  modalSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollBody: {
    paddingBottom: 6,
  },
  warningBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  warningText: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "600",
    lineHeight: 17,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  walletSelectorRow: {
    gap: 8,
    paddingVertical: 2,
  },
  walletOptionCard: {
    minWidth: 125,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.2,
  },
  walletOptionTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  walletOptionName: {
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
  },
  walletOptionBalance: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
  },
  swapDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  swapBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  swapBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
  },
  rpPrefix: {
    fontSize: 15,
    fontWeight: "800",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  summaryBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: "800",
  },
  errorText: {
    color: "#F87171",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 10,
  },
  submitBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0A1402",
  },
  successCard: {
    width: "100%",
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    alignItems: "center",
  },
  successIconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 17,
    paddingHorizontal: 8,
  },
  successAmountText: {
    fontSize: 24,
    fontWeight: "900",
    marginTop: 12,
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  routeBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 14,
    maxWidth: "100%",
  },
  routeWalletPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 1,
  },
  routeWalletText: {
    fontSize: 12,
    fontWeight: "700",
  },
  detailCard: {
    width: "100%",
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "500",
    flexShrink: 1,
  },
  detailVal: {
    fontSize: 12,
    fontWeight: "700",
  },
  successActionsRow: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  primaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0A1402",
  },
});
