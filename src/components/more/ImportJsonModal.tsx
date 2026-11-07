import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  CheckCircle2,
  FileJson,
  FolderOpen,
  TriangleAlert,
  Upload,
  X,
} from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";
import {
  ValidatedDuitkuImport,
  pickAndValidateDuitkuJsonFile,
  useImportDuitkuJson,
  validateDuitkuImportJson,
} from "@/services/import/importData";

interface ImportJsonModalProps {
  visible: boolean;
  onClose: () => void;
}

const ImportJsonModal = ({ visible, onClose }: ImportJsonModalProps) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;
  const subBg = isDark ? "#182235" : "#F3F4F6";

  const [mode, setMode] = useState<"file" | "paste">("file");
  const [rawJsonInput, setRawJsonInput] = useState("");
  const [validatedData, setValidatedData] =
    useState<ValidatedDuitkuImport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  const { mutateAsync: runImport, isPending: isImporting } =
    useImportDuitkuJson();

  useEffect(() => {
    if (visible) {
      setMode("file");
      setRawJsonInput("");
      setValidatedData(null);
      setErrorMsg(null);
    }
  }, [visible]);

  const handlePickFile = async () => {
    setErrorMsg(null);
    setIsPicking(true);
    try {
      const result = await pickAndValidateDuitkuJsonFile();
      if (result) {
        setValidatedData(result);
      }
    } catch (err: any) {
      setValidatedData(null);
      setErrorMsg(err?.message ?? "Gagal membaca atau memvalidasi file JSON.");
    } finally {
      setIsPicking(false);
    }
  };

  const handleValidatePaste = () => {
    setErrorMsg(null);
    try {
      const result = validateDuitkuImportJson(rawJsonInput, "Data Tempel JSON");
      setValidatedData(result);
    } catch (err: any) {
      setValidatedData(null);
      setErrorMsg(err?.message ?? "Teks JSON tidak valid.");
    }
  };

  const handleConfirmImport = async () => {
    if (!validatedData) return;
    setErrorMsg(null);
    try {
      await runImport(validatedData.payload);
      onClose();
      Alert.alert(
        "Impor Data Berhasil",
        `Seluruh data aplikasi telah diperbarui dengan ${validatedData.walletsCount} dompet, ${validatedData.categoriesCount} kategori, ${validatedData.transactionsCount} transaksi, dan ${validatedData.budgetsCount} anggaran.`,
      );
    } catch (err: any) {
      setErrorMsg(
        err?.message ?? "Terjadi kesalahan saat menyimpan data ke database.",
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalBackdrop}
      >
        <Pressable style={styles.backdropDismiss} onPress={onClose} />

        <View
          style={[
            styles.modalCard,
            { backgroundColor: cardBg, borderColor: theme.border },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View
                style={[
                  styles.headerIconBox,
                  { backgroundColor: theme.primarySoftBg },
                ]}
              >
                <Upload size={17} color={theme.primaryText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Impor Data Web (JSON)
                </Text>
                <Text
                  style={[styles.modalSubtitle, { color: theme.textMuted }]}
                >
                  Migrasi data dari Duitku versi Website (`duitku-export`)
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
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
            keyboardShouldPersistTaps='handled'
            contentContainerStyle={styles.scrollBody}
          >
            {/* Warning Box */}
            <View style={styles.warningBanner}>
              <TriangleAlert size={16} color='#F59E0B' />
              <Text style={styles.warningBannerText}>
                Perhatian: Semua data dompet, kategori, anggaran, dan transaksi
                di aplikasi mobile ini akan{" "}
                <Text style={{ fontWeight: "800" }}>diganti sepenuhnya</Text>{" "}
                dengan data dari file JSON.
              </Text>
            </View>

            {/* Mode Switcher */}
            <View style={styles.modeTabsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setMode("file");
                  setErrorMsg(null);
                }}
                style={[
                  styles.modeTabBtn,
                  {
                    backgroundColor:
                      mode === "file" ? theme.primarySoftBg : subBg,
                    borderColor: mode === "file" ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    { color: mode === "file" ? theme.primaryText : theme.text },
                  ]}
                >
                  Pilih File (.json)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setMode("paste");
                  setErrorMsg(null);
                }}
                style={[
                  styles.modeTabBtn,
                  {
                    backgroundColor:
                      mode === "paste" ? theme.primarySoftBg : subBg,
                    borderColor:
                      mode === "paste" ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    {
                      color: mode === "paste" ? theme.primaryText : theme.text,
                    },
                  ]}
                >
                  Tempel Teks JSON
                </Text>
              </TouchableOpacity>
            </View>

            {mode === "file" ? (
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isPicking || isImporting}
                onPress={handlePickFile}
                style={[
                  styles.filePickerBox,
                  {
                    backgroundColor: subBg,
                    borderColor: validatedData ? theme.primary : theme.border,
                  },
                ]}
              >
                {isPicking ? (
                  <ActivityIndicator size='small' color={theme.primaryText} />
                ) : (
                  <>
                    <View
                      style={[
                        styles.filePickerIconWrap,
                        { backgroundColor: theme.primarySoftBg },
                      ]}
                    >
                      <FolderOpen size={20} color={theme.primaryText} />
                    </View>
                    <Text
                      style={[styles.filePickerTitle, { color: theme.text }]}
                    >
                      {validatedData?.fileName
                        ? validatedData.fileName
                        : "Ketuk untuk Memilih File JSON"}
                    </Text>
                    <Text
                      style={[styles.filePickerSub, { color: theme.textMuted }]}
                    >
                      Format yang didukung: `duitku-export` (versi 1)
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.pasteContainer}>
                <TextInput
                  value={rawJsonInput}
                  onChangeText={(txt) => {
                    setRawJsonInput(txt);
                    setValidatedData(null);
                    setErrorMsg(null);
                  }}
                  multiline
                  placeholder='{"format": "duitku-export", "version": 1, "data": { ... }}'
                  placeholderTextColor={theme.textMuted}
                  style={[
                    styles.pasteInput,
                    {
                      backgroundColor: subBg,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleValidatePaste}
                  style={[
                    styles.validatePasteBtn,
                    {
                      backgroundColor: theme.primarySoftBg,
                      borderColor: theme.primarySoftBorder,
                    },
                  ]}
                >
                  <FileJson size={14} color={theme.primaryText} />
                  <Text
                    style={[
                      styles.validatePasteBtnText,
                      { color: theme.primaryText },
                    ]}
                  >
                    Periksa & Validasi JSON
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Preview Card once JSON is validated */}
            {validatedData && (
              <View
                style={[
                  styles.previewCard,
                  {
                    backgroundColor: theme.primarySoftBg,
                    borderColor: theme.primarySoftBorder,
                  },
                ]}
              >
                <View style={styles.previewHeaderRow}>
                  <CheckCircle2 size={15} color={theme.primaryText} />
                  <Text
                    style={[styles.previewTitle, { color: theme.primaryText }]}
                  >
                    File JSON Valid & Siap Diimpor
                  </Text>
                </View>

                <Text
                  style={[styles.previewMetaText, { color: theme.textMuted }]}
                >
                  Waktu Ekspor Web: {validatedData.exportedAtLabel}
                </Text>

                <View style={styles.previewGrid}>
                  <View
                    style={[
                      styles.previewStatBox,
                      { backgroundColor: cardBg, borderColor: theme.border },
                    ]}
                  >
                    <Text
                      style={[styles.previewStatVal, { color: theme.text }]}
                    >
                      {validatedData.walletsCount}
                    </Text>
                    <Text
                      style={[
                        styles.previewStatLabel,
                        { color: theme.textMuted },
                      ]}
                    >
                      Dompet
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.previewStatBox,
                      { backgroundColor: cardBg, borderColor: theme.border },
                    ]}
                  >
                    <Text
                      style={[styles.previewStatVal, { color: theme.text }]}
                    >
                      {validatedData.categoriesCount}
                    </Text>
                    <Text
                      style={[
                        styles.previewStatLabel,
                        { color: theme.textMuted },
                      ]}
                    >
                      Kategori
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.previewStatBox,
                      { backgroundColor: cardBg, borderColor: theme.border },
                    ]}
                  >
                    <Text
                      style={[styles.previewStatVal, { color: theme.text }]}
                    >
                      {validatedData.transactionsCount}
                    </Text>
                    <Text
                      style={[
                        styles.previewStatLabel,
                        { color: theme.textMuted },
                      ]}
                    >
                      Transaksi
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.previewStatBox,
                      { backgroundColor: cardBg, borderColor: theme.border },
                    ]}
                  >
                    <Text
                      style={[styles.previewStatVal, { color: theme.text }]}
                    >
                      {validatedData.budgetsCount}
                    </Text>
                    <Text
                      style={[
                        styles.previewStatLabel,
                        { color: theme.textMuted },
                      ]}
                    >
                      Anggaran
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!validatedData || isImporting}
              onPress={handleConfirmImport}
              style={[
                styles.submitBtn,
                {
                  backgroundColor: theme.primary,
                  opacity: !validatedData || isImporting ? 0.55 : 1,
                },
              ]}
            >
              {isImporting ? (
                <ActivityIndicator size='small' color='#0A1402' />
              ) : (
                <>
                  <Upload size={16} color='#0A1402' strokeWidth={2.4} />
                  <Text style={styles.submitBtnText}>Import Sekarang</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ImportJsonModal;

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
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.35)",
    marginBottom: 14,
  },
  warningBannerText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    color: "#F59E0B",
    fontWeight: "600",
  },
  modeTabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  modeTabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.2,
    alignItems: "center",
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: "700",
  },
  filePickerBox: {
    borderRadius: 16,
    borderWidth: 1.2,
    borderStyle: "dashed",
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  filePickerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  filePickerTitle: {
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  filePickerSub: {
    fontSize: 11,
    textAlign: "center",
  },
  pasteContainer: {
    gap: 8,
  },
  pasteInput: {
    minHeight: 120,
    maxHeight: 180,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 12,
    textAlignVertical: "top",
  },
  validatePasteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  validatePasteBtnText: {
    fontSize: 12,
    fontWeight: "800",
  },
  previewCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  previewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  previewMetaText: {
    fontSize: 11,
    marginTop: 4,
    marginBottom: 10,
  },
  previewGrid: {
    flexDirection: "row",
    gap: 8,
  },
  previewStatBox: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  previewStatVal: {
    fontSize: 15,
    fontWeight: "900",
  },
  previewStatLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
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
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0A1402",
  },
});
