const db = require("../../config/db");

//Get all pending accounts
const getPendingUsers = (req, res) => {
  const sql = `
    SELECT u.user_id, u.username, u.bio_id, u.role, u.status, u.created_at, d.dept_name
    FROM users u
    JOIN departments d ON u.dept_id = d.dept_id
    WHERE u.status = 'pending'
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

module.exports = { getPendingUsers, approveUser, rejectUser };
