
import React, { useEffect } from "react";
import { Stack, router } from "expo-router";
import { SystemBars } from "react-native-edge-to-edge";
import "react-native-reanimated";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert } from "react-native";
import { useNetworkState } from "expo-network";
import * as SplashScreen from "expo-splash-screen";
import { Button } from "@/components/button";
import { StatusBar } from "expo-status-bar";

// ✅ NEW: imports for Firebase + router tracking
import { usePathname } from "expo-router";
import analytics from "@react-native-firebase/analytics";


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const { isConnected } = useNetworkState();
  const colorScheme = useColorScheme();
  const pathname = usePathname(); // 

useEffect(() => {
  const identifyUser = async () => {
    try {
      // --- Step 1: Initial "Logged In" State ---
      console.log("⏳ Starting Phase 1: Logged In...");
      await analytics().setUserId("12456789123");
      await analytics().setUserProperty("user_type", "registered");
      
      // Fire an event to stamp these properties
      await analytics().logEvent("test_mid_session_start");
      console.log("✅ Phase 1 Complete.");

      // --- Step 2: Pause for 10 seconds ---
      console.log("⏳ Waiting 10 seconds...");
      await new Promise(resolve => setTimeout(resolve, 300000));

      // --- Step 3: Mid-Session Change ("Logged Out" State) ---
      console.log("⏳ Starting Phase 2: Logged Out...");
      await analytics().setUserId(null); // Clears the ID
      await analytics().setUserProperty("user_type", "anonymous");

      // Fire another event to see the new properties attached
      await analytics().logEvent("test_mid_session_end");
      console.log("✅ Phase 2 Complete.");

    } catch (error) {
      console.error("Identity Simulation Error:", error);
    }
  };

  identifyUser();
}, []);

useEffect(() => {
  // on every route change
  if (pathname) {
    console.log("🚀 TRIGGERING SCREEN VIEW FOR:", pathname); // Add this line
    analytics().logScreenView({ screen_name: pathname, screen_class: pathname });
    analytics()
      .logScreenView({ screen_name: pathname, screen_class: pathname })
      .catch(() => {});
  }
}, [pathname]);

// ✅ NEW: 5-second simulated consent timer!
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        await analytics().setConsent({
          analytics_storage: true,
          ad_storage: true,
          ad_user_data: true,
          ad_personalization: true,
        });
        console.log("✅ SIMULATED: User clicked Accept! Consent is now GRANTED.");
      } catch (error) {
        console.error("Error setting consent:", error);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <CartProvider>
            <WidgetProvider>
              <SystemBars style="auto" />
              <StatusBar style="auto" />
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="modal"
                  options={{
                    presentation: "modal",
                    title: "Modal",
                  }}
                />
                <Stack.Screen
                  name="formsheet"
                  options={{
                    presentation: "formSheet",
                    title: "Form Sheet",
                    sheetAllowedDetents: [0.5, 1],
                    sheetGrabberVisible: true,
                  }}
                />
                <Stack.Screen
                  name="transparent-modal"
                  options={{
                    presentation: "transparentModal",
                    animation: "fade",
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="login"
                  options={{
                    presentation: "modal",
                    title: "Sign In",
                  }}
                />
                <Stack.Screen
                  name="signup"
                  options={{
                    presentation: "modal",
                    title: "Sign Up",
                  }}
                />
                <Stack.Screen
                  name="product/[id]"
                  options={{
                    presentation: "card",
                    title: "Product Details",
                  }}
                />
                <Stack.Screen
                  name="checkout"
                  options={{
                    presentation: "card",
                    title: "Checkout",
                  }}
                />
              </Stack>
            </WidgetProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
