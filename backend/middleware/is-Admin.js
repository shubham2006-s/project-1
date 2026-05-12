import User from "../model/User.js";

export const isAdmin = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    next();

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};