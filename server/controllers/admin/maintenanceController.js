const db = require("../../config/db");

// ADD HOLIDAY / HALF-DAY
const addMaintenance = (req, res) => {
  try {
    const { date, category } = req.body;

    if (!date || !category) {
      return res.status(400).json({ message: "Date and category are required" });
    }

    const sql = `
      INSERT INTO maintenance_settings (config_date, category)
      VALUES (?, ?)
    `;


    const cleanDate = normalizeDate(date);
    
    db.query(sql, [cleanDate, category], (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Database error", error: err.message });
      }

      res.json({
        message: "Added successfully",
        id: result.insertId,
        date: cleanDate,
        category,
      });
    });
  } catch (error) {
    console.error("Add Maintenance Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL
const getMaintenance = (req, res) => {
  const sql = `
    SELECT 
      setting_id,
      DATE_FORMAT(config_date, '%Y-%m-%d') AS config_date,
      category
    FROM maintenance_settings
    ORDER BY config_date ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(results);
  });
};

// DELETE
const deleteMaintenance = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM maintenance_settings WHERE setting_id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.json({ message: "Deleted successfully" });
  });
};

const normalizeDate = (dateStr) => {
  if (!dateStr) return null;
  const cleanedDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  return cleanedDate;
};

module.exports = {
  addMaintenance,
  getMaintenance,
  deleteMaintenance,
  normalizeDate,
};