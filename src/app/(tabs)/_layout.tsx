import {
  View,
  Text,
  useColorScheme,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { router, Tabs } from "expo-router";
import {
  Bell,
  ChartPie,
  House,
  LayoutGrid,
  Plus,
  ReceiptText,
  User,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const Layout = () => {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const isDark = colorScheme === "dark";

  return (
    <>
      <StatusBar animated={true} style="auto" />
      <SafeAreaView
        edges={["top"]}
        style={[
          styles.topBar,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View style={styles.brandRow}>
          <Image
            source={require("../../assets/image.png")}
            style={styles.logo}
          />
          <Text style={[styles.brandText, { color: theme.text }]}>Duitku</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={[
              styles.iconButton,
              {
                backgroundColor: isDark ? "#111726" : theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <Bell size={18} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            style={[
              styles.iconButton,
              {
                backgroundColor: isDark ? "#111726" : theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <User size={18} color={theme.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

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
            borderTopColor: theme.border,
            marginHorizontal: 8,
            borderWidth: 1.2,
            borderColor: theme.border,
            borderRadius: 100,
            elevation: 0,
          },
          animation: "fade",
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Beranda",
            tabBarIcon: ({ color }) => <House size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="transaction"
          options={{
            title: "Transaksi",
            tabBarIcon: ({ color }) => <ReceiptText size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="addTransaction"
          options={{
            title: "",
            tabBarButton: () => (
              <TouchableOpacity
                style={styles.fabContainer}
                onPress={() => router.push("/addTransactionModal")}
              >
                <View
                  style={[
                    styles.fabButton,
                    {
                      backgroundColor: theme.primary,
                      shadowColor: theme.primary,
                    },
                  ]}
                >
                  <Plus color="#000000" size={28} strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="budget"
          options={{
            title: "Anggaran",
            tabBarIcon: ({ color }) => <ChartPie size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: "Lainnya",
            tabBarIcon: ({ color }) => <LayoutGrid size={22} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
};

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 9,
  },
  brandText: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fabContainer: {
    top: -16,
    justifyContent: "center",
    alignItems: "center",
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default Layout;
