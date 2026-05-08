require("dotenv").config();
const db = require("./config/db");
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const fileUpload = require("express-fileupload");
const app = express();

// Trust Nginx reverse proxy
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "localhost";
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));
app.use(
  session({
    key: "connect.sid",
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

const authRoutes = require("./routes/authRoute");

// Admin routes
const adminUsersRoute = require("./routes/admin/usersRoute");
const adminSignatoryRoutes = require("./routes/admin/signatoriesRoute");
const dtrRoute = require("./routes/admin/dtrRoute");
const activityLogsRoute = require("./routes/admin/activityLogsRoute");
const maintenanceRoute = require("./routes/admin/maintenanceRoute");
const homepageRoute = require("./routes/admin/homepageRoute");
const scheduleRoute = require("./routes/admin/scheduleRoute");

// Employee routes
const employeeHomepageRoute = require("./routes/employee/homepageRoute");
const employeeDtrRoute = require("./routes/employee/dtrRoute");


// Admin
app.use("/api/auth", authRoutes);
app.use("/api/users", adminUsersRoute);
app.use("/api/signatories", adminSignatoryRoutes);
app.use("/api/dtr", dtrRoute);
app.use("/api/activity-logs", activityLogsRoute);
app.use("/api/maintenance", maintenanceRoute);
app.use("/api/homepage", homepageRoute);
app.use("/api/schedules", scheduleRoute);

// Employee
app.use("/api/employee/homepage", employeeHomepageRoute);
app.use("/api/employee/dtr", employeeDtrRoute);

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
