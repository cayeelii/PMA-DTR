const db = require("../../config/db");

//Get all departments
const getDepartments = (req, res) => {
  const sql = `
    SELECT dept_id, dept_name, dept_full_name 
    FROM departments 
    ORDER BY dept_name
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(results);
  });
};

//Get all signatories
const getSignatories = (req, res) => {
  const sql = `
    SELECT 
      s.signatory_id, 
      s.head_name, 
      s.position,
      d.dept_id, 
      d.dept_name,
      d.dept_full_name
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
  const { dept_name, dept_full_name, head_name, position } = req.body;

  const deptName = (dept_name || "").toUpperCase().trim();
  const deptFullName = (dept_full_name || "").trim();
  const headName = (head_name || "").trim();
  const pos = (position || "").trim();

  if (!deptName || !deptFullName || !headName || !pos) {
    return res.status(400).json({
      error: "Department, full name, head name, and position are required",
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
          INSERT INTO signatories (dept_id, head_name, position)
          VALUES (?, ?, ?)
        `;

        db.query(insertSql, [dept_id, headName, pos], (err, result) => {
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
      const existingDept = deptRows[0];

      if (existingDept.dept_full_name !== deptFullName) {
        const updateDeptSql = `
          UPDATE departments 
          SET dept_full_name = ?
          WHERE dept_id = ?
        `;

        db.query(updateDeptSql, [deptFullName, existingDept.dept_id], (err) => {
          if (err) return res.status(500).json({ error: err.message });

          handleInsertSignatory(existingDept.dept_id);
        });
      } else {
        handleInsertSignatory(existingDept.dept_id);
      }
    } else {
      const insertDeptSql = `
        INSERT INTO departments (dept_name, dept_full_name)
        VALUES (?, ?)
      `;

      db.query(insertDeptSql, [deptName, deptFullName], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        handleInsertSignatory(result.insertId);
      });
    }
  });
};

//Update signatory
const updateSignatory = (req, res) => {
  let { signatory_id, dept_id, head_name, position } = req.body;

  signatory_id = Number(signatory_id);
  dept_id = Number(dept_id);
  head_name = (head_name || "").trim();
  position = (position || "").trim();

  if (!signatory_id || !dept_id || !head_name || !position) {
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
      SET dept_id = ?, head_name = ?, position = ?
      WHERE signatory_id = ?
    `;

    db.query(sql, [dept_id, head_name, position, signatory_id], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "Signatory updated successfully" });
    });
  });
};

//Delete signatory
const deleteSignatory = (req, res) => {
  const { signatory_id } = req.params;

  if (!signatory_id) {
    return res.status(400).json({ error: "Signatory ID is required" });
  }

  const sql = `DELETE FROM signatories WHERE signatory_id = ?`;

  db.query(sql, [signatory_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Signatory not found" });
    }

    res.json({ message: "Signatory deleted successfully" });
  });
};

module.exports = {
  getDepartments,
  getSignatories,
  addSignatory,
  updateSignatory,
  deleteSignatory,
};
