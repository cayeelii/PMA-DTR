require("dotenv").config();
const db = require("./config/db");
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const fileUpload = require("express-fileupload");
const app = express();

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
app.use(fileUpload());
app.use(express.json());
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
const adminUsersRoute = require("./routes/admin/adminUsersRoute");
const dtrRoute = require("./routes/admin/dtrRoute");

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", adminUsersRoute);
app.use("/api/dtr", dtrRoute);

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
