import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import { Link } from "expo-router";
import { StyleSheet } from "react-native";

const index = () => {
  return (
    <ThemedView style={styles.root}>
      <ThemedText style={styles.title}>Home</ThemedText>
      <ThemedText>
        <Link href={"/about"} style={{ color: "#ffffff" }}>
          to about
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
