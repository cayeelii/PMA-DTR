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

// Import DTR
const importDTR = async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const file = req.files.file;

        const workbook = XLSX.read(file.data, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const data = XLSX.utils.sheet_to_json(sheet, {
            raw: false,
        });

        if (data.length === 0) {
            return res.status(400).json({ message: "Empty Excel file" });
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

        const insertRaw = `
      INSERT INTO raw_logs 
      (dept_name, name, bio_id, date_time, machine_loc, log_type, date_only, time_only, ampm_type, status, reason, class, include_in_calc, late_minutes)
      VALUES ?
    `;

        await db.query(insertRaw, [values]);

        /* NOT WORKING */
        const sync = `
      INSERT INTO employee_dtr
      (bio_id, log_date, am_in, am_out, pm_in, pm_out, ot_in, ot_out, is_edited)
      SELECT 
        bio_id,
        date_only,

        MAX(CASE WHEN TRIM(ampm_type) = 'AM IN' THEN time_only END),
        MAX(CASE WHEN TRIM(ampm_type) = 'AM OUT' THEN time_only END),
        MAX(CASE WHEN TRIM(ampm_type) = 'PM IN' THEN time_only END),
        MAX(CASE WHEN TRIM(ampm_type) = 'PM OUT' THEN time_only END),
        MAX(CASE WHEN TRIM(ampm_type) = 'OT IN' THEN time_only END),
        MAX(CASE WHEN TRIM(ampm_type) = 'OT OUT' THEN time_only END),

        0
      FROM raw_logs
      GROUP BY bio_id, date_only

      ON DUPLICATE KEY UPDATE
        am_in = VALUES(am_in),
        am_out = VALUES(am_out),
        pm_in = VALUES(pm_in),
        pm_out = VALUES(pm_out),
        ot_in = VALUES(ot_in),
        ot_out = VALUES(ot_out)
    `;

        await db.query(sync);

        return res.json({
            message: "File imported and synced successfully",
        });
    } catch (error) {
        console.error("IMPORT ERROR:", error);
        res.status(500).json({
            message: "Import failed",
            error: error.message,
        });
    }
};

// Get Departments
const getDepartments = async (req, res) => {
    try {
        const sql = `
      SELECT 
        TRIM(dept_name) AS name,
        COUNT(DISTINCT bio_id) AS employees
      FROM raw_logs
      WHERE dept_name IS NOT NULL AND dept_name != ''
      GROUP BY TRIM(dept_name)
      ORDER BY name ASC
    `;

        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ message: "Database error" });
    }
};

// Get Employees by Department
const getEmployeesByDepartment = async (req, res) => {
    try {
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

        const [rows] = await db.query(sql, [department]);
        res.json(rows);
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({
            message: "Database error",
            error: err.message,
        });
    }
};

// Get Employee DTR
const getEmployeeDTR = async (req, res) => {
    try {
        const { bio_id, month, year } = req.query;

        if (!bio_id || !month || !year) {
            return res.status(400).json({ message: "Missing parameters" });
        }

        const sql = `
            SELECT 
                log_date,
                am_in AS amIn,
                am_out AS amOut,
                pm_in AS pmIn,
                pm_out AS pmOut,
                ot_in AS otIn,
                ot_out AS otOut
            FROM employee_dtr
            WHERE bio_id = ?
              AND MONTH(log_date) = ?
              AND YEAR(log_date) = ?
            ORDER BY log_date ASC
        `;

        const [rows] = await db.query(sql, [bio_id, month, year]);

        // FOR FIXING
        const formatted = rows.map(r => ({
            rawDate: r.log_date,
            date: r.log_date,
            amIn: r.amIn,
            amOut: r.amOut,
            pmIn: r.pmIn,
            pmOut: r.pmOut,
            otIn: r.otIn,
            otOut: r.otOut
        }));

        res.json(formatted);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const updateEmployeeDTR = async (req, res) => {
    const entries = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
        return res.status(400).json({ error: "No DTR data provided" });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const query = `
            INSERT INTO employee_dtr 
            (bio_id, log_date, am_in, am_out, pm_in, pm_out, ot_in, ot_out, is_edited)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE
                am_in = VALUES(am_in),
                am_out = VALUES(am_out),
                pm_in = VALUES(pm_in),
                pm_out = VALUES(pm_out),
                ot_in = VALUES(ot_in),
                ot_out = VALUES(ot_out),
                is_edited = 1,
                updated_at = CURRENT_TIMESTAMP
        `;

        for (const entry of entries) {
            const { bio_id, date, amIn, amOut, pmIn, pmOut, otIn, otOut } =
                entry;

            await connection.query(query, [
                bio_id,
                date,
                amIn,
                amOut,
                pmIn,
                pmOut,
                otIn,
                otOut,
            ]);
        }

        await connection.commit();

        res.json({ message: "DTR successfully saved" });
    } catch (error) {
        await connection.rollback();

        res.status(500).json({
            error: "Failed to update DTR",
            details: error.message,
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    importDTR,
    getDepartments,
    getEmployeesByDepartment,
    getEmployeeDTR,
    updateEmployeeDTR,
};
