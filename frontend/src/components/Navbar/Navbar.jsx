import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { FiHeart } from 'react-icons/fi'
import { AuthContext } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { useWishlist } from '../../context/WishlistContext'

const Navbar = () => {
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const { totalQuantity, cartAnchorRef } = useCart();
  const { totalCount: wishlistCount } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [searchInput, setSearchInput] = useState(() =>
    location.pathname === '/' ? (searchParams.get('q') ?? '') : ''
  );
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const inputRef = useRef();


  const navItems = useMemo(
    () => [
      { label: 'Home', to: '/' },
      { label: 'New Arrivals', to: '/new-arrivals' },
      { label: 'Deals', to: '/deals' },
      { label: 'Help', to: '/help' },
    ],
    []
  );

  const cartCount = totalQuantity;
  const fallbackUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const displayName = user?.name || (fallbackUserId ? `User ${fallbackUserId}` : 'My Account');
  const avatarLetter = (user?.name?.trim()?.[0] || displayName?.trim()?.[0] || 'U').toUpperCase();

  useEffect(() => {
    if (!profileOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };

    const onPointerDown = (e) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target)) setProfileOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!isLoggedIn) setProfileOpen(false);
  }, [isLoggedIn]);

  useEffect(() => {
    if (location.pathname === '/') {
      setSearchInput(searchParams.get('q') ?? '');
    }
  }, [location.pathname, searchParams]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = searchInput.trim();
    navigate({ pathname: '/', search: q ? `?q=${encodeURIComponent(q)}` : '' });
    setMobileOpen(false);
    setOpen(false);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    setMobileOpen(false);
    showToast({
      variant: 'info',
      title: 'Signed out',
      description: 'You have been logged out of ShopNow.',
      duration: 4200,
    });
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-linear-to-r from-purple-900 via-purple-800 to-indigo-800 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-3 sm:px-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-white/10">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-95">
              <path d="M7 10V7a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M6 10h12l-1 11H7L6 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="leading-tight">
            <div className="text-lg font-extrabold tracking-tight">
              Shop<span className="text-sky-200">Now</span>
            </div>
            <div className="hidden text-[11px] text-white/70 sm:block">Quality products, fast delivery</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex md:items-center md:gap-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search — navigates to home catalog with ?q= for shareable, filterable results */}
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <form
            role="search"
            onSubmit={submitSearch}
            className="relative w-full max-w-xl"
            aria-label="Search products"
          >
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-white/60">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M21 21l-4.3-4.3m1.3-5.2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              name="q"
              type="search"
              autoComplete="off"
              enterKeyHint="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products, brands and more…"
              className="h-11 w-full rounded-full bg-white/10 py-2 pl-10 pr-14 text-sm text-white placeholder:text-white/60 ring-1 ring-white/15 outline-none transition focus:bg-white/15 focus:ring-2 focus:ring-sky-300/70"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 z-10 inline-flex h-8 min-w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 px-3 text-xs font-extrabold text-white ring-1 ring-white/20 transition hover:bg-white/25"
              aria-label="Submit search"
            >
              Go
            </button>
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/10 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-95">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Account */}
          {isLoggedIn ? (
            <div className="relative hidden sm:block" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2 py-1.5 ring-1 ring-white/15 transition hover:bg-white/15 hover:ring-white/25"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-sm font-extrabold text-white ring-1 ring-white/15">
                  {avatarLetter}
                </span>
                <span className="max-w-[110px] truncate text-sm font-semibold text-white/90">
                  {displayName}
                </span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/80">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-white/10 bg-slate-950/85 shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-1 ring-black/20 backdrop-blur"
                >
                  <div className="px-4 py-3">
                    <div className="text-xs font-semibold text-white/70">Signed in</div>
                    <div className="mt-1 text-sm font-bold text-white">
                      {displayName}
                    </div>
                    <div className="mt-0.5 text-xs text-white/60">
                      {user?.email ? user.email : (fallbackUserId ? `ID: ${fallbackUserId}` : 'Account info not available')}
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  <div className="p-2">
                    <Link
                      to="/profile"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-white/90 hover:bg-white/10"
                      onClick={() => setProfileOpen(false)}
                      role="menuitem"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 ring-1 ring-white/10">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/80">
                          <path
                            d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M20 21a8 8 0 1 0-16 0"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      Profile
                    </Link>

                    <Link
                      to="/orders"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-white/90 hover:bg-white/10"
                      onClick={() => setProfileOpen(false)}
                      role="menuitem"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 ring-1 ring-white/10">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/80">
                          <path
                            d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M4 10h16"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M6 21h12a2 2 0 0 0 2-2v-6H4v6a2 2 0 0 0 2 2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      Orders
                    </Link>

                    <Link
                      to="/wishlist"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-white/90 hover:bg-white/10"
                      onClick={() => setProfileOpen(false)}
                      role="menuitem"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 ring-1 ring-white/10">
                        <FiHeart className="text-[18px] text-white/80" />
                      </span>
                      Wishlist
                      {wishlistCount > 0 ? (
                        <span className="ml-auto text-xs font-extrabold text-rose-200">{wishlistCount}</span>
                      ) : null}
                    </Link>

                    <button
                      type="button"
                      className="mt-1 flex w-full items-center justify-center rounded-lg bg-rose-500/90 px-3 py-2 text-sm font-extrabold text-white hover:bg-rose-500"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-white/90 ring-1 ring-white/15 hover:bg-white/10 hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-sky-400/90 px-4 py-2 text-sm font-extrabold text-slate-900 transition hover:bg-sky-300"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/10"
            aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} saved` : ''}`}
          >
            <FiHeart className="text-xl opacity-95" />
            {wishlistCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-white px-0.5 text-[10px] font-extrabold text-rose-600 ring-2 ring-purple-900">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            ) : null}
          </Link>

          {/* Cart */}
          <Link
            ref={cartAnchorRef}
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/10"
            aria-label={`Shopping cart${cartCount ? `, ${cartCount} items` : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-95">
              <path
                d="M6 6h15l-2 8H7L6 6Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M6 6 5 3H2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M8.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM18.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                fill="currentColor"
              />
            </svg>
            {cartCount > 0 && (
              <span
                key={cartCount}
                className="cart-badge-pop absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-rose-500 px-1 text-[11px] font-extrabold text-white ring-2 ring-purple-900"
              >
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-purple-950/40 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-3 py-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white"
            >
              Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white"
            >
              Cart{cartCount > 0 ? ` (${cartCount})` : ''}
            </Link>

            {!isLoggedIn ? (
              <div className="mt-2 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-md bg-white/10 px-3 py-2 text-center text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-md bg-sky-400/90 px-3 py-2 text-center text-sm font-extrabold text-slate-900 hover:bg-sky-300"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 rounded-md px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white"
                >
                  Profile
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white"
                >
                  My orders
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 rounded-md bg-white/10 px-3 py-2 text-left text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
export default Navbar
