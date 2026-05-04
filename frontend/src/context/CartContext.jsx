import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const STORAGE_KEY = "shopnow_cart_v1";

const lineKey = (id, color, size) =>
  `${String(id)}::${color ?? ""}::${size ?? ""}`;

const normalizeItem = (product, quantity, color, size) => ({
  id: product.id,
  title: product.title,
  brand: product.brand,
  category: product.category,
  price: Number(product.price) || 0,
  mrp: Number(product.mrp) || Number(product.price) || 0,
  image: product.image || product.images?.[0] || "",
  quantity,
  color: color || undefined,
  size: size || undefined,
});

const CartContext = createContext(null);

export function CartProvider({ children }) {
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

  const cartAnchorRef = useRef(null);
  const [fly, setFly] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const endFly = useCallback((id) => {
    setFly((f) => (f && f.id === id ? null : f));
  }, []);

  useEffect(() => {
    if (!fly || fly.phase !== "fly") return;
    const id = fly.id;
    const t = window.setTimeout(() => endFly(id), 900);
    return () => window.clearTimeout(t);
  }, [fly, endFly]);

  const removeLine = useCallback((line) => {
    const key = lineKey(line.id, line.color ?? "", line.size ?? "");
    setItems((prev) => prev.filter((l) => lineKey(l.id, l.color ?? "", l.size ?? "") !== key));
  }, []);

  const setLineQuantity = useCallback((line, quantity) => {
    const q = Math.min(99, Math.max(0, Math.round(Number(quantity) || 0)));
    const key = lineKey(line.id, line.color ?? "", line.size ?? "");
    setItems((prev) => {
      if (q <= 0) {
        return prev.filter((l) => lineKey(l.id, l.color ?? "", l.size ?? "") !== key);
      }
      return prev.map((l) =>
        lineKey(l.id, l.color ?? "", l.size ?? "") === key ? { ...l, quantity: q } : l
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const addToCart = useCallback((product, options = {}) => {
    const qty = Math.min(99, Math.max(1, Number(options.quantity) || 1));
    const color = options.color ?? "";
    const size = options.size ?? "";
    const flyFromEl = options.flyFromEl;

    const imgSrc = product.image || product.images?.[0];
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setItems((prev) => {
      const key = lineKey(product.id, color, size);
      const idx = prev.findIndex((l) => lineKey(l.id, l.color ?? "", l.size ?? "") === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, normalizeItem(product, qty, color, size)];
    });

    if (!prefersReduced && flyFromEl && cartAnchorRef.current && imgSrc) {
      const from = flyFromEl.getBoundingClientRect();
      const to = cartAnchorRef.current.getBoundingClientRect();
      const thumb = Math.min(60, Math.max(44, Math.min(from.width, from.height) * 0.35));
      const sx = from.left + from.width / 2 - thumb / 2;
      const sy = from.top + from.height / 2 - thumb / 2;
      const fcx = from.left + from.width / 2;
      const fcy = from.top + from.height / 2;
      const tcx = to.left + to.width / 2;
      const tcy = to.top + to.height / 2;
      const dx = tcx - fcx;
      const dy = tcy - fcy;
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setFly({ id, src: imgSrc, sx, sy, size: thumb, dx, dy, phase: "start" });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFly((f) => (f && f.id === id ? { ...f, phase: "fly" } : f));
        });
      });
    }
  }, []);

  const totalQuantity = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeLine,
      setLineQuantity,
      clearCart,
      cartAnchorRef,
      totalQuantity,
    }),
    [items, addToCart, removeLine, setLineQuantity, clearCart, totalQuantity]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {fly &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[200]"
            style={{
              left: fly.sx,
              top: fly.sy,
              width: fly.size,
              height: fly.size,
              transform:
                fly.phase === "fly"
                  ? `translate(${fly.dx}px, ${fly.dy}px) scale(0.12)`
                  : "translate(0, 0) scale(1)",
              transition:
                fly.phase === "fly"
                  ? "transform 0.68s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.68s ease-out"
                  : "none",
              opacity: fly.phase === "fly" ? 0.25 : 1,
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 14px 44px rgba(15, 23, 42, 0.38)",
            }}
            onTransitionEnd={() => endFly(fly.id)}
          >
            <img src={fly.src} alt="" className="h-full w-full object-cover" draggable={false} />
          </div>,
          document.body
        )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
