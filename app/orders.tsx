
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
  ActivityIndicator,
  Animated,
  RefreshControl,
} from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import * as Haptics from "expo-haptics";
import React, { useState, useRef, useEffect } from "react";
import { getUserOrders, Order } from "@/services/database";

const OrdersScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadOrders();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadOrders = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      console.log('Loading orders for user:', user.uid);
      const userOrders = await getUserOrders(user.uid);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'processing':
        return '#4A90E2';
      case 'shipped':
        return '#9B59B6';
      case 'delivered':
        return '#27AE60';
      case 'cancelled':
        return '#E74C3C';
      default:
        return colors.text;
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'clock.fill';
      case 'processing':
        return 'gearshape.fill';
      case 'shipped':
        return 'shippingbox.fill';
      case 'delivered':
        return 'checkmark.circle.fill';
      case 'cancelled':
        return 'xmark.circle.fill';
      default:
        return 'circle.fill';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderOrderCard = (order: Order, index: number) => {
    const statusColor = getStatusColor(order.status);
    const statusIcon = getStatusIcon(order.status);

    return (
      <Pressable
        key={order.id || index}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          console.log('Order pressed:', order.id);
        }}
        style={({ pressed }) => [
          styles.orderCard,
          pressed && styles.cardPressed,
        ]}
      >
        <GlassView
          style={[styles.cardContent, { backgroundColor: colors.card }]}
          intensity={Platform.OS === "ios" ? 20 : 0}
        >
          {/* Order Header */}
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={[styles.orderId, { color: colors.text }]}>
                Order #{order.id?.substring(0, 8).toUpperCase()}
              </Text>
              <Text style={[styles.orderDate, { color: colors.text + "80" }]}>
                {formatDate(order.created_at)}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
              <IconSymbol name={statusIcon} size={16} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
          </View>

          {/* Order Items */}
          <View style={styles.itemsContainer}>
            {order.items.slice(0, 2).map((item, idx) => (
              <Text key={idx} style={[styles.itemText, { color: colors.text + "CC" }]}>
                • {item.product_name} x {item.quantity}
              </Text>
            ))}
            {order.items.length > 2 && (
              <Text style={[styles.moreItems, { color: colors.text + "80" }]}>
                +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {/* Order Footer */}
          <View style={styles.orderFooter}>
            <Text style={[styles.totalLabel, { color: colors.text + "80" }]}>
              Total
            </Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              ${order.total_amount.toFixed(2)}
            </Text>
          </View>
        </GlassView>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="bag.fill" size={80} color={colors.text + "40"} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Orders Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.text + "80" }]}>
        Start shopping to see your orders here
      </Text>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/(tabs)/(home)");
        }}
        style={({ pressed }) => [
          styles.shopButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <LinearGradient
          colors={["#FF6B9D", "#C06C84"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <IconSymbol name="bag.fill" size={20} color="#FFFFFF" />
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "My Orders",
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }}
        />
        <View style={styles.emptyContainer}>
          <IconSymbol name="person.fill.xmark" size={80} color={colors.text + "40"} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Please Log In
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.text + "80" }]}>
            Log in to view your order history
          </Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/login");
            }}
            style={({ pressed }) => [
              styles.shopButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <LinearGradient
              colors={["#FF6B9D", "#C06C84"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <IconSymbol name="person.fill" size={20} color="#FFFFFF" />
              <Text style={styles.shopButtonText}>Log In</Text>
            </LinearGradient>
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
          title: "My Orders",
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading orders...
          </Text>
        </View>
      ) : (
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
          >
            {orders.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                <Text style={[styles.ordersCount, { color: colors.text + "80" }]}>
                  {orders.length} order{orders.length !== 1 ? 's' : ''}
                </Text>
                {orders.map((order, index) => renderOrderCard(order, index))}
              </>
            )}
          </ScrollView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  ordersCount: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
  },
  orderCard: {
    marginBottom: 16,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  cardContent: {
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  itemsContainer: {
    marginBottom: 16,
  },
  itemText: {
    fontSize: 14,
    marginBottom: 4,
  },
  moreItems: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "800",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  shopButton: {
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
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 12,
  },
  shopButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default OrdersScreen;
