// controllers/admin/dtrController.js
const db = require("../../config/db");
const XLSX = require("xlsx");

const importDTR = (req, res) => {
  try {
    // ✅ Check if file exists
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const file = req.files.file;

    // ✅ Read Excel file using SheetJS
    const workbook = XLSX.read(file.data, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return res.status(400).json({
        message: "Empty Excel file",
      });
    }

    // ✅ Map Excel → DB columns
    const values = data.map((row) => [
      row["Dept Nam"],
      row["BIOID"],
      row["Date_Time"],
      row["Machine Loc"],
      row["Type"],
      row["DateOnly"],
      row["TimeOnly"],
      row["AMPM Type"],
      row["Status"] || null,
      row["Their Reason"] || null,
      row["Class"] || null,
      row["Include"] || 0,
      row["Late"] || 0,
    ]);

    // ✅ Insert to database
    const sql = `
      INSERT INTO raw_logs 
      (dept_name, bio_id, date_time, machine_loc, log_type, date_only, time_only, ampm_type, status, reason, class, include_in_calc, late_minutes)
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

module.exports = { importDTR };