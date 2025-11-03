
import { useAuth } from "@/contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { getUserOrders, Order } from "@/services/database";
import { IconSymbol } from "@/components/IconSymbol";
import * as Haptics from "expo-haptics";
import { useRouter, Stack } from "expo-router";
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
import { GlassView } from "expo-glass-effect";

const OrderCard = ({ order, index, colors }: { order: Order; index: number; colors: any }) => {
  const itemAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(itemAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [index, itemAnim]);

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
        return 'gearshape.2';
      case 'shipped':
        return 'shippingbox';
      case 'delivered':
        return 'checkmark.circle.fill';
      case 'cancelled':
        return 'xmark.circle.fill';
      default:
        return 'questionmark.circle';
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return '#34C759';
      case 'processing':
        return '#007AFF';
      case 'failed':
        return '#FF3B30';
      case 'refunded':
        return '#FF9500';
      default:
        return colors.text + '80';
    }
  };

  const getPaymentMethodIcon = (method?: string) => {
    switch (method) {
      case 'credit_card':
        return 'creditcard';
      case 'paypal':
        return 'dollarsign.circle';
      default:
        return 'questionmark.circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const orderId = order.id?.substring(0, 8).toUpperCase();
  const statusColor = getStatusColor(order.status);
  const statusIcon = getStatusIcon(order.status);

  return (
    <Animated.View
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
      <GlassView
        style={[styles.orderCard, { backgroundColor: colors.card }]}
        intensity={Platform.OS === "ios" ? 20 : 0}
      >
        {/* Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <IconSymbol name="number" size={16} color={colors.text + "80"} />
            <Text style={[styles.orderId, { color: colors.text }]}>
              {orderId}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
            <IconSymbol name={statusIcon} size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.itemsContainer}>
          {order.items.slice(0, 2).map((item, idx) => (
            <View key={idx} style={styles.orderItem}>
              <Text style={[styles.itemName, { color: colors.text }]}>
                {item.product_name} x {item.quantity}
              </Text>
              <Text style={[styles.itemPrice, { color: colors.text + "80" }]}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          {order.items.length > 2 && (
            <Text style={[styles.moreItems, { color: colors.text + "60" }]}>
              +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Payment Info */}
        {order.payment_method && (
          <View style={styles.paymentInfo}>
            <View style={styles.paymentRow}>
              <IconSymbol 
                name={getPaymentMethodIcon(order.payment_method)} 
                size={16} 
                color={colors.text + "80"} 
              />
              <Text style={[styles.paymentLabel, { color: colors.text + "80" }]}>
                {order.payment_method === 'credit_card' ? 'Credit Card' : 'PayPal'}
              </Text>
              {order.payment_details?.card_last_four && (
                <Text style={[styles.paymentDetail, { color: colors.text + "60" }]}>
                  •••• {order.payment_details.card_last_four}
                </Text>
              )}
            </View>
            {order.payment_status && (
              <View style={styles.paymentRow}>
                <IconSymbol 
                  name={order.payment_status === 'completed' ? 'checkmark.circle' : 'clock'} 
                  size={16} 
                  color={getPaymentStatusColor(order.payment_status)} 
                />
                <Text style={[styles.paymentStatus, { color: getPaymentStatusColor(order.payment_status) }]}>
                  Payment {order.payment_status}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={[styles.orderFooter, { borderTopColor: colors.border }]}>
          <View style={styles.footerLeft}>
            <IconSymbol name="calendar" size={14} color={colors.text + "60"} />
            <Text style={[styles.orderDate, { color: colors.text + "60" }]}>
              {formatDate(order.created_at || '')}
            </Text>
          </View>
          <Text style={[styles.orderTotal, { color: colors.primary }]}>
            ${order.total_amount.toFixed(2)}
          </Text>
        </View>
      </GlassView>
    </Animated.View>
  );
};

const OrdersScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadOrders = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    console.log('=== ORDERS SCREEN MOUNTED ===');
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    loadOrders();
  }, [fadeAnim, loadOrders]);

  const onRefresh = () => {
    console.log('Refreshing orders...');
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadOrders();
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="bag" size={80} color={colors.text + "40"} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Orders Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.text + "80" }]}>
        Your order history will appear here
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
          }}
        />
        <View style={styles.emptyContainer}>
          <IconSymbol name="person.crop.circle" size={80} color={colors.text + "40"} />
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
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={styles.shopButtonText}>Log In</Text>
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
            Loading your orders...
          </Text>
        </View>
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
            {orders.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                <View style={styles.header}>
                  <Text style={[styles.title, { color: colors.text }]}>
                    Order History
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.text + "80" }]}>
                    {orders.length} order{orders.length !== 1 ? 's' : ''}
                  </Text>
                </View>

                <View style={styles.ordersContainer}>
                  {orders.map((order, index) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      index={index}
                      colors={colors}
                    />
                  ))}
                </View>
              </>
            )}
          </Animated.View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  ordersContainer: {
    gap: 16,
  },
  orderCard: {
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
    alignItems: "center",
    marginBottom: 16,
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
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
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemsContainer: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemName: {
    fontSize: 15,
    flex: 1,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "600",
  },
  moreItems: {
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 4,
  },
  paymentInfo: {
    paddingTop: 12,
    marginBottom: 12,
    gap: 8,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  paymentDetail: {
    fontSize: 13,
    marginLeft: 4,
  },
  paymentStatus: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderDate: {
    fontSize: 13,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: "800",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
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
    borderRadius: 16,
  },
  shopButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OrdersScreen;
