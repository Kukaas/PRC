import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./src/connections/db.js";
import { ENV } from "./src/connections/env.js";

// Routes imports
import testRoute from "./src/routes/test.route.js";
import authRoute from "./src/routes/auth.route.js";
import profileRoute from "./src/routes/profile.route.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: [ENV.FRONTEND_URL, "http://localhost:5173"],
  credentials: true,
};

app.use(cors(corsOptions));

connectDB();

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});

// Routes
app.use("/api/v1/test", testRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/profile", profileRoute);

export default app;
