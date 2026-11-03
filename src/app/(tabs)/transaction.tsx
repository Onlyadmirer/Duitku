import { StyleSheet, Text, useColorScheme, View } from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";

const transaction = () => {
  return (
    <ThemedView style={styles.root}>
      <ThemedText style={styles.title}>transaction</ThemedText>
      <ThemedText>
        <Link href={"/"}>back to Home</Link>
      </ThemedText>
    </ThemedView>
  );
};

export default transaction;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
});
