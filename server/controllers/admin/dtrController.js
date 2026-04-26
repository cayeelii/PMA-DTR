const db = require("../../config/db");
const XLSX = require("xlsx");

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
        if (!req.files || !req.files.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const file = req.files.file;

        const workbook = XLSX.read(file.data, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, {
            raw: false,
            defval: null,
            dateNF: "yyyy-mm-dd hh:mm:ss",
        });

        if (!data.length) {
            return res.status(400).json({ message: "Empty file" });
        }

        // Create batch record
        const insertBatchSql = `
      INSERT INTO dtr_batches (file_name, uploaded_by)
      VALUES (?, ?)
    `;

        db.query(
            insertBatchSql,
            [file.name, req.session?.user?.user_id || null],
            (err, batchResult) => {
                if (err) {
                    return res
                        .status(500)
                        .json({ message: "Failed to create batch" });
                }

                const batch_id = batchResult.insertId;

                const values = data.map((row) => [
                    row["Dept"],
                    row["NAME"],
                    row["BIOID"],
                    formatDateTime(row["Date_Time"]),
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
                    batch_id,
                ]);

                const sql = `
          INSERT INTO employee_dtr (
            dept_name, name, bio_id, date_time, machine_loc,
            log_type, date_only, time_only, ampm_type,
            status, reason, class, include_in_calc,
            late_minutes, batch_id
          ) VALUES ?
        `;

                db.query(sql, [values], (err2, result) => {
                    if (err2) {
                        return res
                            .status(500)
                            .json({ message: "Insert failed" });
                    }

                    return res.json({
                        message: "Import successful",
                        batch_id,
                        insertedRows: result.affectedRows,
                    });
                });
            },
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Import error" });
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
      TRIM(dept_name) AS name,
      COUNT(DISTINCT bio_id) AS employees
    FROM employee_dtr
    WHERE dept_name IS NOT NULL 
      AND dept_name != ''
      AND batch_id = ?
    GROUP BY TRIM(dept_name)
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

// GET EMPLOYEE DTR + HOLIDAYS
const getEmployeeDTR = (req, res) => {
    const { bio_id, batch_id } = req.query;

    if (!bio_id || !batch_id) {
        return res.status(400).json({ message: "Missing parameters" });
    }

    // Get DTR with normalized date format
    const dtrQuery = `
    SELECT 
      DATE_FORMAT(date_only, '%Y-%m-%d') AS date,
      MAX(CASE WHEN ampm_type = 'AM IN' THEN time_only END) AS amIn,
      MAX(CASE WHEN ampm_type = 'AM OUT' THEN time_only END) AS amOut,
      MAX(CASE WHEN ampm_type = 'PM IN' THEN time_only END) AS pmIn,
      MAX(CASE WHEN ampm_type = 'PM OUT' THEN time_only END) AS pmOut,
      MAX(CASE WHEN ampm_type = 'OT IN' THEN time_only END) AS otIn,
      MAX(CASE WHEN ampm_type = 'OT OUT' THEN time_only END) AS otOut
    FROM employee_dtr
    WHERE bio_id = ? AND batch_id = ?
    GROUP BY DATE_FORMAT(date_only, '%Y-%m-%d')
  `;

    // Get holidays / half-days with normalized date format
    const maintenanceQuery = `
    SELECT 
      DATE_FORMAT(config_date, '%Y-%m-%d') AS date,
      category,
      am_in,
      am_out,
      pm_in,
      pm_out
    FROM maintenance_settings
  `;

    db.query(dtrQuery, [bio_id, batch_id], (err, dtrResults) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "DTR error" });
        }

        db.query(maintenanceQuery, (err2, maintenanceResults) => {
            if (err2) {
                console.error(err2);
                return res.status(500).json({ message: "Maintenance error" });
            }

            // Convert DTR into map - dates are already normalized strings
            const dtrMap = {};
            dtrResults.forEach((row) => {
                dtrMap[row.date] = { ...row, status: null };
            });

            // Merge maintenance into DTR - dates are already normalized strings
            maintenanceResults.forEach((m) => {
                const date = m.date;

                if (!dtrMap[date]) {
                    // If no DTR exists, create one from maintenance
                    dtrMap[date] = {
                        date: date,
                        amIn: m.am_in,
                        amOut: m.am_out,
                        pmIn: m.pm_in,
                        pmOut: m.pm_out,
                        otIn: null,
                        otOut: null,
                        status: m.category,
                    };
                } else {
                    // If DTR exists, override times + add status (preserve DTR times if maintenance is null)
                    dtrMap[date].amIn = m.am_in || dtrMap[date].amIn;
                    dtrMap[date].amOut = m.am_out || dtrMap[date].amOut;
                    dtrMap[date].pmIn = m.pm_in || dtrMap[date].pmIn;
                    dtrMap[date].pmOut = m.pm_out || dtrMap[date].pmOut;
                    dtrMap[date].status = m.category;
                }
            });

            res.json(Object.values(dtrMap));
        });
    });
};

// UPDATE DTR inside a transaction on a single pooled connection.
const updateEmployeeDTR = (req, res) => {
      const entries = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
        return res.status(400).json({ error: "No DTR data provided" });
    }

    const batch_id = entries?.[0]?.batch_id;

    if (!batch_id) {
        return res.status(400).json({
            error: "Missing batch_id in request"
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
        const { bio_id, date, amIn, amOut, pmIn, pmOut, otIn, otOut } =
            entry || {};
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
            return res
                .status(500)
                .json({
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
                return res
                    .status(500)
                    .json({
                        error: "Failed to update DTR",
                        details: txErr.message,
                    });
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

                // Map of bio|date|type -> { old_time, name }
                const oldMap = new Map();
                const nameMap = new Map(); // bio_id -> name
                for (const r of oldRows || []) {
                    oldMap.set(`${r.bio_id}|${r.date_only}|${r.ampm_type}`, {
                        old_time: r.time_only,
                        name: r.name,
                    });
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
                        const name =
                            (prev && prev.name) ||
                            nameMap.get(String(bio_id)) ||
                            null;
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
                        [
                            actorUserId,
                            "DTR Edit",
                            payload,
                            uniqueBioIds[0] ?? null,
                        ],
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
                            const [, bio_id, , date, type] = params;
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
