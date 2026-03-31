require("dotenv").config();
const mysql = require("mysql2");

//Create the DB connection
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',      
  password: process.env.DB_PASSWORD || '',  
  database: process.env.DB_NAME || 'pma_dtr'
});

//Connect to MySQL
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to database");
  }
});

module.exports = db;
