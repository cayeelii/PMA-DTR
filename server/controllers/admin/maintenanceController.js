const db = require("../../config/db");

//Category schedules
const CATEGORY_CONFIG = {
  Holiday: {
    db: "Holiday",
    schedule: {
      am_in: "08:00:00",
      am_out: "12:00:00",
      pm_in: "13:00:00",
      pm_out: "17:00:00",
    },
  },
  "Half-day": {
    db: "Half-day",
    schedule: {
      am_in: null,
      am_out: null,
      pm_in: "13:00:00",
      pm_out: "17:00:00",
    },
  },
};

function normalizeRequestCategory(category) {
  const c = String(category ?? "").trim();
  if (!c) return null;

  if (CATEGORY_CONFIG[c]) {
    return { logical: c, db: CATEGORY_CONFIG[c].db };
  }

  return null;
}

function matchesSchedule(row, schedule) {
  const aIn = row?.am_in ?? null;
  const aOut = row?.am_out ?? null;
  const pIn = row?.pm_in ?? null;
  const pOut = row?.pm_out ?? null;

  return (
    aIn === schedule.am_in &&
    aOut === schedule.am_out &&
    pIn === schedule.pm_in &&
    pOut === schedule.pm_out
  );
}

function logicalCategoryFromRow(row) {
  const raw = String(row?.category ?? "").trim();
  if (CATEGORY_CONFIG[raw]) return raw;

  if (matchesSchedule(row, CATEGORY_CONFIG.Holiday.schedule)) return "Holiday";
  if (matchesSchedule(row, CATEGORY_CONFIG["Half-day"].schedule)) return "Half-day";

  const hasAny =
    row?.am_in != null ||
    row?.am_out != null ||
    row?.pm_in != null ||
    row?.pm_out != null;
  return hasAny ? "Half-day" : null;
}

function scheduleForCategory(logicalCategory) {
  return CATEGORY_CONFIG[logicalCategory].schedule;
}

//Parse HH:MM or HH:MM:SS from body to MySQL TIME string
function parseBodyTime(value) {
  if (value == null || value === "") return null;
  const s = String(value).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const hh = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  const mm = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  const ss =
    m[3] != null ? Math.min(59, Math.max(0, parseInt(m[3], 10))) : 0;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
}

//Add holiday / half-day
const addMaintenance = (req, res) => {
  try {
    const { date, category, am_in, am_out, pm_in, pm_out } = req.body;

    if (!date || !category) {
      return res.status(400).json({ message: "Date and category are required" });
    }

    const normalized = normalizeRequestCategory(category);
    if (!normalized) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const sql = `
      INSERT INTO maintenance_settings (config_date, category, am_in, am_out, pm_in, pm_out)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        category = VALUES(category),
        am_in = VALUES(am_in),
        am_out = VALUES(am_out),
        pm_in = VALUES(pm_in),
        pm_out = VALUES(pm_out)
    `;


    const cleanDate = normalizeDate(date);
    if (!cleanDate) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    let sched = { ...scheduleForCategory(normalized.logical) };

    if (normalized.logical === "Holiday") {
      const ai = parseBodyTime(am_in);
      const ao = parseBodyTime(am_out);
      const pi = parseBodyTime(pm_in);
      const po = parseBodyTime(pm_out);
      if (ai && ao && pi && po) {
        sched = { am_in: ai, am_out: ao, pm_in: pi, pm_out: po };
      }
    }
    
    db.query(
      sql,
      [
        cleanDate,
        normalized.db,
        sched.am_in,
        sched.am_out,
        sched.pm_in,
        sched.pm_out,
      ],
      (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Database error", error: err.message });
      }

      res.json({
        message: "Added successfully",
        id: result.insertId,
        date: cleanDate,
        category: normalized.logical,
        ...sched,
      });
      },
    );
  } catch (error) {
    console.error("Add Maintenance Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//Get all maintenance
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

    const normalizedResults = (results || []).map((row) => ({
      ...row,
      category: logicalCategoryFromRow(row),
    }));
    res.json(normalizedResults);
  });
};

//Delete maintenance
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
  const raw = String(dateStr).trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

module.exports = {
  addMaintenance,
  getMaintenance,
  deleteMaintenance,
  normalizeDate,
};