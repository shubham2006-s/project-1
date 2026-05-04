import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import {
  FiCheck,
  FiChevronDown,
  FiHeart,
  FiShield,
  FiShoppingCart,
  FiStar,
  FiTruck,
} from "react-icons/fi";

const money = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

const productSvg = (a, b, label = "Premium") =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1050" viewBox="0 0 1400 1050">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${a}"/>
        <stop offset="1" stop-color="${b}"/>
      </linearGradient>
      <radialGradient id="r" cx="30%" cy="25%" r="60%">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1400" height="1050" fill="url(#g)"/>
    <rect width="1400" height="1050" fill="url(#r)"/>
    <g opacity="0.22">
      <circle cx="1110" cy="190" r="190" fill="#fff"/>
      <circle cx="320" cy="880" r="260" fill="#fff"/>
    </g>
    <g fill="#ffffff" opacity="0.92" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial">
      <text x="90" y="150" font-size="34" font-weight="800" letter-spacing="1">REAL WORLD</text>
      <text x="90" y="230" font-size="64" font-weight="900" letter-spacing="-1">${label}</text>
    </g>
  </svg>
  `)}`;

const MOCK_PRODUCTS = [
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
    images: [
      productSvg("#0EA5E9", "#1D4ED8", "AirFlex Runner"),
      productSvg("#22C55E", "#0F172A", "Breathable Mesh"),
      productSvg("#A855F7", "#1D4ED8", "Cushioned Sole"),
      productSvg("#0F172A", "#06B6D4", "All-day Comfort"),
    ],
    colors: [
      { name: "Sky", swatch: "bg-sky-500" },
      { name: "Black", swatch: "bg-slate-900" },
      { name: "Mint", swatch: "bg-emerald-500" },
    ],
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"],
    highlights: [
      "Lightweight knit upper with breathable mesh zones",
      "Responsive foam midsole for long walks and runs",
      "Rubber outsole with multi-direction grip",
      "Padded collar and heel counter for stability",
    ],
    details:
      "Designed for everyday running and city wear. AirFlex Runner blends a breathable knit upper with responsive cushioning, making it a perfect pick for long days on your feet.",
    shipping: {
      delivery: "Delivery in 2–4 days",
      returns: "7-day easy return",
      warranty: "6-month manufacturing warranty",
    },
    specs: [
      { k: "Upper", v: "Knit mesh" },
      { k: "Midsole", v: "Responsive foam" },
      { k: "Outsole", v: "High-grip rubber" },
      { k: "Weight", v: "Approx. 280g (UK 8)" },
    ],
    reviewItems: [
      { name: "Shubham", stars: 5, text: "Super comfortable, looks premium. Great for daily wear." },
      { name: "Aditi", stars: 4, text: "Nice cushioning. Size runs a bit snug—go one size up." },
      { name: "Rahul", stars: 5, text: "Lightweight and breathable. Fast delivery." },
    ],
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
    images: [
      productSvg("#22C55E", "#0F172A", "NoiseCancel"),
      productSvg("#0F172A", "#06B6D4", "40h Battery"),
      productSvg("#F97316", "#0F172A", "Deep Bass"),
      productSvg("#6366F1", "#111827", "ANC + Transparency"),
    ],
    colors: [
      { name: "Graphite", swatch: "bg-slate-800" },
      { name: "Navy", swatch: "bg-blue-800" },
    ],
    sizes: ["Standard"],
    highlights: [
      "Hybrid ANC with transparency mode",
      "Up to 40 hours battery (typical use)",
      "Low-latency mode for gaming/video",
      "Comfort-fit ear cushions for long sessions",
    ],
    details:
      "Sonic NoiseCancel delivers immersive audio with reliable noise cancellation, tuned bass, and long battery life—ideal for travel, work, and gaming.",
    shipping: {
      delivery: "Delivery in 1–3 days",
      returns: "10-day replacement",
      warranty: "1-year warranty",
    },
    specs: [
      { k: "Connectivity", v: "Bluetooth 5.x" },
      { k: "Battery", v: "Up to 40 hours" },
      { k: "Charging", v: "USB-C fast charge" },
      { k: "Audio", v: "ANC + Transparency" },
    ],
    reviewItems: [
      { name: "Neha", stars: 5, text: "ANC is impressive for the price. Great sound stage." },
      { name: "Kunal", stars: 4, text: "Battery life is amazing. Mic is decent for calls." },
    ],
  },
];

const Stars = ({ value }) => {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <div className="inline-flex items-center gap-0.5 text-amber-500" aria-label={`${v} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar key={i} className={i < Math.round(v) ? "fill-current" : ""} />
      ))}
    </div>
  );
};

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
      >
        <span className="text-sm font-extrabold text-slate-900">{title}</span>
        <span
          className={[
            "inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200 transition",
            open ? "rotate-180" : "rotate-0",
          ].join(" ")}
          aria-hidden="true"
        >
          <FiChevronDown />
        </span>
      </button>
      <div className={[open ? "grid" : "hidden", "px-4 pb-4"].join(" ")}>{children}</div>
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const heroRef = useRef(null);
  const infoRef = useRef(null);
  const mainImgRef = useRef(null);

  const product = useMemo(() => {
    const fromState = location?.state?.product;
    if (fromState && typeof fromState === "object") {
      const base = fromState;
      const images = Array.isArray(base.images) && base.images.length
        ? base.images
        : [base.image].filter(Boolean);

      return {
        id: base.id ?? id ?? "p-unknown",
        title: base.title ?? "Product",
        brand: base.brand ?? "Brand",
        category: base.category ?? "Category",
        price: Number(base.price) || 999,
        mrp: Number(base.mrp) || Number(base.price) || 1299,
        rating: Number(base.rating) || 4.2,
        reviews: Number(base.reviews) || 120,
        badge: base.badge ?? "Trending",
        images,
        colors: base.colors ?? [
          { name: "Black", swatch: "bg-slate-900" },
          { name: "Sky", swatch: "bg-sky-500" },
          { name: "Mint", swatch: "bg-emerald-500" },
        ],
        sizes: base.sizes ?? ["Standard"],
        highlights: base.highlights ?? [
          "Fast delivery and easy returns",
          "Premium quality materials",
          "Top-rated by customers",
          "Secure packaging",
        ],
        details:
          base.details ??
          "A real-world e-commerce product page with polished UI, smooth interactions, and an engaging details experience.",
        shipping: base.shipping ?? {
          delivery: "Delivery in 2–4 days",
          returns: "7-day easy return",
          warranty: "6-month manufacturing warranty",
        },
        specs: base.specs ?? [
          { k: "Category", v: base.category ?? "—" },
          { k: "Brand", v: base.brand ?? "—" },
          { k: "Care", v: "Follow label/instructions" },
          { k: "In the box", v: "1 unit" },
        ],
        reviewItems: base.reviewItems ?? [
          { name: "Verified buyer", stars: 5, text: "Great quality and super quick delivery." },
          { name: "Customer", stars: 4, text: "Looks premium. Value for money." },
        ],
      };
    }

    if (!id) return MOCK_PRODUCTS[0];
    return MOCK_PRODUCTS.find((p) => p.id === id) ?? MOCK_PRODUCTS[0];
  }, [id, location?.state?.product]);

  const [activeImg, setActiveImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name ?? "Default");
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? "Standard");
  const [qty, setQty] = useState(1);
  const [cartFlash, setCartFlash] = useState(false);

  const wishlistPayload = useMemo(
    () => ({
      id: product.id,
      title: product.title,
      brand: product.brand,
      category: product.category,
      price: product.price,
      mrp: product.mrp,
      rating: product.rating,
      reviews: product.reviews,
      badge: product.badge,
      image: product.images?.[activeImg] ?? product.images?.[0] ?? "",
    }),
    [product, activeImg]
  );

  const savedToWishlist = isWishlisted(product.id);

  useEffect(() => {
    setActiveImg(0);
    setSelectedColor(product.colors?.[0]?.name ?? "Default");
    setSelectedSize(product.sizes?.[0] ?? "Standard");
    setQty(1);
  }, [product.id]);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const els = [heroRef.current, infoRef.current].filter(Boolean);
    for (const el of els) {
      el.classList.add("opacity-0", "translate-y-2");
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.remove("opacity-0", "translate-y-2");
          e.target.classList.add("opacity-100", "translate-y-0");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "120px 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const off = Math.max(0, Math.round(((product.mrp - product.price) / product.mrp) * 100));

  const handleAddToCart = () => {
    const image = product.images?.[activeImg] ?? product.images?.[0] ?? product.image;
    addToCart(
      { ...product, image },
      {
        quantity: qty,
        color: selectedColor,
        size: selectedSize,
        flyFromEl: mainImgRef.current,
      }
    );
    setCartFlash(true);
    window.setTimeout(() => setCartFlash(false), 700);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-xs font-semibold text-slate-600">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link className="hover:text-slate-950" to="/">
                Home
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="text-slate-500">{product.category}</li>
            <li className="text-slate-400">/</li>
            <li className="text-slate-950 font-extrabold">{product.title}</li>
          </ol>
        </nav>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <section
            ref={heroRef}
            className="lg:col-span-7 motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out"
          >
            <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm">
              <div className="relative aspect-4/3 bg-slate-100">
                <img
                  ref={mainImgRef}
                  src={product.images?.[activeImg] ?? product.images?.[0]}
                  alt={product.title}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent" />

                <div className="absolute left-4 top-4 flex items-center gap-2">
                  <span className="rounded-full bg-slate-950/90 px-3 py-1 text-[11px] font-extrabold tracking-wide text-white ring-1 ring-white/10 backdrop-blur">
                    {product.badge}
                  </span>
                  {off >= 10 ? (
                    <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-extrabold tracking-wide text-white ring-1 ring-white/10 backdrop-blur">
                      {off}% OFF
                    </span>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => toggleWishlist(wishlistPayload)}
                  aria-pressed={savedToWishlist}
                  aria-label={savedToWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  className={[
                    "absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-2xl backdrop-blur",
                    "ring-1 transition motion-safe:duration-200",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                    savedToWishlist
                      ? "bg-rose-500/95 text-white ring-rose-400 shadow-md"
                      : "bg-white/85 text-slate-900 ring-slate-200 hover:bg-white hover:shadow-md",
                  ].join(" ")}
                >
                  <FiHeart className={["text-[18px]", savedToWishlist ? "fill-current" : ""].join(" ")} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3 p-4">
                {product.images?.slice(0, 4).map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={[
                      "group overflow-hidden rounded-2xl bg-slate-100 ring-1 transition",
                      i === activeImg ? "ring-sky-500" : "ring-slate-200 hover:ring-slate-300",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                    ].join(" ")}
                    aria-label={`Preview image ${i + 1}`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="aspect-4/3 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      draggable={false}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside
            ref={infoRef}
            className="lg:col-span-5 motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out"
          >
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200 shadow-sm">
              <p className="text-xs font-extrabold tracking-widest text-slate-500">{product.brand}</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                {product.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-800 ring-1 ring-amber-100">
                  <Stars value={product.rating} />
                  <span>{Number(product.rating).toFixed(1)}</span>
                </div>
                <p className="text-sm font-semibold text-slate-600">
                  {product.reviews} reviews
                </p>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <div className="text-3xl font-black text-slate-950">{money(product.price)}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-500">
                    MRP <span className="line-through">{money(product.mrp)}</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                  <p className="text-xs font-bold text-slate-600">Offer</p>
                  <p className="text-sm font-extrabold text-slate-950">
                    Save {money(product.mrp - product.price)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <div>
                  <p className="text-xs font-extrabold text-slate-700">Color</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {product.colors?.map((c) => {
                      const active = c.name === selectedColor;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedColor(c.name)}
                          className={[
                            "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-bold ring-1 transition",
                            active
                              ? "bg-slate-950 text-white ring-slate-950"
                              : "bg-white text-slate-800 ring-slate-200 hover:ring-slate-300",
                          ].join(" ")}
                        >
                          <span className={["h-3.5 w-3.5 rounded-full", c.swatch].join(" ")} />
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-extrabold text-slate-700">Size</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.sizes?.map((s) => {
                      const active = s === selectedSize;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={[
                            "rounded-2xl px-3 py-2 text-sm font-extrabold ring-1 transition",
                            active
                              ? "bg-sky-500 text-slate-950 ring-sky-400"
                              : "bg-white text-slate-800 ring-slate-200 hover:ring-slate-300",
                          ].join(" ")}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                  <p className="text-xs font-extrabold text-slate-700">Quantity</p>
                  <div className="inline-flex items-center overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="h-10 w-11 font-black text-slate-900 hover:bg-slate-50"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <div className="h-10 w-12 grid place-items-center text-sm font-black text-slate-950">
                      {qty}
                    </div>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(10, q + 1))}
                      className="h-10 w-11 font-black text-slate-900 hover:bg-slate-50"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={[
                      "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold",
                      "bg-slate-950 text-white shadow-sm ring-1 ring-slate-900/10",
                      "motion-safe:transition motion-safe:duration-300",
                      "hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-md active:translate-y-0",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                      cartFlash ? "motion-safe:ring-2 motion-safe:ring-emerald-400/90" : "",
                    ].join(" ")}
                  >
                    <FiShoppingCart />
                    {cartFlash ? "Added to cart" : "Add to cart"}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={[
                      "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold",
                      "bg-sky-400/95 text-slate-950 ring-1 ring-sky-300",
                      "transition hover:-translate-y-0.5 hover:bg-sky-300 active:translate-y-0",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950",
                    ].join(" ")}
                  >
                    <FiCheck />
                    Buy now
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                    <div className="flex items-center gap-2 text-slate-900">
                      <FiTruck />
                      <p className="text-xs font-extrabold">Fast delivery</p>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-600">
                      {product.shipping.delivery}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                    <div className="flex items-center gap-2 text-slate-900">
                      <FiShield />
                      <p className="text-xs font-extrabold">Warranty</p>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-600">
                      {product.shipping.warranty}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                    <div className="flex items-center gap-2 text-slate-900">
                      <FiCheck />
                      <p className="text-xs font-extrabold">Returns</p>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-600">
                      {product.shipping.returns}
                    </p>
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-600">
                  Selected:{" "}
                  <span className="font-extrabold text-slate-950">
                    {selectedColor} • {selectedSize} • Qty {qty}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <Accordion title="Product details" defaultOpen>
                <p className="text-sm font-medium text-slate-700">{product.details}</p>
                <ul className="mt-4 grid gap-2">
                  {product.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm font-semibold text-slate-700">
                      <span className="mt-0.5 text-emerald-600">
                        <FiCheck />
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              </Accordion>

              <Accordion title="Specifications">
                <div className="grid gap-2">
                  {product.specs.map((s) => (
                    <div
                      key={s.k}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200"
                    >
                      <span className="text-xs font-extrabold text-slate-700">{s.k}</span>
                      <span className="text-xs font-semibold text-slate-600">{s.v}</span>
                    </div>
                  ))}
                </div>
              </Accordion>

              <Accordion title="Ratings & reviews">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-2xl font-black text-slate-950">{Number(product.rating).toFixed(1)}</p>
                    <p className="text-sm font-semibold text-slate-600">{product.reviews} reviews</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                    <p className="text-xs font-bold text-slate-600">Verified purchase</p>
                    <p className="mt-0.5 text-sm font-extrabold text-slate-950">Most customers recommend</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {product.reviewItems.map((r, idx) => (
                    <div
                      key={`${r.name}-${idx}`}
                      className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-extrabold text-slate-950">{r.name}</p>
                        <Stars value={r.stars} />
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-700">{r.text}</p>
                    </div>
                  ))}
                </div>
              </Accordion>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
