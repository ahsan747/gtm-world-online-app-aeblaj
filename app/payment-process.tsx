
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  TextInput,
  Animated,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import React, { useRef, useEffect, useState } from "react";
import { IconSymbol } from "@/components/IconSymbol";
import * as Haptics from "expo-haptics";
import { GlassView } from "expo-glass-effect";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/config/supabase";

type PaymentMethod = 'credit_card' | 'paypal';

const PaymentProcessScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment method from previous screen
  const paymentMethod = params.paymentMethod as PaymentMethod;
  
  // Parse order data from params
  const orderData = params.orderData ? JSON.parse(params.orderData as string) : null;

  // Credit card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  // PayPal form state
  const [paypalEmail, setPaypalEmail] = useState("");
  const [paypalPassword, setPaypalPassword] = useState("");

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

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

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add space every 4 digits
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const validateCreditCard = () => {
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    
    if (cleanedCardNumber.length !== 16) {
      Alert.alert("Invalid Card", "Please enter a valid 16-digit card number");
      return false;
    }
    
    if (!cardName.trim()) {
      Alert.alert("Invalid Name", "Please enter the cardholder name");
      return false;
    }
    
    const expiryParts = expiryDate.split('/');
    if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
      Alert.alert("Invalid Expiry", "Please enter a valid expiry date (MM/YY)");
      return false;
    }
    
    const month = parseInt(expiryParts[0]);
    if (month < 1 || month > 12) {
      Alert.alert("Invalid Expiry", "Please enter a valid month (01-12)");
      return false;
    }
    
    if (cvv.length !== 3 && cvv.length !== 4) {
      Alert.alert("Invalid CVV", "Please enter a valid CVV (3 or 4 digits)");
      return false;
    }
    
    return true;
  };

  const validatePayPal = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(paypalEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid PayPal email address");
      return false;
    }
    
    if (paypalPassword.length < 6) {
      Alert.alert("Invalid Password", "Please enter your PayPal password");
      return false;
    }
    
    return true;
  };

  /**
   * Process payment through Supabase Edge Function
   * This function calls the secure server-side payment processing
   * 
   * IMPORTANT: For production use:
   * 1. For Stripe: Implement Stripe Elements or Stripe SDK on client side
   *    to generate secure tokens instead of sending raw card data
   * 2. For PayPal: Implement PayPal SDK to create orders on client side
   * 3. Never send raw card numbers to the server - use tokenization
   * 4. Set up proper payment gateway credentials in Supabase Edge Function secrets:
   *    - STRIPE_SECRET_KEY for Stripe
   *    - PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET for PayPal
   */
  const processPaymentViaEdgeFunction = async () => {
    try {
      console.log('Calling payment processing Edge Function...');
      
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start();

      // Get Supabase function URL
      const { data: { session } } = await supabase.auth.getSession();
      
      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          paymentMethod,
          amount: orderData.total_amount,
          currency: 'usd',
          orderData: {
            user_id: orderData.user_id,
            user_email: orderData.user_email,
            items: orderData.items,
            shipping_info: orderData.shipping_info,
            total_amount: orderData.total_amount,
          },
          // NOTE: In production, replace these with secure tokens
          // For Stripe: Use Stripe.js to create a token
          // For PayPal: Use PayPal SDK to create an order
          stripeToken: paymentMethod === 'credit_card' ? 'demo_token' : undefined,
          paypalOrderId: paymentMethod === 'paypal' ? 'demo_order_id' : undefined,
        },
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(error.message || 'Payment processing failed');
      }

      console.log('Payment response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Payment was declined');
      }

      return {
        success: true,
        paymentId: data.paymentId,
        orderId: data.orderId,
      };
    } catch (error: any) {
      console.error('Payment processing error:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    console.log('=== PROCESSING PAYMENT ===');
    console.log('Payment method:', paymentMethod);
    
    // Validate based on payment method
    if (paymentMethod === 'credit_card') {
      if (!validateCreditCard()) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
    } else if (paymentMethod === 'paypal') {
      if (!validatePayPal()) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
    }

    if (!orderData) {
      Alert.alert("Error", "Order data is missing. Please try again.");
      return;
    }

    try {
      setIsProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.log('Processing payment via Edge Function...');
      const result = await processPaymentViaEdgeFunction();

      if (!result.success) {
        throw new Error('Payment processing failed');
      }

      console.log('Payment successful, order created:', result.orderId);

      // Clear cart after successful order
      console.log('Clearing cart after successful payment');
      clearCart();

      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Show success message
      const orderId = result.orderId?.substring(0, 8).toUpperCase();
      const paymentMethodName = paymentMethod === 'credit_card' ? 'Credit Card' : 'PayPal';
      
      Alert.alert(
        "Payment Successful! 🎉",
        `Your ${paymentMethodName} payment has been processed successfully.\n\nOrder ID: #${orderId}\nPayment ID: ${result.paymentId}\n\nWe'll send you a confirmation email at ${orderData.user_email}.`,
        [
          {
            text: "View Orders",
            onPress: () => {
              router.replace("/orders");
            },
          },
        ]
      );

    } catch (error: any) {
      console.error("Payment error:", error);
      
      setIsProcessing(false);
      progressAnim.setValue(0);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        "Payment Failed",
        error.message || "There was an error processing your payment. Please try again.",
        [
          {
            text: "Try Again",
            onPress: () => {
              // Reset form or allow retry
            },
          },
          {
            text: "Change Payment Method",
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    }
  };

  if (!orderData || !paymentMethod) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Payment",
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={80} color={colors.text + "40"} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Invalid Payment Session
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
          title: paymentMethod === 'credit_card' ? 'Card Payment' : 'PayPal Payment',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerBackVisible: !isProcessing,
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
          scrollEnabled={!isProcessing}
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
            {/* Processing Overlay */}
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <GlassView
                  style={[styles.processingCard, { backgroundColor: colors.card }]}
                  intensity={Platform.OS === "ios" ? 40 : 0}
                >
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.processingTitle, { color: colors.text }]}>
                    Processing Payment...
                  </Text>
                  <Text style={[styles.processingSubtitle, { color: colors.text + "80" }]}>
                    Please don&apos;t close this screen
                  </Text>
                  
                  {/* Progress Bar */}
                  <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
                    <Animated.View
                      style={[
                        styles.progressBar,
                        {
                          backgroundColor: colors.primary,
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          }),
                        },
                      ]}
                    />
                  </View>
                </GlassView>
              </View>
            )}

            {/* Demo Notice */}
            <View style={[styles.demoNotice, { backgroundColor: "#FF9500" + "20", borderColor: "#FF9500" }]}>
              <IconSymbol name="info.circle.fill" size={20} color="#FF9500" />
              <View style={styles.demoTextContainer}>
                <Text style={[styles.demoTitle, { color: colors.text }]}>
                  Demo Mode - Simulated Payment
                </Text>
                <Text style={[styles.demoText, { color: colors.text + "80" }]}>
                  {paymentMethod === 'paypal' 
                    ? 'This is a dummy PayPal payment for demonstration. No real payment will be processed. In production, integrate PayPal JavaScript SDK for real transactions.'
                    : 'Payment gateway not configured. Using simulation mode. To enable real payments, configure Stripe or PayPal credentials in Edge Function secrets.'}
                </Text>
              </View>
            </View>

            {/* Amount Card */}
            <GlassView
              style={[styles.amountCard, { backgroundColor: colors.card }]}
              intensity={Platform.OS === "ios" ? 20 : 0}
            >
              <Text style={[styles.amountLabel, { color: colors.text + "80" }]}>
                Amount to Pay
              </Text>
              <Text style={[styles.amountValue, { color: colors.primary }]}>
                ${total.toFixed(2)}
              </Text>
              <View style={[styles.methodBadge, { backgroundColor: paymentMethod === 'paypal' ? "#0070BA20" : colors.primary + "20" }]}>
                <IconSymbol 
                  name={paymentMethod === 'credit_card' ? 'creditcard' : 'dollarsign.circle'} 
                  size={16} 
                  color={paymentMethod === 'paypal' ? '#0070BA' : colors.primary} 
                />
                <Text style={[styles.methodBadgeText, { color: paymentMethod === 'paypal' ? '#0070BA' : colors.primary }]}>
                  {paymentMethod === 'credit_card' ? 'Credit Card' : 'PayPal (Demo)'}
                </Text>
              </View>
            </GlassView>

            {/* Payment Form */}
            {paymentMethod === 'credit_card' ? (
              <View style={styles.formSection}>
                <Text style={[styles.formTitle, { color: colors.text }]}>
                  Card Information
                </Text>

                {/* PCI DSS Notice */}
                <View style={[styles.infoBox, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
                  <IconSymbol name="lock.shield.fill" size={20} color={colors.primary} />
                  <Text style={[styles.infoText, { color: colors.text + "80" }]}>
                    For production: Use Stripe Elements or Stripe SDK to securely tokenize card data. Never send raw card numbers to your server.
                  </Text>
                </View>

                {/* Card Number */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Card Number
                  </Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <IconSymbol name="creditcard" size={20} color={colors.text + "60"} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={cardNumber}
                      onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                      placeholder="1234 5678 9012 3456"
                      placeholderTextColor={colors.text + "40"}
                      keyboardType="number-pad"
                      maxLength={19}
                      editable={!isProcessing}
                    />
                  </View>
                </View>

                {/* Cardholder Name */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Cardholder Name
                  </Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <IconSymbol name="person" size={20} color={colors.text + "60"} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={cardName}
                      onChangeText={setCardName}
                      placeholder="John Doe"
                      placeholderTextColor={colors.text + "40"}
                      autoCapitalize="words"
                      editable={!isProcessing}
                    />
                  </View>
                </View>

                {/* Expiry and CVV */}
                <View style={styles.rowInputs}>
                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Expiry Date
                    </Text>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <IconSymbol name="calendar" size={20} color={colors.text + "60"} />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        value={expiryDate}
                        onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                        placeholder="MM/YY"
                        placeholderTextColor={colors.text + "40"}
                        keyboardType="number-pad"
                        maxLength={5}
                        editable={!isProcessing}
                      />
                    </View>
                  </View>

                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      CVV
                    </Text>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <IconSymbol name="lock.shield" size={20} color={colors.text + "60"} />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        value={cvv}
                        onChangeText={(text) => setCvv(text.replace(/\D/g, '').substring(0, 4))}
                        placeholder="123"
                        placeholderTextColor={colors.text + "40"}
                        keyboardType="number-pad"
                        maxLength={4}
                        secureTextEntry
                        editable={!isProcessing}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.formSection}>
                <Text style={[styles.formTitle, { color: colors.text }]}>
                  PayPal Login (Demo)
                </Text>

                {/* PayPal SDK Notice */}
                <View style={[styles.infoBox, { backgroundColor: "#0070BA" + "10", borderColor: "#0070BA" + "30" }]}>
                  <IconSymbol name="info.circle.fill" size={20} color="#0070BA" />
                  <Text style={[styles.infoText, { color: colors.text + "80" }]}>
                    This is a simulated PayPal payment. For production: Use PayPal JavaScript SDK to create orders on client side, then pass the order ID to your server for capture.
                  </Text>
                </View>

                {/* Demo Credentials Info */}
                <View style={[styles.demoCredentialsBox, { backgroundColor: "#34C759" + "10", borderColor: "#34C759" + "30" }]}>
                  <IconSymbol name="checkmark.circle.fill" size={20} color="#34C759" />
                  <View style={styles.demoCredentialsContent}>
                    <Text style={[styles.demoCredentialsTitle, { color: colors.text }]}>
                      Demo Credentials
                    </Text>
                    <Text style={[styles.demoCredentialsText, { color: colors.text + "80" }]}>
                      Enter any email and password (min 6 characters) to simulate a PayPal payment. No real payment will be processed.
                    </Text>
                  </View>
                </View>

                {/* PayPal Email */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    PayPal Email
                  </Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <IconSymbol name="envelope" size={20} color={colors.text + "60"} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={paypalEmail}
                      onChangeText={setPaypalEmail}
                      placeholder="your@email.com"
                      placeholderTextColor={colors.text + "40"}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isProcessing}
                    />
                  </View>
                </View>

                {/* PayPal Password */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    PayPal Password
                  </Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <IconSymbol name="lock" size={20} color={colors.text + "60"} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={paypalPassword}
                      onChangeText={setPaypalPassword}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.text + "40"}
                      secureTextEntry
                      editable={!isProcessing}
                    />
                  </View>
                </View>

                {/* PayPal Info */}
                <View style={[styles.infoBox, { backgroundColor: "#0070BA20" }]}>
                  <IconSymbol name="info.circle" size={20} color="#0070BA" />
                  <Text style={[styles.infoText, { color: colors.text + "80" }]}>
                    In a real implementation, you&apos;d be securely logged into your PayPal account to complete the payment
                  </Text>
                </View>
              </View>
            )}

            {/* Security Notice */}
            <View style={[styles.securityNotice, { backgroundColor: colors.card }]}>
              <IconSymbol name="lock.shield.fill" size={24} color="#34C759" />
              <View style={styles.securityTextContainer}>
                <Text style={[styles.securityTitle, { color: colors.text }]}>
                  Secure Payment Processing
                </Text>
                <Text style={[styles.securityText, { color: colors.text + "80" }]}>
                  {paymentMethod === 'paypal' 
                    ? 'This demo simulates PayPal payment processing. In production, all payments would be processed securely via PayPal\'s official SDK with 256-bit SSL encryption.'
                    : 'Payments are processed securely via Supabase Edge Functions with 256-bit SSL encryption. All sensitive data is handled according to PCI DSS compliance standards.'}
                </Text>
              </View>
            </View>

            {/* Pay Button */}
            <View style={styles.buttonContainer}>
              <Pressable
                onPress={handlePayment}
                disabled={isProcessing}
                style={({ pressed }) => [
                  styles.payButton,
                  isProcessing && styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}
              >
                <LinearGradient
                  colors={paymentMethod === 'paypal' ? ["#0070BA", "#003087"] : ["#34C759", "#30B350"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradient}
                >
                  {isProcessing ? (
                    <>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.payButtonText}>Processing...</Text>
                    </>
                  ) : (
                    <>
                      <IconSymbol 
                        name={paymentMethod === 'paypal' ? 'dollarsign.circle.fill' : 'checkmark.shield.fill'} 
                        size={24} 
                        color="#FFFFFF" 
                      />
                      <Text style={styles.payButtonText}>
                        {paymentMethod === 'paypal' ? 'Pay with PayPal' : `Pay $${total.toFixed(2)}`}
                      </Text>
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
  demoNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  demoTextContainer: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  demoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  demoCredentialsBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  demoCredentialsContent: {
    flex: 1,
  },
  demoCredentialsTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  demoCredentialsText: {
    fontSize: 12,
    lineHeight: 18,
  },
  amountCard: {
    borderRadius: 20,
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
  amountLabel: {
    fontSize: 14,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  amountValue: {
    fontSize: 42,
    fontWeight: "800",
    marginBottom: 16,
  },
  methodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  methodBadgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  formSection: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
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
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  securityText: {
    fontSize: 13,
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: 8,
  },
  payButton: {
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#34C759",
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
    opacity: 0.6,
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
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  processingCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
  },
  processingSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  progressBarContainer: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
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

export default PaymentProcessScreen;
