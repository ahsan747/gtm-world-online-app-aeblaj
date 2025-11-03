
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { GlassView } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Animated,
  ActivityIndicator,
} from "react-native";
import { getUserProfile, updateUserProfile, createUserProfile } from "@/services/database";
import { IconSymbol } from "@/components/IconSymbol";
import * as Haptics from "expo-haptics";
import React, { useState, useRef, useEffect, useCallback } from "react";

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("USA");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadProfile = useCallback(async () => {
    if (!user) {
      console.log('No user logged in');
      setLoading(false);
      return;
    }

    try {
      console.log('Loading user profile for:', user.id);
      const profile = await getUserProfile(user.id);
      
      if (profile) {
        console.log('Profile loaded successfully');
        setDisplayName(profile.display_name || "");
        setPhone(profile.phone || "");
        setAddress(profile.address || "");
        setCity(profile.city || "");
        setState(profile.state || "");
        setZipCode(profile.zip_code || "");
        setCountry(profile.country || "USA");
      } else {
        console.log('No profile found, using user metadata');
        setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || "");
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Entrance animation and load profile - only run once on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    loadProfile();
  }, [fadeAnim, loadProfile]);

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to update your profile");
      return;
    }

    if (!displayName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setSaving(true);
    try {
      console.log('Saving profile for user:', user.id);
      
      // Try to update existing profile
      try {
        await updateUserProfile(user.id, {
          display_name: displayName,
          phone,
          address,
          city,
          state,
          zip_code: zipCode,
          country,
        });
        console.log('Profile updated successfully');
      } catch (updateError: any) {
        // If profile doesn't exist, create it
        if (updateError.message?.includes('No rows found')) {
          console.log('Profile not found, creating new profile');
          await createUserProfile(user.id, user.email || '', displayName);
          await updateUserProfile(user.id, {
            phone,
            address,
            city,
            state,
            zip_code: zipCode,
            country,
          });
          console.log('Profile created and updated successfully');
        } else {
          throw updateError;
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Success",
        "Your profile has been updated successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert(
        "Error",
        error.message || "Failed to update profile. Please try again."
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    keyboardType: any = "default",
    autoCapitalize: any = "words"
  ) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text + "60"}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={!saving}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Edit Profile",
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Edit Profile",
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.avatarSection}>
              <LinearGradient
                colors={["#FF6B9D", "#C06C84", "#8B5A8E"]}
                style={styles.avatarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <IconSymbol name="person.fill" size={48} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.avatarLabel, { color: colors.text + "80" }]}>
                {user?.email}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Personal Information
              </Text>
              {renderInput("Full Name", displayName, setDisplayName, "John Doe")}
              {renderInput(
                "Phone",
                phone,
                setPhone,
                "+1 (555) 123-4567",
                "phone-pad",
                "none"
              )}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Address
              </Text>
              {renderInput(
                "Street Address",
                address,
                setAddress,
                "123 Main Street",
                "default",
                "words"
              )}
              {renderInput("City", city, setCity, "New York")}
              {renderInput("State", state, setState, "NY")}
              {renderInput(
                "Zip Code",
                zipCode,
                setZipCode,
                "10001",
                "number-pad",
                "none"
              )}
              {renderInput("Country", country, setCountry, "USA")}
            </View>

            <View style={styles.buttonContainer}>
              <Pressable
                onPress={handleSave}
                disabled={saving}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <LinearGradient
                  colors={["#FF6B9D", "#C06C84"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradient}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <IconSymbol name="checkmark.circle.fill" size={24} color="#FFFFFF" />
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  content: {
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
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
  avatarLabel: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  saveButton: {
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
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});
