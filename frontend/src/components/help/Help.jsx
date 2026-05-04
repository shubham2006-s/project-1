import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiChevronDown,
  FiCreditCard,
  FiHeart,
  FiMail,
  FiPackage,
  FiPhone,
  FiRefreshCw,
  FiShield,
  FiTruck,
  FiUser,
} from "react-icons/fi";

const faqItems = [
  {
    q: "How do I track my order?",
    a: "After checkout, open Orders from your profile menu. Each order shows status and a summary of items. You’ll also see confirmation details on the order screen.",
  },
  {
    q: "What payment methods are supported?",
    a: "Checkout supports card-style flows and common demo options shown on the payment step. In production you would connect a real gateway (Razorpay, Stripe, etc.).",
  },
  {
    q: "How does the wishlist work?",
    a: "Tap the heart on a product card or product page. Saved items live in your browser on this device and appear on the Wishlist page until you remove them or clear site data.",
  },
  {
    q: "Can I change my delivery address?",
    a: "Use the address fields on checkout before placing the order. After an order is placed, contact support with your order ID for changes if the package has not shipped.",
  },
  {
    q: "What is your return policy?",
    a: "We offer easy returns within the window shown at checkout for eligible items. Initiate a return from your order details or reach support with your order number.",
  },
];

const Help = () => {
  const [openFaq, setOpenFaq] = useState(() => new Set([0]));

  const topics = useMemo(
    () => [
      {
        id: "shipping",
        title: "Shipping & delivery",
        blurb: "Timelines, coverage, and tracking.",
        icon: FiTruck,
        body: (
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-medium text-slate-600">
            <li>Standard delivery to major metros in 3–5 business days (demo copy).</li>
            <li>Express options may appear at checkout when available.</li>
            <li>Tracking and updates appear on your Orders page after purchase.</li>
          </ul>
        ),
      },
      {
        id: "returns",
        title: "Returns & exchanges",
        blurb: "How to start a return and refunds.",
        icon: FiRefreshCw,
        body: (
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-medium text-slate-600">
            <li>Unopened or eligible items in original condition within the return window.</li>
            <li>Refunds are issued to the original payment method after inspection.</li>
            <li>Contact support with your order ID if you need a pickup or label.</li>
          </ul>
        ),
      },
      {
        id: "payments",
        title: "Payments & security",
        blurb: "Checkout, cards, and data safety.",
        icon: FiCreditCard,
        body: (
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-medium text-slate-600">
            <li>Checkout is designed for a smooth, trustworthy payment experience.</li>
            <li>Card details are never stored on this demo storefront.</li>
            <li>For production, use PCI-compliant providers and HTTPS everywhere.</li>
          </ul>
        ),
      },
      {
        id: "account",
        title: "Account & wishlist",
        blurb: "Login, profile, and saved items.",
        icon: FiUser,
        body: (
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-medium text-slate-600">
            <li>Sign in from the navbar to access profile and orders.</li>
            <li>Wishlist is stored locally in your browser for quick access.</li>
            <li>Clearing site data will remove locally saved wishlist items.</li>
          </ul>
        ),
      },
    ],
    []
  );

  const toggleFaq = (index) => {
    setOpenFaq((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-xs font-extrabold tracking-widest text-slate-500">SUPPORT</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Help center</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-slate-600">
          Answers about orders, delivery, returns, and your account. For anything else, reach us using the
          contact options below.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            to="/orders"
            className="group flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-safe:duration-200"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white ring-1 ring-slate-900/10">
              <FiPackage className="text-xl" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-950">Orders</p>
              <p className="mt-1 text-xs font-semibold text-slate-600">View purchases and status</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-slate-900 group-hover:gap-2 motion-safe:transition-all">
                Go to orders
                <FiArrowRight className="opacity-70" aria-hidden />
              </span>
            </div>
          </Link>
          <Link
            to="/wishlist"
            className="group flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-safe:duration-200"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-500 text-white ring-1 ring-rose-600/20">
              <FiHeart className="text-xl" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-950">Wishlist</p>
              <p className="mt-1 text-xs font-semibold text-slate-600">Saved items on this device</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-slate-900 group-hover:gap-2 motion-safe:transition-all">
                Open wishlist
                <FiArrowRight className="opacity-70" aria-hidden />
              </span>
            </div>
          </Link>
        </div>

        <section className="mt-10 rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-sm sm:p-8">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
              <FiShield className="text-lg" aria-hidden />
            </span>
            <div>
              <h2 className="text-base font-black text-slate-950">Contact us</h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                Our team replies within one business day for most requests.
              </p>
              <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
                <p className="inline-flex items-center gap-2">
                  <FiMail className="text-slate-500" aria-hidden />
                  <a href="mailto:support@shop.example" className="text-slate-950 underline-offset-2 hover:underline">
                    support@shop.example
                  </a>
                </p>
                <p className="inline-flex items-center gap-2">
                  <FiPhone className="text-slate-500" aria-hidden />
                  <a href="tel:+919000000000" className="text-slate-950 underline-offset-2 hover:underline">
                    +91 90000 00000
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-black text-slate-950">Popular topics</h2>
          <p className="mt-1 text-sm font-medium text-slate-600">Jump into the details for each area.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {topics.map((t) => {
              const Icon = t.icon;
              return (
                <article
                  key={t.id}
                  id={t.id}
                  className="scroll-mt-24 rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-sm sm:p-6"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-800 ring-1 ring-slate-200">
                      <Icon className="text-lg" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-slate-950">{t.title}</h3>
                      <p className="mt-0.5 text-xs font-semibold text-slate-500">{t.blurb}</p>
                    </div>
                  </div>
                  {t.body}
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-10 rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-sm sm:p-8">
          <h2 className="text-lg font-black text-slate-950">Frequently asked questions</h2>
          <p className="mt-1 text-sm font-medium text-slate-600">Tap a question to show or hide the answer.</p>
          <ul className="mt-6 divide-y divide-slate-200">
            {faqItems.map((item, index) => {
              const open = openFaq.has(index);
              const panelId = `help-faq-panel-${index}`;
              const buttonId = `help-faq-button-${index}`;
              return (
                <li key={item.q} className="py-1">
                  <button
                    type="button"
                    id={buttonId}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="text-sm font-extrabold text-slate-950">{item.q}</span>
                    <FiChevronDown
                      className={[
                        "shrink-0 text-slate-500 motion-safe:transition-transform motion-safe:duration-200",
                        open ? "rotate-180" : "rotate-0",
                      ].join(" ")}
                      aria-hidden
                    />
                  </button>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    hidden={!open}
                    className="px-3 pb-3"
                  >
                    <p className="text-sm font-medium leading-relaxed text-slate-600">{item.a}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white shadow-sm ring-1 ring-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-900"
          >
            Back to home
            <FiArrowRight aria-hidden />
          </Link>
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-slate-900 ring-1 ring-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            View cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Help;
