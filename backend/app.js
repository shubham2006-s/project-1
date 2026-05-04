import dotenv from "dotenv";
dotenv.config({path: ".env"});

  import express from "express"
  import AuthRoutes from "./routes/Auth.js"
  import mongoose from "mongoose"
  import cors from "cors";
  import UserRoutes from "./routes/User.js";

  const app = express();

  app.use(express.json())
  app.use(cors());

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

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
    .connect("mongodb+srv://shubhamsavsaviya123_db_user:ZA6ENPAoDR6H6zFe@cluster0.ryol7y5.mongodb.net/store?retryWrites=true&w=majority")
    .then(() => {
      app.listen(3000);
    })
    .catch((err) => {
      console.error(err);
    });
