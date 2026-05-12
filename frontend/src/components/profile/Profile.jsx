import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiBell,
  FiCheck,
  FiChevronRight,
  FiHeart,
  FiLock,
  FiMail,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiSettings,
  FiShield,
  FiShoppingBag,
  FiUser,
} from "react-icons/fi";
import { AuthContext } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useOrders } from "../../context/OrderContext";
import { useWishlist } from "../../context/WishlistContext";
import { useToast } from "../../context/ToastContext";
import API from "../../util/api";

const cardBase =
  "rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-sm motion-safe:transition motion-safe:duration-300";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { totalQuantity } = useCart();
  const { orders } = useOrders();
  const { totalCount: wishlistCount } = useWishlist();

  const [emailOffers, setEmailOffers] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSubmitting, setPwSubmitting] = useState(false);

  useEffect(() => {
    const mq =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    if (!mq) return;
    const sync = () => setPrefersReduced(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  const fallbackUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const displayName = user?.name || (fallbackUserId ? `User ${fallbackUserId}` : "Member");
  const email = user?.email || "—";
  const phone = user?.phone || user?.mobile || null;
  const avatarLetter = (displayName?.trim()?.[0] || "U").toUpperCase();

  const memberSince = useMemo(() => {
    try {
      const raw = localStorage.getItem("shopnow_member_since");
      if (raw) return raw;
      const now = new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      localStorage.setItem("shopnow_member_since", now);
      return now;
    } catch {
      return new Date().getFullYear().toString();
    }
  }, []);

  const cardDelay = (i) => (prefersReduced ? undefined : { animationDelay: `${90 + i * 72}ms` });
  const cardAnim = prefersReduced ? "" : "motion-safe:animate-[profile-card-in_0.48s_cubic-bezier(0.22,1,0.36,1)_both]";

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (pwSubmitting) return;

    if (newPassword.length < 6) {
      showToast({
        variant: "info",
        title: "Password too short",
        description: "New password must be at least 6 characters.",
        duration: 4200,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast({
        variant: "info",
        title: "Passwords do not match",
        description: "Confirm password should match new password.",
        duration: 4200,
      });
      return;
    }

    try {
      setPwSubmitting(true);

      await API.post(
        "/user/change-password",
        {
          currentPassword,
          newPassword,
        }
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPwForm(false);

      showToast({
        variant: "success",
        title: "Password updated",
        description: "Your account password has been changed successfully.",
        duration: 4800,
      });

    } catch (error) {

      showToast({
        variant: "info",
        title: "Update failed",
        description:
          error?.response?.data?.message ||
          "Could not change password.",
        duration: 5000,
      });

    } finally {
      setPwSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <nav
          className={
            prefersReduced
              ? "text-xs font-semibold text-slate-600"
              : "text-xs font-semibold text-slate-600 motion-safe:animate-[profile-header-in_0.5s_ease-out_both]"
          }
          aria-label="Breadcrumb"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link className="hover:text-slate-950" to="/">
                Home
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="font-extrabold text-slate-950">Account</li>
          </ol>
        </nav>

        {/* Hero */}
        <section
          className={
            prefersReduced
              ? "relative mt-8 overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-purple-900 to-indigo-900 p-6 text-white shadow-xl ring-1 ring-white/10 sm:p-8"
              : "relative mt-8 overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-purple-900 to-indigo-900 p-6 text-white shadow-xl ring-1 ring-white/10 motion-safe:animate-[profile-hero-in_0.65s_cubic-bezier(0.22,1,0.36,1)_both] sm:p-8"
          }
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div
                className={
                  prefersReduced
                    ? "relative grid h-24 w-24 shrink-0 place-items-center rounded-3xl bg-white/10 text-3xl font-black text-white ring-2 ring-white/20 backdrop-blur-sm"
                    : "relative grid h-24 w-24 shrink-0 place-items-center rounded-3xl bg-white/10 text-3xl font-black text-white ring-2 ring-white/20 backdrop-blur-sm motion-safe:animate-[profile-avatar-pop_0.55s_cubic-bezier(0.34,1.45,0.64,1)_0.12s_both]"
                }
              >
                {avatarLetter}
                <span className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-purple-950 shadow-lg">
                  <FiCheck className="text-sm" strokeWidth={3} aria-hidden />
                </span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/60">Account</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{displayName}</h1>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-white/85">
                  <span className="inline-flex items-center gap-1.5">
                    <FiMail className="opacity-80" aria-hidden />
                    {email}
                  </span>
                </p>
                <p className="mt-2 text-xs font-semibold text-white/55">Member since {memberSince}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 sm:justify-end">
              <Link
                to="/orders"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-extrabold text-slate-900 shadow-md ring-1 ring-white/30 transition hover:-translate-y-0.5 hover:bg-slate-50 motion-safe:duration-200"
              >
                <FiPackage />
                Orders
                <FiArrowRight className="opacity-70" />
              </Link>
              <Link
                to="/wishlist"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-extrabold text-white ring-1 ring-white/25 transition hover:bg-white/15 motion-safe:duration-200"
              >
                <FiHeart />
                Wishlist
                {wishlistCount > 0 ? (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-black tabular-nums">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                ) : null}
              </Link>
              <Link
                to="/cart"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-extrabold text-white ring-1 ring-white/25 transition hover:bg-white/15 motion-safe:duration-200"
              >
                <FiShoppingBag />
                Cart
                {totalQuantity > 0 ? (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-black tabular-nums">
                    {totalQuantity > 99 ? "99+" : totalQuantity}
                  </span>
                ) : null}
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <div className="space-y-6 lg:col-span-8">
            {/* Personal */}
            <section style={cardDelay(0)} className={[cardBase, cardAnim].filter(Boolean).join(" ")}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-800 ring-1 ring-slate-200">
                    <FiUser />
                  </span>
                  <div>
                    <h2 className="text-base font-black text-slate-950">Personal information</h2>
                    <p className="text-xs font-semibold text-slate-500">How we reach you</p>
                  </div>
                </div>
              </div>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <dt className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                    Full name
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-slate-950">{displayName}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <dt className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                    Email
                  </dt>
                  <dd className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-950">
                    <FiMail className="text-slate-400" aria-hidden />
                    {email}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100 sm:col-span-2">
                  <dt className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                    Phone
                  </dt>
                  <dd className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-950">
                    <FiPhone className="text-slate-400" aria-hidden />
                    {phone || "Add a phone number (coming soon)"}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-xs font-medium text-slate-500">
                Profile edits will sync from your account settings when you connect the backend API.
              </p>
            </section>

            {/* Security */}
            <section style={cardDelay(1)} className={[cardBase, cardAnim].filter(Boolean).join(" ")}>
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-800 ring-1 ring-slate-200">
                  <FiShield />
                </span>
                <div>
                  <h2 className="text-base font-black text-slate-950">Security</h2>
                  <p className="text-xs font-semibold text-slate-500">Password & sign-in</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPwForm((v) => !v)}
                className="mt-5 flex w-full items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-left ring-1 ring-slate-200 transition hover:bg-slate-100 motion-safe:duration-200"
              >
                <span className="flex items-center gap-3">
                  <FiLock className="text-slate-600" />
                  <span>
                    <span className="block text-sm font-extrabold text-slate-950">Change password</span>
                    <span className="text-xs font-medium text-slate-500">
                      Securely update your password
                    </span>
                  </span>
                </span>
                <FiChevronRight className="text-slate-400" />
              </button>
              {showPwForm ? (
                <form
                  onSubmit={handleChangePassword}
                  className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-600">Current password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">New password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">Confirm new password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={pwSubmitting}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pwSubmitting ? "Updating..." : "Update password"}
                  </button>
                </form>
              ) : null}
            </section>

            {/* Notifications */}
            <section style={cardDelay(2)} className={[cardBase, cardAnim].filter(Boolean).join(" ")}>
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-800 ring-1 ring-slate-200">
                  <FiBell />
                </span>
                <div>
                  <h2 className="text-base font-black text-slate-950">Notifications</h2>
                  <p className="text-xs font-semibold text-slate-500">Choose what we send you</p>
                </div>
              </div>
              <ul className="mt-5 divide-y divide-slate-100 rounded-xl ring-1 ring-slate-100">
                <li className="flex items-center justify-between gap-4 px-4 py-3 first:rounded-t-xl last:rounded-b-xl">
                  <span className="text-sm font-semibold text-slate-800">Order & delivery updates</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={orderAlerts}
                    onClick={() => setOrderAlerts((v) => !v)}
                    className={[
                      "relative h-7 w-12 shrink-0 rounded-full transition-colors motion-safe:duration-300",
                      orderAlerts ? "bg-emerald-500" : "bg-slate-200",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform motion-safe:duration-300",
                        orderAlerts ? "translate-x-5" : "translate-x-0",
                      ].join(" ")}
                    />
                  </button>
                </li>
                <li className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="text-sm font-semibold text-slate-800">Offers & recommendations</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={emailOffers}
                    onClick={() => setEmailOffers((v) => !v)}
                    className={[
                      "relative h-7 w-12 shrink-0 rounded-full transition-colors motion-safe:duration-300",
                      emailOffers ? "bg-emerald-500" : "bg-slate-200",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform motion-safe:duration-300",
                        emailOffers ? "translate-x-5" : "translate-x-0",
                      ].join(" ")}
                    />
                  </button>
                </li>
              </ul>
            </section>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            {/* Stats */}
            <div style={cardDelay(3)} className={[cardBase, "p-6", cardAnim].filter(Boolean).join(" ")}>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Snapshot</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 motion-safe:transition hover:ring-slate-200">
                  <p className="text-2xl font-black tabular-nums text-slate-950">{orders.length}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">Orders</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 motion-safe:transition hover:ring-slate-200">
                  <p className="text-2xl font-black tabular-nums text-slate-950">{totalQuantity}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">In cart</p>
                </div>
                <div className="col-span-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 motion-safe:transition hover:ring-slate-200 sm:col-span-1">
                  <p className="text-2xl font-black tabular-nums text-slate-950">{wishlistCount}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">Wishlist</p>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div
              style={cardDelay(4)}
              className={[cardBase, "overflow-hidden p-0", cardAnim].filter(Boolean).join(" ")}
            >
              <div className="border-b border-slate-100 px-5 py-4">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-950">
                  <FiSettings className="text-slate-500" />
                  Shortcuts
                </h3>
              </div>
              <ul className="divide-y divide-slate-100">
                <li>
                  <Link
                    to="/orders"
                    className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm font-extrabold text-slate-800 transition hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-3">
                      <FiPackage className="text-slate-500" />
                      My orders
                    </span>
                    <FiChevronRight className="text-slate-400" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/wishlist"
                    className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm font-extrabold text-slate-800 transition hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-3">
                      <FiHeart className="text-slate-500" />
                      Wishlist
                    </span>
                    <FiChevronRight className="text-slate-400" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cart"
                    className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm font-extrabold text-slate-800 transition hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-3">
                      <FiShoppingBag className="text-slate-500" />
                      Shopping cart
                    </span>
                    <FiChevronRight className="text-slate-400" />
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left text-sm font-extrabold text-slate-400"
                  >
                    <span className="flex items-center gap-3">
                      <FiMapPin className="text-slate-400" />
                      Saved addresses
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Soon</span>
                  </button>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                showToast({
                  variant: "info",
                  title: "Signed out",
                  description: "You have been logged out of ShopNow.",
                  duration: 4200,
                });
                logout();
                navigate("/login");
              }}
              style={cardDelay(5)}
              className={[
                "w-full rounded-2xl bg-rose-50 px-5 py-3.5 text-sm font-extrabold text-rose-800 ring-1 ring-rose-100 transition hover:bg-rose-100",
                cardAnim,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              Sign out of ShopNow
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Profile;
