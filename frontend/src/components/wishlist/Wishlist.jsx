import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiHeart,
  FiShoppingCart,
  FiTrash2,
} from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const money = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

const Wishlist = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [removing, setRemoving] = useState(() => new Set());
  const [addedId, setAddedId] = useState(null);

  const scheduleRemove = (id) => {
    setRemoving((prev) => new Set(prev).add(id));
    window.setTimeout(() => {
      removeFromWishlist(id);
      setRemoving((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 280);
  };

  const handleMoveToCart = (line, imgEl) => {
    addToCart(
      {
        id: line.id,
        title: line.title,
        brand: line.brand,
        category: line.category,
        price: line.price,
        mrp: line.mrp,
        rating: line.rating,
        reviews: line.reviews,
        badge: line.badge,
        image: line.image,
      },
      { flyFromEl: imgEl }
    );
    setAddedId(line.id);
    window.setTimeout(() => setAddedId(null), 700);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-xs font-extrabold tracking-widest text-slate-500">SAVED</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          Wishlist
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-600">
          Items you love — move them to your bag when you’re ready to buy.
        </p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl bg-white p-10 text-center ring-1 ring-slate-200 shadow-sm sm:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 ring-1 ring-rose-100">
              <FiHeart className="text-2xl" aria-hidden />
            </div>
            <h2 className="mt-6 text-lg font-black text-slate-950">Your wishlist is empty</h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-600">
              Tap the heart on any product to save it here for later.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white shadow-sm ring-1 ring-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-900"
            >
              Browse products
              <FiArrowRight />
            </Link>
          </div>
        ) : (
          <ul className="mt-10 flex flex-col gap-4">
            {items.map((line) => {
              const leaving = removing.has(line.id);
              const justAdded = addedId === line.id;
              return (
                <li
                  key={line.id}
                  className={[
                    "overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm",
                    leaving
                      ? "motion-safe:scale-[0.99] motion-safe:opacity-0 motion-safe:-translate-x-1"
                      : "",
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
                          rating: line.rating,
                          reviews: line.reviews,
                          badge: line.badge,
                          image: line.image,
                        },
                      }}
                      className="group relative shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200 sm:h-28 sm:w-36"
                    >
                      <div className="aspect-4/3 w-full sm:aspect-auto sm:h-full">
                        {line.image ? (
                          <img
                            data-wishlist-img
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
                            rating: line.rating,
                            reviews: line.reviews,
                            badge: line.badge,
                            image: line.image,
                          },
                        }}
                        className="mt-0.5 block text-base font-extrabold tracking-tight text-slate-950 hover:text-sky-700"
                      >
                        {line.title}
                      </Link>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{line.category}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="text-lg font-black text-slate-950">{money(line.price)}</span>
                        <span className="text-xs font-semibold text-slate-500 line-through">
                          {money(line.mrp)}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
                      <button
                        type="button"
                        disabled={leaving}
                        onClick={(e) => {
                          const li = e.currentTarget.closest("li");
                          const img = li?.querySelector("[data-wishlist-img]");
                          handleMoveToCart(line, img);
                        }}
                        className={[
                          "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold",
                          "bg-slate-950 text-white ring-1 ring-slate-900/10 transition hover:bg-slate-900",
                          "disabled:opacity-40",
                          justAdded ? "ring-2 ring-emerald-400/90" : "",
                        ].join(" ")}
                      >
                        <FiShoppingCart />
                        {justAdded ? "Added" : "Add to cart"}
                      </button>
                      <button
                        type="button"
                        disabled={leaving}
                        onClick={() => scheduleRemove(line.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-50 disabled:opacity-40"
                      >
                        <FiTrash2 />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
