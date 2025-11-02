
import React, { useState } from "react";
import { Stack, useRouter } from "expo-router";
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  Text,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { LinearGradient } from "expo-linear-gradient";
import { products, categories } from "@/data/products";
import { Product } from "@/types/Product";

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { addToCart, getCartItemCount } = useCart();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const renderCategory = ({ item }: { item: typeof categories[0] }) => {
    const isSelected = selectedCategory === item.id;
    return (
      <Pressable onPress={() => setSelectedCategory(item.id)}>
        <GlassView
          style={[
            styles.categoryChip,
            isSelected && styles.categoryChipSelected,
            Platform.OS !== 'ios' && {
              backgroundColor: isSelected
                ? theme.colors.primary + '20'
                : theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }
          ]}
          glassEffectStyle={isSelected ? "clear" : "regular"}
        >
          <IconSymbol
            name={item.icon as any}
            size={18}
            color={isSelected ? theme.colors.primary : theme.colors.text}
          />
          <Text
            style={[
              styles.categoryText,
              { color: isSelected ? theme.colors.primary : theme.colors.text }
            ]}
          >
            {item.name}
          </Text>
        </GlassView>
      </Pressable>
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <Pressable
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}` as any)}
    >
      <GlassView
        style={[
          styles.productCardInner,
          Platform.OS !== 'ios' && {
            backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
          }
        ]}
        glassEffectStyle="regular"
      >
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: theme.colors.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.productDescription, { color: theme.dark ? '#98989D' : '#666' }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.productFooter}>
            <View>
              <Text style={[styles.productPrice, { color: theme.colors.primary }]}>
                ${item.price.toFixed(2)}
              </Text>
              {item.rating && (
                <View style={styles.ratingContainer}>
                  <IconSymbol name="star.fill" size={12} color="#FFD700" />
                  <Text style={[styles.ratingText, { color: theme.dark ? '#98989D' : '#666' }]}>
                    {item.rating} ({item.reviews})
                  </Text>
                </View>
              )}
            </View>
            <Pressable
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={(e) => {
                e.stopPropagation();
                handleAddToCart(item);
              }}
            >
              <IconSymbol name="plus" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </GlassView>
    </Pressable>
  );

  const renderHeaderRight = () => (
    <Pressable
      onPress={() => router.push('/(tabs)/cart')}
      style={styles.headerButtonContainer}
    >
      <IconSymbol name="cart" color={theme.colors.primary} size={24} />
      {getCartItemCount() > 0 && (
        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.badgeText}>{getCartItemCount()}</Text>
        </View>
      )}
    </Pressable>
  );

  const renderHeaderLeft = () => (
    <View style={styles.headerLeft}>
      <Text style={[styles.headerTitle, { color: theme.colors.text }]}>GTM World</Text>
      <Text style={[styles.headerSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
        Online
      </Text>
    </View>
  );

  const renderWelcomeCard = () => {
    if (user) {
      return (
        <GlassView
          style={[
            styles.welcomeCard,
            Platform.OS !== 'ios' && {
              backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }
          ]}
          glassEffectStyle="regular"
        >
          <LinearGradient
            colors={['#FF6B9D', '#C44569']}
            style={styles.welcomeIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <IconSymbol name="sparkles" size={28} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.welcomeContent}>
            <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>
              Welcome back, {user.displayName || 'User'}!
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
              Discover our premium cosmetics
            </Text>
          </View>
        </GlassView>
      );
    }

    return (
      <GlassView
        style={[
          styles.welcomeCard,
          Platform.OS !== 'ios' && {
            backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
          }
        ]}
        glassEffectStyle="regular"
      >
        <LinearGradient
          colors={['#FF6B9D', '#C44569']}
          style={styles.welcomeIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <IconSymbol name="sparkles" size={28} color="#FFFFFF" />
        </LinearGradient>
        <View style={styles.welcomeContent}>
          <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>
            Welcome to GTM World Online
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
            Browse our products. Sign in to checkout.
          </Text>
        </View>
      </GlassView>
    );
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            headerLeft: renderHeaderLeft,
            headerRight: renderHeaderRight,
            headerTitle: "",
          }}
        />
      )}
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          ListHeaderComponent={
            <>
              {renderWelcomeCard()}
              <FlatList
                data={categories}
                renderItem={renderCategory}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              />
            </>
          }
          contentContainerStyle={[
            styles.listContainer,
            Platform.OS !== 'ios' && styles.listContainerWithTabBar
          ]}
          columnWrapperStyle={styles.columnWrapper}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  listContainerWithTabBar: {
    paddingBottom: 100,
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    boxShadow: '0px 4px 12px rgba(255, 107, 157, 0.3)',
    elevation: 8,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
  },
  categoriesContainer: {
    paddingBottom: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  categoryChipSelected: {
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 12,
  },
  productCard: {
    flex: 1,
    maxWidth: '48%',
    marginBottom: 12,
  },
  productCardInner: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 122, 255, 0.3)',
    elevation: 4,
  },
  headerButtonContainer: {
    padding: 6,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  headerLeft: {
    paddingLeft: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
});
