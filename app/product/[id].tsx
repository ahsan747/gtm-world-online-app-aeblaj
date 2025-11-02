
import { GlassView } from "expo-glass-effect";
import { useCart } from "@/contexts/CartContext";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { products } from "@/data/products";
import { IconSymbol } from "@/components/IconSymbol";
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
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={64} color={colors.text} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Product not found
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!product.inStock) {
      Alert.alert("Out of Stock", "This product is currently unavailable.");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToCart(product, quantity);
    Alert.alert(
      "Added to Cart",
      `${quantity} x ${product.name} added to your cart.`,
      [
        {
          text: "Continue Shopping",
          style: "cancel",
        },
        {
          text: "View Cart",
          onPress: () => router.push("/(tabs)/cart"),
        },
      ]
    );
  };

  const renderRelatedProduct = (relatedProduct: typeof products[0]) => (
    <Pressable
      key={relatedProduct.id}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/product/${relatedProduct.id}`);
      }}
      style={({ pressed }) => [
        styles.relatedProductCard,
        {
          backgroundColor: colors.card,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <Image
        source={{ uri: relatedProduct.image }}
        style={styles.relatedProductImage}
      />
      <Text style={[styles.relatedProductName, { color: colors.text }]} numberOfLines={2}>
        {relatedProduct.name}
      </Text>
      <Text style={[styles.relatedProductPrice, { color: colors.primary }]}>
        ${relatedProduct.price.toFixed(2)}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "",
          headerTransparent: true,
          headerStyle: {
            backgroundColor: "transparent",
          },
          headerLeft: () => (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={({ pressed }) => [
                styles.headerButton,
                {
                  backgroundColor: colors.card,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <IconSymbol name="chevron.left" size={24} color={colors.text} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/(tabs)/cart");
              }}
              style={({ pressed }) => [
                styles.headerButton,
                {
                  backgroundColor: colors.card,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <IconSymbol name="cart" size={24} color={colors.text} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          {!product.inStock && (
            <View style={styles.outOfStockOverlay}>
              <View style={styles.outOfStockBadge}>
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </View>
            </View>
          )}
        </View>

        <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
          <View style={styles.headerSection}>
            <View style={styles.titleContainer}>
              <Text style={[styles.productName, { color: colors.text }]}>
                {product.name}
              </Text>
              <Text style={[styles.productPrice, { color: colors.primary }]}>
                ${product.price.toFixed(2)}
              </Text>
            </View>

            {product.rating && (
              <View style={styles.ratingContainer}>
                <View style={styles.ratingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <IconSymbol
                      key={star}
                      name={star <= Math.floor(product.rating!) ? "star.fill" : "star"}
                      size={18}
                      color="#FFD700"
                    />
                  ))}
                </View>
                <Text style={[styles.ratingText, { color: colors.text }]}>
                  {product.rating} ({product.reviews} reviews)
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Description
            </Text>
            <Text style={[styles.description, { color: colors.text + "CC" }]}>
              {product.description}
            </Text>
            <Text style={[styles.description, { color: colors.text + "CC" }]}>
              This premium cosmetic product is carefully formulated with high-quality ingredients 
              to deliver exceptional results. Suitable for all skin types and dermatologically tested.
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Key Features
            </Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#34C759" />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Dermatologically tested
                </Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#34C759" />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Cruelty-free formula
                </Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#34C759" />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Premium ingredients
                </Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#34C759" />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Long-lasting results
                </Text>
              </View>
            </View>
          </View>

          {relatedProducts.length > 0 && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  You May Also Like
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.relatedProductsContainer}
                >
                  {relatedProducts.map(renderRelatedProduct)}
                </ScrollView>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card }]}>
        <View style={styles.quantitySection}>
          <Text style={[styles.quantityLabel, { color: colors.text }]}>
            Quantity
          </Text>
          <View style={styles.quantityControls}>
            <Pressable
              onPress={() => {
                if (quantity > 1) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setQuantity(quantity - 1);
                }
              }}
              disabled={quantity <= 1}
              style={({ pressed }) => [
                styles.quantityButton,
                {
                  backgroundColor: colors.border,
                  opacity: quantity <= 1 ? 0.5 : pressed ? 0.7 : 1,
                },
              ]}
            >
              <IconSymbol name="minus" size={20} color={colors.text} />
            </Pressable>

            <Text style={[styles.quantityValue, { color: colors.text }]}>
              {quantity}
            </Text>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setQuantity(quantity + 1);
              }}
              style={({ pressed }) => [
                styles.quantityButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <IconSymbol name="plus" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={handleAddToCart}
          disabled={!product.inStock}
          style={({ pressed }) => [
            styles.addToCartButton,
            {
              backgroundColor: product.inStock ? colors.primary : colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <IconSymbol
            name={product.inStock ? "cart.badge.plus" : "xmark"}
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.addToCartText}>
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Text>
        </Pressable>
      </View>
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
    paddingBottom: 120,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  imageContainer: {
    width: width,
    height: width,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  outOfStockBadge: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  outOfStockText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  contentContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
  },
  headerSection: {
    paddingHorizontal: 20,
  },
  titleContainer: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 32,
    fontWeight: "bold",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ratingStars: {
    flexDirection: "row",
    gap: 4,
  },
  ratingText: {
    fontSize: 15,
  },
  divider: {
    height: 1,
    marginVertical: 20,
    marginHorizontal: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 15,
  },
  relatedProductsContainer: {
    gap: 12,
    paddingRight: 20,
  },
  relatedProductCard: {
    width: 140,
    borderRadius: 12,
    overflow: "hidden",
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
  relatedProductImage: {
    width: "100%",
    height: 140,
  },
  relatedProductName: {
    fontSize: 13,
    fontWeight: "600",
    padding: 8,
    paddingBottom: 4,
  },
  relatedProductPrice: {
    fontSize: 15,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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
  quantitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: "bold",
    minWidth: 32,
    textAlign: "center",
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  addToCartText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 32,
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
