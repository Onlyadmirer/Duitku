import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Save, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AmountInput from "@/components/addTransaction/AmountInput";
import ToggleType from "@/components/addTransaction/ToggleType";
import FormInput from "@/components/addTransaction/FormInput";
import { useModalTransactionContext } from "@/context/ModalTransactionContext";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function AddTransactionModal() {
  const { theme, editingId, handleSave, isSaving } =
    useModalTransactionContext();
  const insets = useSafeAreaInsets();
  const isEditing = editingId !== null;

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scrollViewRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const isNoteFocusedRef = useRef(false);

  const scrollToNoteInput = () => {
    scrollViewRef.current?.scrollTo({ y: 150, animated: true });
  };

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      damping: 22,
      stiffness: 220,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";

    const showSub = Keyboard.addListener(showEvent, () => {
      if (isNoteFocusedRef.current) {
        setTimeout(scrollToNoteInput, 60);
      }
    });

    return () => {
      showSub.remove();
    };
  }, []);

  const handleFocusNote = () => {
    isNoteFocusedRef.current = true;
    setTimeout(scrollToNoteInput, 120);
  };

  const handleBlurNote = () => {
    isNoteFocusedRef.current = false;
  };

  const closeSheet = () => {
    Keyboard.dismiss();
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (router.canGoBack()) {
        router.back();
      }
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 6,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 110 || gestureState.vy > 0.85) {
          closeSheet();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            damping: 20,
            stiffness: 220,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.overlay}
    >
      <Pressable style={styles.backdrop} onPress={closeSheet} />

      <Animated.View
        style={[
          styles.sheetContainer,
          {
            backgroundColor: theme.background,
            borderColor: theme.border,
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Draggable Grabber & Header */}
        <View {...panResponder.panHandlers} style={styles.dragHeaderArea}>
          <View style={styles.grabberBar} />

          <View style={styles.headerRow}>
            <View style={styles.headerSpacer} />
            <Text style={[styles.modalHeaderTitle, { color: theme.text }]}>
              {isEditing ? "Edit Transaksi" : "Tambah Transaksi"}
            </Text>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={closeSheet}
              style={[
                styles.closeBtn,
                {
                  backgroundColor: theme.backgroundInput,
                  borderColor: theme.border,
                },
              ]}
            >
              <X size={16} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: Math.max(insets.bottom + 20, 28),
            },
          ]}
          nestedScrollEnabled
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          {/* Toggle Type (Income / Expense) */}
          <ToggleType />

          {/* Amount Input */}
          <AmountInput />

          {/* Form Input */}
          <FormInput
            onFocusNote={handleFocusNote}
            onBlurNote={handleBlurNote}
          />

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isSaving}
            style={[
              styles.submitButton,
              {
                backgroundColor: theme.primary,
                opacity: isSaving ? 0.75 : 1,
              },
            ]}
            onPress={() => handleSave()}
          >
            {isSaving ? (
              <ActivityIndicator size='small' color='#0A1402' />
            ) : (
              <Save size={18} color='#0A1402' />
            )}
            <Text style={styles.submitButtonText}>
              {isSaving
                ? "Menyimpan..."
                : isEditing
                  ? "Simpan Perubahan"
                  : "Simpan Transaksi"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  sheetContainer: {
    maxHeight: "90%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    overflow: "hidden",
  },
  dragHeaderArea: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  grabberBar: {
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#71717A",
    alignSelf: "center",
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSpacer: {
    width: 32,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
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
    color: "#0A1402",
    fontSize: 15,
    fontWeight: "800",
  },
});
