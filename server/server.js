require("dotenv").config();
require("./config/db");
const cors = require("cors");
const express = require("express");
const app = express();

const PORT = process.env.PORT;
const HOST = process.env.HOST;

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoute");

//Routes
app.use("/auth", authRoutes);

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
