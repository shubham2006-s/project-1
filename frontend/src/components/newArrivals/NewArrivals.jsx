import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../products/ProductCard";
import API from "../../util/api";

const FALLBACK_PRODUCTS = [
  {
    id: "na-1",
    title: "CityLite Sling Bag",
    brand: "Canto",
    category: "Accessories",
    price: 1299,
    mrp: 1899,
    rating: 4.5,
    reviews: 412,
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "na-2",
    title: "Breeze Linen Shirt",
    brand: "Northline",
    category: "Fashion",
    price: 1699,
    mrp: 2399,
    rating: 4.3,
    reviews: 268,
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "na-3",
    title: "Aura Ceramic Mug Set",
    brand: "Glow",
    category: "Home",
    price: 799,
    mrp: 1199,
    rating: 4.6,
    reviews: 159,
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "na-4",
    title: "Pulse Smart Fitness Band",
    brand: "Sonic",
    category: "Electronics",
    price: 2499,
    mrp: 3499,
    rating: 4.4,
    reviews: 985,
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=60",
  },
];


const badgeFromPrice = (price) => {
  if (price <= 500) return "Value";
  if (price <= 1200) return "Trending";
  if (price <= 3500) return "New";
  return "Premium";
};

const brandFromTitle = (title) => {
  const t = String(title || "");
  const word = t.split(" ").find((w) => w.length >= 4) || "Brand";
  return word.replace(/[^a-z0-9]/gi, "").slice(0, 12) || "Brand";
};

const normalizeExternalProduct = (p) => {
  const id = p?._id || p?.id;

  const price = Number(p?.price) || 999;
  const mrp = Number(p?.mrp) || Math.round(price * 1.35);

  const title = String(p?.title || "Product");

  const category = String(p?.category || "General");

  const image =
    p?.image?.trim() ||
    p?.thumbnail?.trim() ||
    "https://via.placeholder.com/300x300?text=No+Image";

  return {
    id,

    title,

    brand: p?.brand || "Brand",

    category:
      category[0]?.toUpperCase() +
      category.slice(1),

    price,

    mrp,

    rating: Number(p?.rating) || 4.2,

    reviews: Number(p?.reviews) || 120,

    badge: p?.badge || "New",

    image,
  };
};

const SkeletonCard = () => (
  <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
    <div className="aspect-4/3 w-full animate-pulse bg-slate-100" />
    <div className="p-4">
      <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
      <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
      <div className="mt-4 flex items-center justify-between">
        <div className="h-5 w-24 animate-pulse rounded bg-slate-100" />
        <div className="h-9 w-20 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  </div>
);

const NewArrivals = ({ limit = 50, showHeader = true }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const cardRefs = useRef([]);

  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "";

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get("/api/products/new-arrivals");

        const data = res.data;
        const normalized = Array.isArray(data)
          ? data.map(normalizeExternalProduct)
          : [];
        const filtered = normalized.filter(
          (p) => !["groceries", "fragrances", "skincare"].includes(p.category.toLowerCase())
        );

        const picked = filtered
          .slice(-Math.max(4, limit))
          .reverse()
          .map((p) => ({ ...p, badge: "New" }));

        if (!cancelled) setProducts(picked.length ? picked.slice(0, limit) : FALLBACK_PRODUCTS.slice(0, limit));
      } catch (e) {
        if (!cancelled) {
          setProducts(FALLBACK_PRODUCTS.slice(0, limit));
          setError("Could not load live new arrivals. Showing a curated fallback.");
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

  const items = useMemo(() => {
    return products
      .filter((p) => {
        const q = query.toLowerCase();

        return (
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      })
      .slice(0, limit);
  }, [products, query, limit]);

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
            <p className="text-xs font-extrabold tracking-widest text-slate-500">DROP</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              New Arrivals
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-600">
              Fresh picks curated like a real-world storefront—updated often, easy to browse.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-fuchsia-500" />
              Fresh drop
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
            <h2 className="text-base font-black text-slate-950">No new arrivals right now</h2>
            <p className="mt-1 text-sm font-medium text-slate-600">Check back soon—new drops land frequently.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p, idx) => (
              <ProductCard
                key={p.id}
                p={p}
                index={idx}
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

export default NewArrivals;

