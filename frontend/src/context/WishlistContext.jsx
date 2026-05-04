import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "shopnow_wishlist_v1";

const normalizeProduct = (p) => ({
  id: p.id,
  title: String(p.title ?? "Product"),
  brand: String(p.brand ?? "Brand"),
  category: String(p.category ?? "General"),
  price: Number(p.price) || 0,
  mrp: Number(p.mrp) || Number(p.price) || 0,
  rating: Number(p.rating) || 4.2,
  reviews: Number(p.reviews) || 0,
  badge: String(p.badge ?? "Saved"),
  image: String(p.image || p.images?.[0] || ""),
  addedAt: new Date().toISOString(),
});

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
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
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const idKey = (id) => String(id);

  const isWishlisted = useCallback(
    (productId) => items.some((x) => idKey(x.id) === idKey(productId)),
    [items]
  );

  const addToWishlist = useCallback((product) => {
    const line = normalizeProduct(product);
    setItems((prev) => {
      if (prev.some((x) => idKey(x.id) === idKey(line.id))) return prev;
      return [line, ...prev];
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setItems((prev) => prev.filter((x) => idKey(x.id) !== idKey(productId)));
  }, []);

  const toggleWishlist = useCallback((product) => {
    const key = idKey(product.id);
    setItems((prev) => {
      const exists = prev.some((x) => idKey(x.id) === key);
      if (exists) return prev.filter((x) => idKey(x.id) !== key);
      return [normalizeProduct(product), ...prev];
    });
  }, []);

  const clearWishlist = useCallback(() => setItems([]), []);

  const totalCount = items.length;

  const value = useMemo(
    () => ({
      items,
      totalCount,
      isWishlisted,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      clearWishlist,
    }),
    [items, totalCount, isWishlisted, addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
