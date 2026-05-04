import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiMinus, FiPlus, FiShoppingBag, FiTrash2 } from "react-icons/fi";
import { useCart } from "../../context/CartContext";

const money = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

const rowKey = (line) =>
  `${String(line.id)}::${line.color ?? ""}::${line.size ?? ""}`;

const Cart = () => {
  const { items, removeLine, setLineQuantity } = useCart();
  const [removing, setRemoving] = useState(() => new Set());

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

  const scheduleRemove = (line) => {
    const k = rowKey(line);
    setRemoving((prev) => new Set(prev).add(k));
    window.setTimeout(() => {
      removeLine(line);
      setRemoving((prev) => {
        const next = new Set(prev);
        next.delete(k);
        return next;
      });
    }, 320);
  };

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header
          className={[
            "cart-page-header",
            prefersReduced ? "" : "motion-safe:animate-[cart-page-header-in_0.55s_ease-out_both]",
          ].join(" ")}
        >
          <p className="text-xs font-extrabold tracking-widest text-slate-500">CART</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Your bag
          </h1>
          <p className="mt-2 max-w-xl text-sm font-medium text-slate-600">
            Review items, adjust quantities, and head to checkout when you’re ready.
          </p>
        </header>

        {items.length === 0 ? (
          <div
            className={[
              "mt-10 overflow-hidden rounded-3xl bg-white p-10 text-center ring-1 ring-slate-200 shadow-sm sm:p-14",
              prefersReduced ? "" : "motion-safe:animate-[cart-empty-in_0.65s_ease-out_both]",
            ].join(" ")}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 ring-1 ring-slate-200 motion-safe:animate-[cart-empty-icon_2.2s_ease-in-out_infinite]">
              <FiShoppingBag className="text-2xl" aria-hidden />
            </div>
            <h2 className="mt-6 text-lg font-black text-slate-950">Your cart is empty</h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-600">
              Save items as you shop — they’ll show up here. Discover deals and new arrivals anytime.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white shadow-sm ring-1 ring-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-md motion-safe:duration-300"
              >
                Continue shopping
                <FiArrowRight />
              </Link>
              <Link
                to="/new-arrivals"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-slate-900 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-slate-300 motion-safe:duration-300"
              >
                New arrivals
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-8">
              <ul className="flex flex-col gap-4">
                {items.map((line, idx) => {
                  const k = rowKey(line);
                  const isLeaving = removing.has(k);
                  const delay = prefersReduced ? 0 : Math.min(idx * 55, 400);
                  return (
                    <li
                      key={k}
                      style={prefersReduced ? undefined : { animationDelay: `${delay}ms` }}
                      className={[
                        "cart-line-enter rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm",
                        prefersReduced ? "" : "motion-safe:animate-[cart-line-in_0.5s_cubic-bezier(0.22,1,0.36,1)_both]",
                        isLeaving
                          ? "motion-safe:scale-[0.98] motion-safe:opacity-0 motion-safe:-translate-x-2"
                          : "motion-safe:scale-100 motion-safe:opacity-100 motion-safe:translate-x-0",
                        "motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out",
                      ].join(" ")}
                    >
                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5">
                        <Link
                          to={`/product/${line.id}`}
                          state={{
                            product: {
                              id: line.id,
                              title: line.title,
                              brand: line.brand,
                              category: line.category,
                              price: line.price,
                              mrp: line.mrp,
                              rating: 4.3,
                              reviews: 100,
                              badge: "In cart",
                              image: line.image,
                            },
                          }}
                          className="group relative shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200 sm:h-28 sm:w-36"
                        >
                          <div className="aspect-4/3 w-full sm:aspect-auto sm:h-full">
                            {line.image ? (
                              <img
                                src={line.image}
                                alt=""
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                draggable={false}
                              />
                            ) : (
                              <div className="grid h-full min-h-[120px] place-items-center text-xs font-bold text-slate-400">
                                No image
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold text-slate-500">{line.brand}</p>
                              <Link
                                to={`/product/${line.id}`}
                                state={{
                                  product: {
                                    id: line.id,
                                    title: line.title,
                                    brand: line.brand,
                                    category: line.category,
                                    price: line.price,
                                    mrp: line.mrp,
                                    rating: 4.3,
                                    reviews: 100,
                                    badge: "In cart",
                                    image: line.image,
                                  },
                                }}
                                className="mt-0.5 block text-base font-extrabold tracking-tight text-slate-950 outline-none hover:text-sky-700 focus-visible:ring-2 focus-visible:ring-sky-500 rounded"
                              >
                                {line.title}
                              </Link>
                              <p className="mt-1 text-xs font-semibold text-slate-500">
                                {line.category}
                                {line.color ? ` · ${line.color}` : ""}
                                {line.size ? ` · ${line.size}` : ""}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-base font-black text-slate-950">
                                {money(line.price * line.quantity)}
                              </p>
                              <p className="text-xs font-semibold text-slate-500">
                                {money(line.price)} each
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="inline-flex items-center overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200">
                              <button
                                type="button"
                                disabled={isLeaving}
                                onClick={() =>
                                  setLineQuantity(line, Math.max(0, line.quantity - 1))
                                }
                                className="flex h-10 w-11 items-center justify-center font-black text-slate-900 transition hover:bg-white disabled:opacity-40"
                                aria-label="Decrease quantity"
                              >
                                <FiMinus />
                              </button>
                              <span className="grid min-w-[2.5rem] place-items-center text-sm font-black text-slate-950 tabular-nums">
                                {line.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={isLeaving || line.quantity >= 99}
                                onClick={() => setLineQuantity(line, line.quantity + 1)}
                                className="flex h-10 w-11 items-center justify-center font-black text-slate-900 transition hover:bg-white disabled:opacity-40"
                                aria-label="Increase quantity"
                              >
                                <FiPlus />
                              </button>
                            </div>

                            <button
                              type="button"
                              disabled={isLeaving}
                              onClick={() => scheduleRemove(line)}
                              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold text-rose-700 ring-1 ring-rose-200/80 transition hover:bg-rose-50 disabled:opacity-40 motion-safe:duration-200"
                            >
                              <FiTrash2 className="text-base" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <aside
              className={[
                "lg:col-span-4 lg:sticky lg:top-24",
                prefersReduced ? "" : "motion-safe:animate-[cart-summary-in_0.55s_ease-out_0.1s_both]",
              ].join(" ")}
            >
              <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-sm">
                <h2 className="text-sm font-black tracking-tight text-slate-950">Order summary</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3 font-semibold text-slate-700">
                    <dt>Subtotal</dt>
                    <dd className="tabular-nums text-slate-950">{money(totals.subtotal)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 font-semibold text-slate-700">
                    <dt>MRP total</dt>
                    <dd className="tabular-nums text-slate-500 line-through">
                      {money(totals.mrpTotal)}
                    </dd>
                  </div>
                  {totals.savings > 0 ? (
                    <div className="flex items-center justify-between gap-3 font-extrabold text-emerald-700">
                      <dt>You save</dt>
                      <dd className="tabular-nums">− {money(totals.savings)}</dd>
                    </div>
                  ) : null}
                  <div className="h-px bg-slate-200" />
                  <div className="flex items-center justify-between gap-3 text-base font-black text-slate-950">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{money(totals.subtotal)}</dd>
                  </div>
                </dl>

                <p className="mt-4 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-100">
                  Free delivery on this order — estimated 2–4 business days.
                </p>

                <Link
                  to="/checkout"
                  className={[
                    "mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-extrabold",
                    "bg-slate-950 text-white shadow-sm ring-1 ring-slate-900/10",
                    "transition hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-md active:translate-y-0",
                    "motion-safe:duration-300",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                  ].join(" ")}
                >
                  Checkout
                  <FiArrowRight />
                </Link>
                <p className="mt-3 text-center text-[11px] font-semibold text-slate-500">
                  Demo checkout — connect your payment provider here.
                </p>

                <Link
                  to="/"
                  className="mt-5 block text-center text-sm font-extrabold text-sky-700 underline decoration-sky-200 underline-offset-4 hover:text-sky-900"
                >
                  Continue shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
