import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEye, FiEyeOff, FiLock, FiMail, FiShield, FiSmartphone } from "react-icons/fi";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const AUTH_BASE = `${import.meta.env.VITE_API_URL}/api/auth`

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyDigits = () => Array.from({ length: 6 }, () => "");

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const [step, setStep] = useState("credentials");
  const [digits, setDigits] = useState(emptyDigits);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [demoOtp, setDemoOtp] = useState(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpShakeKey, setOtpShakeKey] = useState(0);
  const [verifySuccess, setVerifySuccess] = useState(false);

  const digitRefs = useRef([]);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { showToast } = useToast();

  const errors = useMemo(() => {
    const next = { email: "", password: "" };

    if (!email.trim()) next.email = "Email is required.";
    else if (!emailRegex.test(email.trim())) next.email = "Enter a valid email.";

    if (!password) next.password = "Password is required.";
    else if (password.length < 6) next.password = "Minimum 6 characters.";

    return next;
  }, [email, password]);

  const canSubmit = !errors.email && !errors.password && !isSubmitting;

  const secondsLeft =
    step === "otp" && otpExpiresAt ? Math.max(0, Math.floor((otpExpiresAt - nowTs) / 1000)) : 0;

  useEffect(() => {
    if (step !== "otp" || !otpExpiresAt) return;
    const id = window.setInterval(() => setNowTs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [step, otpExpiresAt]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = window.setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendCooldown]);

  useEffect(() => {
    if (step === "otp") {
      window.requestAnimationFrame(() => digitRefs.current[0]?.focus());
    }
  }, [step]);

  const formatMmSs = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const otpComplete = digits.every((d) => d.length === 1);

  const onCredentialsSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);
      const { data } = await axios.post(`${AUTH_BASE}/login-request`, { email, password });
      setMaskedEmail(data.maskedEmail || "");
      setMaskedPhone(data.maskedPhone || "");
      setDemoOtp(data.demoOtp ?? null);
      const sec = Number(data.expiresIn) || 120;
      setOtpExpiresAt(Date.now() + sec * 1000);
      setDigits(emptyDigits());
      setStep("otp");
      setResendCooldown(45);
      showToast({
        variant: "success",
        title: "Code sent",
        description:
          "Check your email and text messages — the same 6-digit code was sent to both.",
        duration: 6000,
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not start sign-in. Check your email and password.";
      showToast({
        variant: "info",
        title: "Sign in failed",
        description: msg,
        duration: 5500,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    try {
      setIsResending(true);
      const { data } = await axios.post(`${AUTH_BASE}/login-resend`, { email });
      const sec = Number(data.expiresIn) || 600;
      setOtpExpiresAt(Date.now() + sec * 1000);
      setMaskedPhone(data.maskedPhone || maskedPhone);
      setDemoOtp(data.demoOtp ?? null);
      setResendCooldown(45);
      setDigits(emptyDigits());
      digitRefs.current[0]?.focus();
      showToast({
        variant: "success",
        title: "New code sent",
        description: "A fresh code was sent to your email and phone again.",
        duration: 5000,
      });
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not resend code.";
      showToast({ variant: "info", title: "Resend failed", description: msg, duration: 5000 });
    } finally {
      setIsResending(false);
    }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpComplete || isVerifying) return;
    const otp = digits.join("");
    try {
      setIsVerifying(true);
      const { data } = await axios.post(`${AUTH_BASE}/login-verify`, { email, otp });
      setVerifySuccess(true);
      login(data.token, data.user);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("user", JSON.stringify(data.user));
      const firstName = data.user?.name?.trim()?.split(/\s+/)[0];
      showToast({
        variant: "success",
        title: "Welcome back!",
        description: firstName ? `Hi ${firstName} — you're signed in.` : "You're signed in to ShopNow.",
        duration: 5500,
      });
      await new Promise((r) => window.setTimeout(r, 420));
      navigate("/");
    } catch (err) {
      setOtpShakeKey((k) => k + 1);
      const msg = err?.response?.data?.message || "Invalid code. Try again.";
      showToast({ variant: "info", title: "Verification failed", description: msg, duration: 4500 });
      setDigits(emptyDigits());
      digitRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const setDigitAt = (index, value) => {
    const v = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
    if (v && index < 5) digitRefs.current[index + 1]?.focus();
  };

  const onDigitKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) digitRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) digitRefs.current[index + 1]?.focus();
  };

  const onOtpPaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length < 6) return;
    e.preventDefault();
    setDigits(text.split(""));
    digitRefs.current[5]?.focus();
  };

  const goBackToCredentials = () => {
    setStep("credentials");
    setDigits(emptyDigits());
    setDemoOtp(null);
    setOtpExpiresAt(null);
    setMaskedEmail("");
    setMaskedPhone("");
  };

  return (
    <div className="min-h-[calc(100vh-4.25rem)] bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="mx-auto flex min-h-[calc(100vh-4.25rem)] max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.08)] md:grid-cols-2">
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-700" />
            <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.85),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.65),transparent_35%),radial-gradient(circle_at_40%_85%,rgba(255,255,255,0.55),transparent_40%)]" />
            <div className="relative flex h-full flex-col justify-between p-10 text-white">
              <div>
                <p className="text-sm/6 font-medium text-white/80">
                  {step === "otp" ? "Almost there" : "Welcome back"}
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                  {step === "otp" ? "Two-step verification" : "Sign in to ShopNow"}
                </h1>
                <p className="mt-3 max-w-sm text-sm/6 text-white/80">
                  {step === "otp"
                    ? "We’ve sent the same one-time code to your email and as a text message. Enter it below—just like apps that use email + SMS for sign-in."
                    : "Sign in with your password first, then confirm with a code sent to your email and phone on file."}
                </p>
              </div>

              <div className="rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur motion-safe:transition motion-safe:duration-500">
                <p className="text-sm font-medium">{step === "otp" ? "Security" : "Tip"}</p>
                <p className="mt-1 text-sm/6 text-white/80">
                  {step === "otp"
                    ? "Never share your code. Legitimate messages only come from our official channels—never follow links asking for your OTP."
                    : "Use a valid email and a 6+ character password. Next, you’ll use the code from your inbox or SMS."}
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[28rem] p-6 sm:p-8 md:min-h-[32rem] md:p-10">
            {/* Progress: both steps live in this login column */}
            <div className="mb-6 flex items-center gap-2" aria-label="Sign-in progress">
              <div
                className={[
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300",
                  step === "credentials"
                    ? "bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200"
                    : "bg-emerald-500 text-white ring-2 ring-emerald-200",
                ].join(" ")}
              >
                1
              </div>
              <div className="relative h-0.5 min-w-[2rem] flex-1 rounded-full bg-slate-200">
                <div
                  className={[
                    "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 motion-safe:transition-all motion-safe:duration-500",
                    step === "otp" ? "w-full" : "w-0",
                  ].join(" ")}
                />
              </div>
              <div
                className={[
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300",
                  step === "otp"
                    ? "bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200"
                    : "bg-slate-100 text-slate-400 ring-1 ring-slate-200",
                ].join(" ")}
              >
                2
              </div>
              <span className="hidden text-xs font-semibold text-slate-500 sm:inline">
                {step === "credentials" ? "Account" : "OTP"}
              </span>
            </div>

            {step === "credentials" ? (
              <div key="step-credentials" className="login-step-enter">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">Login</h2>
                    <p className="mt-1 text-sm text-slate-600">Enter your details to continue.</p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    Secure
                  </div>
                </div>

                <form className="mt-7 space-y-5" onSubmit={onCredentialsSubmit}>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Email</label>
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
                        aria-describedby="login-email-error"
                      />
                    </div>
                    {touched.email && errors.email ? (
                      <p id="login-email-error" className="mt-2 text-xs font-medium text-rose-600">
                        {errors.email}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Password</label>
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
                      <FiLock className="text-slate-400" />
                      <input
                        className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                        autoComplete="current-password"
                        aria-invalid={Boolean(touched.password && errors.password)}
                        aria-describedby="login-password-error"
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
                      <p id="login-password-error" className="mt-2 text-xs font-medium text-rose-600">
                        {errors.password}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                      Remember me
                    </label>

                    <Link to="/forgot-password" className="text-sm font-medium text-indigo-700 hover:text-indigo-800">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Checking…
                      </>
                    ) : (
                      "Continue"
                    )}
                  </button>

                  <div className="pt-1 text-center text-sm text-slate-600">
                    New here?{" "}
                    <Link to="/signup" className="font-semibold text-indigo-700 hover:text-indigo-800">
                      Create an account
                    </Link>
                  </div>
                </form>
              </div>
            ) : (
              <div key="step-otp" className="login-step-enter">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={goBackToCredentials}
                    className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <FiArrowLeft className="text-base" aria-hidden />
                    Back to login
                  </button>
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                    <FiShield className="text-lg" aria-hidden />
                  </div>
                </div>

                <div className="mt-4">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-900">Check email &amp; messages</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Enter the 6-digit code we sent to your <span className="font-semibold text-slate-800">email</span>{" "}
                    
                  </p>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                      <FiMail className="text-lg" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Email</p>
                      <p className="truncate text-sm font-semibold text-slate-900">{maskedEmail || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* OTP entry — same login column */}
                <div className="mt-5 rounded-2xl border border-indigo-200/80 bg-gradient-to-b from-indigo-50/90 to-white p-4 shadow-sm ring-1 ring-indigo-100 sm:p-5">
                  {demoOtp ? (
                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-center text-xs text-amber-950">
                      <span className="font-semibold">Developer mode:</span>{" "}
                      <span className="font-mono text-base font-bold tracking-[0.25em]">{demoOtp}</span>
                      <span className="mt-1 block text-[11px] text-amber-900/85">
                        Set <code className="rounded bg-white/80 px-1 font-mono">SHOW_OTP_IN_RESPONSE</code> off in
                        production — real apps never return the code in the browser.
                      </span>
                    </div>
                  ) : null}

                  <form onSubmit={onVerifyOtp}>
                    <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-600/90">
                      One-time password
                    </p>
                    <div
                      key={otpShakeKey}
                      className={[
                        "mt-3 flex justify-center gap-2 sm:gap-2.5",
                        otpShakeKey ? "login-otp-shake" : "",
                      ].join(" ")}
                      role="group"
                      aria-label="One-time code digits"
                    >
                      {digits.map((d, i) => (
                        <input
                          key={`otp-${i}`}
                          ref={(el) => {
                            digitRefs.current[i] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          autoComplete={i === 0 ? "one-time-code" : "off"}
                          maxLength={1}
                          value={d}
                          onChange={(e) => setDigitAt(i, e.target.value)}
                          onKeyDown={(e) => onDigitKeyDown(i, e)}
                          onPaste={i === 0 ? onOtpPaste : undefined}
                          style={{ animationDelay: `${i * 45}ms` }}
                          className={[
                            "login-otp-digit-in h-14 w-10 rounded-xl border-2 text-center text-xl font-bold shadow-sm outline-none transition sm:h-14 sm:w-11",
                            d
                              ? "border-indigo-500 bg-white text-slate-900 ring-2 ring-indigo-200/70"
                              : "border-slate-200 bg-white/90 text-slate-900 hover:border-indigo-300",
                            "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100",
                          ].join(" ")}
                          aria-label={`Digit ${i + 1} of 6`}
                        />
                      ))}
                    </div>

                    <div className="mt-4 flex flex-col gap-3 border-t border-indigo-100 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-center font-medium tabular-nums text-slate-600 sm:text-left">
                        {secondsLeft > 0 ? (
                          <>
                            Expires in <span className="font-bold text-slate-900">{formatMmSs(secondsLeft)}</span>
                          </>
                        ) : (
                          <span className="font-medium text-rose-600">Code expired — go back and try again.</span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={onResend}
                        disabled={resendCooldown > 0 || isResending || secondsLeft <= 0}
                        className="text-center font-semibold text-indigo-700 transition hover:text-indigo-900 disabled:cursor-not-allowed disabled:opacity-40 sm:text-right"
                      >
                        {isResending ? "Sending…" : resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend code"}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={!otpComplete || isVerifying || secondsLeft <= 0}
                      className={[
                        "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60",
                        verifySuccess ? "login-verify-success" : "",
                      ].join(" ")}
                    >
                      {isVerifying ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          Verifying…
                        </>
                      ) : (
                        "Verify & sign in"
                      )}
                    </button>
                  </form>
                </div>

                <p className="mt-5 text-center text-sm text-slate-600">
                  Wrong account?{" "}
                  <button
                    type="button"
                    className="font-semibold text-indigo-700 hover:text-indigo-800"
                    onClick={goBackToCredentials}
                  >
                    Change email
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
