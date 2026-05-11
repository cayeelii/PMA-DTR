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

          MAX(CASE WHEN ampm_type = 'AM IN' 
            THEN TIME_FORMAT(time_only, '%H:%i:%s') END) AS am_in,

          MAX(CASE WHEN ampm_type = 'AM OUT' 
            THEN TIME_FORMAT(time_only, '%H:%i:%s') END) AS am_out,

          MAX(CASE WHEN ampm_type = 'PM IN' 
            THEN TIME_FORMAT(time_only, '%H:%i:%s') END) AS pm_in,

          MAX(CASE WHEN ampm_type = 'PM OUT' 
            THEN TIME_FORMAT(time_only, '%H:%i:%s') END) AS pm_out,

          MAX(CASE WHEN ampm_type = 'OT IN' 
            THEN TIME_FORMAT(time_only, '%H:%i:%s') END) AS ot_in,

          MAX(CASE WHEN ampm_type = 'OT OUT' 
            THEN TIME_FORMAT(time_only, '%H:%i:%s') END) AS ot_out
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

            const departmentName = (user.department || "").trim();
            if (!departmentName) {
                return res.json({
                    user: {
                        name: user.name,
                        bio_id: user.bio_id,
                        department: user.department || "",
                    },
                    signatory: null,
                    dtr: results || [],
                });
            }

            const signatorySql = `
                SELECT
                    s.signatory_id,
                    s.head_name,
                    s.position,
                    d.dept_id,
                    d.dept_name
                FROM signatories s
                JOIN departments d ON d.dept_id = s.dept_id
                WHERE TRIM(d.dept_name) = TRIM(?)
                LIMIT 1
            `;

            db.query(signatorySql, [departmentName], (signErr, signRows) => {
                if (signErr) {
                    console.error("Employee DTR signatory lookup error:", signErr);
                }

                return res.json({
                    user: {
                        name: user.name,
                        bio_id: user.bio_id,
                        department: user.department || "",
                    },
                    signatory: signErr ? null : signRows[0] || null,
                    dtr: results || [],
                });
            });
        });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};

const getLatestDTR = (req, res) => {
    const user = req.session.user;

    const sql = `
        SELECT 
            YEAR(date_only) AS year,
            MONTH(date_only) AS month
        FROM employee_dtr
        WHERE bio_id = ?
        GROUP BY YEAR(date_only), MONTH(date_only)
        ORDER BY year DESC, month DESC
        LIMIT 1
    `;

    db.query(sql, [user.bio_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "DB error" });
        }

        // if no data at all
        if (result.length === 0) {
            return res.json({
                year: null,
                month: null,
                hasData: false
            });
        }

        res.json({
            ...result[0],
            hasData: true
        });
    });
};

module.exports = {
    getEmployeeDTR,
    getLatestDTR,
};
