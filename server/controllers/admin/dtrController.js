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
      INSERT INTO raw_logs 
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
    FROM raw_logs
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
    FROM raw_logs
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

module.exports = { importDTR, getDepartments, getEmployeesByDepartment };