import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, cartAPI } from "../services/api";
import toast from "react-hot-toast";
const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [language, setLanguage] = useState("english");
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    loadCart();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        // First set from localStorage for immediate UI
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);

        // Then verify with server
        try {
          const response = await authAPI.verify();
          if (response.data.success) {
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }
        } catch (verifyError) {
          // Token invalid - clear everything
          console.error("Token verification failed:", verifyError);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await cartAPI.get();
        setCart(response.data.items || []);
      } else {
        const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart(localCart);
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);

      // Load cart - ignore errors
      try {
        await loadCart();
      } catch (e) {
        console.log("Cart load skipped");
      }

      return { success: true, user: user };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setUser(user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setCart([]);
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => (item._id || item.id) === (product._id || product.id)
      );
      if (existingItem) {
        return prevCart.map((item) =>
          (item._id || item.id) === (product._id || product.id)
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    // Remove the API call - cart is local only
    toast.success("Added to cart!");
  };

  const removeFromCart = (itemId) => {
    const updatedCart = cart.filter((item) => (item._id || item.id) !== itemId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };
  const updateCartQuantity = (itemId, quantity) => {
    const updatedCart = cart.map((item) =>
      (item._id || item.id) === itemId ? { ...item, quantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // const removeFromCart = async (itemId) => {
  //   try {
  //     if (isAuthenticated) {
  //       await cartAPI.remove(itemId);
  //       await loadCart();
  //     } else {
  //       const updatedCart = cart.filter(
  //         (item) => (item._id || item.id) !== itemId
  //       );
  //       setCart(updatedCart);
  //       localStorage.setItem("cart", JSON.stringify(updatedCart));
  //     }
  //   } catch (error) {
  //     console.error("Failed to remove from cart:", error);
  //   }
  // };

  // const updateCartQuantity = async (itemId, quantity) => {
  //   try {
  //     if (isAuthenticated) {
  //       await cartAPI.update(itemId, quantity);
  //       await loadCart();
  //     } else {
  //       const updatedCart = cart.map((item) =>
  //         (item._id || item.id) === itemId ? { ...item, quantity } : item
  //       );
  //       setCart(updatedCart);
  //       localStorage.setItem("cart", JSON.stringify(updatedCart));
  //     }
  //   } catch (error) {
  //     console.error("Failed to update cart:", error);
  //   }
  // };

  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        await cartAPI.clear();
      } else {
        localStorage.removeItem("cart");
      }
      setCart([]);
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.discountPrice || item.price || 0;
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + (item.quantity || 1), 0);
  };

  const value = {
    user,
    cart,
    language,
    loading,
    isAuthenticated,
    setLanguage,
    login,
    register,
    logout,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
