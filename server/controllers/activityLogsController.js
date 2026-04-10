const db = require("../config/db");

const getActivityLogs = (req, res) => {
  // Activity Logs fetch.
  const sql = `
    SELECT
      al.activity_id,
      al.user_id,
      COALESCE(u.username, "System") AS username,
      al.action_performed,
      al.action_details,
      al.target_bio_id,
      al.created_at
    FROM activity_logs al
    LEFT JOIN users u ON u.user_id = al.user_id
    ORDER BY al.created_at DESC, al.activity_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.json(results);
  });
};

const createActivityLog = (req, res) => {
  const { action_performed, action_details, target_bio_id = null } = req.body;

  // Activity Logs create.
  if (!req.session?.user) {
    return res.status(401).json({ error: "No user logged in" });
  }

  if (!action_performed || !action_details) {
    return res.status(400).json({
      error: "action_performed and action_details are required",
    });
  }

  const sql = `
    INSERT INTO activity_logs (user_id, action_performed, action_details, target_bio_id)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      req.session.user.user_id,
      action_performed,
      action_details,
      target_bio_id,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      return res.status(201).json({
        message: "Activity log saved successfully",
        activity_id: result.insertId,
      });
    },
  );
};

module.exports = {
  getActivityLogs,
  createActivityLog,
};
