const db = require("../../config/db");

const getEmployeeDTR = async (req, res) => {
  try {
    const user = req.session.user;

    if (!user || !user.bio_id) {
      return res.status(401).json({
        message: "Unauthorized. Please login again.",
      });
    }

    const bioId = user.bio_id;

    // optional filters from frontend
    const { month, year } = req.query;

    let query = `
      SELECT 
        date_only,
        DAYNAME(date_only) AS day,
        log_type,
        time_only
      FROM employee_dtr
      WHERE bio_id = ?
    `;

    const params = [bioId];

    if (month && year) {
      query += ` AND MONTH(date_only) = ? AND YEAR(date_only) = ?`;
      params.push(month, year);
    }

    query += ` ORDER BY date_only ASC, time_only ASC`;

    const [rows] = await db.query(query, params);

    // 🧠 transform into DTR table format
    const dtrMap = {};

    rows.forEach((row) => {
      const dateKey = row.date_only.toISOString().split("T")[0];

      if (!dtrMap[dateKey]) {
        dtrMap[dateKey] = {
          date: dateKey,
          day: row.day,
          am_in: null,
          am_out: null,
          pm_in: null,
          pm_out: null,
          ot_in: null,
          ot_out: null,
        };
      }

      const time = row.time_only;
      const type = row.log_type;

      // map log types to UI columns
      switch (type) {
        case "AM IN":
          dtrMap[dateKey].am_in = time;
          break;
        case "AM OUT":
          dtrMap[dateKey].am_out = time;
          break;
        case "PM IN":
          dtrMap[dateKey].pm_in = time;
          break;
        case "PM OUT":
          dtrMap[dateKey].pm_out = time;
          break;
        case "OT IN":
          dtrMap[dateKey].ot_in = time;
          break;
        case "OT OUT":
          dtrMap[dateKey].ot_out = time;
          break;
      }
    });

    res.json({
      user: {
        name: user.name,
        bio_id: user.bio_id,
      },
      dtr: Object.values(dtrMap),
    });

  } catch (err) {
    console.error("DTR fetch error:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getEmployeeDTR,
};