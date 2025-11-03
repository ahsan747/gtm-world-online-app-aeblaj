
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
import { IconSymbol } from "@/components/IconSymbol";
import { useCart } from "@/contexts/CartContext";
import * as Haptics from "expo-haptics";
import React, { useState, useRef, useEffect } from "react";
import { createOrder, createUserProfile } from "@/services/database";

const CheckoutScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { cart, getCartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  // Shipping information state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("USA");

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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
  }, []);

  const handlePlaceOrder = async () => {
    console.log('Place order button pressed');
    
    // Validation
    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }
    if (!address.trim()) {
      Alert.alert("Error", "Please enter your address");
      return;
    }
    if (!city.trim()) {
      Alert.alert("Error", "Please enter your city");
      return;
    }
    if (!state.trim()) {
      Alert.alert("Error", "Please enter your state");
      return;
    }
    if (!zipCode.trim()) {
      Alert.alert("Error", "Please enter your zip code");
      return;
    }

    if (cart.length === 0) {
      Alert.alert("Error", "Your cart is empty");
      return;
    }

    try {
      setIsProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.log('Creating user profile if needed...');
      // Create user profile if it doesn't exist
      if (user?.uid) {
        try {
          await createUserProfile(user.uid, email, fullName);
        } catch (error) {
          console.log('User profile may already exist:', error);
        }
      }

      const total = getCartTotal();
      
      // Prepare order data
      const orderData = {
        user_id: user?.uid || 'guest',
        user_email: email,
        items: cart.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_image: item.product.image,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shipping_info: {
          full_name: fullName,
          email,
          phone,
          address,
          city,
          state,
          zip_code: zipCode,
          country,
        },
        total_amount: total,
        status: 'pending' as const,
      };

      console.log('Placing order with data:', orderData);

      // Save order to Supabase
      const order = await createOrder(orderData);

      console.log('Order placed successfully:', order);

      // Clear cart
      clearCart();

      // Show success message
      Alert.alert(
        "Order Placed Successfully! 🎉",
        `Your order #${order.id?.substring(0, 8)} has been placed. We'll send you a confirmation email at ${email}.`,
        [
          {
            text: "OK",
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.replace("/(tabs)/(home)");
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Error placing order:", error);
      Alert.alert(
        "Order Failed",
        error.message || "There was an error placing your order. Please try again or contact support.",
        [{ text: "OK" }]
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsProcessing(false);
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
        editable={!isProcessing}
      />
    </View>
  );

  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? (subtotal > 50 ? 0 : 5.99) : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Checkout",
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
            {/* Order Summary */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Order Summary
              </Text>
              <GlassView
                style={[styles.summaryCard, { backgroundColor: colors.card }]}
                intensity={Platform.OS === "ios" ? 20 : 0}
              >
                {cart.map((item, index) => (
                  <View key={item.product.id} style={styles.summaryItem}>
                    <Text style={[styles.itemName, { color: colors.text }]}>
                      {item.product.name} x {item.quantity}
                    </Text>
                    <Text style={[styles.itemPrice, { color: colors.text }]}>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: colors.text }]}>
                    Subtotal
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    ${subtotal.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: colors.text }]}>
                    Shipping
                  </Text>
                  <Text style={[styles.summaryValue, { color: shipping === 0 ? "#34C759" : colors.text }]}>
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: colors.text }]}>
                    Tax (8%)
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    ${tax.toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.totalLabel, { color: colors.text }]}>
                    Total
                  </Text>
                  <Text style={[styles.totalAmount, { color: colors.primary }]}>
                    ${total.toFixed(2)}
                  </Text>
                </View>
              </GlassView>
            </View>

            {/* Shipping Information */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Shipping Information
              </Text>
              {renderInput("Full Name", fullName, setFullName, "John Doe")}
              {renderInput(
                "Email",
                email,
                setEmail,
                "john@example.com",
                "email-address",
                "none"
              )}
              {renderInput(
                "Phone",
                phone,
                setPhone,
                "+1 (555) 123-4567",
                "phone-pad",
                "none"
              )}
              {renderInput(
                "Address",
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

            {/* Place Order Button */}
            <View style={styles.buttonContainer}>
              <Pressable
                onPress={handlePlaceOrder}
                disabled={isProcessing}
                style={({ pressed }) => [
                  styles.placeOrderButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <LinearGradient
                  colors={["#FF6B9D", "#C06C84"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradient}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <IconSymbol name="checkmark.circle.fill" size={24} color="#FFFFFF" />
                      <Text style={styles.placeOrderText}>Place Order - ${total.toFixed(2)}</Text>
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
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
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
  },
  summaryLabel: {
    fontSize: 15,
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
    fontWeight: "700",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "800",
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
  placeOrderButton: {
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
  placeOrderText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default CheckoutScreen;
