import { View, Text, useColorScheme, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { House, User } from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const Layout = () => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <>
      <StatusBar animated={true} />
      <View style={{ backgroundColor: theme.tabBackground }}>
        <SafeAreaView style={styles.topBar}>
          <Text style={styles.text}>Duitku</Text>
        </SafeAreaView>
      </View>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.tabActive,
          tabBarInactiveTintColor: theme.tabInActive,
          tabBarStyle: {
            backgroundColor: theme.tabBackground,
            height: 60,
            paddingTop: 8,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name='index'
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <House color={color} />,
          }}
        />
        <Tabs.Screen
          name='about'
          options={{
            title: "About",
            tabBarIcon: ({ color }) => <User color={color} />,
          }}
        />
      </Tabs>
    </>
  );
};

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
  text: {
    fontSize: 20,
    color: "#8B5CF6",
    fontWeight: "800",
  },
});

export default Layout;
