
import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.notLoggedInContainer}>
          <IconSymbol name="person.circle" size={80} color={theme.dark ? '#98989D' : '#666'} />
          <Text style={[styles.notLoggedInTitle, { color: theme.colors.text }]}>
            Not Logged In
          </Text>
          <Text style={[styles.notLoggedInText, { color: theme.dark ? '#98989D' : '#666' }]}>
            Please login to view your profile
          </Text>
          <Pressable
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <LinearGradient
              colors={['#FF6B9D', '#C44569']}
              style={styles.loginButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
      >
        <GlassView style={[
          styles.profileHeader,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]} glassEffectStyle="regular">
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#FF6B9D', '#C44569']}
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <IconSymbol name="person.fill" size={40} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {user.displayName || 'User'}
          </Text>
          <Text style={[styles.email, { color: theme.dark ? '#98989D' : '#666' }]}>
            {user.email}
          </Text>
        </GlassView>

        <GlassView style={[
          styles.section,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]} glassEffectStyle="regular">
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account Information</Text>
          
          <View style={styles.infoRow}>
            <IconSymbol name="envelope.fill" size={20} color={theme.dark ? '#98989D' : '#666'} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: theme.dark ? '#98989D' : '#666' }]}>Email</Text>
              <Text style={[styles.infoText, { color: theme.colors.text }]}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <IconSymbol name="calendar" size={20} color={theme.dark ? '#98989D' : '#666'} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: theme.dark ? '#98989D' : '#666' }]}>Member Since</Text>
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                {user.metadata?.creationTime 
                  ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <IconSymbol name="checkmark.circle.fill" size={20} color={user.emailVerified ? '#34C759' : theme.dark ? '#98989D' : '#666'} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: theme.dark ? '#98989D' : '#666' }]}>Email Status</Text>
              <Text style={[styles.infoText, { color: user.emailVerified ? '#34C759' : theme.colors.text }]}>
                {user.emailVerified ? 'Verified' : 'Not Verified'}
              </Text>
            </View>
          </View>
        </GlassView>

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <View style={[styles.logoutButtonContent, { 
            backgroundColor: theme.dark ? 'rgba(255,59,48,0.15)' : 'rgba(255,59,48,0.1)',
            borderColor: theme.dark ? 'rgba(255,59,48,0.3)' : 'rgba(255,59,48,0.2)'
          }]}>
            <IconSymbol name="arrow.right.square" size={20} color="#FF3B30" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  notLoggedInText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  loginButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0px 4px 12px rgba(255, 107, 157, 0.3)',
    elevation: 4,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  profileHeader: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 32,
    marginBottom: 16,
    gap: 12,
  },
  avatarContainer: {
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(255, 107, 157, 0.3)',
    elevation: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    gap: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    marginBottom: 20,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
  },
});
