import ThemedText from "@/components/ui/ThemedText";
import ThemedView from "@/components/ui/ThemedView";
import { Link } from "expo-router";
import { StyleSheet } from "react-native";

const index = () => {
  return (
    <ThemedView style={styles.root}>
      <ThemedText style={styles.title}>Home</ThemedText>
      <ThemedText>
        <Link href={"/transaction"} style={{ color: "#ffffff" }}>
          to about
        </Link>
        <Link href={"/addTransactionModal"} style={{ color: "#ffffff" }}>
          to add transaction
        </Link>
      </ThemedText>
    </ThemedView>
  );
};

export default index;

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
