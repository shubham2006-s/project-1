import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiKey, FiLock, FiMail } from "react-icons/fi";
import axios from "axios";
import { useToast } from "../../context/ToastContext";

const AUTH_BASE = "http://localhost:3000/api/auth";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyDigits = () => Array.from({ length: 6 }, () => "");

const ForgotPassword = () => {
  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(emptyDigits);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  const canRequest = useMemo(() => emailRegex.test(email.trim()), [email]);
  const otp = otpDigits.join("");
  const canReset =
    otp.length === 6 &&
    newPassword.length >= 6 &&
    confirmPassword.length >= 6 &&
    newPassword === confirmPassword;

    const handleKeyDown = (index, e) => {
      if (e.key === "Backspace") {
        e.preventDefault(); // ✅ important
    
        setOtpDigits((prev) => {
          const next = [...prev];
    
          if (next[index]) {
            // ✅ remove current digit
            next[index] = "";
          } else if (index > 0) {
            // ✅ move to previous & clear it
            otpRefs.current[index - 1]?.focus();
            next[index - 1] = "";
          }
    
          return next;
        });
      }
    };

  const setOtpAt = (idx, value) => {
    const v = String(value || "").replace(/\D/g, "").slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[idx] = v;
      return next;
    });

    if (idx < otpRefs.current.length - 1) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const requestReset = async (e) => {
    e.preventDefault();
    if (!canRequest || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const { data } = await axios.post(`${AUTH_BASE}/forgot-password-request`, {
        email: email.trim(),
      });
      setMaskedEmail(data.maskedEmail || email);
      setStep("reset");
      showToast({
        variant: "success",
        title: "Reset code sent",
        description: "Check your email for the 6-digit password reset code.",
        duration: 5200,
      });
    } catch (err) {
      showToast({
        variant: "info",
        title: "Request failed",
        description: err?.response?.data?.message || "Unable to send reset code right now.",
        duration: 5200,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    if (!canReset || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await axios.post(`${AUTH_BASE}/forgot-password-reset`, {
        email: email.trim(),
        otp,
        newPassword,
      });
      setIsSuccess(true);
      showToast({
        variant: "success",
        title: "Password updated",
        description: "You can now login with your new password.",
        duration: 5200,
      });
      window.setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      showToast({
        variant: "info",
        title: "Reset failed",
        description: err?.response?.data?.message || "Invalid code or password.",
        duration: 5200,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.25rem)] bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="mx-auto flex min-h-[calc(100vh-4.25rem)] max-w-2xl items-center justify-center px-4 py-10">
        <div className="w-full rounded-2xl border border-black/5 bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.08)] sm:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Forgot password</h1>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              <FiArrowLeft />
              Back
            </Link>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {step === "request"
              ? "Enter your account email and we’ll send a secure reset code."
              : `Enter the code sent to ${maskedEmail || email} and set a new password.`}
          </p>

          {step === "request" ? (
            <form className="mt-7 space-y-5" onSubmit={requestReset}>
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
                  <FiMail className="text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!canRequest || isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiKey />
                {isSubmitting ? "Sending code..." : "Send reset code"}
              </button>
            </form>
          ) : (
            <form className="mt-7 space-y-5" onSubmit={submitReset}>
              <div>
                <p className="text-sm font-medium text-slate-700">Reset code</p>
                <div className="mt-2 flex justify-between gap-2">
                    {otpDigits.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => setOtpAt(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className="h-12 w-11 rounded-xl border border-slate-200 text-center text-lg font-black outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      />
                    ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">New password</label>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
                  <FiLock className="text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Confirm new password</label>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
                  <FiLock className="text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!canReset || isSubmitting}
                className={[
                  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60",
                  isSuccess ? "login-verify-success" : "",
                ].join(" ")}
              >
                <FiCheckCircle />
                {isSubmitting ? "Updating password..." : "Reset password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
