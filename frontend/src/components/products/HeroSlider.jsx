import React, { useEffect, useMemo, useRef, useState } from "react";

const heroSvg = (accentA, accentB, kicker, title) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1200" viewBox="0 0 2400 1200">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#070A15"/>
          <stop offset="0.45" stop-color="${accentA}"/>
          <stop offset="1" stop-color="${accentB}"/>
        </linearGradient>
        <radialGradient id="glow1" cx="25%" cy="20%" r="55%">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="glow2" cx="80%" cy="30%" r="55%">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="2400" height="1200" fill="url(#bg)"/>
      <rect width="2400" height="1200" fill="url(#glow1)"/>
      <rect width="2400" height="1200" fill="url(#glow2)"/>
      <g opacity="0.18">
        <circle cx="350" cy="880" r="260" fill="#fff"/>
        <circle cx="2200" cy="980" r="360" fill="#fff"/>
        <circle cx="1650" cy="220" r="220" fill="#fff"/>
      </g>
      <g opacity="0.22">
        <path d="M0 940 C 420 840, 640 1050, 1060 960 C 1480 870, 1700 1000, 2400 900 L 2400 1200 L 0 1200 Z" fill="#000"/>
      </g>
      <g font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" fill="#fff">
        <text x="140" y="250" font-size="44" font-weight="800" opacity="0.9">${kicker}</text>
        <text x="140" y="360" font-size="96" font-weight="900" letter-spacing="-1">${title}</text>
        <text x="140" y="440" font-size="40" font-weight="600" opacity="0.8">Premium e-commerce hero banner</text>
      </g>
    </svg>
  `)}`;

const HeroSlider = ({ slides: slidesProp }) => {
  const [active, setActive] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [animating, setAnimating] = useState(false);
  const touchStartX = useRef(null);
  const [brokenImages, setBrokenImages] = useState(() => ({}));

  const slides = useMemo(() => {
    // Prefer real product/hero images from your app (put files in `frontend/public/hero/`)
    // Example: `frontend/public/hero/slide-1.jpg` → use "/hero/slide-1.jpg"
    const fallback = [
      {
        title: "Top Picks in Fashion",
        subtitle: "Best sellers from top brands — delivered fast",
        cta: "Shop fashion",
        image: "https://templates.simplified.co/thumb/3446e660-7af3-4ff6-86ce-755afcde8fcd.jpg",
        fallbackImage: heroSvg("#5B21B6", "#0EA5E9", "Trending", "Top Picks"),
      },
      {
        title: "Shoes & Sneakers",
        subtitle: "New drops + limited time offers",
        cta: "Shop shoes",
        image: "https://mir-s3-cdn-cf.behance.net/project_modules/fs/296c65109831843.5ff5f1ebd274f.jpg",
        fallbackImage: heroSvg("#1D4ED8", "#A855F7", "New", "Sneakers"),
      },
      {
        title: "Electronics Deals",
        subtitle: "Gadgets you’ll love — easy returns",
        cta: "Browse tech",
        image: "https://mir-s3-cdn-cf.behance.net/project_modules/max_632_webp/091f5b179696429.64fea5e228032.jpg",
        fallbackImage: heroSvg("#0F172A", "#22C55E", "Deals", "Electronics"),
      },
    ];

    if (Array.isArray(slidesProp) && slidesProp.length > 0) return slidesProp;
    return fallback;
  }, [slidesProp]);

  const goTo = (idx) => {
    if (!slides.length) return;
    const next = (idx + slides.length) % slides.length;
    setAnimating(true);
    setActive(next);
    window.setTimeout(() => setAnimating(false), 650);
  };

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    if (isHovering) return;
    // Amazon-like: steady autoplay, pauses on hover/touch, doesn’t feel “too fast”.
    const id = window.setInterval(() => goTo(active + 1), 3800);
    return () => window.clearInterval(id);
  }, [active, isHovering, slides.length]);

  return (
    <section className="w-full bg-slate-950">
      <div
        className="w-full"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={(e) => {
          touchStartX.current = e.touches?.[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchStartX.current;
          const end = e.changedTouches?.[0]?.clientX ?? null;
          touchStartX.current = null;
          if (start == null || end == null) return;
          const delta = end - start;
          if (Math.abs(delta) < 40) return;
          if (delta < 0) goTo(active + 1);
          else goTo(active - 1);
        }}
      >
        <div className="relative h-[260px] w-full overflow-hidden sm:h-[460px] lg:h-[560px]">
          {slides.map((s, idx) => {
            const isActive = idx === active;
            const imgSrc =
              brokenImages[idx] && s.fallbackImage ? s.fallbackImage : s.image;
            return (
              <div
                key={s.title}
                className={[
                  "absolute inset-0 transition-all duration-700 ease-out will-change-transform",
                  isActive ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10",
                ].join(" ")}
                aria-hidden={!isActive}
              >
                <img
                  src={imgSrc}
                  alt={s.title}
                  className={[
                    "h-full w-full object-cover select-none transition duration-1000 ease-out",
                    isActive ? "scale-105" : "scale-100",
                  ].join(" ")}
                  draggable={false}
                  loading="eager"
                  onError={() => {
                    setBrokenImages((prev) => ({ ...prev, [idx]: true }));
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_40%)]" />

                <div
                  className={[
                    "absolute left-5 top-1/2 w-[92%] -translate-y-1/2 sm:left-12 sm:w-[62%] lg:left-20 lg:w-[52%] transition-all duration-700 ease-out",
                    isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/15 backdrop-blur transition-all duration-700",
                      isActive ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                    ].join(" ")}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
                    Limited time
                  </div>
                  <h2
                    className={[
                      "mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl transition-all duration-700",
                      isActive ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                    ].join(" ")}
                  >
                    {s.title}
                  </h2>
                  <p
                    className={[
                      "mt-3 max-w-xl text-sm font-medium text-white/80 sm:text-base lg:text-lg transition-all duration-700",
                      isActive ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                    ].join(" ")}
                    style={{ transitionDelay: isActive ? "60ms" : "0ms" }}
                  >
                    {s.subtitle}
                  </p>
                  <div
                    className={[
                      "mt-5 flex flex-wrap items-center gap-3 transition-all duration-700",
                      isActive ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                    ].join(" ")}
                    style={{ transitionDelay: isActive ? "110ms" : "0ms" }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full bg-sky-400/95 px-5 py-2.5 text-sm font-extrabold text-slate-900 transition hover:bg-sky-300"
                    >
                      {s.cta}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
                    >
                      View collection
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => goTo(active - 1)}
            disabled={animating}
            className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/15 disabled:opacity-60 sm:inline-flex"
            aria-label="Previous slide"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18 9 12l6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            disabled={animating}
            className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/15 disabled:opacity-60 sm:inline-flex"
            aria-label="Next slide"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/25 px-3 py-2 ring-1 ring-white/10 backdrop-blur">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                disabled={animating}
                className={[
                  "h-2.5 w-2.5 rounded-full transition disabled:opacity-70",
                  i === active ? "bg-white" : "bg-white/40 hover:bg-white/60",
                ].join(" ")}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === active}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
