import { StyleProp, ViewStyle, useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

interface ThemedViewProps extends ViewStyle {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const ThemedView = ({ style, children, ...props }: ThemedViewProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <SafeAreaView
      style={[{ backgroundColor: theme.background }, style]}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
};

export default ThemedView;
