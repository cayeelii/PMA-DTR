const db = require("../../config/db");

/* GET ALL SCHEDULES */
const getSchedules = async (req, res) => {
    try {
        const [rows] = await db.promise().query(`
      SELECT * 
      FROM schedules
      WHERE status = 'ACTIVE'
    `);

        res.json(rows);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch schedules",
            error: error.message,
        });
    }
};

/* GET SINGLE SCHEDULE */
const getScheduleById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.promise().query(
            `
      SELECT * 
      FROM schedules
      WHERE schedule_id = ?
    `,
            [id],
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Schedule not found",
            });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching schedule",
            error: error.message,
        });
    }
};

/* CREATE SCHEDULE */
const createSchedule = async (req, res) => {
    try {
        const {
            schedule_name,
            am_in_start,
            am_in_end,
            am_out_start,
            am_out_end,
            pm_in_start,
            pm_in_end,
            pm_out_start,
            pm_out_end,
            ot_in_start,
            ot_in_end,
            ot_out_start,
            ot_out_end,
        } = req.body;

        const isEmptyTime = (value) =>
            !value ||
            value.trim() === "" ||
            value === "00:00" ||
            value === "00:00:00";

        const clean = (value) => (isEmptyTime(value) ? null : value);
        const scheduleName = schedule_name?.toUpperCase();

        await db.promise().query(
            `
            INSERT INTO schedules (
                schedule_name,

                am_in_start, am_in_end,
                am_out_start, am_out_end,

                pm_in_start, pm_in_end,
                pm_out_start, pm_out_end,

                ot_in_start, ot_in_end,
                ot_out_start, ot_out_end,

                status,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', NOW(), NOW())
            `,
            [
                scheduleName,

                clean(am_in_start),
                clean(am_in_end),
                clean(am_out_start),
                clean(am_out_end),

                clean(pm_in_start),
                clean(pm_in_end),
                clean(pm_out_start),
                clean(pm_out_end),

                clean(ot_in_start),
                clean(ot_in_end),
                clean(ot_out_start),
                clean(ot_out_end),
            ],
        );

        res.status(201).json({
            message: "Schedule created successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create schedule",
            error: error.message,
        });
    }
};

/* UPDATE SCHEDULE */
const updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            schedule_name,
            am_in_start,
            am_in_end,
            am_out_start,
            am_out_end,
            pm_in_start,
            pm_in_end,
            pm_out_start,
            pm_out_end,
            ot_in_start,
            ot_in_end,
            ot_out_start,
            ot_out_end,
        } = req.body;

        await db.promise().query(
            `
      UPDATE schedules
      SET
        schedule_name = ?,
        am_in_start = ?,
        am_in_end = ?,
        am_out_start = ?,
        am_out_end = ?,
        pm_in_start = ?,
        pm_in_end = ?,
        pm_out_start = ?,
        pm_out_end = ?,
        ot_in_start = ?,
        ot_in_end = ?,
        ot_out_start = ?,
        ot_out_end = ?,
        updated_at = NOW()
      WHERE schedule_id = ?
    `,
            [
                schedule_name,
                am_in_start,
                am_in_end,
                am_out_start,
                am_out_end,
                pm_in_start,
                pm_in_end,
                pm_out_start,
                pm_out_end,
                ot_in_start,
                ot_in_end,
                ot_out_start,
                ot_out_end,
                id,
            ],
        );

        res.json({
            message: "Schedule updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update schedule",
            error: error.message,
        });
    }
};

/* ARCHIVE SCHEDULE */
const archiveSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        await db.promise().query(
            `
      UPDATE schedules
      SET status = 'ARCHIVED',
          updated_at = NOW()
      WHERE schedule_id = ?
    `,
            [id],
        );

        res.json({
            message: "Schedule archived successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to archive schedule",
            error: error.message,
        });
    }
};

module.exports = {
    getSchedules,
    getScheduleById,
    createSchedule,
    updateSchedule,
    archiveSchedule,
};
