const db = require("../../config/db");
const XLSX = require("xlsx");

const formatDateOnly = (value) => {
  if (!value) return null;

  // FORMAT: YYYY-MM-DD
  if (value instanceof Date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }

  // String MM/DD/YYYY
  if (typeof value === "string") {
    const parts = value.trim().split("/");

    if (parts.length === 3) {
      const [month, day, year] = parts;
      const pad = (n) => String(n).padStart(2, "0");

      return `${year}-${pad(month)}-${pad(day)}`;
    }
  }

  return null;
};

const importDTR = (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const file = req.files.file;

    // Read Excel file
    const workbook = XLSX.read(file.data, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet, {
      raw: false,
      dateNF: "yyyy-mm-dd hh:mm:ss",
    });

    if (data.length === 0) {
      return res.status(400).json({
        message: "Empty Excel file",
      });
    }

    const values = data.map((row) => [
      row["Dept"],
      row["NAME"],
      row["BIOID"],
      row["Date_Time"],
      row["Machine Loc"],
      row["Type"],
      formatDateOnly(row["DateOnly"]), 
      row["TimeOnly"],
      row["AMPM Type"],
      row["Status"] || null,
      row["Their Reason"] || null,
      row["Class"] || null,
      row["Include"] || 0,
      row["Late"] || 0,
    ]);

    const sql = `
      INSERT INTO employee_dtr
      (dept_name, name, bio_id, date_time, machine_loc, log_type, date_only, time_only, ampm_type, status, reason, class, include_in_calc, late_minutes)
      VALUES ?
    `;

    db.query(sql, [values], (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({
          message: "Database error",
        });
      }

      return res.json({
        message: "File imported successfully",
        insertedRows: result.affectedRows,
      });
    });

  } catch (error) {
    console.error("Import Error:", error);
    res.status(500).json({
      message: "Import failed",
    });
  }
};

// Get Departments
const getDepartments = (req, res) => {
  const sql = `
   SELECT 
      TRIM(dept_name) AS name,
      COUNT(DISTINCT bio_id) AS employees
    FROM employee_dtr
    WHERE dept_name IS NOT NULL AND dept_name != ''
    GROUP BY TRIM(dept_name)
    ORDER BY name ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(results);
  });
};

// Get Employees by Department
const getEmployeesByDepartment = (req, res) => {
  const { department } = req.query;

  if (!department) {
    return res.status(400).json({ message: "Department is required" });
  }

  const sql = `
    SELECT 
      bio_id AS id,
      MAX(name) AS name
    FROM employee_dtr
    WHERE TRIM(dept_name) = TRIM(?)
    GROUP BY bio_id
    ORDER BY name ASC
  `;

  db.query(sql, [department], (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({
        message: "Database error",
        error: err.sqlMessage || err.message,
      });
    }

    res.json(results);
  });
};

// Get Employee DTR
const getEmployeeDTR = (req, res) => {
  try {
    const { bio_id, month, year } = req.query;

    if (!bio_id || !month || !year) {
      return res.status(400).json({
        message: "Missing parameters",
      });
    }

    // Return date as plain "YYYY-MM-DD" to avoid mysql2 timezone conversion.
    const sql = `
      SELECT 
        DATE_FORMAT(date_only, '%Y-%m-%d') AS date,

        MAX(CASE WHEN TRIM(ampm_type) = 'AM IN' THEN time_only END) AS amIn,
        MAX(CASE WHEN TRIM(ampm_type) = 'AM OUT' THEN time_only END) AS amOut,
        MAX(CASE WHEN TRIM(ampm_type) = 'PM IN' THEN time_only END) AS pmIn,
        MAX(CASE WHEN TRIM(ampm_type) = 'PM OUT' THEN time_only END) AS pmOut,
        MAX(CASE WHEN TRIM(ampm_type) = 'OT IN' THEN time_only END) AS otIn,
        MAX(CASE WHEN TRIM(ampm_type) = 'OT OUT' THEN time_only END) AS otOut

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
        console.error("DTR Fetch Error:", err);
        return res.status(500).json({
          message: "Database error",
          error: err.message,
        });
      }

      res.json(results);
    });

  } catch (error) {
    console.error("Server Crash:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE DTR inside a transaction on a single pooled connection.
const updateEmployeeDTR = (req, res) => {
  const entries = req.body;

  if (!Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: "No DTR data provided" });
  }

  const updateQuery = `
    UPDATE employee_dtr
    SET time_only = ?, status = 'Edited'
    WHERE bio_id = ?
      AND date_only = ?
      AND TRIM(ampm_type) = ?
  `;

  // Flatten entries into [time, bio_id, date, type]
  const updatesToRun = [];
  for (const entry of entries) {
    const { bio_id, date, amIn, amOut, pmIn, pmOut, otIn, otOut } = entry || {};
    if (!bio_id || !date) {
      return res.status(400).json({ error: "Missing bio_id or date in DTR payload" });
    }

    const fields = [
      ["AM IN", amIn],
      ["AM OUT", amOut],
      ["PM IN", pmIn],
      ["PM OUT", pmOut],
      ["OT IN", otIn],
      ["OT OUT", otOut],
    ];
    for (const [type, time] of fields) {
      if (time === null) continue;
      updatesToRun.push([time, bio_id, date, type]);
    }
  }

  
  db.getConnection((connErr, connection) => {
    if (connErr) {
      return res.status(500).json({ error: "Failed to update DTR", details: connErr.message });
    }

    const fail = (e) => {
      connection.rollback(() => {
        connection.release();
        res.status(500).json({ error: "Failed to update DTR", details: e?.message || String(e) });
      });
    };

    connection.beginTransaction((txErr) => {
      if (txErr) {
        connection.release();
        return res.status(500).json({ error: "Failed to update DTR", details: txErr.message });
      }

      const misses = []; // updates that matched 0 rows
      let i = 0;

      const runNext = () => {
        if (i >= updatesToRun.length) {
          return connection.commit((commitErr) => {
            if (commitErr) return fail(commitErr);
            connection.release();
            res.json({ message: "DTR updated successfully", updates: updatesToRun.length, misses });
          });
        }

        const params = updatesToRun[i];
        connection.query(updateQuery, params, (qErr, result) => {
          if (qErr) return fail(qErr);
          if (!result || (result.affectedRows || 0) === 0) {
            const [, bio_id, date, type] = params;
            misses.push({ bio_id, date, type });
          }
          i += 1;
          runNext();
        });
      };

      runNext();
    });
  });
};

module.exports = {
    importDTR,
    getDepartments,
    getEmployeesByDepartment,
    getEmployeeDTR,
    updateEmployeeDTR,
};