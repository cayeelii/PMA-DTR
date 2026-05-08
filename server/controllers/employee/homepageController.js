const db = require("../../config/db");

const getEmployeeHomepage = (req, res) => {
  try {
    const user = req.session.user;

    if (!user || !user.bio_id) {
      return res.status(401).json({
        message: "Unauthorized. Please login again.",
      });
    }

    const bioId = user.bio_id;

    const sql = `
      SELECT DISTINCT
        b.id AS batch_id,
        b.file_name,
        d.date_only
      FROM employee_dtr d
      INNER JOIN dtr_batches b
        ON d.batch_id = b.id
      WHERE d.bio_id = ?
    `;

    db.query(sql, [bioId], (err, rows) => {
      if (err) {
        console.error("Homepage error:", err);
        return res.status(500).json({
          message: "Database error",
        });
      }

      // Group by YEAR → MONTH
      const grouped = {};

      rows.forEach((row) => {
        const date = new Date(row.date_only);

        const year = date.getFullYear();
        const month = date.toLocaleString("en-US", {
          month: "long",
        });

        if (!grouped[year]) grouped[year] = {};
        if (!grouped[year][month]) {
          grouped[year][month] = {
            label: month,
            files: [],
          };
        }

        // avoid duplicates
        const exists = grouped[year][month].files.some(
          (f) => f.id === row.batch_id
        );

        if (!exists) {
          grouped[year][month].files.push({
            id: row.batch_id,
            name: row.file_name,
            url: `/employee/dtr/${row.batch_id}`,
          });
        }
      });

      return res.json({
        user: {
          name: user.name,
          bio_id: user.bio_id,
        },
        dtr: grouped,
      });
    });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = { getEmployeeHomepage };