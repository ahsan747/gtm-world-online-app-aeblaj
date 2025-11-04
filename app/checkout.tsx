
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
import React, { useState, useRef, useEffect, useCallback } from "react";
import { getUserProfile, updateUserProfile } from "@/services/database";

const CheckoutScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { cart, getCartTotal } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

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

  const loadUserProfile = useCallback(async () => {
    if (!user) {
      console.log('No user logged in, skipping profile load');
      setLoadingProfile(false);
      return;
    }

    try {
      console.log('Loading user profile for checkout');
      const profile = await getUserProfile(user.id);
      
      if (profile) {
        console.log('Profile loaded, pre-filling form');
        setFullName(profile.display_name || "");
        setPhone(profile.phone || "");
        setAddress(profile.address || "");
        setCity(profile.city || "");
        setState(profile.state || "");
        setZipCode(profile.zip_code || "");
        setCountry(profile.country || "USA");
      } else {
        console.log('No profile found, using user metadata');
        setFullName(user.user_metadata?.display_name || "");
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('=== CHECKOUT SCREEN MOUNTED ===');
    console.log('Cart items on mount:', cart.length);
    
    // Entrance animations and load profile - only run once on mount
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

    loadUserProfile();
  }, [fadeAnim, loadUserProfile, slideAnim]);

  const handleContinueToPayment = async () => {
    console.log('=== CONTINUE TO PAYMENT BUTTON PRESSED ===');
    console.log('Cart items:', cart.length);
    console.log('User:', user ? user.email : 'Guest');
    
    // Validation
    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your full name");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    if (!phone.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!address.trim()) {
      Alert.alert("Error", "Please enter your address");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!city.trim()) {
      Alert.alert("Error", "Please enter your city");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!state.trim()) {
      Alert.alert("Error", "Please enter your state");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!zipCode.trim()) {
      Alert.alert("Error", "Please enter your zip code");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (cart.length === 0) {
      Alert.alert("Error", "Your cart is empty");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setIsProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.log('Saving shipping information to user profile...');
      // Save shipping information to user profile
      if (user?.id) {
        try {
          await updateUserProfile(user.id, {
            display_name: fullName,
            phone,
            address,
            city,
            state,
            zip_code: zipCode,
            country,
          });
          console.log('Shipping information saved successfully');
        } catch (error: any) {
          console.error('Error saving shipping information:', error);
          // Don't block checkout if profile update fails
        }
      }

      const subtotal = getCartTotal();
      const shipping = subtotal > 50 ? 0 : 5.99;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;
      
      // Prepare order data to pass to payment screens
      const orderData = {
        user_id: user?.id || 'guest',
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

      console.log('Navigating to payment method selection...');
      console.log('Order data prepared:', JSON.stringify(orderData, null, 2));

      // Navigate to payment method selection
      router.push({
        pathname: "/payment-method",
        params: {
          orderData: JSON.stringify(orderData),
        },
      });

      setIsProcessing(false);
      
    } catch (error: any) {
      console.error("Error preparing checkout:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      let errorMessage = "There was an error preparing your order. Please try again.";
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        "Checkout Error",
        errorMessage,
        [{ text: "OK" }]
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
        editable={!isProcessing && !loadingProfile}
      />
    </View>
  );

  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? (subtotal > 50 ? 0 : 5.99) : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (cart.length === 0) {
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
          }}
        />
        <View style={styles.emptyContainer}>
          <IconSymbol name="cart" size={80} color={colors.text + "40"} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Your cart is empty
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.text + "80" }]}>
            Add some products before checking out
          </Text>
          <Pressable
            onPress={() => router.replace("/(tabs)/(home)")}
            style={({ pressed }) => [
              styles.shopButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
            {/* Demo Payment Notice */}
            <View style={[styles.demoNotice, { backgroundColor: "#FF9500" + "15", borderColor: "#FF9500" }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#FF9500" />
              <View style={styles.demoNoticeContent}>
                <Text style={[styles.demoNoticeTitle, { color: colors.text }]}>
                  Demo Payment Mode
                </Text>
                <Text style={[styles.demoNoticeText, { color: colors.text + "90" }]}>
                  This is a demonstration app. Payment methods are simulated and no real charges will be made. Do not enter your actual payment credentials.
                </Text>
              </View>
            </View>

            {/* Order Summary */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Order Summary
              </Text>
              <GlassView
                style={[styles.summaryCard, { backgroundColor: colors.card }]}
                intensity={Platform.OS === "ios" ? 20 : 0}
              >
                {cart.map((item) => (
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
              {loadingProfile ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.text }]}>
                    Loading your information...
                  </Text>
                </View>
              ) : (
                <>
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
                </>
              )}
            </View>

            {/* Continue to Payment Button */}
            <View style={styles.buttonContainer}>
              <Pressable
                onPress={() => {
                  console.log('=== CONTINUE TO PAYMENT BUTTON TAPPED ===');
                  handleContinueToPayment();
                }}
                disabled={isProcessing || loadingProfile}
                style={({ pressed }) => [
                  styles.continueButton,
                  (isProcessing || loadingProfile) && styles.buttonDisabled,
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
                    <>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.continueText}>Processing...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.continueText}>Continue to Payment</Text>
                      <IconSymbol name="arrow.right" size={24} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </Pressable>
              <Text style={[styles.totalHint, { color: colors.text + "60" }]}>
                Total: ${total.toFixed(2)}
              </Text>
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
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1.5,
  },
  demoNoticeContent: {
    flex: 1,
  },
  demoNoticeTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  demoNoticeText: {
    fontSize: 13,
    lineHeight: 20,
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
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
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
  continueButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
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
  continueText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  totalHint: {
    fontSize: 14,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  shopButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  shopButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CheckoutScreen;
