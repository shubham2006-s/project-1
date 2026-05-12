import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiFilter, FiSearch } from "react-icons/fi";
import HeroSlider from "./HeroSlider";
import ProductCard from "./ProductCard";
import API from "../../util/api";

const badgeFromPrice = (price) => {
  if (price <= 500) return "Value";
  if (price <= 1200) return "Trending";
  if (price <= 3500) return "Best seller";
  return "Premium";
};

const brandFromTitle = (title) => {
  const t = String(title || "");
  const word = t.split(" ").find((w) => w.length >= 4) || "Brand";
  return word.replace(/[^a-z0-9]/gi, "").slice(0, 12) || "Brand";
};

const normalizeExternalProduct = (p) => {
  const id = p?._id || `api-${Math.random().toString(16).slice(2)}`;
  const price = Number(p?.price) || 999;
  const mrp = Number(p?.mrp) || Math.round(price * 1.35);
  const rate = Number(p?.rating) || 4.2;
  const count = Number(p?.reviews) || 120;
  const title = String(p?.title || "Product");
  const category = String(p?.category || "General");
  const image = String(p?.image || "");

  return {
    id,
    title,
    brand: p?.brand || brandFromTitle(title),
    category: category[0]?.toUpperCase() + category.slice(1),
    price,
    mrp,
    rating: Math.max(3.8, Math.min(4.9, Math.round(rate * 10) / 10)),
    reviews: Math.max(20, count),
    badge: p?.badge || badgeFromPrice(price),
    image,
    stock: p?.stock ?? 0,
    stockStatus: p?.stockStatus || "in stock",
    lowStockThreshold: p?.lowStockThreshold || 5,
  };
};

const FALLBACK_PRODUCTS = [
  {
    id: "p-1",
    title: "AirFlex Runner Sneakers",
    brand: "Aurum",
    category: "Shoes",
    price: 2999,
    mrp: 4499,
    rating: 4.6,
    reviews: 1382,
    badge: "Best seller",
    image:
      "https://www.campusshoes.com/cdn/shop/files/LEVEL_LEVEL_WHT-L.GRY_07_831c7a2c-ff1b-4011-9268-b11f984219c6.webp?v=1757580207",
  },
  {
    id: "p-2",
    title: "NoiseCancel Wireless Headphones",
    brand: "Sonic",
    category: "Electronics",
    price: 6499,
    mrp: 8999,
    rating: 4.4,
    reviews: 824,
    badge: "Deal",
    image:
      "https://www.boat-lifestyle.com/cdn/shop/files/Artboard_2_47c2719f-e0f0-4cba-97dd-39821af9454a_1800x.png?v=1752729573",
  },
  {
    id: "p-3",
    title: "Everyday Oversized Hoodie",
    brand: "Northline",
    category: "Fashion",
    price: 1599,
    mrp: 2299,
    rating: 4.5,
    reviews: 512,
    badge: "Trending",
    image:
      "https://image.hm.com/assets/hm/cb/83/cb83dc14110d0dcf79088d373dd74d8dcb1eb0d7_xxl-1.jpg",
  },
  {
    id: "p-4",
    title: "Classic Leather Wallet",
    brand: "Canto",
    category: "Accessories",
    price: 899,
    mrp: 1299,
    rating: 4.3,
    reviews: 291,
    badge: "Premium",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBEvqlW9QWsZ2DCx_fcIVwJ1ThQK5eVTMtOQ&s",
  },
  {
    id: "p-5",
    title: "Minimal Analog Watch (Steel)",
    brand: "TimeArc",
    category: "Accessories",
    price: 3799,
    mrp: 5299,
    rating: 4.7,
    reviews: 944,
    badge: "Top rated",
    image: "https://orsga.in/cdn/shop/files/9237BlackGold-4_600x.jpg?v=1718876298",
  },
  {
    id: "p-6",
    title: "Smart LED Desk Lamp",
    brand: "Glow",
    category: "Home",
    price: 1399,
    mrp: 1999,
    rating: 4.2,
    reviews: 218,
    badge: "New",
    image: "https://chronoslights.com/cdn/shop/files/Untitleddesign_1.png?v=1711706269&width=1080",
  },
  {
    id: "p-7",
    title: "Cotton Relaxed Fit T-Shirt",
    brand: "Basics",
    category: "Fashion",
    price: 549,
    mrp: 799,
    rating: 4.1,
    reviews: 1770,
    badge: "Value",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcHb9gF_OV_aNrLEyBd6-7DD56t-_yfVzIbg&s",
  },
  {
    id: "p-8",
    title: "TrailGrip Outdoor Sandals",
    brand: "Aurum",
    category: "Shoes",
    price: 1799,
    mrp: 2499,
    rating: 4.4,
    reviews: 363,
    badge: "Limited",
    image:
      "https://inc5shop.com/cdn/shop/files/INC-900321_Peach_1_045a5e3e-c00f-419d-890d-ca5f54949c52.jpg?v=1755491705",
  },
];

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

const sampleProducts = FALLBACK_PRODUCTS;

const SEARCH_DEBOUNCE_MS = 380;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const searchDebounceRef = useRef(null);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const cardRefs = useRef([]);
  const [products, setProducts] = useState(sampleProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [products]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get("/api/products");
        const data = res.data;
        const normalized = Array.isArray(data) ? data.map(normalizeExternalProduct) : [];

        if (!cancelled) {
          setProducts(normalized.length ? normalized : FALLBACK_PRODUCTS);
        }
      } catch (e) {
        if (!cancelled) {
          setProducts(FALLBACK_PRODUCTS);
          setError("Could not load live products. Showing fallback catalog.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const commitQueryToUrl = useCallback(
    (value) => {
      const trimmed = value.trim();
      setSearchParams(trimmed ? { q: trimmed } : {}, { replace: true });
    },
    [setSearchParams]
  );

  useEffect(() => {
    const fromUrl = searchParams.get("q") ?? "";
    setQuery(fromUrl);
  }, [searchParams]);

  const handleQueryChange = useCallback(
    (value) => {
      setQuery(value);
      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = window.setTimeout(() => {
        commitQueryToUrl(value);
      }, SEARCH_DEBOUNCE_MS);
    },
    [commitQueryToUrl]
  );

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });

    if (sort === "price-asc") items = items.slice().sort((a, b) => a.price - b.price);
    if (sort === "price-desc") items = items.slice().sort((a, b) => b.price - a.price);
    if (sort === "rating") items = items.slice().sort((a, b) => b.rating - a.rating);

    return items;
  }, [products, query, category, sort]);

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean);

    cards.forEach((card) => {
      card.classList.add("opacity-0", "translate-y-3");
      card.classList.remove("opacity-100", "translate-y-0");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0", "translate-y-3");

            entry.target.classList.add(
              "opacity-100",
              "translate-y-0"
            );

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    cards.forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [filtered]);

  return (
    <div className="min-h-screen bg-slate-50">
      <HeroSlider />

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold tracking-widest text-slate-500">SHOP</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Discover products you’ll love
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium text-slate-600">
                Curated picks, fast delivery, and easy returns—built like a real-world store front.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                In stock
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                Free returns
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 shadow-sm sm:grid-cols-12 sm:gap-4">
            <div className="sm:col-span-6">
              <label className="sr-only" htmlFor="product-search">
                Search products
              </label>
              <div className="relative">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="product-search"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Search by product, brand, or category…"
                  className={[
                    "h-11 w-full rounded-xl bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-900",
                    "ring-1 ring-slate-200 outline-none transition",
                    "focus:bg-white focus:ring-2 focus:ring-sky-500",
                  ].join(" ")}
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="sr-only" htmlFor="product-category">
                Category
              </label>
              <div className="relative">
                <FiFilter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  id="product-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={[
                    "h-11 w-full appearance-none rounded-xl bg-slate-50 pl-10 pr-10 text-sm font-bold text-slate-900",
                    "ring-1 ring-slate-200 outline-none transition",
                    "focus:bg-white focus:ring-2 focus:ring-sky-500",
                  ].join(" ")}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="m7 10 5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="sr-only" htmlFor="product-sort">
                Sort
              </label>
              <div className="relative">
                <select
                  id="product-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className={[
                    "h-11 w-full appearance-none rounded-xl bg-slate-50 px-3 pr-10 text-sm font-bold text-slate-900",
                    "ring-1 ring-slate-200 outline-none transition",
                    "focus:bg-white focus:ring-2 focus:ring-sky-500",
                  ].join(" ")}
                >
                  <option value="featured">Featured</option>
                  <option value="rating">Top rated</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="m7 10 5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="sm:col-span-12 flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-xs font-semibold text-slate-600">
                Showing <span className="font-extrabold text-slate-900">{filtered.length}</span> items
              </p>
              <button
                type="button"
                onClick={() => {
                  if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
                  setQuery("");
                  commitQueryToUrl("");
                  setCategory("All");
                  setSort("featured");
                }}
                className="text-xs font-extrabold text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-950"
              >
                Reset filters
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 ring-1 ring-amber-200">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-slate-200">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <FiSearch />
              </div>
              <h2 className="mt-4 text-base font-black text-slate-950">No matches found</h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                Try a different keyword or switch categories.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p, idx) => (
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
    </div>
  );
};

export default Products;