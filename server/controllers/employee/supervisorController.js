const db = require("../../config/db");

const getSupervisorEmployees = (req, res) => {
  const user = req.session.user;

  console.log("Session user:", user);

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

  // IMPORTANT: use the exact session field name
  const deptId = user.department || user.dept_id;

  if (!deptId) {
    return res.status(400).json({
      message: "Supervisor has no assigned department.",
    });
  }

  // Get department name
  const deptSql = `
    SELECT dept_name
    FROM departments
    WHERE dept_id = ?
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

module.exports = {
  getSupervisorEmployees,
};