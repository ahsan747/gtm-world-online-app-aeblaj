
import React from "react";
import { Stack, Link, useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, View, Text, Alert, Platform } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

const ICON_COLOR = "#007AFF";

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const modalDemos = [
    {
      title: "Standard Modal",
      description: "Full screen modal presentation",
      route: "/modal",
      color: "#007AFF",
    },
    {
      title: "Form Sheet",
      description: "Bottom sheet with detents and grabber",
      route: "/formsheet",
      color: "#34C759",
    },
    {
      title: "Transparent Modal",
      description: "Overlay without obscuring background",
      route: "/transparent-modal",
      color: "#FF9500",
    }
  ];

  const renderModalDemo = ({ item }: { item: (typeof modalDemos)[0] }) => (
    <GlassView style={[
      styles.demoCard,
      Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
    ]} glassEffectStyle="regular">
      <View style={[styles.demoIcon, { backgroundColor: item.color }]}>
        <IconSymbol name="square.grid.3x3" color="white" size={24} />
      </View>
      <View style={styles.demoContent}>
        <Text style={[styles.demoTitle, { color: theme.colors.text }]}>{item.title}</Text>
        <Text style={[styles.demoDescription, { color: theme.dark ? '#98989D' : '#666' }]}>{item.description}</Text>
      </View>
      <Link href={item.route as any} asChild>
        <Pressable>
          <GlassView style={[
            styles.tryButton,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }
          ]} glassEffectStyle="clear">
            <Text style={[styles.tryButtonText, { color: theme.colors.primary }]}>Try It</Text>
          </GlassView>
        </Pressable>
      </Link>
    </GlassView>
  );

  const renderHeaderRight = () => (
    <Pressable
      onPress={() => Alert.alert("Not Implemented", "This feature is not implemented yet")}
      style={styles.headerButtonContainer}
    >
      <IconSymbol name="plus" color={theme.colors.primary} />
    </Pressable>
  );

  const renderHeaderLeft = () => (
    <Pressable
      onPress={() => Alert.alert("Not Implemented", "This feature is not implemented yet")}
      style={styles.headerButtonContainer}
    >
      <IconSymbol
        name="gear"
        color={theme.colors.primary}
      />
    </Pressable>
  );

  const renderWelcomeCard = () => {
    if (user) {
      return (
        <GlassView style={[
          styles.welcomeCard,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]} glassEffectStyle="regular">
          <LinearGradient
            colors={['#FF6B9D', '#C44569']}
            style={styles.welcomeIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <IconSymbol name="sparkles" size={32} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>
            Welcome back, {user.displayName || 'User'}!
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
            Explore GTM World Online
          </Text>
        </GlassView>
      );
    }

    return (
      <GlassView style={[
        styles.welcomeCard,
        Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
      ]} glassEffectStyle="regular">
        <LinearGradient
          colors={['#FF6B9D', '#C44569']}
          style={styles.welcomeIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <IconSymbol name="sparkles" size={32} color="#FFFFFF" />
        </LinearGradient>
        <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>
          Welcome to GTM World Online
        </Text>
        <Text style={[styles.welcomeSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
          Sign in to access all features
        </Text>
        <View style={styles.authButtons}>
          <Pressable
            style={styles.authButton}
            onPress={() => router.push('/login')}
          >
            <LinearGradient
              colors={['#FF6B9D', '#C44569']}
              style={styles.authButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.authButtonText}>Sign In</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            style={[styles.authButton, styles.authButtonOutline, {
              borderColor: theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
            }]}
            onPress={() => router.push('/signup')}
          >
            <Text style={[styles.authButtonTextOutline, { color: theme.colors.text }]}>Sign Up</Text>
          </Pressable>
        </View>
      </GlassView>
    );
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "GTM World Online",
            headerRight: renderHeaderRight,
            headerLeft: renderHeaderLeft,
          }}
        />
      )}
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <FlatList
          data={modalDemos}
          renderItem={renderModalDemo}
          keyExtractor={(item) => item.route}
          ListHeaderComponent={renderWelcomeCard}
          contentContainerStyle={[
            styles.listContainer,
            Platform.OS !== 'ios' && styles.listContainerWithTabBar
          ]}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  listContainerWithTabBar: {
    paddingBottom: 100,
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(255, 107, 157, 0.3)',
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  authButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  authButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  authButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  authButtonOutline: {
    borderWidth: 2,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButtonTextOutline: {
    fontSize: 16,
    fontWeight: '700',
  },
  demoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  demoContent: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  demoDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  headerButtonContainer: {
    padding: 6,
  },
  tryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  tryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
