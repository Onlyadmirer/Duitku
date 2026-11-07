import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Lightbulb } from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";

interface SavingTipsBannerProps {
  title?: string;
  description?: string;
}

const SavingTipsBanner = ({
  title = "Tips Hemat Duitku",
  description = "Anggaran jajan sisa 0%. Coba masak mie bareng teman kost minggu ini!",
}: SavingTipsBannerProps) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor: theme.border },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: theme.primary }]}>
        <Lightbulb size={20} color="#111111" strokeWidth={2.2} />
      </View>

      <View style={styles.textCol}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text
          style={[styles.description, { color: theme.textMuted }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {description}
        </Text>
      </View>
    </View>
  );
};

export default SavingTipsBanner;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
  },
  description: {
    fontSize: 12,
    marginTop: 2,
  },
});
