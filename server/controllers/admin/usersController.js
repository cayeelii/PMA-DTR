const db = require("../../config/db");
const bcrypt = require("bcrypt");

const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

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

//Get all approved employee accounts
const getApprovedEmployees = (req, res) => {
  const sql = `
    SELECT u.user_id, u.username, u.bio_id, u.role, u.status, u.created_at, d.dept_name
    FROM users u
    JOIN departments d ON u.dept_id = d.dept_id
    WHERE u.status = 'approved'
    AND u.role = 'employee'
    ORDER BY u.created_at DESC
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

//Add admin or superadmin
const addAdminUser = async (req, res) => {
  const { username, password, role, dept_id } = req.body;
  const currentUserRole = normalizeRole(req.session?.user?.role);

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const normalizedRole = normalizeRole(role || "admin");

  if (!["admin", "superadmin"].includes(currentUserRole)) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (!["admin", "superadmin"].includes(normalizedRole)) {
    return res.status(400).json({ error: "Invalid role selected" });
  }

  if (currentUserRole === "admin" && normalizedRole !== "admin") {
    return res.status(403).json({
      error: "Admins can only create admin accounts.",
    });
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
        [
          username,
          hashedPassword,
          normalizedRole,
          status,
          created_at,
          dept_id || null,
        ],
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.json({
            message: "User added successfully",
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
  const currentUserRole = normalizeRole(req.session?.user?.role);

  if (!["admin", "superadmin"].includes(currentUserRole)) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const sql = `
    SELECT user_id, username, role, status, created_at
    FROM users
    WHERE role ${currentUserRole === "superadmin" ? "IN ('admin', 'superadmin')" : "= ?"}
    ORDER BY created_at DESC
  `;

  const queryParams = currentUserRole === "superadmin" ? [] : [currentUserRole];

  db.query(sql, queryParams, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

module.exports = {
  getPendingUsers,
  getApprovedEmployees,
  approveUser,
  rejectUser,
  addAdminUser,
  getAllAdmins,
};
