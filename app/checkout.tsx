
import { GlassView } from "expo-glass-effect";
import { useCart } from "@/contexts/CartContext";
import { useRouter, Stack } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import * as Haptics from "expo-haptics";

export default function CheckoutScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { cart, getCartTotal, clearCart } = useCart();
  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    console.log("Checkout screen mounted");
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []); // Empty dependency array is intentional - animation should only run once on mount

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    console.log("Place order button pressed");
    
    if (!name || !email || !phone || !address || !city || !zipCode || !country) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setIsProcessing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    console.log("Processing order...");

    // Simulate order processing
    setTimeout(() => {
      console.log("Order processed successfully");
      setIsProcessing(false);
      clearCart();
      
      Alert.alert(
        "Order Placed Successfully! 🎉",
        `Thank you for your order, ${name}!\n\nOrder Total: $${total.toFixed(2)}\n\nYou will receive a confirmation email at ${email} shortly.`,
        [
          {
            text: "Continue Shopping",
            onPress: () => {
              console.log("Navigating back to home");
              router.replace("/(tabs)/(home)");
            },
          },
        ]
      );
    }, 2000);
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    keyboardType: any = "default",
    autoCapitalize: any = "words"
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.text }]}>
        {label} *
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
        placeholder={placeholder}
        placeholderTextColor={colors.text + "60"}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Checkout",
          headerStyle: {
            backgroundColor: Platform.OS === "android" ? colors.card : "transparent",
          },
          headerTransparent: Platform.OS === "ios",
          headerBlurEffect: "regular",
          headerLeft: () => (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                console.log("Back button pressed");
                router.back();
              }}
              style={({ pressed }) => [
                styles.headerButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <IconSymbol name="chevron.left" size={24} color={colors.text} />
            </Pressable>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.progressBar,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.progressStep}>
              <View style={[styles.progressCircle, { backgroundColor: colors.primary }]}>
                <IconSymbol name="cart" size={16} color="#FFFFFF" />
              </View>
              <Text style={[styles.progressText, { color: colors.text }]}>Cart</Text>
            </View>
            <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
            <View style={styles.progressStep}>
              <View style={[styles.progressCircle, { backgroundColor: colors.primary }]}>
                <IconSymbol name="doc.text" size={16} color="#FFFFFF" />
              </View>
              <Text style={[styles.progressText, { color: colors.text }]}>Details</Text>
            </View>
            <View style={[styles.progressLine, { backgroundColor: colors.border }]} />
            <View style={styles.progressStep}>
              <View style={[styles.progressCircle, { backgroundColor: colors.border }]}>
                <IconSymbol name="checkmark" size={16} color={colors.text} />
              </View>
              <Text style={[styles.progressText, { color: colors.text + "80" }]}>Complete</Text>
            </View>
          </Animated.View>

          <Animated.View 
            style={[
              styles.section, 
              { 
                backgroundColor: colors.card,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <IconSymbol name="person.circle" size={24} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Contact Information
              </Text>
            </View>
            
            {renderInput("Full Name", name, setName, "John Doe")}
            {renderInput("Email Address", email, setEmail, "john@example.com", "email-address", "none")}
            {renderInput("Phone Number", phone, setPhone, "+1 (555) 123-4567", "phone-pad")}
          </Animated.View>

          <Animated.View 
            style={[
              styles.section, 
              { 
                backgroundColor: colors.card,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <IconSymbol name="location.circle" size={24} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Shipping Address
              </Text>
            </View>
            
            {renderInput("Street Address", address, setAddress, "123 Main Street")}

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  City *
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="New York"
                  placeholderTextColor={colors.text + "60"}
                  value={city}
                  onChangeText={setCity}
                  autoCapitalize="words"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  ZIP Code *
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="10001"
                  placeholderTextColor={colors.text + "60"}
                  value={zipCode}
                  onChangeText={setZipCode}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {renderInput("Country", country, setCountry, "United States")}
          </Animated.View>

          <Animated.View 
            style={[
              styles.section, 
              { 
                backgroundColor: colors.card,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <IconSymbol name="doc.text" size={24} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Order Summary
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>
                Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ${subtotal.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <View style={styles.shippingLabelContainer}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>
                  Shipping
                </Text>
                {shipping === 0 && (
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>FREE</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.summaryValue, { color: shipping === 0 ? "#34C759" : colors.text }]}>
                {shipping === 0 ? "$0.00" : `$${shipping.toFixed(2)}`}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>
                Tax (8%)
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ${tax.toFixed(2)}
              </Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Total
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                ${total.toFixed(2)}
              </Text>
            </View>
          </Animated.View>

          <Animated.View 
            style={[
              styles.infoBox,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <IconSymbol name="lock.shield" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Your order will be processed securely. You&apos;ll receive a confirmation email shortly.
            </Text>
          </Animated.View>

          {/* Add extra spacing at the bottom for better scrolling */}
          <View style={{ height: 40 }} />
        </ScrollView>

        <Animated.View 
          style={[
            styles.footer, 
            { 
              backgroundColor: colors.card,
              opacity: fadeAnim,
            }
          ]}
        >
          <Pressable
            onPress={handlePlaceOrder}
            disabled={isProcessing}
            style={({ pressed }) => [
              styles.placeOrderButton,
              {
                backgroundColor: colors.primary,
                opacity: isProcessing ? 0.6 : pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            {isProcessing ? (
              <>
                <Text style={styles.placeOrderText}>Processing Order...</Text>
              </>
            ) : (
              <>
                <IconSymbol name="checkmark.circle.fill" size={24} color="#FFFFFF" />
                <Text style={styles.placeOrderText}>
                  Place Order - ${total.toFixed(2)}
                </Text>
              </>
            )}
          </Pressable>
        </Animated.View>
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
    paddingBottom: 20,
  },
  headerButton: {
    marginLeft: 16,
  },
  progressBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  progressStep: {
    alignItems: "center",
    gap: 8,
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
  },
  shippingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  freeBadge: {
    backgroundColor: "#34C759",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  freeBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  placeOrderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  placeOrderText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
