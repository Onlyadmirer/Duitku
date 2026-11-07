import {
  Text,
  TextProps,
  StyleProp,
  TextStyle,
  useColorScheme,
} from "react-native";
import { Colors } from "@/constants/Colors";
import React from "react";

interface ThemedTextProps extends TextProps {
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

const ThemedText = ({ style, children, ...props }: ThemedTextProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <Text style={[{ color: theme.text }, style]} {...props}>
      {children}
    </Text>
  );
};

export default ThemedText;
