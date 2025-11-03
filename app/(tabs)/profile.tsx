
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { GlassView } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import { IconSymbol } from "@/components/IconSymbol";
import React from "react";
import * as Haptics from "expo-haptics";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Alert,
} from "react-native";

const menuItems = [
  {
    id: "edit-profile",
    title: "Edit Profile",
    icon: "person.circle",
    route: "/edit-profile",
    color: "#007AFF",
  },
  {
    id: "orders",
    title: "My Orders",
    icon: "bag",
    route: "/orders",
    color: "#FF6B9D",
  },
  {
    id: "contact",
    title: "Contact Us",
    icon: "envelope",
    route: "/contact",
    color: "#34C759",
  },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const handleLogout = () => {
    console.log('Logout button pressed');
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              console.log('Logging out user...');
              await logout();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              console.log('Logout successful, navigating to home');
              router.replace("/(tabs)/(home)/");
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ]
    );
  };

  const renderMenuItem = (item: typeof menuItems[0], index: number) => (
    <Pressable
      key={item.id}
      onPress={() => {
        console.log('Menu item pressed:', item.title);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(item.route as any);
      }}
      style={({ pressed }) => [
        styles.menuItem,
        {
          backgroundColor: colors.card,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: item.color + "20" }]}>
        <IconSymbol name={item.icon as any} size={24} color={item.color} />
      </View>
      <Text style={[styles.menuItemText, { color: colors.text }]}>
        {item.title}
      </Text>
      <IconSymbol name="chevron.right" size={20} color={colors.text + "60"} />
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Profile",
          headerStyle: {
            backgroundColor: Platform.OS === "android" ? colors.card : "transparent",
          },
          headerTransparent: Platform.OS === "ios",
          headerBlurEffect: "regular",
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={["#FF6B9D", "#C06C84", "#8B5A8E"]}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <IconSymbol name="person.fill" size={48} color="#FFFFFF" />
          </LinearGradient>
          
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.user_metadata?.display_name || user?.email?.split('@')[0] || "Guest User"}
          </Text>
          
          {user?.email && (
            <Text style={[styles.userEmail, { color: colors.text + "80" }]}>
              {user.email}
            </Text>
          )}
          
          {!user && (
            <View style={styles.loginPrompt}>
              <Text style={[styles.loginPromptText, { color: colors.text + "80" }]}>
                Sign in to access all features
              </Text>
              <Pressable
                onPress={() => {
                  console.log('Login button pressed from profile');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push("/login");
                }}
                style={({ pressed }) => [
                  styles.loginButton,
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={styles.loginButtonText}>Sign In</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account
          </Text>
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </View>

        {user && (
          <View style={styles.logoutSection}>
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.logoutButton,
                {
                  backgroundColor: colors.card,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <IconSymbol name="arrow.right.square" size={24} color="#FF3B30" />
              <Text style={[styles.logoutText, { color: "#FF3B30" }]}>
                Logout
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text + "60" }]}>
            GTM World Online
          </Text>
          <Text style={[styles.footerText, { color: colors.text + "60" }]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginTop: Platform.OS === "ios" ? 60 : 20,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
  },
  loginPrompt: {
    alignItems: "center",
    marginTop: 16,
  },
  loginPromptText: {
    fontSize: 14,
    marginBottom: 12,
  },
  loginButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
  },
});
