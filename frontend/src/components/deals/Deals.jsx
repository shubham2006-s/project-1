import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiClock, FiTag, FiTrendingDown } from "react-icons/fi";

const money = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const pad2 = (n) => String(Math.max(0, Math.floor(n))).padStart(2, "0");

const msToParts = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return { d, h, m, sec };
};

const pickBadge = (offPct, endsInMs) => {
  if (endsInMs <= 30 * 60 * 1000) return "Ending soon";
  if (offPct >= 50) return "Mega deal";
  if (offPct >= 35) return "Hot deal";
  return "Deal";
};

const FALLBACK_DEALS = [
  {
    id: "deal-1",
    title: "Noise-cancel Headphones Pro",
    brand: "Sonic",
    category: "Electronics",
    price: 2999,
    mrp: 5499,
    rating: 4.6,
    reviews: 1240,
    stockLeft: 14,
    stockTotal: 60,
    endsAt: Date.now() + 5.5 * 60 * 60 * 1000,
    image:
      "https://images.unsplash.com/photo-1518441311925-10f7f4c0b3d3?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "deal-2",
    title: "Everyday Sneakers — Cloud Step",
    brand: "Northline",
    category: "Fashion",
    price: 1799,
    mrp: 2999,
    rating: 4.4,
    reviews: 688,
    stockLeft: 9,
    stockTotal: 40,
    endsAt: Date.now() + 2.2 * 60 * 60 * 1000,
    image:
      "https://images.unsplash.com/photo-1528701800489-20be3c6ea3d7?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "deal-3",
    title: "Minimal Desk Lamp (Warm Glow)",
    brand: "Glow",
    category: "Home",
    price: 899,
    mrp: 1499,
    rating: 4.5,
    reviews: 302,
    stockLeft: 21,
    stockTotal: 80,
    endsAt: Date.now() + 9.25 * 60 * 60 * 1000,
    image:
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "deal-4",
    title: "Premium Sling Bag — CityLite",
    brand: "Canto",
    category: "Accessories",
    price: 1099,
    mrp: 1999,
    rating: 4.3,
    reviews: 412,
    stockLeft: 6,
    stockTotal: 25,
    endsAt: Date.now() + 45 * 60 * 1000,
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=60",
  },
];

const normalizeExternalDeal = (p, idx) => {
  const id = p?.id != null ? `deal-api-${p.id}` : `deal-api-${idx}-${Math.random().toString(16).slice(2)}`;
  const title = String(p?.title || "Product");
  const brand = String(p?.brand || "Brand");
  const category = String(p?.category || "General");
  const image = String(p?.thumbnail || "");

  const base = Number(p?.price) || 999;
  const stock = Number(p?.stock) || 60;
  const rating = Number(p?.rating) || 4.2;

  const offPct = clamp(18 + ((idx * 11) % 45), 18, 62);
  const mrp = Math.round(base * (1 + offPct / 70));
  const price = Math.max(199, Math.round(mrp * (1 - offPct / 100)));

  const stockTotal = clamp(Math.round(stock * 1.2), 20, 200);
  const stockLeft = clamp(Math.round(stock * (0.25 + ((idx % 6) / 10))), 3, stockTotal);

  const endsAt = Date.now() + (30 + ((idx * 37) % 690)) * 60 * 1000;

  return {
    id,
    title,
    brand,
    category: category[0]?.toUpperCase() + category.slice(1),
    price: Math.round(price * 100),
    mrp: Math.round(mrp * 100),
    rating: Math.max(3.8, Math.min(4.9, Math.round(rating * 10) / 10)),
    reviews: Math.max(40, stock),
    stockLeft,
    stockTotal,
    endsAt,
    image,
  };
};

const SkeletonCard = () => (
  <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
    <div className="aspect-4/3 w-full animate-pulse bg-slate-100" />
    <div className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
        <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
      </div>
      <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-slate-100" />
      <div className="mt-4 h-2 w-full animate-pulse rounded bg-slate-100" />
      <div className="mt-4 flex items-center justify-between">
        <div className="h-5 w-24 animate-pulse rounded bg-slate-100" />
        <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  </div>
);

const DealCard = ({ d, index, cardRef, now }) => {
  const offPct = Math.max(0, Math.round(((d.mrp - d.price) / d.mrp) * 100));
  const endsIn = Math.max(0, d.endsAt - now);
  const t = msToParts(endsIn);
  const badge = pickBadge(offPct, endsIn);

  const soldPct = clamp(Math.round(((d.stockTotal - d.stockLeft) / d.stockTotal) * 100), 0, 100);
  const lowStock = d.stockLeft <= 10;

  const urgencyTone =
    endsIn <= 30 * 60 * 1000
      ? "bg-rose-500/90"
      : endsIn <= 2 * 60 * 60 * 1000
        ? "bg-amber-500/90"
        : "bg-slate-950/90";

  const barTone =
    endsIn <= 30 * 60 * 1000
      ? "from-rose-500 to-fuchsia-500"
      : endsIn <= 2 * 60 * 60 * 1000
        ? "from-amber-500 to-orange-500"
        : "from-sky-500 to-fuchsia-500";

  return (
    <article
      ref={cardRef}
      data-idx={index}
      className={[
        "group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition",
        "hover:shadow-xl hover:ring-slate-300",
        "motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out",
        "opacity-0 translate-y-3",
      ].join(" ")}
      style={{ transitionDelay: `${Math.min(index * 60, 420)}ms` }}
    >
      <Link
        to={`/product/${d.id}`}
        state={{ product: d }}
        className="relative block aspect-4/3 w-full overflow-hidden bg-slate-100"
        aria-label={`View deal for ${d.title}`}
      >
        <img
          src={d.image}
          alt={d.title}
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
          loading="lazy"
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-white ring-1 ring-white/10 backdrop-blur",
              urgencyTone,
            ].join(" ")}
          >
            <FiClock className="-mt-px" />
            {pad2(t.h + t.d * 24)}:{pad2(t.m)}:{pad2(t.sec)}
          </span>
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-slate-900 ring-1 ring-slate-200/70 backdrop-blur">
            {badge}
          </span>
        </div>

        {offPct >= 10 ? (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-white ring-1 ring-white/10 backdrop-blur">
              <FiTrendingDown className="-mt-px" />
              {offPct}% OFF
            </span>
          </div>
        ) : null}
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-500">{d.brand}</p>
            <h3 className="mt-1 line-clamp-2 text-sm font-extrabold tracking-tight text-slate-900">
              <Link
                to={`/product/${d.id}`}
                state={{ product: d }}
                className="rounded outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                {d.title}
              </Link>
            </h3>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
            {d.category}
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span className={lowStock ? "text-rose-700" : ""}>
              {lowStock ? `Only ${d.stockLeft} left` : `${d.stockLeft} left`}
            </span>
            <span className="text-slate-500">{soldPct}% claimed</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
            <div
              className={`h-full bg-linear-to-r ${barTone} transition-[width] duration-500 ease-out`}
              style={{ width: `${soldPct}%` }}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="text-base font-black text-slate-950">{money(d.price)}</div>
            <div className="text-xs font-semibold text-slate-500">
              MRP <span className="line-through">{money(d.mrp)}</span>
            </div>
          </div>

          <button
            type="button"
            className={[
              "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-extrabold",
              "bg-slate-950 text-white shadow-sm ring-1 ring-slate-900/10",
              "transition hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-md active:translate-y-0",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
            ].join(" ")}
            aria-label="Grab deal"
          >
            <FiTag />
            Grab deal
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
        <div className="absolute -left-24 -top-24 h-48 w-48 rounded-full bg-sky-400/10 blur-2xl" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-fuchsia-400/10 blur-2xl" />
      </div>
    </article>
  );
};

const Deals = ({ limit = 8, showHeader = true }) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const cardRefs = useRef([]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("https://dummyjson.com/products?limit=32");
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();

        const raw = Array.isArray(data.products) ? data.products : [];
        const filtered = raw.filter(
          (p) => !["groceries", "fragrances", "skincare"].includes(String(p?.category || "").toLowerCase())
        );

        const normalized = filtered.map(normalizeExternalDeal);

        const sorted = normalized
          .map((d) => ({
            ...d,
            offPct: Math.max(0, Math.round(((d.mrp - d.price) / d.mrp) * 100)),
            endsIn: d.endsAt - Date.now(),
          }))
          .sort((a, b) => (b.offPct - a.offPct) || (a.endsIn - b.endsIn));

        const picked = sorted.slice(0, Math.max(4, limit)).map(({ offPct, endsIn, ...d }) => d);

        if (!cancelled) setDeals(picked.length ? picked.slice(0, limit) : FALLBACK_DEALS.slice(0, limit));
      } catch (e) {
        if (!cancelled) {
          setDeals(FALLBACK_DEALS.slice(0, limit));
          setError("Could not load live deals. Showing a curated fallback.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  const items = useMemo(() => deals.slice(0, limit), [deals, limit]);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      cardRefs.current.forEach((el) => {
        if (!el) return;
        el.classList.remove("opacity-0", "translate-y-3");
        el.classList.add("opacity-100", "translate-y-0");
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target;
          el.classList.remove("opacity-0", "translate-y-3");
          el.classList.add("opacity-100", "translate-y-0");
          io.unobserve(el);
        }
      },
      { rootMargin: "120px 0px" }
    );

    cardRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [items.length]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {showHeader ? (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold tracking-widest text-slate-500">LIVE</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Today’s Deals
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-600">
              Limited-time offers with live countdowns and stock meters—feels like a real storefront.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Updating live
            </div>
            <Link
              to="/"
              className="text-xs font-extrabold text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-950"
            >
              Back to shop
            </Link>
          </div>
        </header>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 ring-1 ring-amber-200">
          {error}
        </div>
      ) : null}

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: Math.min(12, Math.max(4, limit)) }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-slate-200">
            <h3 className="text-base font-black text-slate-950">No deals right now</h3>
            <p className="mt-1 text-sm font-medium text-slate-600">Check back soon—fresh deals drop throughout the day.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((d, idx) => (
              <DealCard
                key={d.id}
                d={d}
                index={idx}
                now={now}
                cardRef={(el) => {
                  cardRefs.current[idx] = el;
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Deals;
