import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiGithub, FiInstagram, FiMail, FiMapPin, FiPhone } from "react-icons/fi";

const Footer = () => {
  const rootRef = useRef(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    el.classList.add("opacity-0", "translate-y-2");
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
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer
      ref={rootRef}
      className={[
        "mt-16 border-t border-slate-200 bg-white",
        "motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out",
      ].join(" ")}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="inline-flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white shadow-sm ring-1 ring-slate-900/10">
                <span className="text-sm font-black tracking-tight">E</span>
              </div>
              <div>
                <p className="text-base font-black tracking-tight text-slate-950">E-Commerce</p>
                <p className="text-xs font-semibold text-slate-600">Fast delivery • Easy returns</p>
              </div>
            </div>

            <p className="mt-4 max-w-sm text-sm font-medium text-slate-600">
              A real-world storefront experience—curated products, smooth UX, and delightful animations.
              Built with React + Tailwind.
            </p>

            <div className="mt-5 grid gap-2 text-sm font-semibold text-slate-700">
              <p className="inline-flex items-center gap-2">
                <FiMapPin className="text-slate-500" />
                India (shipping across major cities)
              </p>
              <p className="inline-flex items-center gap-2">
                <FiPhone className="text-slate-500" />
                +91 90000 00000
              </p>
              <p className="inline-flex items-center gap-2">
                <FiMail className="text-slate-500" />
                support@shop.example
              </p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <p className="text-sm font-extrabold text-slate-950">Stay in the loop</p>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Get deals, drops, and product updates. No spam.
            </p>

            <form
              className="mt-4 flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email"
                className={[
                  "h-11 w-full rounded-2xl bg-slate-50 px-4 text-sm font-semibold text-slate-900",
                  "ring-1 ring-slate-200 outline-none transition",
                  "focus:bg-white focus:ring-2 focus:ring-sky-500",
                ].join(" ")}
              />
              <button
                type="submit"
                className={[
                  "inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-extrabold",
                  "bg-slate-950 text-white shadow-sm ring-1 ring-slate-900/10",
                  "transition hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-md active:translate-y-0",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                ].join(" ")}
              >
                Subscribe
                <FiArrowRight />
              </button>
            </form>

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200 sm:grid-cols-4">
              {[
                { k: "Secure", v: "Checkout" },
                { k: "Fast", v: "Delivery" },
                { k: "Easy", v: "Returns" },
                { k: "24/7", v: "Support" },
              ].map((x) => (
                <div key={x.k}>
                  <p className="text-sm font-black text-slate-950">{x.k}</p>
                  <p className="text-xs font-semibold text-slate-600">{x.v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-extrabold text-slate-950">Shop</p>
                <ul className="mt-3 grid gap-2 text-sm font-semibold text-slate-600">
                  <li>
                    <Link className="transition hover:text-slate-950" to="/">
                      New arrivals
                    </Link>
                  </li>
                  <li>
                    <Link className="transition hover:text-slate-950" to="/">
                      Best sellers
                    </Link>
                  </li>
                  <li>
                    <Link className="transition hover:text-slate-950" to="/">
                      Deals
                    </Link>
                  </li>
                  <li>
                    <Link className="transition hover:text-slate-950" to="/">
                      Categories
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-sm font-extrabold text-slate-950">Company</p>
                <ul className="mt-3 grid gap-2 text-sm font-semibold text-slate-600">
                  <li>
                    <Link className="transition hover:text-slate-950" to="/">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link className="transition hover:text-slate-950" to="/">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link className="transition hover:text-slate-950" to="/">
                      Privacy policy
                    </Link>
                  </li>
                  <li>
                    <Link className="transition hover:text-slate-950" to="/">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <p className="mt-8 text-sm font-extrabold text-slate-950">Follow</p>
            <div className="mt-3 flex items-center gap-2">
              {[
                { label: "GitHub", icon: <FiGithub />, href: "#" },
                { label: "Instagram", icon: <FiInstagram />, href: "#" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  onClick={(e) => e.preventDefault()}
                  className={[
                    "inline-flex h-11 w-11 items-center justify-center rounded-2xl",
                    "bg-white text-slate-900 ring-1 ring-slate-200 shadow-sm",
                    "transition hover:-translate-y-0.5 hover:shadow-md hover:ring-slate-300 active:translate-y-0",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                  ].join(" ")}
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-slate-600">
            © {year} <span className="font-extrabold text-slate-900">E-Commerce</span>. All rights
            reserved.
          </p>
          <p className="text-xs font-semibold text-slate-600">
            Made with React • Tailwind • Smooth animations
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;