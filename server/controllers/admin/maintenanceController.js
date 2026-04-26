const db = require("../../config/db");

// ADD HOLIDAY / HALF-DAY
const addMaintenance = (req, res) => {
  try {
    const { date, category, times } = req.body;

    const sql = `
      INSERT INTO maintenance_settings 
      (config_date, category, am_in, am_out, pm_in, pm_out)
      VALUES (?, ?, ?, ?, ?, ?)
    `;


    const cleanDate = normalizeDate(date);

    db.query(
      sql,
      [
        cleanDate,
        category,
        times?.amIn || null,
        times?.amOut || null,
        times?.pmIn || null,
        times?.pmOut || null,
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "DB error" });
        }

        res.json({ message: "Added successfully" });
      }
    );
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL
const getMaintenance = (req, res) => {
  const sql = `
    SELECT 
      setting_id,
      DATE_FORMAT(config_date, '%Y-%m-%d') AS config_date,
      category,
      am_in,
      am_out,
      pm_in,
      pm_out
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

  // Split only date part and normalize to YYYY-MM-DD
  const dateOnly = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const parts = dateOnly.split('-');

  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return dateOnly;
};

module.exports = {
  addMaintenance,
  getMaintenance,
  deleteMaintenance,
  normalizeDate,
};