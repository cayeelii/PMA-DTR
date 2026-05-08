const db = require("../../config/db");
const XLSX = require("xlsx");
const crypto = require("crypto");

// FORMAT DATE ONLY
const formatDateOnly = (value) => {
  if (!value) return null;

  const pad = (n) => String(n).padStart(2, "0");

  if (value instanceof Date) {
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    // MySQL format
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed;
    }

    const parts = trimmed.split("/");

    if (parts.length === 3) {
      let [month, day, year] = parts;

      if (year.length === 2) year = "20" + year;

      return `${year}-${pad(month)}-${pad(day)}`;
    }
  }

  return null;
};

// FORMAT DATETIME
const formatDateTime = (value) => {
  if (!value) return null;

  const pad = (n) => String(n).padStart(2, "0");

  // If already Date object
  if (value instanceof Date) {
    return (
      `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ` +
      `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
    );
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    // Handle MySQL format safely
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const d = new Date(trimmed);
      if (!isNaN(d)) {
        return (
          `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
          `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
        );
      }
    }

    // MM/DD/YYYY HH:MM[:SS] AM/PM or 24-hour
    const match = trimmed.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i,
    );

    if (match) {
      let [, month, day, year, hour, minute, second, ampm] = match;

      if (year.length === 2) year = "20" + year;

      hour = parseInt(hour, 10);

      if (ampm) {
        if (ampm.toUpperCase() === "PM" && hour !== 12) hour += 12;
        if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;
      }

      return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second || 0)}`;
    }
  }

  return null;
};

// IMPORT DTR
const importDTR = (req, res) => {
  try {
    if (!req.files?.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.files.file;
    const fileBuffer = file.data;
    const fileHash = crypto.createHash("md5").update(fileBuffer).digest("hex");

    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const data = XLSX.utils.sheet_to_json(sheet, {
      raw: false,
      defval: null,
      dateNF: "yyyy-mm-dd hh:mm:ss",
    });

    if (!data.length) {
      return res.status(400).json({ message: "Empty file" });
    }

    // check duplicate
    const checkSql = `SELECT id FROM dtr_batches WHERE file_hash = ?`;

    db.query(checkSql, [fileHash], (checkErr, checkResult) => {
      if (checkErr) {
        return res.status(500).json({
          message: "Error checking duplicate file",
        });
      }

      if (checkResult.length > 0) {
        return res.status(400).json({
          message: "This file has already been uploaded.",
        });
      }

      // update current status to done
      const updateSql = `
        UPDATE dtr_batches
        SET status = 'DONE'
        WHERE status = 'CURRENT'
      `;

      db.query(updateSql, (statusErr) => {
        if (statusErr) {
          return res.status(500).json({
            message: "Failed to update batch status",
          });
        }

        // insert new batch
        const insertBatchSql = `
          INSERT INTO dtr_batches (file_name, file_hash, status)
          VALUES (?, ?, 'CURRENT')
        `;

        db.query(insertBatchSql, [file.name, fileHash], (err, batchResult) => {
          if (err) {
            return res.status(500).json({
              message: "Failed to create batch",
            });
          }

          const batch_id = batchResult.insertId;

          const values = data.map((row) => [
            row["Department"] || row["Dept"],
            row["Name"] || row["NAME"],
            row["BIO_ID"] || row["BIOID"],
            formatDateTime(row["Date_Time"]),
            row["Machine_Loc"] || row["Machine Loc"],
            row["Log_Type"] || row["Type"],
            formatDateOnly(row["Date_Only"] || row["DateOnly"]),
            row["Time_Only"] || row["TimeOnly"],
            row["AMPM_Type"] || row["AMPM Type"],
            row["Status"] || null,
            row["Reason"] || row["Their Reason"] || null,
            row["Class"] || null,
            row["Include_In_Calc"] || row["Include"] || 0,
            row["Late_Minutes"] || row["Late"] || 0,
            batch_id,
          ]);

          const insertSql = `
            INSERT INTO employee_dtr (
              dept_name, name, bio_id, date_time, machine_loc,
              log_type, date_only, time_only, ampm_type,
              status, reason, class, include_in_calc,
              late_minutes, batch_id
            ) VALUES ?
          `;

          db.query(insertSql, [values], (err2, result) => {
            if (err2) {
              return res.status(500).json({
                message: "Insert failed",
              });
            }

            return res.json({
              message: "Import successful",
              batch_id,
              insertedRows: result.affectedRows,
            });
          });
        });
      });
    });
  } catch (err) {
    console.error("Import error:", err);
    return res.status(500).json({ message: "Import error" });
  }
};

// Get Departments
const getDepartments = (req, res) => {
  const { batch_id } = req.query;

  if (!batch_id) {
    return res.status(400).json({ message: "Missing batch_id" });
  }

  const sql = `
    SELECT 
      d.dept_id,
      TRIM(e.dept_name) AS name,
      COUNT(DISTINCT e.bio_id) AS employees
    FROM employee_dtr e
    LEFT JOIN departments d 
      ON TRIM(e.dept_name) = TRIM(d.dept_name)
    WHERE e.dept_name IS NOT NULL 
      AND e.dept_name != ''
      AND e.batch_id = ?
    GROUP BY d.dept_id, TRIM(e.dept_name)
    ORDER BY name ASC
  `;

  db.query(sql, [batch_id], (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(results);
  });
};

// Get Employees by Department
const getEmployeesByDepartment = (req, res) => {
  const { department, batch_id } = req.query;

  if (!department) {
    return res.status(400).json({ message: "Department is required" });
  }

  if (!batch_id) {
    return res.status(400).json({ message: "Missing batch_id" });
  }

  const sql = `
    SELECT 
      bio_id AS id,
      MAX(name) AS name
    FROM employee_dtr
    WHERE TRIM(dept_name) = TRIM(?)
      AND batch_id = ?
    GROUP BY bio_id
    ORDER BY name ASC
  `;

  db.query(sql, [department, batch_id], (err, results) => {
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
    const { bio_id, month, year, batch_id } = req.query;

    if (!bio_id) {
      return res.status(400).json({ message: "Missing bio_id" });
    }

    if (!batch_id) {
      return res.status(400).json({ message: "Missing batch_id" });
    }

    let sql;
    let params;

    // FILTER BY MONTH/YEAR
    if (month && year) {
      sql = `
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
          AND batch_id = ?
          AND date_only IS NOT NULL
          AND MONTH(date_only) = ?
          AND YEAR(date_only) = ?

        GROUP BY date_only
        ORDER BY date_only ASC
      `;

      params = [bio_id, batch_id, month, year];
    }

    // LATEST DATA
    else {
      sql = `
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
          AND batch_id = ?
          AND date_only IS NOT NULL

        GROUP BY date_only
        ORDER BY date_only ASC
      `;

      params = [bio_id, batch_id];
    }

    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("DTR Fetch Error:", err);
        return res.status(500).json({
          message: "Database error",
          error: err.message,
        });
      }

      return res.json(results || []);
    });
  } catch (error) {
    console.error("Server Crash:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Insert a manual DTR time.
const insertDtrTime = (
  connection,
  { newTime, bio_id, batch_id, date, ampmType },
  nameMap,
  metaCache,
  onDone,
) => {
  const k = String(bio_id);

  const useMeta = (meta) => {
    if (meta.name) nameMap.set(k, meta.name);
    const dateTime = `${date} ${newTime}`;
    const insertSql = `
    INSERT INTO employee_dtr (
      dept_name, name, bio_id, date_time, machine_loc,
      log_type, date_only, time_only, ampm_type,
      status, reason, class, include_in_calc, late_minutes, batch_id
    ) VALUES (?, ?, ?, ?, 'DTR Editor', 'MANUAL', ?, ?, ?, 'Edited', NULL, NULL, 1, 0, ?)
  `;
    connection.query(
      insertSql,
      [
        meta.dept_name,
        meta.name,
        bio_id,
        dateTime,
        date,
        newTime,
        ampmType,
        batch_id,
      ],
      onDone,
    );
  };

  if (metaCache.has(k)) {
    return useMeta(metaCache.get(k));
  }

  connection.query(
    `SELECT MAX(name) AS name, MAX(TRIM(dept_name)) AS dept_name
      FROM employee_dtr
      WHERE bio_id = ? AND batch_id = ?`,
    [bio_id, batch_id],
    (e, rows) => {
      if (e) return onDone(e);
      const row = rows && rows[0];
      if (!row || (row.name == null && row.dept_name == null)) {
        return onDone(
          new Error(
            "Cannot save: no existing DTR row for this employee in this batch (copy name/dept from).",
          ),
        );
      }
      const meta = {
        name: row.name || "",
        dept_name: (row.dept_name && String(row.dept_name).trim()) || "—",
      };
      metaCache.set(k, meta);
      useMeta(meta);
    },
  );
};

const updateEmployeeDTR = (req, res) => {
  const entries = req.body;

  if (!Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: "No DTR data provided" });
  }

  const batch_id = entries?.[0]?.batch_id;

  if (!batch_id) {
    return res.status(400).json({
      error: "Missing batch_id in request",
    });
  }

  const updateQuery = `
    UPDATE employee_dtr
    SET time_only = ?, status = 'Edited'
    WHERE bio_id = ?
      AND batch_id = ?
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
      if (time === "__UNCHANGED__") continue;

      updatesToRun.push([time, bio_id, batch_id, date, type]);
    }
  }

  // Unique (bio_id, date) pairs to pre-fetch current values for audit diffs.
  const pairKey = (b, d) => `${b}|${d}`;
  const uniquePairs = Array.from(
    new Map(
      updatesToRun.map((u) => [pairKey(u[1], u[3]), [u[1], u[3]]]),
    ).values(),
  );

  db.getConnection((connErr, connection) => {
    if (connErr) {
      return res.status(500).json({
        error: "Failed to update DTR",
        details: connErr.message,
      });
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
        return res.status(500).json({
          error: "Failed to update DTR",
          details: txErr.message,
        });
      }

      // PRE-FETCH CURRENT VALUES FOR AUDIT DIFFS
      const selectOldSql = uniquePairs.length
        ? `
          SELECT
            bio_id,
            MAX(name) AS name,
            DATE_FORMAT(date_only, '%Y-%m-%d') AS date_only,
            TRIM(ampm_type) AS ampm_type,
            time_only
          FROM employee_dtr
          WHERE batch_id = ? AND (bio_id, date_only) IN (${uniquePairs.map(() => "(?, ?)").join(", ")})
          GROUP BY bio_id, date_only, TRIM(ampm_type), time_only
        `
        : null;
      const selectOldParams = [batch_id, ...uniquePairs.flat()];

      const runSelectOld = (cb) => {
        if (!selectOldSql) return cb(null, []);
        connection.query(selectOldSql, selectOldParams, (e, rows) =>
          cb(e, rows),
        );
      };

      runSelectOld((selErr, oldRows) => {
        if (selErr) return fail(selErr);

        const oldMap = new Map();
        const nameMap = new Map(); 
        for (const r of oldRows || []) {
          oldMap.set(`${r.bio_id}|${r.date_only}|${r.ampm_type}`, {
            old_time: r.time_only,
            name: r.name,
          });
          if (r.name && !nameMap.has(String(r.bio_id))) {
            nameMap.set(String(r.bio_id), r.name);
          }
        }

        const misses = [];
        const metaCache = new Map();
        let i = 0;

        const finalize = () => {
          const actorUserId = req.session?.user?.user_id ?? null;

          // Build per-field diffs (only where value actually changed).
          const changes = [];
          for (const [newTime, bio_id, , date, type] of updatesToRun) {
            const key = `${bio_id}|${date}|${type}`;
            const prev = oldMap.get(key);
            const oldTime = prev ? prev.old_time : null;
            const name =
              (prev && prev.name) || nameMap.get(String(bio_id)) || null;
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

          const uniqueBioIds = Array.from(
            new Set(changes.map((c) => c.bio_id)),
          );
          const uniqueDates = Array.from(
            new Set(changes.map((c) => c.date)),
          ).sort();
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
          const [newTime, bio_id, batchIdParam, date, ampmType] = params;
          connection.query(updateQuery, params, (qErr, result) => {
            if (qErr) return fail(qErr);
            if (result && (result.affectedRows || 0) > 0) {
              i += 1;
              return runNext();
            }
            insertDtrTime(
              connection,
              {
                newTime,
                bio_id,
                batch_id: batchIdParam,
                date,
                ampmType,
              },
              nameMap,
              metaCache,
              (insErr) => {
                if (insErr) {
                  misses.push({
                    bio_id,
                    date,
                    type: ampmType,
                  });
                  return fail(insErr);
                }
                i += 1;
                runNext();
              },
            );
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
        s.position,
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

      res.json(results[0] || null);
    });
  } catch (error) {
    console.error("SERVER CRASH:", error);
    res.status(500).json({ message: "Server crash" });
  }
};

//Export DTR by department
const exportDepartmentXLSX = (req, res) => {
  try {
    const { department, batch_id } = req.query;

    if (!department) {
      return res.status(400).json({ message: "Department is required" });
    }

    if (!batch_id) {
      return res.status(400).json({ message: "Missing batch_id" });
    }

    const sql = `
      SELECT
        dept_name,
        name,
        bio_id,
        date_time,
        machine_loc,
        log_type,
        date_only,
        time_only,
        ampm_type,
        status,
        reason,
        class,
        include_in_calc,
        late_minutes
      FROM employee_dtr
      WHERE TRIM(dept_name) = TRIM(?)
        AND batch_id = ?
      ORDER BY name ASC, date_time ASC
    `;

    db.query(sql, [department, batch_id], (err, results) => {
      if (err) {
        console.error("Export error:", err);
        return res.status(500).json({
          message: "Database error",
        });
      }

      if (!results.length) {
        return res.status(404).json({
          message: "No DTR data found",
        });
      }

      const exportData = results.map((row) => ({
        Department: row.dept_name,
        Name: row.name,
        BIO_ID: row.bio_id,
        Date_Time: row.date_time,
        Machine_Loc: row.machine_loc,
        Log_Type: row.log_type,
        Date_Only: row.date_only,
        Time_Only: row.time_only,
        AMPM_Type: row.ampm_type,
        Status: row.status,
        Reason: row.reason,
        Class: row.class,
        Include_In_Calc: row.include_in_calc,
        Late_Minutes: row.late_minutes,
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      XLSX.utils.book_append_sheet(workbook, worksheet, "Employee DTR Export");

      const buffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      const safeDepartment = department.replace(/[^\w\s]/gi, "_");

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${safeDepartment}_DTR_Full.xlsx"`,
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      res.send(buffer);
    });
  } catch (error) {
    console.error("Export crash:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

//Export DTR per batch
const exportBatchXLSX = (req, res) => {
  try {
    const { batch_id } = req.query;

    if (!batch_id) {
      return res.status(400).json({
        message: "Missing batch_id",
      });
    }

    const sql = `
      SELECT
        dept_name,
        name,
        bio_id,
        date_time,
        machine_loc,
        log_type,
        date_only,
        time_only,
        ampm_type,
        status,
        reason,
        class,
        include_in_calc,
        late_minutes
      FROM employee_dtr
      WHERE batch_id = ?
      ORDER BY dept_name ASC, name ASC, date_time ASC
    `;

    db.query(sql, [batch_id], (err, results) => {
      if (err) {
        console.error("Batch export error:", err);
        return res.status(500).json({
          message: "Database error",
        });
      }

      if (!results.length) {
        return res.status(404).json({
          message: "No batch data found",
        });
      }

      const exportData = results.map((row) => ({
        Department: row.dept_name,
        Name: row.name,
        BIO_ID: row.bio_id,
        Date_Time: row.date_time,
        Machine_Loc: row.machine_loc,
        Log_Type: row.log_type,
        Date_Only: row.date_only,
        Time_Only: row.time_only,
        AMPM_Type: row.ampm_type,
        Status: row.status,
        Reason: row.reason,
        Class: row.class,
        Include_In_Calc: row.include_in_calc,
        Late_Minutes: row.late_minutes,
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      XLSX.utils.book_append_sheet(workbook, worksheet, `Batch_${batch_id}`);

      const buffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Batch_${batch_id}_DTR.xlsx"`,
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      res.send(buffer);
    });
  } catch (error) {
    console.error("Export batch crash:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  importDTR,
  getDepartments,
  getEmployeesByDepartment,
  getEmployeeDTR,
  updateEmployeeDTR,
  getDepartmentSignatory,
  exportDepartmentXLSX,
  exportBatchXLSX,
};
