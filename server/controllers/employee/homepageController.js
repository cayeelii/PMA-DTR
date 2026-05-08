const db = require("../../config/db");

const getEmployeeHomepage = async (req, res) => {
  try {
    const user = req.session.user;

    if (!user || !user.bio_id) {
      return res.status(401).json({
        message: "Unauthorized. Please login again.",
      });
    }

    const bioId = user.bio_id;

    // Get employee DTR logs
    const [rows] = await db.query(
      `SELECT 
          log_id,
          date_only,
          time_only,
          log_type,
          status
       FROM employee_dtr
       WHERE bio_id = ?
       ORDER BY date_only DESC, time_only DESC`,
      [bioId]
    );

    // Format rows
    const logs = rows.map((log) => {
      const date = new Date(log.date_only);

      const year = date.getFullYear();

      const month = date.toLocaleString("en-US", {
        month: "long",
      });

      return {
        id: log.log_id,
        date: log.date_only,
        time: log.time_only,
        type: log.log_type,
        status: log.status,
        year,
        month,
      };
    });

    // Group by Year → Month
    const grouped = {};

    logs.forEach((log) => {
      if (!grouped[log.year]) {
        grouped[log.year] = {};
      }

      if (!grouped[log.year][log.month]) {
        grouped[log.year][log.month] = [];
      }

      grouped[log.year][log.month].push(log);
    });

    res.json({
      user: {
        name: user.name,
        bio_id: user.bio_id,
      },
      dtr: grouped,
    });

  } catch (err) {
    console.error("Homepage error:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getEmployeeHomepage,
};