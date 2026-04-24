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
      return res
        .status(400)
        .json({ error: "Missing bio_id or date in DTR payload" });
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

  // Unique (bio_id, date) pairs to pre-fetch current values for audit diffs.
  const pairKey = (b, d) => `${b}|${d}`;
  const uniquePairs = Array.from(
    new Map(
      updatesToRun.map((u) => [pairKey(u[1], u[2]), [u[1], u[2]]]),
    ).values(),
  );

  db.getConnection((connErr, connection) => {
    if (connErr) {
      return res
        .status(500)
        .json({ error: "Failed to update DTR", details: connErr.message });
    }

    const fail = (e) => {
      connection.rollback(() => {
        connection.release();
        res.status(500).json({
          error: "Failed to update DTR",
          details: e?.message || String(e),
        });
      });
    };

    connection.beginTransaction((txErr) => {
      if (txErr) {
        connection.release();
        return res
          .status(500)
          .json({ error: "Failed to update DTR", details: txErr.message });
      }

      // 1) Fetch current (old) values + employee names for all targets.
      const selectOldSql = uniquePairs.length
        ? `
          SELECT
            bio_id,
            MAX(name) AS name,
            DATE_FORMAT(date_only, '%Y-%m-%d') AS date_only,
            TRIM(ampm_type) AS ampm_type,
            time_only
          FROM employee_dtr
          WHERE (bio_id, date_only) IN (${uniquePairs.map(() => "(?, ?)").join(", ")})
          GROUP BY bio_id, date_only, TRIM(ampm_type), time_only
        `
        : null;
      const selectOldParams = uniquePairs.flat();

      const runSelectOld = (cb) => {
        if (!selectOldSql) return cb(null, []);
        connection.query(selectOldSql, selectOldParams, (e, rows) => cb(e, rows));
      };

      runSelectOld((selErr, oldRows) => {
        if (selErr) return fail(selErr);

        // Map of bio|date|type -> { old_time, name }
        const oldMap = new Map();
        const nameMap = new Map(); // bio_id -> name
        for (const r of oldRows || []) {
          oldMap.set(
            `${r.bio_id}|${r.date_only}|${r.ampm_type}`,
            { old_time: r.time_only, name: r.name },
          );
          if (r.name && !nameMap.has(String(r.bio_id))) {
            nameMap.set(String(r.bio_id), r.name);
          }
        }

        const misses = []; // updates that matched 0 rows
        let i = 0;

        const finalize = () => {
          const actorUserId = req.session?.user?.user_id ?? null;

          // Build per-field diffs (only where value actually changed).
          const changes = [];
          for (const [newTime, bio_id, date, type] of updatesToRun) {
            const key = `${bio_id}|${date}|${type}`;
            const prev = oldMap.get(key);
            const oldTime = prev ? prev.old_time : null;
            const name = (prev && prev.name) || nameMap.get(String(bio_id)) || null;
            if ((oldTime || null) === (newTime || null)) continue;
            changes.push({
              bio_id: String(bio_id),
              name,
              date,
              field: type,
              old_time: oldTime,
              new_time: newTime,
            });
          }

          const finishWithoutLog = () =>
            connection.commit((commitErr) => {
              if (commitErr) return fail(commitErr);
              connection.release();
              res.json({
                message: "DTR updated successfully",
                updates: updatesToRun.length,
                misses,
              });
            });

          // If no actual value changes, skip creating a log entry.
          if (changes.length === 0) return finishWithoutLog();

          const uniqueBioIds = Array.from(new Set(changes.map((c) => c.bio_id)));
          const uniqueDates = Array.from(new Set(changes.map((c) => c.date))).sort();
          const primaryName = nameMap.get(uniqueBioIds[0]) || null;

          const summary =
            `Edited ${changes.length} DTR field${changes.length === 1 ? "" : "s"} ` +
            `for ${
              primaryName
                ? `${primaryName} (Bio ID ${uniqueBioIds[0]})`
                : `Bio ID ${uniqueBioIds.join(", ")}`
            }${uniqueBioIds.length > 1 ? ` +${uniqueBioIds.length - 1} more` : ""}` +
            ` across ${uniqueDates.length} date${uniqueDates.length === 1 ? "" : "s"}.`;

          const payload = JSON.stringify({ summary, changes });

          const insertActivitySql = `
            INSERT INTO activity_logs (user_id, action_performed, action_details, target_bio_id)
            VALUES (?, ?, ?, ?)
          `;

          connection.query(
            insertActivitySql,
            [actorUserId, "DTR Edit", payload, uniqueBioIds[0] ?? null],
            (logErr) => {
              if (logErr) return fail(logErr);
              return connection.commit((commitErr) => {
                if (commitErr) return fail(commitErr);
                connection.release();
                res.json({
                  message: "DTR updated successfully",
                  updates: updatesToRun.length,
                  misses,
                });
              });
            },
          );
        };

        const runNext = () => {
          if (i >= updatesToRun.length) return finalize();

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
  });
};

//Get Signatory by Department
const getDepartmentSignatory = (req, res) => {
  try {
    const { dept_id } = req.query;

    const sql = `
      SELECT 
        s.signatory_id,
        s.head_name,
        d.dept_name
      FROM signatories s
      JOIN departments d ON d.dept_id = s.dept_id
      WHERE d.dept_id = ?
      LIMIT 1
    `;

    db.query(sql, [dept_id], (err, results) => {
      if (err) {
        console.error("SQL ERROR:", err.sqlMessage || err);
        return res.status(500).json({
          message: err.sqlMessage || "Database error",
        });
      }

      console.log("RESULT:", results);
      res.json(results[0] || null);
    });
  } catch (error) {
    console.error("SERVER CRASH:", error);
    res.status(500).json({ message: "Server crash" });
  }
};

module.exports = {
  importDTR,
  getDepartments,
  getEmployeesByDepartment,
  getEmployeeDTR,
  updateEmployeeDTR,
  getDepartmentSignatory,
};
