import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET; // or same constant

export const isAuth = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // ✅ FIXED
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
};