import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiPackage,
  FiHash,
} from "react-icons/fi";
import { useOrders } from "../../context/OrderContext";

const money = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

const formatDate = (iso) => {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const Orders = () => {
  const { orders } = useOrders();
  const [openId, setOpenId] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-xs font-extrabold tracking-widest text-slate-500">PROFILE</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          Your orders
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-600">
          Track purchases placed from this device with your account.
        </p>

        {orders.length === 0 ? (
          <div className="mt-10 rounded-3xl bg-white p-10 text-center ring-1 ring-slate-200 shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 ring-1 ring-slate-200">
              <FiPackage className="text-2xl" aria-hidden />
            </div>
            <h2 className="mt-5 text-lg font-black text-slate-950">No orders yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-slate-600">
              When you complete checkout, your orders will appear here.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white shadow-sm ring-1 ring-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-900"
            >
              Start shopping
              <FiArrowRight />
            </Link>
          </div>
        ) : (
          <ul className="mt-10 flex flex-col gap-4">
            {orders.map((order) => {
              const expanded = openId === order.id;
              const lineCount = order.lines?.length ?? 0;
              return (
                <li
                  key={order.id}
                  className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenId((v) => (v === order.id ? null : order.id))}
                    className="flex w-full items-start gap-4 p-4 text-left transition hover:bg-slate-50/80 sm:items-center sm:p-5"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                      <FiPackage className="text-xl" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-extrabold text-slate-950">
                          {order.id}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-100">
                          {order.status || "Processing"}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <FiCalendar className="opacity-70" />
                          {formatDate(order.placedAt)}
                        </span>
                        <span>
                          {lineCount} item{lineCount === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-base font-black tabular-nums text-slate-950">
                        {money(order.total)}
                      </p>
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-extrabold text-sky-700">
                        {expanded ? (
                          <>
                            Hide <FiChevronUp />
                          </>
                        ) : (
                          <>
                            Details <FiChevronDown />
                          </>
                        )}
                      </span>
                    </div>
                  </button>

                  {expanded ? (
                    <div className="border-t border-slate-200 bg-slate-50/80 px-4 py-4 sm:px-5">
                      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                          Payment
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{order.paymentLabel}</p>
                      </div>

                      {order.shipping ? (
                        <div className="mt-3 rounded-xl bg-white p-4 ring-1 ring-slate-200">
                          <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                            Delivery
                          </p>
                          <p className="mt-1 text-sm font-extrabold text-slate-950">{order.shipping.fullName}</p>
                          <p className="mt-0.5 text-sm font-medium text-slate-700">{order.shipping.address}</p>
                          <p className="text-sm font-medium text-slate-700">
                            {order.shipping.city}, {order.shipping.state} — {order.shipping.pin}
                          </p>
                        </div>
                      ) : null}


                      <ul className="mt-3 divide-y divide-slate-200 rounded-xl bg-white ring-1 ring-slate-200">
                        {(order.lines || []).map((line, idx) => (
                          <li key={`${line.id}-${idx}`} className="flex gap-3 p-3 first:rounded-t-xl last:rounded-b-xl">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                              {line.image ? (
                                <img
                                  src={line.image}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  draggable={false}
                                />
                              ) : (
                                <div className="grid h-full place-items-center text-[10px] font-bold text-slate-400">
                                  —
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-extrabold text-slate-950">{line.title}</p>
                              <p className="mt-0.5 text-xs font-semibold text-slate-500">
                                Qty {line.quantity}
                                {line.color ? ` · ${line.color}` : ""}
                                {line.size ? ` · ${line.size}` : ""}
                              </p>
                            </div>
                            <p className="shrink-0 text-sm font-black tabular-nums text-slate-950">
                              {money((line.price || 0) * (line.quantity || 0))}
                            </p>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <FiHash />
                          Order reference for support
                        </span>
                        <span className="font-mono font-bold text-slate-700">{order.id}</span>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-sky-700 underline decoration-sky-200 underline-offset-4 hover:text-sky-900"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
};

export default Orders;
