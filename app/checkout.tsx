
import React, { useState } from "react";
import { useRouter, Stack } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export default function CheckoutScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const handlePlaceOrder = () => {
    // Validate shipping info
    if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.phone ||
        !shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zipCode) {
      Alert.alert("Missing Information", "Please fill in all shipping details.");
      return;
    }

    // Simulate order placement
    Alert.alert(
      "Order Placed Successfully!",
      `Thank you for your order, ${shippingInfo.fullName}! Your order total is $${getCartTotal().toFixed(2)}. We'll send a confirmation email to ${shippingInfo.email}.`,
      [
        {
          text: "OK",
          onPress: () => {
            clearCart();
            router.replace("/(tabs)/(home)/");
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Checkout",
          headerBackTitle: "Back",
        }}
      />
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['bottom']}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GlassView
            style={[
              styles.card,
              Platform.OS !== 'ios' && {
                backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
              }
            ]}
            glassEffectStyle="regular"
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Shipping Information
            </Text>

            <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
              Full Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                }
              ]}
              value={shippingInfo.fullName}
              onChangeText={(text) => setShippingInfo({ ...shippingInfo, fullName: text })}
              placeholder="John Doe"
              placeholderTextColor={theme.dark ? '#666' : '#999'}
            />

            <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
              Email
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                }
              ]}
              value={shippingInfo.email}
              onChangeText={(text) => setShippingInfo({ ...shippingInfo, email: text })}
              placeholder="john@example.com"
              placeholderTextColor={theme.dark ? '#666' : '#999'}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
              Phone
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                }
              ]}
              value={shippingInfo.phone}
              onChangeText={(text) => setShippingInfo({ ...shippingInfo, phone: text })}
              placeholder="+1 (555) 123-4567"
              placeholderTextColor={theme.dark ? '#666' : '#999'}
              keyboardType="phone-pad"
            />

            <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
              Address
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                }
              ]}
              value={shippingInfo.address}
              onChangeText={(text) => setShippingInfo({ ...shippingInfo, address: text })}
              placeholder="123 Main Street"
              placeholderTextColor={theme.dark ? '#666' : '#999'}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
                  City
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    }
                  ]}
                  value={shippingInfo.city}
                  onChangeText={(text) => setShippingInfo({ ...shippingInfo, city: text })}
                  placeholder="New York"
                  placeholderTextColor={theme.dark ? '#666' : '#999'}
                />
              </View>

              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
                  State
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    }
                  ]}
                  value={shippingInfo.state}
                  onChangeText={(text) => setShippingInfo({ ...shippingInfo, state: text })}
                  placeholder="NY"
                  placeholderTextColor={theme.dark ? '#666' : '#999'}
                />
              </View>
            </View>

            <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
              ZIP Code
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                }
              ]}
              value={shippingInfo.zipCode}
              onChangeText={(text) => setShippingInfo({ ...shippingInfo, zipCode: text })}
              placeholder="10001"
              placeholderTextColor={theme.dark ? '#666' : '#999'}
              keyboardType="number-pad"
            />
          </GlassView>

          <GlassView
            style={[
              styles.card,
              Platform.OS !== 'ios' && {
                backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
              }
            ]}
            glassEffectStyle="regular"
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Order Summary
            </Text>

            {cart.map((item) => (
              <View key={item.product.id} style={styles.orderItem}>
                <Text style={[styles.orderItemName, { color: theme.colors.text }]}>
                  {item.product.name} x {item.quantity}
                </Text>
                <Text style={[styles.orderItemPrice, { color: theme.colors.text }]}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}

            <View style={[styles.divider, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />

            <View style={styles.orderItem}>
              <Text style={[styles.orderItemName, { color: theme.dark ? '#98989D' : '#666' }]}>
                Subtotal
              </Text>
              <Text style={[styles.orderItemPrice, { color: theme.colors.text }]}>
                ${getCartTotal().toFixed(2)}
              </Text>
            </View>

            <View style={styles.orderItem}>
              <Text style={[styles.orderItemName, { color: theme.dark ? '#98989D' : '#666' }]}>
                Shipping
              </Text>
              <Text style={[styles.orderItemPrice, { color: theme.colors.text }]}>
                Free
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />

            <View style={styles.orderItem}>
              <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
                Total
              </Text>
              <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
                ${getCartTotal().toFixed(2)}
              </Text>
            </View>
          </GlassView>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
          <Pressable style={styles.placeOrderButton} onPress={handlePlaceOrder}>
            <LinearGradient
              colors={['#FF6B9D', '#C44569']}
              style={styles.placeOrderButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <IconSymbol name="checkmark.circle" size={20} color="#FFFFFF" />
              <Text style={styles.placeOrderButtonText}>Place Order</Text>
            </LinearGradient>
          </Pressable>
        </View>
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
    paddingBottom: 100,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderItemName: {
    fontSize: 16,
    flex: 1,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  placeOrderButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  placeOrderButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
