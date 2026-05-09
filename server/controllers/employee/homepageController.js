const db = require("../../config/db");

const getDTRSummary = (req, res) => {
    const user = req.session.user;

    const sql = `
        SELECT 
            YEAR(date_only) AS year,
            MONTH(date_only) AS month
        FROM employee_dtr
        WHERE bio_id = ?
        GROUP BY YEAR(date_only), MONTH(date_only)
        ORDER BY year DESC, month DESC
    `;

    db.query(sql, [user.bio_id], (err, result) => {
        if (err) return res.status(500).json({ message: "DB error" });

        const latest = result[0] || null;

        const grouped = result.reduce((acc, row) => {
            if (!acc[row.year]) acc[row.year] = [];
            acc[row.year].push(row.month);
            return acc;
        }, {});

        res.json({
            latest,
            available: grouped
        });
    });
};

module.exports = { getDTRSummary };