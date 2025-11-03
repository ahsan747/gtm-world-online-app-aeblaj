
import { GlassView } from "expo-glass-effect";
import { Product } from "@/types/Product";
import {
  Pressable,
  StyleSheet,
  View,
  Text,
  Platform,
  Image,
  ScrollView,
  TextInput,
  Animated,
  Alert,
} from "react-native";
import { useCart } from "@/contexts/CartContext";
import { IconSymbol } from "@/components/IconSymbol";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@react-navigation/native";
import { products, categories } from "@/data/products";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import * as Haptics from "expo-haptics";

// Category Item Component
const CategoryItem = ({ category, index, selectedCategory, onSelect, colors }: any) => {
  const isSelected = selectedCategory === category.id;
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation runs once on mount with stable dependencies
    Animated.timing(animValue, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, [animValue, index]);

  return (
    <Animated.View
      style={{
        opacity: animValue,
        transform: [
          {
            translateX: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          },
        ],
      }}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSelect(category.id);
        }}
        style={({ pressed }) => [
          styles.categoryItem,
          {
            backgroundColor: isSelected ? colors.primary : colors.card,
            opacity: pressed ? 0.7 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
      >
        <IconSymbol
          name={category.icon as any}
          size={20}
          color={isSelected ? "#FFFFFF" : colors.text}
        />
        <Text
          style={[
            styles.categoryText,
            { color: isSelected ? "#FFFFFF" : colors.text },
          ]}
        >
          {category.name}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

// Product Card Component
const ProductCard = ({ product, index, onAddToCart, colors, router }: any) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation runs once on mount with stable dependencies
    Animated.spring(animValue, {
      toValue: 1,
      friction: 8,
      tension: 40,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, [animValue, index]);

  return (
    <Animated.View
      style={{
        opacity: animValue,
        transform: [
          {
            scale: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          },
        ],
      }}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/product/${product.id}`);
        }}
        style={({ pressed }) => [
          styles.productCard,
          {
            backgroundColor: colors.card,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View style={styles.productImageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          {!product.inStock && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
          {product.rating && product.rating >= 4.8 && (
            <View style={styles.bestSellerBadge}>
              <IconSymbol name="star.fill" size={12} color="#FFD700" />
              <Text style={styles.bestSellerText}>Best Seller</Text>
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={[styles.productDescription, { color: colors.text + "80" }]} numberOfLines={2}>
            {product.description}
          </Text>
          
          {product.rating && (
            <View style={styles.ratingContainer}>
              <IconSymbol name="star.fill" size={14} color="#FFD700" />
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {product.rating}
              </Text>
              <Text style={[styles.reviewsText, { color: colors.text + "60" }]}>
                ({product.reviews})
              </Text>
            </View>
          )}
          
          <View style={styles.productFooter}>
            <View>
              <Text style={[styles.productPrice, { color: colors.primary }]}>
                ${product.price.toFixed(2)}
              </Text>
              {product.price > 50 && (
                <Text style={[styles.freeShippingText, { color: "#34C759" }]}>
                  Free Shipping
                </Text>
              )}
            </View>
            
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                if (product.inStock) {
                  onAddToCart(product);
                }
              }}
              disabled={!product.inStock}
              style={({ pressed }) => [
                styles.addButton,
                {
                  backgroundColor: product.inStock ? colors.primary : colors.border,
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.9 : 1 }],
                },
              ]}
            >
              <IconSymbol
                name={product.inStock ? "plus" : "xmark"}
                size={18}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { addToCart, getCartItemCount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Entrance animations - only run once on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: Product) => {
    console.log('Quick add to cart from home screen:', product.name);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToCart(product, 1);
    
    // Show success alert with options
    Alert.alert(
      "Added to Cart! 🛒",
      `${product.name} has been added to your cart.`,
      [
        {
          text: "Continue Shopping",
          style: "cancel",
          onPress: () => console.log('User chose to continue shopping'),
        },
        {
          text: "View Cart",
          onPress: () => {
            console.log('User chose to view cart');
            router.push("/(tabs)/cart");
          },
        },
      ]
    );
  };

  const renderHeaderRight = () => (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push("/(tabs)/cart");
      }}
      style={({ pressed }) => [
        styles.headerButton,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <IconSymbol name="shopping.cart" size={24} color={colors.text} />
      {getCartItemCount() > 0 && (
        <View
          style={[styles.badge, { backgroundColor: colors.notification }]}
        >
          <Text style={styles.badgeText}>{getCartItemCount()}</Text>
        </View>
      )}
    </Pressable>
  );

  const renderHeaderLeft = () => (
    <View style={styles.headerLeft}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>
        GTM World
      </Text>
    </View>
  );

  const renderWelcomeCard = () => (
    <Animated.View 
      style={[
        styles.welcomeCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={["#FF6B9D", "#C06C84", "#8B5A8E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeGradient}
      >
        <View style={styles.welcomeContent}>
          <View>
            <Text style={styles.welcomeTitle}>
              {user ? `Welcome back, ${user.displayName || "Beauty Lover"}!` : "Welcome to GTM World"}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Discover premium cosmetics for your beauty routine
            </Text>
          </View>
          <View style={styles.welcomeIcon}>
            <IconSymbol name="sparkles" size={40} color="#FFFFFF" />
          </View>
        </View>
        
        {/* Decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </LinearGradient>
    </Animated.View>
  );

  const renderSearchBar = () => (
    <Animated.View 
      style={[
        styles.searchContainer, 
        { 
          backgroundColor: colors.card,
          opacity: fadeAnim,
        }
      ]}
    >
      <IconSymbol name="magnifyingglass" size={20} color={colors.text} />
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        placeholder="Search products..."
        placeholderTextColor={colors.text + "80"}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 && (
        <Pressable onPress={() => setSearchQuery("")}>
          <IconSymbol name="xmark.circle.fill" size={20} color={colors.text} />
        </Pressable>
      )}
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerLeft: renderHeaderLeft,
          headerRight: renderHeaderRight,
          headerTransparent: Platform.OS === "ios",
          headerBlurEffect: "regular",
          headerStyle: {
            backgroundColor: Platform.OS === "android" ? colors.card : "transparent",
          },
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderWelcomeCard()}
        
        {renderSearchBar()}

        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Categories
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category, index) => (
              <CategoryItem
                key={category.id}
                category={category}
                index={index}
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
                colors={colors}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.productsSection}>
          <View style={styles.productsSectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {selectedCategory === "all" ? "All Products" : categories.find(c => c.id === selectedCategory)?.name}
            </Text>
            <Text style={[styles.productsCount, { color: colors.text + "80" }]}>
              {filteredProducts.length} items
            </Text>
          </View>
          
          <View style={styles.productsGrid}>
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onAddToCart={handleAddToCart}
                colors={colors}
                router={router}
              />
            ))}
          </View>
        </View>

        {filteredProducts.length === 0 && (
          <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
            <IconSymbol name="magnifyingglass" size={64} color={colors.text + "40"} />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>
              No products found
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.text + "80" }]}>
              Try adjusting your search or filters
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
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
  headerButton: {
    marginRight: 16,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  headerLeft: {
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  welcomeCard: {
    marginHorizontal: 16,
    marginTop: Platform.OS === "ios" ? 80 : 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  welcomeGradient: {
    padding: 24,
    position: "relative",
    overflow: "hidden",
  },
  welcomeContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
  },
  welcomeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
    maxWidth: 220,
  },
  decorativeCircle1: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -50,
    right: -30,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    bottom: -30,
    left: -20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 12,
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
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
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
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  productsSection: {
    marginBottom: 24,
  },
  productsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  productsCount: {
    fontSize: 14,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    gap: 12,
  },
  productCard: {
    width: "47%",
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
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
  productImageContainer: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  outOfStockBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  outOfStockText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  bestSellerBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255, 215, 0, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bestSellerText: {
    color: "#000000",
    fontSize: 10,
    fontWeight: "700",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
  },
  reviewsText: {
    fontSize: 12,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
  },
  freeShippingText: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
});
