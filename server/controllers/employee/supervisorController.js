const db = require("../../config/db");

// Get employees under the supervisor's department
const getSupervisorEmployees = (req, res) => {
    const user = req.session.user;

    if (!user || !user.bio_id) {
        return res.status(401).json({
            message: "Unauthorized. Please login again.",
        });
    }

    if (user.role !== "supervisor") {
        return res.status(403).json({
            message: "Access denied.",
        });
    }

    const deptId = user.department || user.dept_id;

    if (!deptId) {
        return res.status(400).json({
            message: "Supervisor has no assigned department.",
        });
    }

    const deptName = user.department;

    const deptSql = `
  SELECT dept_name
  FROM departments
  WHERE dept_name = ?
  LIMIT 1
`;

    db.query(deptSql, [deptId], (deptErr, deptResult) => {
        if (deptErr) {
            console.error(deptErr);

            return res.status(500).json({
                message: "Database error",
            });
        }

        if (!deptResult.length) {
            return res.status(404).json({
                message: "Department not found",
            });
        }

        const departmentName = deptResult[0].dept_name;

        // Get latest imported batch
        const batchSql = `
      SELECT MAX(batch_id) AS batch_id
      FROM employee_dtr
    `;

        db.query(batchSql, (batchErr, batchResult) => {
            if (batchErr) {
                console.error(batchErr);

                return res.status(500).json({
                    message: "Database error",
                });
            }

            const batchId = batchResult[0].batch_id;

            // Get employees from imported DTR
            const employeeSql = `
        SELECT 
          bio_id,
          MAX(name) AS name
        FROM employee_dtr
        WHERE TRIM(dept_name) = TRIM(?)
          AND batch_id = ?
        GROUP BY bio_id
        ORDER BY name ASC
      `;

            db.query(
                employeeSql,
                [departmentName, batchId],
                (empErr, employees) => {
                    if (empErr) {
                        console.error(empErr);

                        return res.status(500).json({
                            message: "Database error",
                        });
                    }

                    return res.status(200).json({
                        department: departmentName,
                        employees,
                    });
                },
            );
        });
    });
};

// Get available months with DTR data for the employee
const getAvailableDTRMonths = async (req, res) => {
    try {
        const { bio_id } = req.query;

        if (!bio_id) {
            return res.status(400).json({ message: "bio_id is required" });
        }

        const sql = `
            SELECT DISTINCT
                YEAR(date_only) AS year,
                MONTH(date_only) AS month
            FROM employee_dtr
            WHERE bio_id = ?
            ORDER BY year DESC, month DESC
        `;

        db.query(sql, [bio_id], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Database error" });
            }

            res.json(results);
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get DTR for a specific employee and month
const getEmployeeDTR = async (req, res) => {
    try {
        const { bio_id, month, year } = req.query;

        if (!bio_id || !month || !year) {
            return res.status(400).json({
                message: "Missing parameters",
            });
        }

        const sql = `
 SELECT 
    DATE_FORMAT(date_only, '%Y-%m-%d') AS date,

    MAX(CASE WHEN TRIM(ampm_type) = 'AM IN' THEN time_only END) AS am_in,
    MAX(CASE WHEN TRIM(ampm_type) = 'AM OUT' THEN time_only END) AS am_out,
    MAX(CASE WHEN TRIM(ampm_type) = 'PM IN' THEN time_only END) AS pm_in,
    MAX(CASE WHEN TRIM(ampm_type) = 'PM OUT' THEN time_only END) AS pm_out,
    MAX(CASE WHEN TRIM(ampm_type) = 'OT IN' THEN time_only END) AS ot_in,
    MAX(CASE WHEN TRIM(ampm_type) = 'OT OUT' THEN time_only END) AS ot_out

  FROM employee_dtr
  WHERE bio_id = ?
    AND date_only IS NOT NULL
    AND MONTH(date_only) = ?
    AND YEAR(date_only) = ?

  GROUP BY date_only
  ORDER BY date_only ASC
`;

        db.query(sql, [bio_id, month, year], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Database error" });
            }

            res.json({
                dtr: results,
            });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSupervisorEmployees,
    getAvailableDTRMonths,
    getEmployeeDTR,
};
