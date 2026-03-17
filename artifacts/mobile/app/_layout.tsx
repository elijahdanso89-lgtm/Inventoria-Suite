import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppContextProvider } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const WELCOME_KEY = "inventoria_welcome_seen_v1";

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="welcome"
        options={{ headerShown: false, animation: "fade" }}
      />
      <Stack.Screen
        name="product/[id]"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="product/new"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="product/edit/[id]"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="product/quickadd"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.7],
          sheetGrabberVisible: true,
          contentStyle: { backgroundColor: "transparent" },
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="sale/new"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="settings"
        options={{ headerShown: false, presentation: "modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;
    SplashScreen.hideAsync();
    AsyncStorage.getItem(WELCOME_KEY).then((seen) => {
      if (!seen) router.replace("/welcome");
    });
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppContextProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AppContextProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
