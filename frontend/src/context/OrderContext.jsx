import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";

const STORAGE_KEY = "shopnow_orders_v1";

/** Stable key for associating orders with the current account (demo). */
export function getAccountKey(user) {
  if (user?.email) return String(user.email).toLowerCase().trim();
  if (typeof window !== "undefined") {
    const id = localStorage.getItem("userId");
    if (id) return `id:${id}`;
  }
  return "guest";
}

function loadOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [];
}

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState(loadOrders);
  const accountKey = useMemo(() => getAccountKey(user), [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      /* ignore */
    }
  }, [orders]);

  const myOrders = useMemo(() => {
    return orders
      .filter((o) => o.userKey === accountKey)
      .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
  }, [orders, accountKey]);

  const addOrder = useCallback((order) => {
    setOrders((prev) => [
      {
        ...order,
        placedAt: order.placedAt || new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const value = useMemo(
    () => ({
      orders: myOrders,
      addOrder,
      accountKey,
    }),
    [myOrders, addOrder, accountKey]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}
