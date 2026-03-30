require("dotenv").config();
require("./config/db");
const cors = require("cors");
const express = require("express");
const app = express();

const PORT = process.env.PORT || 5173;
const HOST = process.env.HOST || "localhost";

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoute");
const adminUsersRoute = require("./routes/adminUsersRoute");

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", adminUsersRoute);

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
