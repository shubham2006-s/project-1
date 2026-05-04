import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser } from "react-icons/fi";
import axios from "axios"


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  });
  const navigate = useNavigate()
  const { showToast } = useToast();

  const errors = useMemo(() => {
    const next = { name: "", email: "", password: "" };

    if (!name.trim()) next.name = "Name is required.";
    else if (name.trim().length < 2) next.name = "Enter your full name.";

    if (!email.trim()) next.email = "Email is required.";
    else if (!emailRegex.test(email.trim())) next.email = "Enter a valid email.";

    if (!password) next.password = "Password is required.";
    else if (password.length < 6) next.password = "Minimum 6 characters.";

    return next;
  }, [name, email, password]);

  const canSubmit =
    !errors.name && !errors.email && !errors.password && !isSubmitting;

  async function onSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);
      const result = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`,{
        name,
        email,
        password
      })
      console.log(result.data)

      showToast({
        variant: "success",
        title: "Account created",
        description: "Sign in with your email and password to start shopping.",
        duration: 5500,
      });
      navigate('/login')
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4.25rem)] bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="mx-auto flex min-h-[calc(100vh-4.25rem)] max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.08)] md:grid-cols-2">
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700" />
            <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.85),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.65),transparent_35%),radial-gradient(circle_at_40%_85%,rgba(255,255,255,0.55),transparent_40%)]" />
            <div className="relative flex h-full flex-col justify-between p-10 text-white">
              <div>
                <p className="text-sm/6 font-medium text-white/80">
                  Create your account
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                  Join ShopNow
                </h1>
                <p className="mt-3 max-w-sm text-sm/6 text-white/80">
                  Sign up in seconds and start exploring products.
                </p>
              </div>

              <div className="rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-medium">Already have an account?</p>
                <p className="mt-1 text-sm/6 text-white/80">
                  You can sign in with your existing credentials.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 md:p-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  Sign up
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Create an account to continue.
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                New
              </div>
            </div>

            <form className="mt-7 space-y-5" onSubmit={onSubmit}>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Name
                </label>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
                  <FiUser className="text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    type="text"
                    name="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    autoComplete="name"
                    aria-invalid={Boolean(touched.name && errors.name)}
                    aria-describedby="signup-name-error"
                  />
                </div>
                {touched.name && errors.name ? (
                  <p
                    id="signup-name-error"
                    className="mt-2 text-xs font-medium text-rose-600"
                  >
                    {errors.name}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
                  <FiMail className="text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    autoComplete="email"
                    inputMode="email"
                    aria-invalid={Boolean(touched.email && errors.email)}
                    aria-describedby="signup-email-error"
                  />
                </div>
                {touched.email && errors.email ? (
                  <p
                    id="signup-email-error"
                    className="mt-2 text-xs font-medium text-rose-600"
                  >
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
                  <FiLock className="text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    name="password"
                    onChange={(e) => setPassword(e.target.value)} 
                    onBlur={() =>
                      setTouched((t) => ({ ...t, password: true }))
                    }
                    autoComplete="new-password"
                    aria-invalid={Boolean(touched.password && errors.password)}
                    aria-describedby="signup-password-error"
                  />
                  <button
                    type="button"
                    className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {touched.password && errors.password ? (
                  <p
                    id="signup-password-error"
                    className="mt-2 text-xs font-medium text-rose-600"
                  >
                    {errors.password}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Creating…
                  </>
                ) : (
                  "Create account"
                )}
              </button>

              <div className="pt-1 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-indigo-700 hover:text-indigo-800"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

