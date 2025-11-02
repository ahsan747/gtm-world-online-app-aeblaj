
import React from "react";
import { Stack, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Image,
  Alert,
} from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export default function CartScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert("Empty Cart", "Please add items to your cart before checking out.");
      return;
    }

    if (!user) {
      Alert.alert(
        "Sign In Required",
        "Please sign in or create an account to complete your purchase.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push("/login") },
          { text: "Sign Up", onPress: () => router.push("/signup") },
        ]
      );
      return;
    }

    router.push("/checkout" as any);
  };

  const renderCartItem = (item: typeof cart[0], index: number) => (
    <GlassView
      key={item.product.id}
      style={[
        styles.cartItem,
        Platform.OS !== 'ios' && {
          backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
        }
      ]}
      glassEffectStyle="regular"
    >
      <Image source={{ uri: item.product.image }} style={styles.cartItemImage} />
      <View style={styles.cartItemInfo}>
        <Text style={[styles.cartItemName, { color: theme.colors.text }]} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={[styles.cartItemPrice, { color: theme.colors.primary }]}>
          ${item.product.price.toFixed(2)}
        </Text>
        <View style={styles.quantityContainer}>
          <Pressable
            style={[styles.quantityButton, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
          >
            <IconSymbol name="minus" size={16} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.quantityText, { color: theme.colors.text }]}>
            {item.quantity}
          </Text>
          <Pressable
            style={[styles.quantityButton, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
          >
            <IconSymbol name="plus" size={16} color={theme.colors.text} />
          </Pressable>
        </View>
      </View>
      <Pressable
        style={styles.removeButton}
        onPress={() => removeFromCart(item.product.id)}
      >
        <IconSymbol name="trash" size={20} color="#FF3B30" />
      </Pressable>
    </GlassView>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <GlassView
        style={[
          styles.emptyCard,
          Platform.OS !== 'ios' && {
            backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
          }
        ]}
        glassEffectStyle="regular"
      >
        <LinearGradient
          colors={['#FF6B9D', '#C44569']}
          style={styles.emptyIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <IconSymbol name="cart" size={48} color="#FFFFFF" />
        </LinearGradient>
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          Your cart is empty
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
          Start shopping to add items to your cart
        </Text>
        <Pressable
          style={styles.shopButton}
          onPress={() => router.push('/(tabs)/(home)/')}
        >
          <LinearGradient
            colors={['#FF6B9D', '#C44569']}
            style={styles.shopButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </LinearGradient>
        </Pressable>
      </GlassView>
    </View>
  );

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Shopping Cart",
          }}
        />
      )}
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['top']}
      >
        {cart.length === 0 ? (
          renderEmptyCart()
        ) : (
          <>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContent,
                Platform.OS !== 'ios' && styles.scrollContentWithTabBar
              ]}
              showsVerticalScrollIndicator={false}
            >
              {cart.map((item, index) => renderCartItem(item, index))}
              
              <GlassView
                style={[
                  styles.summaryCard,
                  Platform.OS !== 'ios' && {
                    backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                  }
                ]}
                glassEffectStyle="regular"
              >
                <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
                  Order Summary
                </Text>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                    Subtotal
                  </Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                    ${getCartTotal().toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                    Shipping
                  </Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                    Free
                  </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
                <View style={styles.summaryRow}>
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
              <Pressable
                style={styles.checkoutButton}
                onPress={handleCheckout}
              >
                <LinearGradient
                  colors={['#FF6B9D', '#C44569']}
                  style={styles.checkoutButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.checkoutButtonText}>
                    Proceed to Checkout
                  </Text>
                  <IconSymbol name="arrow.right" size={20} color="#FFFFFF" />
                </LinearGradient>
              </Pressable>
            </View>
          </>
        )}
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
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  cartItem: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  cartItemPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 16 : 100,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  checkoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  checkoutButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    boxShadow: '0px 4px 12px rgba(255, 107, 157, 0.3)',
    elevation: 8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  shopButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
