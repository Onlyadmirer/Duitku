import { useEffect } from "react";
import { View, Text, useColorScheme } from "react-native";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SystemUI from "expo-system-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDatabaseReady } from "@/db/useDatabaseReady";
import { Colors } from "@/constants/Colors";
import { ModalTransactionProvider } from "@/context/ModalTransactionContext";
import { AppStartupLoader } from "@/components/ui/LoadingState";

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

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(c.background);
  }, [c.background]);

  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: c.primary,
      background: c.background,
      card: c.tabBackground,
      text: c.text,
    },
  };

  const { success, error, isSeeded } = useDatabaseReady();

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: c.background,
        }}
      >
        <Text style={{ color: c.text }}>Migration Error: {error.message}</Text>
      </View>
    );
  }

  if (!success || !isSeeded) {
    return <AppStartupLoader message='Memuat...' />;
  }
  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ThemeProvider value={navTheme}>
        <QueryClientProvider client={queryClient}>
          <ModalTransactionProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen
                name='(tabs)'
                options={{
                  headerShown: false,
                  contentStyle: { backgroundColor: c.background },
                }}
              />

              <Stack.Screen
                name='financialReport'
                options={{
                  headerShown: false,
                  animation: "slide_from_right",
                  contentStyle: { backgroundColor: c.background },
                }}
              />

              <Stack.Screen
                name='addTransactionModal'
                options={{
                  headerShown: false,
                  presentation: "transparentModal",
                  animation: "fade",
                  contentStyle: { backgroundColor: "transparent" },
                }}
              />
            </Stack>
          </ModalTransactionProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </View>
  );
};

export default RootLayout;
