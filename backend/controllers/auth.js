import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmailOTP } from "../utils/email.js";

const JWT_SECRET = process.env.JWT_SECRET || "somesupersupersecret";

/** In-memory OTP stores (use Redis in production) */
const loginOtpChallenges = new Map();
const resetOtpChallenges = new Map();
const OTP_TTL_MS = 2 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const emailChallengeKey = (email) => String(email || "").trim().toLowerCase();
const maskEmail = (email) => {
  const [local = "", domain = ""] = String(email || "").split("@");
  if (!domain) return "***";
  return `${local.slice(0, 2)}***@${domain}`;
};

export const postSignUp = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  try {
    const hashPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name: name,
      email: email,
      password: hashPassword,
    });
    const result = await user.save();
    await sendEmailOTP(email, result._id.toString(), "signup", name);
    res.status(201).json({ message: "User created", userId: result._id });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("A user with this email could not be found.");
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password!");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Successfully logged in",
      token: token,
      userId: user._id.toString(),
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const postLoginRequest = async (req, res, next) => {

  const email = String(req.body.email)
  const password = String(req.body.password)
  
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");
    
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) throw new Error("Password incorrect");

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // 🔐 hash OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    const key = emailChallengeKey(email);
    loginOtpChallenges.set(key, {
      otp: hashedOtp,
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      attempts: 0,
      expiresAt: Date.now() + OTP_TTL_MS,
    });

    // 📩 send email
    await sendEmailOTP(user.email, otp, "login");

    res.status(200).json({
      message: "OTP sent",
      maskedEmail: maskEmail(user.email),
      expiresIn: Math.floor(OTP_TTL_MS / 1000),
    });
  } catch (err) {
    next(err);
  }
};

export const postLoginVerify = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    const key = emailChallengeKey(email);
    const entry = loginOtpChallenges.get(key);

    if (!entry || entry.expiresAt < Date.now()) {
      loginOtpChallenges.delete(key);
      return res.status(401).json({ message: "OTP expired" });
    }

    if (entry.attempts >= MAX_OTP_ATTEMPTS) {
      loginOtpChallenges.delete(key);
      return res.status(429).json({ message: "Too many attempts" });
    }

    // 🔐 compare hashed OTP
    const isMatch = await bcrypt.compare(otp, entry.otp);

    if (!isMatch) {
      entry.attempts++;
      loginOtpChallenges.set(key, entry);
      return res.status(401).json({ message: "Invalid OTP" });
    }

    loginOtpChallenges.delete(key);

    const token = jwt.sign(
      {
        email: entry.email,
        userId: entry.userId,
        role: entry.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      userId: entry.userId,
      user: {
        id: entry.userId,
        name: entry.name,
        email: entry.email,
        role: entry.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const postLoginResend = async (req, res, next) => {
  const { email } = req.body;

  try {
    const key = emailChallengeKey(email);
    const entry = loginOtpChallenges.get(key);

    if (!entry || entry.expiresAt < Date.now()) {
      return res.status(400).json({
        message: "Session expired, login again",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10);

    entry.otp = hashedOtp;
    entry.expiresAt = Date.now() + OTP_TTL_MS;
    entry.attempts = 0;

    loginOtpChallenges.set(key, entry);

    await sendEmailOTP(entry.email, otp, "login");

    res.status(200).json({
      message: "OTP resent",
      expiresIn: Math.floor(OTP_TTL_MS / 1000)
    });
  } catch (err) {
    next(err);
  }
};

export const postForgotPasswordRequest = async (req, res, next) => {
  const email = emailChallengeKey(req.body.email);
  try {
    const user = await User.findOne({ email });

    // Do not reveal whether account exists.
    if (!user) {
      return res.status(200).json({
        message: "If this email exists, we sent a reset code.",
        maskedEmail: maskEmail(email),
        expiresIn: Math.floor(OTP_TTL_MS / 1000),
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10);
    resetOtpChallenges.set(email, {
      otp: hashedOtp,
      userId: user._id.toString(),
      attempts: 0,
      expiresAt: Date.now() + OTP_TTL_MS,
    });

    await sendEmailOTP(user.email, otp, "forgot-password");

    return res.status(200).json({
      message: "If this email exists, we sent a reset code.",
      maskedEmail: maskEmail(user.email),
      expiresIn: Math.floor(OTP_TTL_MS / 1000),
    });
  } catch (err) {
    next(err);
  }
};

export const postForgotPasswordReset = async (req, res, next) => {
  const email = emailChallengeKey(req.body.email);
  const otp = String(req.body.otp || "");
  const newPassword = String(req.body.newPassword || "");

  try {
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const entry = resetOtpChallenges.get(email);
    if (!entry || entry.expiresAt < Date.now()) {
      resetOtpChallenges.delete(email);
      return res.status(401).json({ message: "Reset code expired. Request a new one." });
    }
    if (entry.attempts >= MAX_OTP_ATTEMPTS) {
      resetOtpChallenges.delete(email);
      return res.status(429).json({ message: "Too many attempts. Request a new code." });
    }

    const isMatch = await bcrypt.compare(otp, entry.otp);
    if (!isMatch) {
      entry.attempts += 1;
      resetOtpChallenges.set(email, entry);
      return res.status(401).json({ message: "Invalid reset code." });
    }

    const hashPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(entry.userId, { password: hashPassword });
    resetOtpChallenges.delete(email);
    loginOtpChallenges.delete(email);

    return res.status(200).json({ message: "Password reset successful. Please log in." });
  } catch (err) {
    next(err);
  }
};