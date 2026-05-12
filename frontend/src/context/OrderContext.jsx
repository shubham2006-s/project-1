import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";
import API from "../util/api";

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await API.get("/api/orders");
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const addOrder = useCallback(async (orderData) => {
    try {

      const response = await API.post(
        "/api/orders/place",
        orderData
      );

      fetchOrders();

      return response.data.order;

    } catch (error) {

      console.log(error.response?.data);

      alert(
        error.response?.data?.message ||
        "Order failed"
      );

      throw error;
    }
  }, [fetchOrders]);

  const value = useMemo(
    () => ({
      orders,
      addOrder,
      loading,
      refetchOrders: fetchOrders,
    }),
    [orders, addOrder, loading, fetchOrders]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}
