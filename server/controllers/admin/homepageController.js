const db = require("../../config/db");

const getDTRBatches = (req, res) => {
  const sql = `
    SELECT 
      id AS batch_id,
      file_name,
      uploaded_at
    FROM dtr_batches
    ORDER BY uploaded_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Error fetching batches:", err);
      return res.status(500).json({ error: "Failed to fetch batches" });
    }

    const grouped = {};

    rows.forEach((row) => {
      const year = new Date(row.uploaded_at).getFullYear();

      if (!grouped[year]) grouped[year] = [];

      grouped[year].push({
        batch_id: row.batch_id,
        label: row.file_name,
        uploaded_at: row.uploaded_at,
      });
    });

    return res.json(grouped);
  });
};

const getLatestBatch = (req, res) => {
  const sql = `
    SELECT id AS batch_id
    FROM dtr_batches
    ORDER BY uploaded_at DESC
    LIMIT 1
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to get latest batch" });
    }

    if (!rows || !rows.length) {
      return res.json({ batch_id: null });
    }

    res.json({ batch_id: rows[0].batch_id });
  });
};

module.exports = { getDTRBatches, getLatestBatch };