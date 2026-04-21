require("dotenv").config();
const mysql = require("mysql2/promise");

//Create the DB connection
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',      
  password: process.env.DB_PASSWORD || '',  
  database: process.env.DB_NAME || 'pma_dtr'
});

//Connect to MySQL
(async () => {
  try {
    const connection = await db.getConnection();
    console.log("Connected to database");
    connection.release();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
})();

module.exports = db;
