import React, { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiStar } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const money = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

const ProductCard = ({ p, index, cardRef }) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const saved = isWishlisted(p.id);
  const articleRef = useRef(null);
  const [addedFlash, setAddedFlash] = useState(false);
  const off = Math.max(0, Math.round(((p.mrp - p.price) / p.mrp) * 100));

  const setArticleRef = useCallback(
    (el) => {
      articleRef.current = el;
      if (typeof cardRef === "function") cardRef(el);
    },
    [cardRef]
  );

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const img = articleRef.current?.querySelector("[data-card-img]");
    addToCart(p, { flyFromEl: img });
    setAddedFlash(true);
    window.setTimeout(() => setAddedFlash(false), 650);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(p);
  };

  return (
    <article
      ref={setArticleRef}
      data-idx={index}
      className={[
        "group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition",
        "hover:shadow-xl hover:ring-slate-300",
        "motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out",
        "opacity-0 translate-y-3",
      ].join(" ")}
      style={{ transitionDelay: `${Math.min(index * 60, 360)}ms` }}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
        <Link
          to={`/product/${p.id}`}
          state={{ product: p }}
          className="absolute inset-0 block"
          aria-label={`View ${p.title}`}
        >
          <img
            data-card-img
            src={p.image}
            alt={p.title}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
            loading="lazy"
            draggable={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2">
          <span className="rounded-full bg-slate-950/90 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-white ring-1 ring-white/10 backdrop-blur">
            {p.badge}
          </span>
          {off >= 10 ? (
            <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-white ring-1 ring-white/10 backdrop-blur">
              {off}% OFF
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleWishlist}
          aria-pressed={saved}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          className={[
            "absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full backdrop-blur",
            "ring-1 transition motion-safe:duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
            saved
              ? "bg-rose-500/95 text-white ring-rose-400 shadow-md motion-safe:scale-105"
              : "bg-white/85 text-slate-900 ring-slate-200 hover:bg-white hover:shadow-md",
          ].join(" ")}
        >
          <FiHeart className={["text-[18px]", saved ? "fill-current" : ""].join(" ")} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-500">{p.brand}</p>
            <h3 className="mt-1 line-clamp-2 text-sm font-extrabold tracking-tight text-slate-900">
              <Link
                to={`/product/${p.id}`}
                state={{ product: p }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded"
              >
                {p.title}
              </Link>
            </h3>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
            {p.category}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-extrabold text-amber-800 ring-1 ring-amber-100">
            <FiStar className="-mt-px" />
            {Number(p.rating).toFixed(1)}
          </div>
          <span className="text-xs font-semibold text-slate-500">({p.reviews} reviews)</span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <div className="text-base font-black text-slate-950">{money(p.price)}</div>
            <div className="text-xs font-semibold text-slate-500">
              MRP <span className="line-through">{money(p.mrp)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-extrabold",
              "bg-slate-950 text-white shadow-sm ring-1 ring-slate-900/10",
              "motion-safe:transition motion-safe:duration-300",
              "hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-md active:translate-y-0",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
              addedFlash ? "motion-safe:scale-105 motion-safe:ring-2 motion-safe:ring-emerald-400/90" : "",
            ].join(" ")}
            aria-label="Add to cart"
          >
            <FiShoppingCart className={addedFlash ? "motion-safe:animate-pulse" : ""} />
            {addedFlash ? "Added" : "Add"}
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

export default ProductCard;
