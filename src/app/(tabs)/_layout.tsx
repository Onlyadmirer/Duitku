import {
  View,
  Text,
  useColorScheme,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { router, Tabs } from "expo-router";
import {
  House,
  LayoutGridCircles,
  Plus,
  ReceiptText,
  User,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ChartPie } from "lucide-react-native/icons";

const Layout = () => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <>
      <StatusBar animated={true} style='auto' />
      <View
        style={{
          backgroundColor: theme.tabBackground,
          borderWidth: 0.4,
        }}
      >
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
            position: "absolute",
            bottom: 8,
            height: 70,
            paddingTop: 9,
            borderTopWidth: 1.2,
            marginHorizontal: 4,
            borderWidth: 1.2,
            borderRadius: 100,
            elevation: 0,
          },
          animation: "fade",
          tabBarLabelStyle: {
            fontSize: 9,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name='index'
          options={{
            title: "Beranda",
            tabBarIcon: ({ color }) => <House size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name='transaction'
          options={{
            title: "transaction",
            tabBarIcon: ({ color }) => <ReceiptText size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name='addTransaction'
          options={{
            title: "",
            tabBarButton: () => (
              <TouchableOpacity
                style={{
                  top: -16,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => router.push("/addTransactionModal")}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: theme.primary,
                    justifyContent: "center",
                    alignItems: "center",
                    elevation: 5,
                    shadowColor: theme.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                  }}
                >
                  <Plus color='#000000' size={28} strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name='budget'
          options={{
            title: "Anggaran",
            tabBarIcon: ({ color }) => <ChartPie size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name='more'
          options={{
            title: "Lainnya",
            tabBarIcon: ({ color }) => (
              <LayoutGridCircles size={22} color={color} />
            ),
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
