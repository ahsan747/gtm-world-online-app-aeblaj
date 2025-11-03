
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { GlassView } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import { IconSymbol } from "@/components/IconSymbol";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import * as Haptics from "expo-haptics";

const ProfileScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colors } = useTheme();

  const handleLogout = () => {
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
              await logout();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.replace("/login");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: "bag.fill",
      title: "My Orders",
      subtitle: "View your order history",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push("/orders");
      },
    },
    {
      icon: "envelope.fill",
      title: "Contact Us",
      subtitle: "Get in touch with support",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push("/contact");
      },
    },
    {
      icon: "bell.fill",
      title: "Notifications",
      subtitle: "Manage your notifications",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert("Coming Soon", "Notification settings will be available soon!");
      },
    },
    {
      icon: "gearshape.fill",
      title: "Settings",
      subtitle: "App preferences and settings",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert("Coming Soon", "Settings will be available soon!");
      },
    },
    {
      icon: "questionmark.circle.fill",
      title: "Help & Support",
      subtitle: "FAQs and customer support",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert("Coming Soon", "Help center will be available soon!");
      },
    },
    {
      icon: "info.circle.fill",
      title: "About",
      subtitle: "App version and information",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert("GTM World Online", "Version 1.0.0\n\nYour trusted cosmetics store");
      },
    },
  ];

  const renderMenuItem = (item: typeof menuItems[0], index: number) => (
    <Pressable
      key={index}
      onPress={item.onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
    >
      <GlassView
        style={[styles.menuItemContent, { backgroundColor: colors.card }]}
        intensity={Platform.OS === "ios" ? 20 : 0}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + "20" }]}>
          <IconSymbol name={item.icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.menuItemText}>
          <Text style={[styles.menuItemTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.menuItemSubtitle, { color: colors.text + "80" }]}>
            {item.subtitle}
          </Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color={colors.text + "60"} />
      </GlassView>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={["#FF6B9D", "#C06C84"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <IconSymbol name="person.fill" size={48} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.displayName || user?.email?.split("@")[0] || "User"}
          </Text>
          <Text style={[styles.userEmail, { color: colors.text + "80" }]}>
            {user?.email || "Not logged in"}
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </View>

        {/* Logout Button */}
        {user && (
          <View style={styles.logoutContainer}>
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <GlassView
                style={[styles.logoutButtonContent, { backgroundColor: "#FF3B3020" }]}
                intensity={Platform.OS === "ios" ? 20 : 0}
              >
                <IconSymbol name="arrow.right.square.fill" size={24} color="#FF3B30" />
                <Text style={styles.logoutText}>Logout</Text>
              </GlassView>
            </Pressable>
          </View>
        )}

        {/* Login Button (if not logged in) */}
        {!user && (
          <View style={styles.loginContainer}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/login");
              }}
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <LinearGradient
                colors={["#FF6B9D", "#C06C84"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginGradient}
              >
                <IconSymbol name="person.fill" size={24} color="#FFFFFF" />
                <Text style={styles.loginText}>Login</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

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
  header: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#FF6B9D",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
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
  menuContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  menuItem: {
    marginBottom: 0,
  },
  menuItemPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  logoutButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  logoutButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 12,
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "700",
  },
  loginContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  loginButton: {
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#FF6B9D",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  loginGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 12,
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default ProfileScreen;
