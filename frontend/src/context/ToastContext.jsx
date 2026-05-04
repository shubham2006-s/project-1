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
import { FiCheckCircle, FiInfo, FiShoppingBag, FiX } from "react-icons/fi";

const ToastContext = createContext(null);

const VARIANT_STYLES = {
  success: {
    ring: "ring-emerald-500/25",
    border: "border-emerald-200",
    bg: "bg-emerald-50/95",
    iconWrap: "bg-emerald-500 text-white",
    Icon: FiCheckCircle,
  },
  info: {
    ring: "ring-sky-500/25",
    border: "border-sky-200",
    bg: "bg-sky-50/95",
    iconWrap: "bg-sky-600 text-white",
    Icon: FiInfo,
  },
  order: {
    ring: "ring-violet-500/25",
    border: "border-violet-200",
    bg: "bg-violet-50/95",
    iconWrap: "bg-violet-600 text-white",
    Icon: FiShoppingBag,
  },
};

function ToastItem({ toast, onDismiss, prefersReduced }) {
  const cfg = VARIANT_STYLES[toast.variant] || VARIANT_STYLES.success;
  const Icon = cfg.Icon;

  return (
    <div
      role="status"
      className={[
        "pointer-events-auto flex max-w-[min(100vw-2rem,22rem)] gap-3 rounded-2xl border p-4 shadow-[0_16px_50px_rgba(15,23,42,0.12)] backdrop-blur-sm",
        cfg.border,
        cfg.bg,
        cfg.ring,
        "ring-1",
        prefersReduced ? "" : toast.exiting ? "toast-exit" : "toast-enter",
      ].join(" ")}
    >
      <span className={["grid h-10 w-10 shrink-0 place-items-center rounded-xl shadow-sm", cfg.iconWrap].join(" ")}>
        <Icon className="text-lg" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-extrabold text-slate-950">{toast.title}</p>
        {toast.description ? (
          <p className="mt-0.5 text-xs font-semibold leading-snug text-slate-600">{toast.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-white/80 hover:text-slate-900"
        aria-label="Dismiss notification"
      >
        <FiX className="text-lg" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const dismiss = useCallback(
    (id) => {
      const t = timers.current.get(id);
      if (t) window.clearTimeout(t);
      timers.current.delete(id);
      if (prefersReduced) {
        setToasts((list) => list.filter((x) => x.id !== id));
        return;
      }
      setToasts((list) => list.map((x) => (x.id === id ? { ...x, exiting: true } : x)));
      window.setTimeout(() => {
        setToasts((list) => list.filter((x) => x.id !== id));
      }, 280);
    },
    [prefersReduced]
  );

  const showToast = useCallback(
    ({ title, description, variant = "success", duration = 5200 }) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((list) => [...list, { id, title, description, variant, exiting: false }]);
      const auto = window.setTimeout(() => dismiss(id), duration);
      timers.current.set(id, auto);
      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const value = useMemo(() => ({ showToast, dismissToast: dismiss }), [showToast, dismiss]);

  const portal =
    typeof document !== "undefined"
      ? createPortal(
          <div
            className="pointer-events-none fixed inset-x-0 top-0 z-[400] flex flex-col items-end gap-3 px-3 pt-4 sm:inset-auto sm:right-4 sm:top-4 sm:left-auto sm:px-0"
            aria-live="polite"
            aria-relevant="additions"
          >
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onDismiss={dismiss} prefersReduced={prefersReduced} />
            ))}
          </div>,
          document.body
        )
      : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {portal}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
