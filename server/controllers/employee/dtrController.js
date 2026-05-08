const db = require("../../config/db");

const getEmployeeDTR = (req, res) => {
  try {
    const user = req.session.user;

    if (!user || !user.bio_id) {
      return res.status(401).json({
        message: "Unauthorized. Please login again.",
      });
    }

    const bio_id = user.bio_id;
    const { month, year } = req.query;

    let sql = `
      SELECT 
        DATE_FORMAT(date_only, '%Y-%m-%d') AS date,
        DAYNAME(date_only) AS day,

        MAX(CASE WHEN log_type = 'AM IN' THEN time_only END) AS am_in,
        MAX(CASE WHEN log_type = 'AM OUT' THEN time_only END) AS am_out,
        MAX(CASE WHEN log_type = 'PM IN' THEN time_only END) AS pm_in,
        MAX(CASE WHEN log_type = 'PM OUT' THEN time_only END) AS pm_out,
        MAX(CASE WHEN log_type = 'OT IN' THEN time_only END) AS ot_in,
        MAX(CASE WHEN log_type = 'OT OUT' THEN time_only END) AS ot_out

      FROM employee_dtr
      WHERE bio_id = ?
        AND date_only IS NOT NULL
    `;

    const params = [bio_id];

    if (month && year) {
      sql += ` AND MONTH(date_only) = ? AND YEAR(date_only) = ?`;
      params.push(month, year);
    }

    sql += ` GROUP BY date_only ORDER BY date_only ASC`;

    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("Employee DTR Error:", err);
        return res.status(500).json({
          message: "Database error",
          error: err.message,
        });
      }

      return res.json({
        user: {
          name: user.name,
          bio_id: user.bio_id,
        },
        dtr: results || [],
      });
    });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getEmployeeDTR,
};