const db = require("../../config/db");

//Get all departments
const getDepartments = (req, res) => {
  const sql = "SELECT dept_id, dept_name FROM departments ORDER BY dept_name";

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(results);
  });
};

//Get all signatories
const getSignatories = (req, res) => {
  const sql = `
    SELECT s.signatory_id, s.head_name, d.dept_id, d.dept_name
    FROM signatories s
    JOIN departments d ON s.dept_id = d.dept_id
    ORDER BY s.signatory_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(results);
  });
};

//Add signatory
const addSignatory = (req, res) => {
  const { dept_name, head_name } = req.body;

  const deptName = dept_name.toUpperCase();

  if (!deptName || !head_name) {
    return res.status(400).json({
      error: "Department and head name are required",
    });
  }

  const checkDeptSql = `SELECT * FROM departments WHERE dept_name = ?`;

  db.query(checkDeptSql, [deptName], (err, deptRows) => {
    if (err) return res.status(500).json({ error: err.message });

    const handleInsertSignatory = (dept_id) => {
      const checkSignatorySql = `SELECT * FROM signatories WHERE dept_id = ?`;

      db.query(checkSignatorySql, [dept_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        if (rows.length > 0) {
          return res.status(400).json({
            error: "This department already has a signatory",
          });
        }

        const insertSql = `
          INSERT INTO signatories (dept_id, head_name)
          VALUES (?, ?)
        `;

        db.query(insertSql, [dept_id, head_name], (err, result) => {
          if (err) return res.status(500).json({ error: err.message });

          res.json({
            message: "Signatory added successfully",
            signatory_id: result.insertId,
            dept_id,
          });
        });
      });
    };

    if (deptRows.length > 0) {
      handleInsertSignatory(deptRows[0].dept_id);
    } else {
      const insertDeptSql = `
        INSERT INTO departments (dept_name)
        VALUES (?)
      `;

      db.query(insertDeptSql, [deptName], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        handleInsertSignatory(result.insertId);
      });
    }
  });
};

//Update signatory
const updateSignatory = (req, res) => {
  const { signatory_id, dept_id, head_name } = req.body;

  if (!signatory_id || !dept_id || !head_name) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }

  const checkSql = `
    SELECT * FROM signatories 
    WHERE dept_id = ? AND signatory_id != ?
  `;

  db.query(checkSql, [dept_id, signatory_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (rows.length > 0) {
      return res.status(400).json({
        error: "This department already has a signatory",
      });
    }

    const sql = `
      UPDATE signatories
      SET dept_id = ?, head_name = ?
      WHERE signatory_id = ?
    `;

    db.query(sql, [dept_id, head_name, signatory_id], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "Signatory updated successfully" });
    });
  });
};

module.exports = {
  getDepartments,
  getSignatories,
  addSignatory,
  updateSignatory,
};
