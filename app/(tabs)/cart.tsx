
import { GlassView } from "expo-glass-effect";
import { useCart } from "@/contexts/CartContext";
import React, { useRef, useEffect } from "react";
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

// Cart Item Component
const CartItemCard = ({ item, index, onRemove, onUpdateQuantity, colors }: any) => {
  const itemAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(itemAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, [index, itemAnim]);

  return (
    <Animated.View
      style={{
        opacity: itemAnim,
        transform: [
          {
            translateX: itemAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0],
            }),
          },
        ],
      }}
    >
      <View
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
                onUpdateQuantity(item.product.id, item.quantity - 1);
              }}
              style={({ pressed }) => [
                styles.quantityButton,
                { 
                  backgroundColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.9 : 1 }],
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
                onUpdateQuantity(item.product.id, item.quantity + 1);
              }}
              style={({ pressed }) => [
                styles.quantityButton,
                { 
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.9 : 1 }],
                },
              ]}
            >
              <IconSymbol name="plus" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
          
          <Text style={[styles.itemTotal, { color: colors.text + "CC" }]}>
            Total: ${(item.product.price * item.quantity).toFixed(2)}
          </Text>
        </View>
        
        <Pressable
          onPress={() => onRemove(item.product.id, item.product.name)}
          style={({ pressed }) => [
            styles.removeButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <IconSymbol name="trash" size={20} color="#FF3B30" />
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default function CartScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

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

  const renderEmptyCart = () => (
    <Animated.View 
      style={[
        styles.emptyContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.emptyIconContainer}>
        <IconSymbol name="cart" size={80} color={colors.text + "40"} />
      </View>
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
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
      >
        <IconSymbol name="bag" size={20} color="#FFFFFF" />
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </Pressable>
    </Animated.View>
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
              {cart.map((item, index) => (
                <CartItemCard
                  key={item.product.id}
                  item={item}
                  index={index}
                  onRemove={handleRemoveItem}
                  onUpdateQuantity={updateQuantity}
                  colors={colors}
                />
              ))}
            </View>

            <Animated.View 
              style={[
                styles.summaryCard, 
                { 
                  backgroundColor: colors.card,
                  opacity: fadeAnim,
                }
              ]}
            >
              <View style={styles.summaryHeader}>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>
                  Order Summary
                </Text>
                <IconSymbol name="doc.text" size={20} color={colors.text} />
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
              
              {subtotal > 0 && subtotal < 50 && (
                <View style={styles.freeShippingNote}>
                  <IconSymbol name="truck.box" size={16} color={colors.primary} />
                  <Text style={[styles.freeShippingText, { color: colors.text + "CC" }]}>
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                  </Text>
                </View>
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
            </Animated.View>
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
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  },
                ]}
              >
                <Text style={styles.checkoutButtonText}>
                  Checkout
                </Text>
                <IconSymbol name="arrow.right" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </Animated.View>
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
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  summaryCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
  freeShippingNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  freeShippingText: {
    fontSize: 12,
    flex: 1,
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
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
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
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  shopButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  shopButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
