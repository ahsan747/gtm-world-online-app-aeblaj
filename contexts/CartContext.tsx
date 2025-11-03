
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, Product } from '@/types/Product';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getCartTotal: () => 0,
  getCartItemCount: () => 0,
});

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const CART_STORAGE_KEY = '@gtm_cart';

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from storage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (cartData) {
          setCart(JSON.parse(cartData));
          console.log('Cart loaded from storage');
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };
    
    loadCart();
  }, []); // Empty dependency array - only load on mount

  // Save cart to storage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        if (cart.length > 0) {
          await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
          console.log('Cart saved to storage:', cart.length, 'items');
        } else {
          await AsyncStorage.removeItem(CART_STORAGE_KEY);
          console.log('Cart cleared from storage');
        }
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    };
    
    saveCart();
  }, [cart]); // Depends on cart - save whenever cart changes

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    console.log('Adding to cart:', product.name, 'quantity:', quantity);
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        console.log('Product already in cart, updating quantity');
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      console.log('Adding new product to cart');
      return [...prevCart, { product, quantity }];
    });
  }, []); // No dependencies - uses functional setState

  const removeFromCart = useCallback((productId: string) => {
    console.log('Removing from cart:', productId);
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  }, []); // No dependencies - uses functional setState

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    console.log('Updating quantity for:', productId, 'to:', quantity);
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]); // Depends on removeFromCart

  const clearCart = useCallback(() => {
    console.log('Clearing cart');
    setCart([]);
  }, []); // No dependencies - uses direct setState

  const getCartTotal = useCallback(() => {
    const total = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    return total;
  }, [cart]); // Depends on cart

  const getCartItemCount = useCallback(() => {
    const count = cart.reduce((count, item) => count + item.quantity, 0);
    return count;
  }, [cart]); // Depends on cart

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
