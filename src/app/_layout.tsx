import { View, Text, useColorScheme } from "react-native";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDatabaseReady } from "@/db/useDatabaseReady";
import { Colors } from "@/constants/Colors";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data dianggap fresh selama 5 menit
      gcTime: 1000 * 60 * 30, // Cache disimpan selama 30 menit
    },
  },
});

const RootLayout = () => {
  const scheme = useColorScheme() ?? "dark";
  const c = Colors[scheme];
  const base = scheme === "dark" ? DarkTheme : DefaultTheme;

  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: c.primary,
      background: c.background, // #0B1C30
      card: c.tabBackground,
      text: c.text,
      border: c.border,
    },
  };

  const { success, error, isSeeded } = useDatabaseReady();

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Migration Error: {error.message}</Text>
      </View>
    );
  }

  if (!success || !isSeeded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Memuat Database & Migrasi...</Text>
      </View>
    );
  }
  return (
    <ThemeProvider value={navTheme}>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />

          <Stack.Screen
            name='addTransactionModal'
            options={{
              animation: "slide_from_bottom",
              headerShown: false,
              presentation: "formSheet",
              sheetGrabberVisible: true,
              sheetInitialDetentIndex: 0,
              sheetAllowedDetents: [0.75, 1],
              gestureDirection: "vertical",
              sheetCornerRadius: 20,
              sheetExpandsWhenScrolledToEdge: true,
              sheetElevation: 24,
            }}
          />
        </Stack>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default RootLayout;
