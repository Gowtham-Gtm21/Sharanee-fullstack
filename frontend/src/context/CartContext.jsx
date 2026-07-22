import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartApi, wishlistApi } from "../api/endpoints";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const refreshCart = useCallback(async () => {
    if (!user) { setCart([]); return; }
    try {
      const { data } = await cartApi.get(user.id);
      setCart(data.cart || []);
    } catch { setCart([]); }
  }, [user]);

  const refreshWishlist = useCallback(async () => {
    if (!user) { setWishlist([]); return; }
    try {
      const { data } = await wishlistApi.get(user.id);
      setWishlist(data.wishlist || []);
    } catch { setWishlist([]); }
  }, [user]);

  useEffect(() => {
    refreshCart();
    refreshWishlist();
  }, [refreshCart, refreshWishlist]);

  const addToCart = async (productId, qty = 1) => {
    await cartApi.add(user.id, productId, qty);
    await refreshCart();
  };
  const updateQty = async (id, qty) => {
    await cartApi.updateQty(id, qty);
    await refreshCart();
  };
  const removeFromCart = async (id) => {
    await cartApi.remove(id);
    await refreshCart();
  };

  const addToWishlist = async (productId) => {
    await wishlistApi.add(user.id, productId);
    await refreshWishlist();
  };
  const removeFromWishlist = async (id) => {
    await wishlistApi.remove(id);
    await refreshWishlist();
  };

  const cartCount = cart.reduce((n, i) => n + (i.quantity || 0), 0);
  const cartTotal = cart.reduce((sum, i) => {
    const p = i.product;
    if (!p) return sum;
    const price = p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;
    return sum + price * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart, wishlist, cartCount, cartTotal,
        addToCart, updateQty, removeFromCart, refreshCart,
        addToWishlist, removeFromWishlist, refreshWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
