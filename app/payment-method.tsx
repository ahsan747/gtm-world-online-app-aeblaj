
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { GlassView } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Animated,
  Alert,
} from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import * as Haptics from "expo-haptics";
import React, { useRef, useEffect, useState } from "react";

type PaymentMethod = 'credit_card' | 'paypal' | null;

const PaymentMethodScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);

  // Parse order data from params
  const orderData = params.orderData ? JSON.parse(params.orderData as string) : null;

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Entrance animations
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

  const handleSelectMethod = (method: PaymentMethod) => {
    console.log('Payment method selected:', method);
    setSelectedMethod(method);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleContinue = () => {
    if (!selectedMethod) {
      Alert.alert("Error", "Please select a payment method");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    console.log('Continuing to payment with method:', selectedMethod);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Navigate to payment processing screen
    router.push({
      pathname: "/payment-process",
      params: {
        paymentMethod: selectedMethod,
        orderData: params.orderData,
      },
    });
  };

  if (!orderData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Payment Method",
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={80} color={colors.text + "40"} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            No Order Data
          </Text>
          <Text style={[styles.errorSubtitle, { color: colors.text + "80" }]}>
            Please start from the checkout page
          </Text>
          <Pressable
            onPress={() => router.replace("/(tabs)/cart")}
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={styles.backButtonText}>Go to Cart</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const total = orderData.total_amount;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Payment Method",
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

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
              Choose Payment Method
            </Text>
            <Text style={[styles.subtitle, { color: colors.text + "80" }]}>
              Select how you&apos;d like to pay for your order
            </Text>
          </View>

          {/* Total Amount Card */}
          <GlassView
            style={[styles.totalCard, { backgroundColor: colors.card }]}
            intensity={Platform.OS === "ios" ? 20 : 0}
          >
            <Text style={[styles.totalLabel, { color: colors.text + "80" }]}>
              Total Amount
            </Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              ${total.toFixed(2)}
            </Text>
          </GlassView>

          {/* Payment Methods */}
          <View style={styles.methodsContainer}>
            {/* Credit Card */}
            <Pressable
              onPress={() => handleSelectMethod('credit_card')}
              style={({ pressed }) => [
                styles.methodCard,
                {
                  backgroundColor: colors.card,
                  borderColor: selectedMethod === 'credit_card' ? colors.primary : colors.border,
                  borderWidth: selectedMethod === 'credit_card' ? 2 : 1,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View style={styles.methodContent}>
                <View style={[
                  styles.iconContainer,
                  { backgroundColor: colors.primary + "20" }
                ]}>
                  <IconSymbol name="creditcard" size={32} color={colors.primary} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodTitle, { color: colors.text }]}>
                    Credit / Debit Card
                  </Text>
                  <Text style={[styles.methodDescription, { color: colors.text + "80" }]}>
                    Pay securely with your card
                  </Text>
                </View>
                {selectedMethod === 'credit_card' && (
                  <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                    <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </Pressable>

            {/* PayPal */}
            <Pressable
              onPress={() => handleSelectMethod('paypal')}
              style={({ pressed }) => [
                styles.methodCard,
                {
                  backgroundColor: colors.card,
                  borderColor: selectedMethod === 'paypal' ? colors.primary : colors.border,
                  borderWidth: selectedMethod === 'paypal' ? 2 : 1,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View style={styles.methodContent}>
                <View style={[
                  styles.iconContainer,
                  { backgroundColor: "#0070BA20" }
                ]}>
                  <IconSymbol name="dollarsign.circle" size={32} color="#0070BA" />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodTitle, { color: colors.text }]}>
                    PayPal
                  </Text>
                  <Text style={[styles.methodDescription, { color: colors.text + "80" }]}>
                    Pay with your PayPal account
                  </Text>
                </View>
                {selectedMethod === 'paypal' && (
                  <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                    <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </Pressable>
          </View>

          {/* Security Notice */}
          <View style={[styles.securityNotice, { backgroundColor: colors.card }]}>
            <IconSymbol name="lock.shield" size={24} color="#34C759" />
            <Text style={[styles.securityText, { color: colors.text + "80" }]}>
              Your payment information is encrypted and secure
            </Text>
          </View>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <Pressable
              onPress={handleContinue}
              disabled={!selectedMethod}
              style={({ pressed }) => [
                styles.continueButton,
                !selectedMethod && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              <LinearGradient
                colors={selectedMethod ? ["#FF6B9D", "#C06C84"] : ["#999", "#666"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                <Text style={styles.continueText}>Continue to Payment</Text>
                <IconSymbol name="arrow.right" size={20} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  content: {
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  totalCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 32,
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
  totalLabel: {
    fontSize: 14,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "800",
  },
  methodsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  methodCard: {
    borderRadius: 16,
    padding: 20,
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
  methodContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 8,
  },
  continueButton: {
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
  buttonDisabled: {
    opacity: 0.5,
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
  continueText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PaymentMethodScreen;
