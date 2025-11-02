
import React from "react";
import { GlassView } from "expo-glass-effect";
import { useRouter, Stack } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            console.log("User logged out");
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  const menuItems = [
    { icon: "bag", label: "My Orders", route: null },
    { icon: "heart", label: "Wishlist", route: null },
    { icon: "location", label: "Addresses", route: null },
    { icon: "creditcard", label: "Payment Methods", route: null },
    { icon: "bell", label: "Notifications", route: null },
    { icon: "gear", label: "Settings", route: null },
    { icon: "questionmark.circle", label: "Help & Support", route: null },
  ];

  const renderMenuItem = (item: typeof menuItems[0], index: number) => (
    <Pressable
      key={index}
      onPress={() => {
        if (item.route) {
          router.push(item.route as any);
        } else {
          Alert.alert("Coming Soon", `${item.label} feature is coming soon!`);
        }
      }}
    >
      <GlassView
        style={[
          styles.menuItem,
          Platform.OS !== 'ios' && {
            backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
          }
        ]}
        glassEffectStyle="regular"
      >
        <View style={styles.menuItemLeft}>
          <View style={[styles.menuIcon, { backgroundColor: theme.colors.primary + '20' }]}>
            <IconSymbol name={item.icon as any} size={20} color={theme.colors.primary} />
          </View>
          <Text style={[styles.menuLabel, { color: theme.colors.text }]}>
            {item.label}
          </Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color={theme.dark ? '#666' : '#999'} />
      </GlassView>
    </Pressable>
  );

  if (!user) {
    return (
      <>
        {Platform.OS === 'ios' && (
          <Stack.Screen
            options={{
              title: "Profile",
            }}
          />
        )}
        <SafeAreaView
          style={[styles.container, { backgroundColor: theme.colors.background }]}
          edges={['top']}
        >
          <View style={styles.guestContainer}>
            <GlassView
              style={[
                styles.guestCard,
                Platform.OS !== 'ios' && {
                  backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                }
              ]}
              glassEffectStyle="regular"
            >
              <LinearGradient
                colors={['#FF6B9D', '#C44569']}
                style={styles.guestIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <IconSymbol name="person" size={48} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.guestTitle, { color: theme.colors.text }]}>
                Sign in to your account
              </Text>
              <Text style={[styles.guestSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                Access your orders, wishlist, and more
              </Text>
              <View style={styles.guestButtons}>
                <Pressable
                  style={styles.guestButton}
                  onPress={() => router.push('/login')}
                >
                  <LinearGradient
                    colors={['#FF6B9D', '#C44569']}
                    style={styles.guestButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.guestButtonText}>Sign In</Text>
                  </LinearGradient>
                </Pressable>
                <Pressable
                  style={[
                    styles.guestButton,
                    styles.guestButtonOutline,
                    {
                      borderColor: theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                    }
                  ]}
                  onPress={() => router.push('/signup')}
                >
                  <Text style={[styles.guestButtonTextOutline, { color: theme.colors.text }]}>
                    Sign Up
                  </Text>
                </Pressable>
              </View>
            </GlassView>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Profile",
          }}
        />
      )}
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['top']}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          <GlassView
            style={[
              styles.profileCard,
              Platform.OS !== 'ios' && {
                backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
              }
            ]}
            glassEffectStyle="regular"
          >
            <LinearGradient
              colors={['#FF6B9D', '#C44569']}
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>
                {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {user.displayName || 'User'}
            </Text>
            <Text style={[styles.userEmail, { color: theme.dark ? '#98989D' : '#666' }]}>
              {user.email}
            </Text>
            <Text style={[styles.memberSince, { color: theme.dark ? '#98989D' : '#666' }]}>
              Member since {new Date(user.metadata.creationTime || '').toLocaleDateString()}
            </Text>
          </GlassView>

          <View style={styles.menuSection}>
            {menuItems.map((item, index) => renderMenuItem(item, index))}
          </View>

          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <GlassView
              style={[
                styles.logoutButtonInner,
                Platform.OS !== 'ios' && {
                  backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                }
              ]}
              glassEffectStyle="regular"
            >
              <IconSymbol name="arrow.right.square" size={20} color="#FF3B30" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </GlassView>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </>
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
    padding: 16,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(255, 107, 157, 0.3)',
    elevation: 8,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 14,
  },
  menuSection: {
    gap: 12,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginBottom: 20,
  },
  logoutButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  guestCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  guestIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    boxShadow: '0px 4px 12px rgba(255, 107, 157, 0.3)',
    elevation: 8,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  guestButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  guestButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  guestButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  guestButtonOutline: {
    borderWidth: 2,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButtonTextOutline: {
    fontSize: 16,
    fontWeight: '700',
  },
});
