
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
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
import { IconSymbol } from "@/components/IconSymbol";
import * as Haptics from "expo-haptics";
import React, { useState, useRef, useEffect } from "react";
import { createContactMessage } from "@/services/database";

const ContactScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Entrance animations - only run once on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    if (!subject.trim()) {
      Alert.alert("Error", "Please enter a subject");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Error", "Please enter your message");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Save contact message to Supabase
      await createContactMessage({
        name,
        email,
        subject,
        message,
      });

      console.log('Contact message submitted successfully');

      // Show success message
      Alert.alert(
        "Message Sent! 📧",
        "Thank you for contacting us. We'll get back to you as soon as possible.",
        [
          {
            text: "OK",
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              // Clear form
              setName("");
              setEmail("");
              setSubject("");
              setMessage("");
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Error submitting contact message:", error);
      Alert.alert(
        "Submission Failed",
        error.message || "There was an error sending your message. Please try again.",
        [{ text: "OK" }]
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    multiline: boolean = false,
    keyboardType: any = "default",
    autoCapitalize: any = "sentences"
  ) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.textArea,
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
        multiline={multiline}
        numberOfLines={multiline ? 6 : 1}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={!isSubmitting}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Contact Us",
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
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                Get in Touch
              </Text>
              <Text style={[styles.subtitle, { color: colors.text + "80" }]}>
                We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
              </Text>
            </View>

            {/* Contact Info Cards */}
            <View style={styles.infoContainer}>
              <GlassView
                style={[styles.infoCard, { backgroundColor: colors.card }]}
                intensity={Platform.OS === "ios" ? 20 : 0}
              >
                <IconSymbol name="envelope.fill" size={24} color="#FF6B9D" />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  support@gtmworldonline.com
                </Text>
              </GlassView>

              <GlassView
                style={[styles.infoCard, { backgroundColor: colors.card }]}
                intensity={Platform.OS === "ios" ? 20 : 0}
              >
                <IconSymbol name="phone.fill" size={24} color="#FF6B9D" />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  +1 (555) 123-4567
                </Text>
              </GlassView>
            </View>

            {/* Contact Form */}
            <View style={styles.formSection}>
              {renderInput("Name", name, setName, "Your name", false, "default", "words")}
              {renderInput("Email", email, setEmail, "your@email.com", false, "email-address", "none")}
              {renderInput("Subject", subject, setSubject, "How can we help?", false, "default", "sentences")}
              {renderInput("Message", message, setMessage, "Tell us more about your inquiry...", true, "default", "sentences")}
            </View>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <Pressable
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <LinearGradient
                  colors={["#FF6B9D", "#C06C84"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradient}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <IconSymbol name="paperplane.fill" size={24} color="#FFFFFF" />
                      <Text style={styles.submitText}>Send Message</Text>
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
};

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
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },
  infoCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  infoText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  formSection: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
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
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  submitButton: {
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
  submitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default ContactScreen;
