import { StyleProp, StyleSheet, ViewStyle, useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

interface ThemedCardProps extends ViewStyle {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const ThemedCard = ({ style, children, ...props }: ThemedCardProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <SafeAreaView
      style={[{ backgroundColor: theme.card }, styles.card, style]}
      {...props}
    />
  );
};

export default ThemedCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 5,
    padding: 20,
  },
});
