import dotenv from "dotenv";
dotenv.config({path: ".env"});

  import express from "express"
  import AuthRoutes from "./routes/Auth.js"
  import mongoose from "mongoose"
  import cors from "cors";
  import UserRoutes from "./routes/User.js";

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json())
  app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://project-1-gray-three.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

  app.use("/api/auth", AuthRoutes);
  app.use("/user", UserRoutes);

  app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
  });

  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      app.listen(PORT);
    })
    .catch((err) => {
      console.error(err);
    });
