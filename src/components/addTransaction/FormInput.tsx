import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Dropdown } from "react-native-element-dropdown";
import { useModalTransactionContext } from "@/context/ModalTransactionContext";
import { Calendar } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const FormInput = () => {
  const {
    theme,
    wallets,
    categories,
    walletId,
    setWalletId,
    categoryId,
    setCategoryId,
    note,
    setNote,
    setShowPicker,
    formattedDate,
    showPicker,
    date,
    handleDateChange,
    handleOnDismiss,
  } = useModalTransactionContext();

  return (
    <View
      style={[
        styles.rowGroup,
        {
          backgroundColor: theme.backgroundCardModal,
          borderColor: theme.border,
        },
      ]}
    >
      <View>
        <Text style={[styles.label, { color: theme.text }]}>
          Sumber Dana (Dompet)
        </Text>
        <Dropdown
          data={wallets.map((wallet) => ({
            label: wallet.name,
            value: wallet.id,
          }))}
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundInput,
              borderColor: theme.border,
            },
          ]}
          placeholderStyle={{
            color: theme.text,
          }}
          containerStyle={{
            borderRadius: 12,
            borderWidth: 0,
            padding: 12,
            backgroundColor: theme.backgroundInput,
          }}
          activeColor={theme.background}
          itemContainerStyle={{
            borderRadius: 8,
            backgroundColor: theme.backgroundInput,
          }}
          itemTextStyle={{
            color: theme.text,
          }}
          selectedTextStyle={{
            color: theme.text,
          }}
          labelField='label'
          valueField='value'
          maxHeight={300}
          placeholder='Pilih kategori'
          value={walletId}
          onChange={(item) => setWalletId(item.value)}
        />
      </View>
      <View>
        <Text style={[styles.label, { color: theme.text }]}>
          Pilih Kategori
        </Text>
        <Dropdown
          data={categories.map((category) => ({
            label: category.name,
            value: category.id,
          }))}
          placeholderStyle={{
            color: theme.text,
          }}
          containerStyle={{
            borderRadius: 12,
            borderWidth: 0,
            padding: 12,
            backgroundColor: theme.backgroundInput,
          }}
          activeColor={theme.background}
          itemContainerStyle={{
            borderRadius: 8,
            backgroundColor: theme.backgroundInput,
          }}
          itemTextStyle={{
            color: theme.text,
          }}
          selectedTextStyle={{
            color: theme.text,
          }}
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundInput,
              borderColor: theme.border,
            },
          ]}
          labelField='label'
          valueField='value'
          placeholder='Pilih kategori'
          dropdownPosition='auto'
          value={categoryId}
          onChange={(item) => setCategoryId(item.value)}
        />
      </View>
      <View>
        <Text style={[styles.label, { color: theme.text }]}>
          Tanggal Transaksi
        </Text>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            padding: 14,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.backgroundInput,
          }}
        >
          <Calendar size={20} color={theme.text} />
          <Text style={{ color: theme.text }}>{formattedDate}</Text>
        </TouchableOpacity>

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
      <View>
        <Text style={[styles.label, { color: theme.text }]}>
          Catatan (Opsional)
        </Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            {
              backgroundColor: theme.backgroundInput,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholderTextColor={theme.text}
          placeholder='Makan siang, bensin, dll...'
          multiline
          numberOfLines={3}
          value={note}
          onChangeText={setNote}
        />
      </View>
    </View>
  );
};

export default FormInput;

const styles = StyleSheet.create({
  rowGroup: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 20,
    borderWidth: 1,
    padding: 20,
    borderRadius: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    flex: 1,
    height: 100,
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
    textAlignVertical: "top", // Penting untuk Android agar teks mulai dari atas
  },
});
