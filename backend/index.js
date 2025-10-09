import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./src/connections/db.js";
import { ENV } from "./src/connections/env.js";

// Routes imports
import testRoute from "./src/routes/test.route.js";
import authRoute from "./src/routes/auth.route.js";
import profileRoute from "./src/routes/profile.route.js";
import volunteerApplicationRoute from "./src/routes/volunteerApplication.route.js";
import activityRoute from "./src/routes/activity.route.js";
import notificationRoute from "./src/routes/notification.route.js";
import dashboardRoute from "./src/routes/dashboard.route.js";
import reportsRoute from "./src/routes/reports.route.js";
import leadersRoute from "./src/routes/leaders.route.js";
import maintenanceRoute from "./src/routes/maintenance.route.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: [ENV.FRONTEND_URL, "http://localhost:5173", "https://prc-phi-lake.vercel.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
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
app.use("/api/v1/volunteer-application", volunteerApplicationRoute);
app.use("/api/v1/activities", activityRoute);
app.use("/api/v1/notifications", notificationRoute);
app.use("/api/v1/dashboard", dashboardRoute);
app.use("/api/v1/reports", reportsRoute);
app.use("/api/v1/leaders", leadersRoute);
app.use("/api/v1/maintenance", maintenanceRoute);

export default app;
