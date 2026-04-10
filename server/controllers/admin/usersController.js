const db = require("../../config/db");
const bcrypt = require("bcrypt");

//Get all pending accounts
const getPendingUsers = (req, res) => {
  const sql = `
    SELECT u.user_id, u.username, u.bio_id, u.role, u.status, u.created_at, d.dept_name
    FROM users u
    JOIN departments d ON u.dept_id = d.dept_id
    WHERE u.status = 'pending' 
    AND u.role = 'employee'
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

//Approve user
const approveUser = (req, res) => {
  const { user_id } = req.params;

  const sql = "UPDATE users SET status = 'approved' WHERE user_id = ?";

  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });
    res.json({ message: "User approved successfully" });
  });
};

//Reject user
const rejectUser = (req, res) => {
  const { user_id } = req.params;

  const sql = "UPDATE users SET status = 'rejected' WHERE user_id = ?";

  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });
    res.json({ message: "User rejected successfully" });
  });
};

//Add admin
const addAdminUser = async (req, res) => {
  const { username, password, dept_id } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
    });
  }

  try {
    const role = "admin";
    const status = "approved";
    const created_at = new Date();

    const checkSql = "SELECT user_id FROM users WHERE username = ?";

    db.query(checkSql, [username], async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length > 0) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const sql = `
        INSERT INTO users (username, password, role, status, created_at, dept_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        sql,
        [username, hashedPassword, role, status, created_at, dept_id || null],
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.json({
            message: "Admin user added successfully",
            user_id: result.insertId,
          });
        },
      );
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

//Get all admin users
const getAllAdmins = (req, res) => {
  const sql = `
    SELECT user_id, username, role, status, created_at
    FROM users
    WHERE role = 'admin'
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

module.exports = {
  getPendingUsers,
  approveUser,
  rejectUser,
  addAdminUser,
  getAllAdmins,
};
