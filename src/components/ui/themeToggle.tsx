import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useTheme } from "expo-router";

const themeToggle = () => {
  const themeScheme = useTheme();

  return (
    <View>
      <Text>themeToggle</Text>
    </View>
  );
};

export default themeToggle;

const styles = StyleSheet.create({});
