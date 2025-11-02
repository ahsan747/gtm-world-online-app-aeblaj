
import { GlassView } from "expo-glass-effect";
import { useCart } from "@/contexts/CartContext";
import React from "react";
import { IconSymbol } from "@/components/IconSymbol";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Image,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import * as Haptics from "expo-haptics";

export default function CartScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert("Empty Cart", "Please add items to your cart before checking out.");
      return;
    }

    if (!user) {
      Alert.alert(
        "Login Required",
        "Please login or continue as guest to proceed with checkout.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Login",
            onPress: () => router.push("/login"),
          },
          {
            text: "Continue as Guest",
            onPress: () => router.push("/checkout"),
          },
        ]
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/checkout");
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    Alert.alert(
      "Remove Item",
      `Remove ${productName} from cart?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            removeFromCart(productId);
          },
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            clearCart();
          },
        },
      ]
    );
  };

  const renderCartItem = (item: typeof cart[0], index: number) => (
    <View
      key={item.product.id}
      style={[styles.cartItem, { backgroundColor: colors.card }]}
    >
      <Image source={{ uri: item.product.image }} style={styles.itemImage} />
      
      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={[styles.itemPrice, { color: colors.primary }]}>
          ${item.product.price.toFixed(2)}
        </Text>
        
        <View style={styles.quantityContainer}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              updateQuantity(item.product.id, item.quantity - 1);
            }}
            style={({ pressed }) => [
              styles.quantityButton,
              { 
                backgroundColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <IconSymbol name="minus" size={16} color={colors.text} />
          </Pressable>
          
          <Text style={[styles.quantityText, { color: colors.text }]}>
            {item.quantity}
          </Text>
          
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              updateQuantity(item.product.id, item.quantity + 1);
            }}
            style={({ pressed }) => [
              styles.quantityButton,
              { 
                backgroundColor: colors.primary,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <IconSymbol name="plus" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
      
      <Pressable
        onPress={() => handleRemoveItem(item.product.id, item.product.name)}
        style={({ pressed }) => [
          styles.removeButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <IconSymbol name="trash" size={20} color="#FF3B30" />
      </Pressable>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="cart" size={80} color={colors.text + "40"} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Your cart is empty
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.text + "80" }]}>
        Add some products to get started
      </Text>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/(tabs)/(home)");
        }}
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
  );

  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? (subtotal > 50 ? 0 : 5.99) : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Shopping Cart",
          headerStyle: {
            backgroundColor: Platform.OS === "android" ? colors.card : "transparent",
          },
          headerTransparent: Platform.OS === "ios",
          headerBlurEffect: "regular",
          headerRight: cart.length > 0 ? () => (
            <Pressable
              onPress={handleClearCart}
              style={({ pressed }) => [
                styles.clearButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.clearButtonText, { color: "#FF3B30" }]}>
                Clear All
              </Text>
            </Pressable>
          ) : undefined,
        }}
      />

      {cart.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.itemsContainer}>
              {cart.map(renderCartItem)}
            </View>

            <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>
                Order Summary
              </Text>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>
                  Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ${subtotal.toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>
                  Shipping
                </Text>
                <Text style={[styles.summaryValue, { color: shipping === 0 ? "#34C759" : colors.text }]}>
                  {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                </Text>
              </View>
              
              {subtotal > 0 && subtotal < 50 && (
                <Text style={[styles.freeShippingNote, { color: colors.text + "80" }]}>
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </Text>
              )}
              
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
            </View>
          </ScrollView>

          <View style={[styles.footer, { backgroundColor: colors.card }]}>
            <View style={styles.footerContent}>
              <View>
                <Text style={[styles.footerLabel, { color: colors.text + "80" }]}>
                  Total Amount
                </Text>
                <Text style={[styles.footerTotal, { color: colors.text }]}>
                  ${total.toFixed(2)}
                </Text>
              </View>
              
              <Pressable
                onPress={handleCheckout}
                style={({ pressed }) => [
                  styles.checkoutButton,
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={styles.checkoutButtonText}>
                  Proceed to Checkout
                </Text>
                <IconSymbol name="arrow.right" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
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
    paddingBottom: 20,
  },
  clearButton: {
    marginRight: 16,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemsContainer: {
    padding: 16,
    gap: 12,
  },
  cartItem: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
  removeButton: {
    padding: 8,
  },
  summaryCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
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
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  freeShippingNote: {
    fontSize: 12,
    marginBottom: 12,
    fontStyle: "italic",
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
  footer: {
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
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
  },
  footerLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  footerTotal: {
    fontSize: 20,
    fontWeight: "bold",
  },
  checkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
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
    borderRadius: 12,
  },
  shopButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
