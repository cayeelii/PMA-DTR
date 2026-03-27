const db = require("../config/db");
const bcrypt = require("bcrypt");
const Joi = require("joi");

//Register user
const register = (req, res) => {
  const schema = Joi.object({
    username: Joi.string()
      .pattern(/^[a-zA-Z\s'-]{3,50}$/)
      .required(),
    bio_id: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        "string.pattern.base": "Bio ID must be exactly 6 digits",
      }),
    password: Joi.string()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Password must be at least 8 characters and include uppercase, lowercase, and number",
      }),
    dept_id: Joi.number().integer().required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { username, bio_id, password, dept_id } = value;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const role = "employee";
  const status = "pending";

  const checkDeptSql = "SELECT dept_id FROM departments WHERE dept_id = ?";

  db.query(checkDeptSql, [dept_id], (err, deptResult) => {
    if (err) return res.status(500).json({ error: err.message });

    if (deptResult.length === 0) {
      return res.status(400).json({ error: "Invalid department selected" });
    }

    const sql = `
      INSERT INTO users (username, bio_id, password, role, status, dept_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [username, bio_id, hashedPassword, role, status, dept_id],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res
              .status(400)
              .json({ error: "Username or Bio ID already exists." });
          }
          return res.status(500).json({ error: err.message });
        }

        res.json({
          message:
            "Employee registered successfully. Please wait for admin approval.",
          id: result.insertId,
        });
      },
    );
  });
};

//login user
const login = (req, res) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { username, password } = value;

  const sql =
    "SELECT id, username, password, role, bio_id FROM users WHERE username = ? LIMIT 1";

  db.query(sql, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!results.length) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const user = results[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        bio_id: user.bio_id,
      },
    });
  });
};

module.exports = { register, login };
