const db = require("../../config/db");

// Normalize a "YYYY-MM-DD" string to a full datetime boundary.
// For `end`, push to end-of-day so the date range is inclusive.
const toBoundary = (value, end = false) => {
  if (!value) return null;
  const str = String(value).trim();
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return end ? `${str} 23:59:59` : `${str} 00:00:00`;
  }
  return str; // assume already a full datetime
};

const getActivityLogs = (req, res) => {
  // Activity Logs fetch (paginated + filtered).
  const {
    page: pageRaw,
    pageSize: pageSizeRaw,
    search = "",
    action = "",
    userId = "",
    bioId = "",
    from = "",
    to = "",
  } = req.query;

  const page = Math.max(1, parseInt(pageRaw, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(pageSizeRaw, 10) || 10));
  const offset = (page - 1) * pageSize;

  const whereParts = [];
  const params = [];

  if (String(search).trim()) {
    const s = `%${String(search).trim()}%`;
    whereParts.push(`(
      COALESCE(u.username, 'System') LIKE ?
      OR al.action_performed LIKE ?
      OR al.action_details LIKE ?
      OR al.target_bio_id LIKE ?
    )`);
    params.push(s, s, s, s);
  }

  if (String(action).trim()) {
    whereParts.push(`al.action_performed = ?`);
    params.push(String(action).trim());
  }

  const userIdNum = parseInt(userId, 10);
  if (!Number.isNaN(userIdNum) && userIdNum > 0) {
    whereParts.push(`al.user_id = ?`);
    params.push(userIdNum);
  }

  if (String(bioId).trim()) {
    const bid = String(bioId).trim();
    // Match either the top-level target OR a bio_id inside the structured JSON details.
    whereParts.push(`(al.target_bio_id = ? OR al.action_details LIKE ?)`);
    params.push(bid, `%"bio_id":"${bid}"%`);
  }

  const fromBoundary = toBoundary(from, false);
  if (fromBoundary) {
    whereParts.push(`al.created_at >= ?`);
    params.push(fromBoundary);
  }

  const toBoundaryVal = toBoundary(to, true);
  if (toBoundaryVal) {
    whereParts.push(`al.created_at <= ?`);
    params.push(toBoundaryVal);
  }

  const whereClause = whereParts.length
    ? `WHERE ${whereParts.join(" AND ")}`
    : "";

  const countSql = `
    SELECT COUNT(*) AS total
    FROM activity_logs al
    LEFT JOIN users u ON u.user_id = al.user_id
    ${whereClause}
  `;

  const listSql = `
    SELECT
      al.activity_id,
      al.user_id,
      COALESCE(u.username, 'System') AS username,
      al.action_performed,
      al.action_details,
      al.target_bio_id,
      al.created_at
    FROM activity_logs al
    LEFT JOIN users u ON u.user_id = al.user_id
    ${whereClause}
    ORDER BY al.created_at DESC, al.activity_id DESC
    LIMIT ? OFFSET ?
  `;

  db.query(countSql, params, (countErr, countRows) => {
    if (countErr) return res.status(500).json({ error: countErr.message });

    const total = countRows?.[0]?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    db.query(listSql, [...params, pageSize, offset], (listErr, items) => {
      if (listErr) return res.status(500).json({ error: listErr.message });
      return res.json({ items, total, page, pageSize, totalPages });
    });
  });
};

// Lightweight filters endpoint for dropdowns in Logs.jsx.
const getActivityLogFilters = (req, res) => {
  const actionsSql = `
    SELECT DISTINCT action_performed
    FROM activity_logs
    WHERE action_performed IS NOT NULL AND action_performed <> ''
    ORDER BY action_performed ASC
  `;

  const usersSql = `
    SELECT DISTINCT u.user_id, u.username
    FROM activity_logs al
    INNER JOIN users u ON u.user_id = al.user_id
    ORDER BY u.username ASC
  `;

  db.query(actionsSql, (aErr, aRows) => {
    if (aErr) return res.status(500).json({ error: aErr.message });
    db.query(usersSql, (uErr, uRows) => {
      if (uErr) return res.status(500).json({ error: uErr.message });
      return res.json({
        actions: aRows.map((r) => r.action_performed),
        users: uRows.map((r) => ({ user_id: r.user_id, username: r.username })),
      });
    });
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
  getActivityLogFilters,
  createActivityLog,
};
