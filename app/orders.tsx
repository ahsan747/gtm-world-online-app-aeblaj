
import { useTheme } from "@react-navigation/native";
import React, { useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { GlassView } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import { IconSymbol } from "@/components/IconSymbol";
import { getUserOrders, Order } from "@/services/database";
import * as Haptics from "expo-haptics";
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

export default function OrdersScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    loadOrders();
  }, []);

  const loadOrders = async () => {
    if (!user) {
      console.log('No user logged in');
      setLoading(false);
      return;
    }

    try {
      console.log('Loading orders for user:', user.id);
      const userOrders = await getUserOrders(user.id);
      console.log('Orders loaded:', userOrders.length);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    console.log('Refreshing orders');
    setRefreshing(true);
    loadOrders();
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '#FF9500';
      case 'processing':
        return '#007AFF';
      case 'shipped':
        return '#5856D6';
      case 'delivered':
        return '#34C759';
      case 'cancelled':
        return '#FF3B30';
      default:
        return colors.text;
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'clock';
      case 'processing':
        return 'gear';
      case 'shipped':
        return 'shippingbox';
      case 'delivered':
        return 'checkmark.circle.fill';
      case 'cancelled':
        return 'xmark.circle.fill';
      default:
        return 'doc.text';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrderCard = (order: Order, index: number) => {
    const itemAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.spring(itemAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        key={order.id}
        style={{
          opacity: itemAnim,
          transform: [
            {
              translateY: itemAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        }}
      >
        <Pressable
          onPress={() => {
            console.log('Order card pressed:', order.id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={({ pressed }) => [
            styles.orderCard,
            {
              backgroundColor: colors.card,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <View style={styles.orderHeader}>
            <View style={styles.orderIdContainer}>
              <Text style={[styles.orderIdLabel, { color: colors.text + "80" }]}>
                Order #
              </Text>
              <Text style={[styles.orderId, { color: colors.text }]}>
                {order.id?.substring(0, 8).toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + "20" }]}>
              <IconSymbol
                name={getStatusIcon(order.status) as any}
                size={16}
                color={getStatusColor(order.status)}
              />
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.orderDetails}>
            <View style={styles.detailRow}>
              <IconSymbol name="calendar" size={16} color={colors.text + "80"} />
              <Text style={[styles.detailText, { color: colors.text + "80" }]}>
                {formatDate(order.created_at || '')}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <IconSymbol name="bag" size={16} color={colors.text + "80"} />
              <Text style={[styles.detailText, { color: colors.text + "80" }]}>
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </View>

          <View style={styles.orderFooter}>
            <View>
              <Text style={[styles.totalLabel, { color: colors.text + "80" }]}>
                Total Amount
              </Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>
                ${order.total_amount.toFixed(2)}
              </Text>
            </View>
            
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                console.log('View details pressed for order:', order.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [
                styles.viewButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={styles.viewButtonText}>View Details</Text>
              <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <View style={styles.emptyIconContainer}>
        <IconSymbol name="bag" size={80} color={colors.text + "40"} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No orders yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.text + "80" }]}>
        Start shopping to see your orders here
      </Text>
      <Pressable
        onPress={() => {
          console.log('Start shopping button pressed');
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
        <IconSymbol name="bag" size={20} color="#FFFFFF" />
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </Pressable>
    </Animated.View>
  );

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "My Orders",
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.emptyContainer}>
          <IconSymbol name="person.crop.circle.badge.exclamationmark" size={80} color={colors.text + "40"} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Login Required
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.text + "80" }]}>
            Please login to view your orders
          </Text>
          <Pressable
            onPress={() => {
              console.log('Login button pressed from orders');
              router.push("/login");
            }}
            style={({ pressed }) => [
              styles.shopButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={styles.shopButtonText}>Login</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "My Orders",
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading your orders...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "My Orders",
          headerStyle: {
            backgroundColor: Platform.OS === "android" ? colors.card : "transparent",
          },
          headerTransparent: Platform.OS === "ios",
          headerBlurEffect: "regular",
          headerTintColor: colors.text,
        }}
      />

      {orders.length === 0 ? (
        renderEmptyState()
      ) : (
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
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.ordersHeader}>
              <Text style={[styles.ordersCount, { color: colors.text }]}>
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
              </Text>
            </View>
            
            <View style={styles.ordersContainer}>
              {orders.map((order, index) => renderOrderCard(order, index))}
            </View>
          </Animated.View>
        </ScrollView>
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
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  ordersHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 80 : 20,
    paddingBottom: 16,
  },
  ordersCount: {
    fontSize: 18,
    fontWeight: "600",
  },
  ordersContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  orderCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  orderIdLabel: {
    fontSize: 14,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  orderDetails: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "700",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
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
