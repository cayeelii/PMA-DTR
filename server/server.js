require("dotenv").config();
require("./config/db");
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const app = express();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "localhost";

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

const authRoutes = require("./routes/authRoute");
const adminUsersRoute = require("./routes/admin/adminUsersRoute");

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", adminUsersRoute);

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
