import React, { Fragment, useContext, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useOrders } from "../../context/OrderContext";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiCreditCard,
  FiLayers,
  FiLock,
  FiMonitor,
  FiSmartphone,
  FiTruck,
} from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";

const money = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

const STEPS = [
  { id: 1, label: "Delivery", icon: FiTruck },
  { id: 2, label: "Payment", icon: FiCreditCard },
  { id: 3, label: "Review", icon: FiLock },
];

const inputClass = [
  "mt-1.5 w-full rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900",
  "ring-1 ring-slate-200 outline-none transition placeholder:text-slate-400",
  "focus:bg-white focus:ring-2 focus:ring-sky-500",
].join(" ");

const labelClass = "text-xs font-extrabold tracking-wide text-slate-600";

const PAYMENT_OPTIONS = [
  {
    id: "card",
    label: "Credit / Debit card",
    sub: "Visa, Mastercard, RuPay, Amex",
    icon: FiCreditCard,
  },
  {
    id: "upi",
    label: "UPI",
    sub: "Google Pay, PhonePe, Paytm",
    icon: FiSmartphone,
  },
  {
    id: "netbanking",
    label: "Net banking",
    sub: "All major banks",
    icon: FiMonitor,
  },
  {
    id: "wallet",
    label: "Wallets",
    sub: "Paytm, Amazon Pay, MobiKwik",
    icon: FiLayers,
  },
  {
    id: "cod",
    label: "Cash on delivery",
    sub: "Pay when you receive",
    icon: FiTruck,
  },
];

const NET_BANKS = [
  { id: "", name: "Select your bank" },
  { id: "sbi", name: "State Bank of India" },
  { id: "hdfc", name: "HDFC Bank" },
  { id: "icici", name: "ICICI Bank" },
  { id: "axis", name: "Axis Bank" },
  { id: "kotak", name: "Kotak Mahindra Bank" },
  { id: "pnb", name: "Punjab National Bank" },
  { id: "bob", name: "Bank of Baroda" },
  { id: "canara", name: "Canara Bank" },
  { id: "union", name: "Union Bank of India" },
];

const WALLET_PROVIDERS = [
  { id: "paytm", label: "Paytm", hint: "Linked wallet balance" },
  { id: "amazonpay", label: "Amazon Pay", hint: "Pay with Amazon balance" },
  { id: "mobikwik", label: "MobiKwik", hint: "Wallet & ZIP" },
];

const UPI_APPS = [
  { id: "gpay", label: "Google Pay" },
  { id: "phonepe", label: "PhonePe" },
  { id: "paytmupi", label: "Paytm UPI" },
];

const COUPONS = {
  SAVE10: {
    label: "SAVE10",
    description: "Get 10% off your order",
    type: "percent",
    value: 10,
  },
  FLAT200: {
    label: "FLAT200",
    description: "Save ₹200 on orders above ₹1500",
    type: "flat",
    value: 200,
    minimum: 1500,
  },
  WELCOME50: {
    label: "WELCOME50",
    description: "Flat ₹50 off for your first order",
    type: "flat",
    value: 50,
  },
};

const OfferActivate = ({
  couponCode,
  setCouponCode,
  appliedCoupon,
  offerMessage,
  onApply,
  onRemove,
  disabled,
}) => (
  <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-slate-950">Apply promo code</p>
          <p className="text-xs text-slate-500">Enter a code to unlock an offer before checkout.</p>
        </div>
        {appliedCoupon ? (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
          >
            Remove code
          </button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          disabled={Boolean(appliedCoupon) || disabled}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          placeholder="Enter code e.g. SAVE10"
        />
        <button
          type="button"
          onClick={onApply}
          disabled={Boolean(appliedCoupon) || disabled}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Apply
        </button>
      </div>

      <div className="space-y-2 text-sm">
        {offerMessage ? (
          <p className="text-sm font-semibold text-emerald-700">{offerMessage}</p>
        ) : null}
        <div className="grid gap-2 sm:grid-cols-3">
          {Object.values(COUPONS).map((coupon) => (
            <button
              key={coupon.label}
              type="button"
              onClick={() => setCouponCode(coupon.label)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100"
            >
              <p className="font-black">{coupon.label}</p>
              <p className="text-[11px] text-slate-500">{coupon.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const { addOrder } = useOrders();
  const { items, clearCart } = useCart();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderMeta, setOrderMeta] = useState({ id: "", total: 0 });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [offerMessage, setOfferMessage] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pin: "",
    payment: "card",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    upiId: "",
    upiAppHint: "",
    netBank: "",
    walletProvider: "paytm",
  });

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const totals = useMemo(() => {
    let sub = 0;
    let mrp = 0;
    for (const line of items) {
      sub += line.price * line.quantity;
      mrp += line.mrp * line.quantity;
    }
    return {
      subtotal: sub,
      mrpTotal: mrp,
      savings: Math.max(0, mrp - sub),
    };
  }, [items]);

  const step1Valid =
    form.fullName.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    /^\d{10}$/.test(form.phone.replace(/\D/g, "")) &&
    form.address.trim().length > 3 &&
    form.city.trim().length > 1 &&
    form.state.trim().length > 1 &&
    /^\d{6}$/.test(form.pin.trim());

  const digitsOnly = (s) => s.replace(/\D/g, "");

  const step2Valid =
    form.payment === "cod" ||
    form.payment === "wallet" ||
    (form.payment === "netbanking" && form.netBank.trim().length > 0) ||
    (form.payment === "upi" && form.upiId.includes("@") && form.upiId.trim().length > 4) ||
    (form.payment === "card" &&
      form.cardName.trim().length > 1 &&
      digitsOnly(form.cardNumber).length >= 12 &&
      /^\d{2}\/\d{2}$/.test(form.cardExpiry.trim()) &&
      /^\d{3,4}$/.test(form.cardCvv.trim()));

  const getCouponDiscount = (coupon, subtotal) => {
    if (!coupon) return 0;
    if (coupon.minimum && subtotal < coupon.minimum) return 0;
    if (coupon.type === "percent") {
      return Math.round((subtotal * coupon.value) / 100);
    }
    if (coupon.type === "flat") {
      return coupon.value;
    }
    return 0;
  };

  const discountAmount = getCouponDiscount(appliedCoupon, totals.subtotal);
  const totalWithDiscount = Math.max(0, totals.subtotal - discountAmount);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    const coupon = COUPONS[code];

    if (!code) {
      setOfferMessage("Please enter a promo code.");
      return;
    }

    if (!coupon) {
      setAppliedCoupon(null);
      setOfferMessage("Sorry, that code is invalid. Try SAVE10, FLAT200 or WELCOME50.");
      return;
    }

    if (coupon.minimum && totals.subtotal < coupon.minimum) {
      setAppliedCoupon(null);
      setOfferMessage(
        `Spend ${money(coupon.minimum)} to use ${coupon.label}. Your current cart total is ${money(totals.subtotal)}.`
      );
      return;
    }

    setAppliedCoupon(coupon);
    setOfferMessage(`Applied ${coupon.label}: ${coupon.description}`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setOfferMessage("Promo code removed.");
  };

  const paymentReviewText = useMemo(() => {
    const bankName = NET_BANKS.find((b) => b.id === form.netBank)?.name;
    const walletName = WALLET_PROVIDERS.find((w) => w.id === form.walletProvider)?.label;
    const upiApp = UPI_APPS.find((a) => a.id === form.upiAppHint)?.label;
    switch (form.payment) {
      case "card":
        return `Card •••• ${digitsOnly(form.cardNumber).slice(-4)}`;
      case "upi":
        return upiApp ? `${upiApp} — ${form.upiId}` : form.upiId;
      case "netbanking":
        return bankName && form.netBank ? `Net banking — ${bankName}` : "Net banking";
      case "wallet":
        return walletName ? `${walletName} wallet` : "Wallet";
      case "cod":
        return "Cash on delivery";
      default:
        return "";
    }
  }, [
    form.payment,
    form.cardNumber,
    form.upiId,
    form.upiAppHint,
    form.netBank,
    form.walletProvider,
  ]);

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    const id = `SN-${Date.now().toString(36).toUpperCase().slice(-8)}`;
    const lineSnapshot = items.map((l) => ({
      ProductId: l.id,
      title: l.title,
      image: l.image,
      quantity: l.quantity,
      price: l.price,
      color: l.color,
      size: l.size,
    }));
    
    try {
      const paymentMethod = form.payment === 'cod'
        ? 'COD'
        : form.payment === 'card'
        ? 'Card'
        : form.payment === 'upi'
        ? 'UPI'
        : form.payment === 'netbanking'
        ? 'Netbanking'
        : form.payment === 'wallet'
        ? 'Wallet'
        : 'Online';

      const paymentStatus = paymentMethod === 'COD' ? 'pending' : 'paid';

      await addOrder({
        id,
        total: totalWithDiscount,
        paymentLabel: paymentReviewText,
        paymentMethod,
        paymentStatus,
        orderStatus: 'pending',
        shipping: {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pin: form.pin.trim(),
        },
        CartItems: lineSnapshot,
      });
      setOrderMeta({ id, total: totalWithDiscount });
      clearCart();
      setOrderComplete(true);
      showToast({
        variant: "order",
        title: "Order confirmed",
        description: `${id} · Total ${money(totalWithDiscount)} · Confirmation sent to ${form.email.trim()}`,
        duration: 6500,
      });
    } catch (error) {
      showToast({
        variant: "error",
        title: "Order failed",
        description: "Failed to place order. Please try again.",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  if (items.length === 0 && !orderComplete) {
    return <Navigate to="/cart" replace />;
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-16 sm:px-6">
          <div
            className={[
              "rounded-3xl bg-white p-10 text-center ring-1 ring-slate-200 shadow-lg",
              prefersReduced ? "" : "motion-safe:animate-[checkout-success-card_0.7s_cubic-bezier(0.22,1,0.36,1)_both]",
            ].join(" ")}
          >
            <div
              className={[
                "mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50",
                prefersReduced ? "" : "motion-safe:animate-[checkout-success-icon_0.6s_cubic-bezier(0.34,1.45,0.64,1)_0.12s_both",
              ].join(" ")}
            >
              <FiCheck className="h-10 w-10 motion-safe:animate-[checkout-success-check_0.45s_ease-out_0.35s_both]" strokeWidth={2.5} />
            </div>
            <h1 className="mt-8 text-2xl font-black tracking-tight text-slate-950">Order placed</h1>
            <p className="mt-2 text-sm font-medium text-slate-600">
              Thank you, {form.fullName.split(" ")[0] || "there"}. We’ve received your payment and
              your order is being prepared.
            </p>
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-200">
              <p className="text-xs font-bold text-slate-500">Order ID</p>
              <p className="mt-1 font-mono text-sm font-extrabold text-slate-950">{orderMeta.id}</p>
              <p className="mt-4 text-xs font-bold text-slate-500">Total paid</p>
              <p className="mt-0.5 text-lg font-black text-slate-950">{money(orderMeta.total)}</p>
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-500">
              You’ll get a confirmation email at <span className="text-slate-800">{form.email}</span>
            </p>
            <Link
              to="/orders"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3.5 text-sm font-extrabold text-white shadow-sm ring-1 ring-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-900 motion-safe:duration-200"
            >
              View my orders
              <FiArrowRight />
            </Link>
            <Link
              to="/"
              className="mt-3 block text-center text-sm font-extrabold text-slate-700 hover:text-slate-950"
            >
              Back to home
            </Link>
            <Link
              to="/new-arrivals"
              className="mt-2 block text-center text-sm font-extrabold text-sky-700 underline decoration-sky-200 underline-offset-4 hover:text-sky-900"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div
          className={
            prefersReduced ? "" : "motion-safe:animate-[checkout-header-in_0.55s_ease-out_both]"
          }
        >
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-700 hover:text-slate-950 motion-safe:transition-colors"
          >
            <FiArrowLeft />
            Back to cart
          </Link>
          <p className="mt-6 text-xs font-extrabold tracking-widest text-slate-500">CHECKOUT</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Complete your purchase
          </h1>
          <p className="mt-2 max-w-xl text-sm font-medium text-slate-600">
            Secure checkout — your details are encrypted in transit (demo).
          </p>
        </div>

        {/* Stepper — classic connector bars between steps */}
        <div
          className={
            prefersReduced ? "mt-10" : "mt-10 motion-safe:animate-[checkout-stepper-wrap_0.6s_ease-out_0.08s_both]"
          }
        >
          <div className="flex items-center gap-2 sm:gap-3">
            {STEPS.map(({ id, label, icon: Icon }, i) => {
              const active = step === id;
              const done = step > id;
              const cantReachStep =
                id > step ||
                (id === 2 && !step1Valid) ||
                (id === 3 && (!step1Valid || !step2Valid));
              return (
                <Fragment key={id}>
                  <div className="flex min-w-0 flex-1 flex-col items-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (id < step) setStep(id);
                      }}
                      disabled={cantReachStep && id !== step}
                      className={[
                        "flex flex-col items-center gap-2",
                        id <= step ? "cursor-pointer" : "cursor-not-allowed opacity-45",
                      ].join(" ")}
                      aria-current={active ? "step" : undefined}
                    >
                      <span
                        className={[
                          "grid h-11 w-11 place-items-center rounded-2xl text-lg ring-2 motion-safe:transition-all motion-safe:duration-300",
                          done
                            ? "bg-emerald-500 text-white ring-emerald-400 shadow-md"
                            : active
                              ? "bg-slate-950 text-white ring-slate-950 shadow-lg motion-safe:animate-[checkout-step-pulse_2s_ease-in-out_infinite]"
                              : "bg-white text-slate-400 ring-slate-200",
                        ].join(" ")}
                      >
                        {done ? <FiCheck className="text-xl" /> : <Icon />}
                      </span>
                      <span
                        className={[
                          "text-center text-[11px] font-extrabold sm:text-xs",
                          active || done ? "text-slate-900" : "text-slate-400",
                        ].join(" ")}
                      >
                        {label}
                      </span>
                    </button>
                  </div>
                  {i < STEPS.length - 1 ? (
                    <div
                      className="relative mb-7 h-1 min-h-1 w-full min-w-[28px] max-w-[100px] flex-[1.25] rounded-full bg-slate-200 sm:max-w-none"
                      aria-hidden
                    >
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-sky-500 to-emerald-500 motion-safe:transition-[width] motion-safe:duration-500 motion-safe:ease-out"
                        style={{ width: step > i + 1 ? "100%" : "0%" }}
                      />
                    </div>
                  ) : null}
                </Fragment>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <div className="relative min-h-[320px] overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm">
              <div
                key={step}
                className={
                  prefersReduced ? "p-6 sm:p-8" : "p-6 sm:p-8 motion-safe:animate-[checkout-panel-in_0.45s_ease-out_both]"
                }
              >
                {step === 1 && (
                  <div className="grid gap-5">
                    <h2 className="text-lg font-black text-slate-950">Delivery details</h2>
                    <div>
                      <label className={labelClass} htmlFor="co-name">
                        Full name
                      </label>
                      <input
                        id="co-name"
                        value={form.fullName}
                        onChange={update("fullName")}
                        autoComplete="name"
                        className={inputClass}
                        placeholder="As on ID / bank records"
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="co-email">
                          Email
                        </label>
                        <input
                          id="co-email"
                          type="email"
                          value={form.email}
                          onChange={update("email")}
                          autoComplete="email"
                          className={inputClass}
                          placeholder="you@example.com"
                        />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="co-phone">
                          Phone
                        </label>
                        <input
                          id="co-phone"
                          inputMode="numeric"
                          value={form.phone}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                            }))
                          }
                          className={inputClass}
                          placeholder="10-digit mobile"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="co-address">
                        Street address
                      </label>
                      <input
                        id="co-address"
                        value={form.address}
                        onChange={update("address")}
                        autoComplete="street-address"
                        className={inputClass}
                        placeholder="House no., building, area"
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-3">
                      <div className="sm:col-span-1">
                        <label className={labelClass} htmlFor="co-city">
                          City
                        </label>
                        <input
                          id="co-city"
                          value={form.city}
                          onChange={update("city")}
                          className={inputClass}
                          placeholder="City"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className={labelClass} htmlFor="co-state">
                          State
                        </label>
                        <input
                          id="co-state"
                          value={form.state}
                          onChange={update("state")}
                          className={inputClass}
                          placeholder="State"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className={labelClass} htmlFor="co-pin">
                          PIN code
                        </label>
                        <input
                          id="co-pin"
                          inputMode="numeric"
                          value={form.pin}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              pin: e.target.value.replace(/\D/g, "").slice(0, 6),
                            }))
                          }
                          className={inputClass}
                          placeholder="6 digits"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid gap-5">
                    <div>
                      <h2 className="text-lg font-black text-slate-950">Payment options</h2>
                      <p className="mt-1 text-sm font-medium text-slate-600">
                        Choose how you’d like to pay — all options are demo-only.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {PAYMENT_OPTIONS.map(({ id, label, sub, icon: Icon }) => (
                        <label
                          key={id}
                          className={[
                            "flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 motion-safe:transition-colors motion-safe:duration-200",
                            form.payment === id
                              ? "border-sky-500 bg-sky-50/80 ring-1 ring-sky-200"
                              : "border-slate-200 bg-white hover:border-slate-300",
                          ].join(" ")}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={id}
                            checked={form.payment === id}
                            onChange={() => setForm((f) => ({ ...f, payment: id }))}
                            className="sr-only"
                          />
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-800 ring-1 ring-slate-200">
                            <Icon className="text-lg" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-extrabold text-slate-900">{label}</span>
                            <span className="mt-0.5 block text-xs font-semibold text-slate-500">{sub}</span>
                          </span>
                          {form.payment === id ? (
                            <FiCheck className="mt-0.5 shrink-0 text-sky-600 motion-safe:animate-[checkout-check-pop_0.35s_ease-out_both]" />
                          ) : null}
                        </label>
                      ))}
                    </div>

                    {form.payment === "card" && (
                      <div
                        className={
                          prefersReduced
                            ? "grid gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                            : "grid gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 motion-safe:animate-[checkout-panel-in_0.35s_ease-out_both]"
                        }
                      >
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          We accept
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {["Visa", "Mastercard", "RuPay", "Amex"].map((brand) => (
                            <span
                              key={brand}
                              className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-slate-700 ring-1 ring-slate-200"
                            >
                              {brand}
                            </span>
                          ))}
                        </div>
                        <div>
                          <label className={labelClass} htmlFor="co-card-name">
                            Name on card
                          </label>
                          <input
                            id="co-card-name"
                            value={form.cardName}
                            onChange={update("cardName")}
                            className={inputClass}
                            placeholder="Exact name on card"
                          />
                        </div>
                        <div>
                          <label className={labelClass} htmlFor="co-card-num">
                            Card number
                          </label>
                          <input
                            id="co-card-num"
                            inputMode="numeric"
                            value={form.cardNumber}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                cardNumber: e.target.value.replace(/\D/g, "").slice(0, 16),
                              }))
                            }
                            className={inputClass}
                            placeholder="4242 4242 4242 4242"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass} htmlFor="co-exp">
                              Expiry
                            </label>
                            <input
                              id="co-exp"
                              value={form.cardExpiry}
                              onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                                if (v.length >= 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                                setForm((f) => ({ ...f, cardExpiry: v }));
                              }}
                              className={inputClass}
                              placeholder="MM/YY"
                            />
                          </div>
                          <div>
                            <label className={labelClass} htmlFor="co-cvv">
                              CVV
                            </label>
                            <input
                              id="co-cvv"
                              inputMode="numeric"
                              type="password"
                              value={form.cardCvv}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  cardCvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                                }))
                              }
                              className={inputClass}
                              placeholder="•••"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {form.payment === "upi" && (
                      <div
                        className={
                          prefersReduced
                            ? "grid gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                            : "grid gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 motion-safe:animate-[checkout-panel-in_0.35s_ease-out_both]"
                        }
                      >
                        <p className={labelClass}>Pay with app (optional)</p>
                        <div className="flex flex-wrap gap-2">
                          {UPI_APPS.map(({ id, label: appLabel }) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setForm((f) => ({ ...f, upiAppHint: f.upiAppHint === id ? "" : id }))}
                              className={[
                                "rounded-xl px-3 py-2 text-xs font-extrabold ring-1 motion-safe:transition-colors motion-safe:duration-200",
                                form.upiAppHint === id
                                  ? "bg-sky-600 text-white ring-sky-500"
                                  : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-100",
                              ].join(" ")}
                            >
                              {appLabel}
                            </button>
                          ))}
                        </div>
                        <div>
                          <label className={labelClass} htmlFor="co-upi">
                            UPI ID
                          </label>
                          <input
                            id="co-upi"
                            value={form.upiId}
                            onChange={update("upiId")}
                            className={inputClass}
                            placeholder="yourname@paytm / @okaxis / @ybl"
                          />
                          <p className="mt-2 text-xs font-medium text-slate-500">
                            You’ll get a collect request on your UPI app for{" "}
                            <span className="font-extrabold text-slate-700">{money(totals.subtotal)}</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {form.payment === "netbanking" && (
                      <div
                        className={
                          prefersReduced
                            ? "grid gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                            : "grid gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 motion-safe:animate-[checkout-panel-in_0.35s_ease-out_both]"
                        }
                      >
                        <label className={labelClass} htmlFor="co-bank">
                          Select bank
                        </label>
                        <select
                          id="co-bank"
                          value={form.netBank}
                          onChange={(e) => setForm((f) => ({ ...f, netBank: e.target.value }))}
                          className={[
                            inputClass,
                            "cursor-pointer appearance-none bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10",
                          ].join(" ")}
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m7 10 5 5 5-5'/%3E%3C/svg%3E")`,
                          }}
                        >
                          {NET_BANKS.map((b) => (
                            <option key={b.id || "placeholder"} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs font-medium text-slate-500">
                          After continuing, you’ll be redirected to your bank’s secure login (demo).
                        </p>
                      </div>
                    )}

                    {form.payment === "wallet" && (
                      <div
                        className={
                          prefersReduced
                            ? "grid gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                            : "grid gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 motion-safe:animate-[checkout-panel-in_0.35s_ease-out_both]"
                        }
                      >
                        <p className={labelClass}>Choose wallet</p>
                        <div className="grid gap-2 sm:grid-cols-3">
                          {WALLET_PROVIDERS.map(({ id, label: wLabel, hint }) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setForm((f) => ({ ...f, walletProvider: id }))}
                              className={[
                                "rounded-2xl border-2 p-3 text-left motion-safe:transition-colors motion-safe:duration-200",
                                form.walletProvider === id
                                  ? "border-sky-500 bg-white ring-1 ring-sky-200"
                                  : "border-slate-200 bg-white hover:border-slate-300",
                              ].join(" ")}
                            >
                              <span className="block text-sm font-extrabold text-slate-950">{wLabel}</span>
                              <span className="mt-1 block text-[11px] font-medium leading-snug text-slate-500">
                                {hint}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {form.payment === "cod" && (
                      <div className="rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-100 motion-safe:animate-[checkout-panel-in_0.35s_ease-out_both]">
                        <p className="text-sm font-semibold text-amber-950">
                          Pay with cash when your order arrives. An executive may call to confirm before dispatch.
                        </p>
                        <p className="mt-2 text-xs font-medium text-amber-900/90">
                          COD fee may apply on orders below a threshold in production — waived here for demo.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="grid gap-6">
                    <h2 className="text-lg font-black text-slate-950">Review & confirm</h2>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                      <p className="text-xs font-extrabold text-slate-500">Ship to</p>
                      <p className="mt-1 text-sm font-extrabold text-slate-950">{form.fullName}</p>
                      <p className="mt-1 text-sm font-medium text-slate-700">{form.address}</p>
                      <p className="text-sm font-medium text-slate-700">
                        {form.city}, {form.state} — {form.pin}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-600">{form.phone}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                      <p className="text-xs font-extrabold text-slate-500">Payment</p>
                      <p className="mt-1 text-sm font-extrabold text-slate-950">{paymentReviewText}</p>
                    </div>
                    <ul className="divide-y divide-slate-200 rounded-2xl ring-1 ring-slate-200">
                      {items.map((line) => (
                        <li
                          key={`${line.id}::${line.color ?? ""}::${line.size ?? ""}`}
                          className="flex gap-3 p-3 first:rounded-t-2xl last:rounded-b-2xl"
                        >
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                            {line.image ? (
                              <img
                                src={line.image}
                                alt=""
                                className="h-full w-full object-cover"
                                draggable={false}
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-extrabold text-slate-950">
                              {line.title}
                            </p>
                            <p className="text-xs font-semibold text-slate-500">
                              Qty {line.quantity}
                              {line.color ? ` · ${line.color}` : ""}
                              {line.size ? ` · ${line.size}` : ""}
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-black text-slate-950 tabular-nums">
                            {money(line.price * line.quantity)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => Math.max(1, s - 1))}
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 motion-safe:duration-200"
                    >
                      <FiArrowLeft />
                      Back
                    </button>
                  ) : (
                    <span />
                  )}
                  {step < 3 ? (
                    <button
                      type="button"
                      disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
                      onClick={() => setStep((s) => Math.min(3, s + 1))}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-extrabold text-white shadow-sm ring-1 ring-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40 motion-safe:duration-200"
                    >
                      Continue
                      <FiArrowRight />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={placingOrder}
                      onClick={handlePlaceOrder}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-md ring-1 ring-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 motion-safe:duration-200"
                    >
                      {placingOrder ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Placing...
                        </>
                      ) : (
                        <>
                          <FiLock />
                          Place order
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside
            className={
              prefersReduced
                ? "lg:col-span-5"
                : "lg:col-span-5 motion-safe:animate-[checkout-aside-in_0.55s_ease-out_0.12s_both]"
            }
          >
            <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-sm lg:sticky lg:top-24">
              <OfferActivate
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                appliedCoupon={appliedCoupon}
                offerMessage={offerMessage}
                onApply={handleApplyCoupon}
                onRemove={handleRemoveCoupon}
                disabled={items.length === 0}
              />
              <div className="mt-4 rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-sm">
                <h2 className="text-sm font-black text-slate-950">Order summary</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3 font-semibold text-slate-700">
                    <dt>Subtotal</dt>
                    <dd className="tabular-nums text-slate-950">{money(totals.subtotal)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 font-semibold text-slate-700">
                    <dt>MRP</dt>
                    <dd className="tabular-nums text-slate-500 line-through">{money(totals.mrpTotal)}</dd>
                  </div>
                  {totals.savings > 0 ? (
                    <div className="flex items-center justify-between gap-3 font-extrabold text-emerald-700">
                      <dt>Savings</dt>
                      <dd className="tabular-nums">− {money(totals.savings)}</dd>
                    </div>
                  ) : null}
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                      <dt>{appliedCoupon.label} discount</dt>
                      <dd className="tabular-nums text-emerald-700">− {money(discountAmount)}</dd>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                    <dt>Shipping</dt>
                    <dd className="font-extrabold text-emerald-700">FREE</dd>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <div className="flex items-center justify-between gap-3 text-base font-black text-slate-950">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{money(totalWithDiscount)}</dd>
                  </div>
                </dl>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                <FiLock className="shrink-0 text-slate-500" />
                SSL-secured demo checkout — no real charges.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
