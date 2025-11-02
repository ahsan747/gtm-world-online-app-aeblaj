
import React, { useState } from "react";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
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
import { products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";

export default function ProductDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          Product not found
        </Text>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    Alert.alert(
      "Added to Cart",
      `${quantity} x ${product.name} added to your cart`,
      [
        { text: "Continue Shopping", style: "cancel" },
        { text: "View Cart", onPress: () => router.push("/(tabs)/cart") },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: product.name,
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
          <Image source={{ uri: product.image }} style={styles.productImage} />

          <View style={styles.content}>
            <GlassView
              style={[
                styles.infoCard,
                Platform.OS !== 'ios' && {
                  backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                }
              ]}
              glassEffectStyle="regular"
            >
              <Text style={[styles.productName, { color: theme.colors.text }]}>
                {product.name}
              </Text>
              
              {product.rating && (
                <View style={styles.ratingContainer}>
                  <IconSymbol name="star.fill" size={16} color="#FFD700" />
                  <Text style={[styles.ratingText, { color: theme.colors.text }]}>
                    {product.rating}
                  </Text>
                  <Text style={[styles.reviewsText, { color: theme.dark ? '#98989D' : '#666' }]}>
                    ({product.reviews} reviews)
                  </Text>
                </View>
              )}

              <Text style={[styles.productPrice, { color: theme.colors.primary }]}>
                ${product.price.toFixed(2)}
              </Text>

              <View style={[styles.divider, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />

              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Description
              </Text>
              <Text style={[styles.productDescription, { color: theme.dark ? '#98989D' : '#666' }]}>
                {product.description}
              </Text>

              <View style={[styles.divider, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />

              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Quantity
              </Text>
              <View style={styles.quantityContainer}>
                <Pressable
                  style={[styles.quantityButton, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <IconSymbol name="minus" size={20} color={theme.colors.text} />
                </Pressable>
                <Text style={[styles.quantityText, { color: theme.colors.text }]}>
                  {quantity}
                </Text>
                <Pressable
                  style={[styles.quantityButton, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <IconSymbol name="plus" size={20} color={theme.colors.text} />
                </Pressable>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />

              <View style={styles.stockContainer}>
                <IconSymbol
                  name={product.inStock ? "checkmark.circle.fill" : "xmark.circle.fill"}
                  size={20}
                  color={product.inStock ? "#34C759" : "#FF3B30"}
                />
                <Text style={[styles.stockText, { color: product.inStock ? "#34C759" : "#FF3B30" }]}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </Text>
              </View>
            </GlassView>
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
          <Pressable
            style={[styles.addButton, !product.inStock && styles.addButtonDisabled]}
            onPress={handleAddToCart}
            disabled={!product.inStock}
          >
            <LinearGradient
              colors={product.inStock ? ['#FF6B9D', '#C44569'] : ['#999', '#666']}
              style={styles.addButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <IconSymbol name="cart" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Text>
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
    paddingBottom: 100,
  },
  productImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 16,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
  },
  productName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsText: {
    fontSize: 14,
  },
  productPrice: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  productDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 24,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockText: {
    fontSize: 16,
    fontWeight: '600',
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
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
});
