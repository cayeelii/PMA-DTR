const db = require("../config/db");
const bcrypt = require("bcrypt");
const Joi = require("joi");

//Register employee
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
    department: Joi.string().trim().min(2).max(100).required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { username, bio_id, password, department } = value;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const role = "employee";
  const status = "pending";

  const checkDeptSql =
    "SELECT dept_id FROM departments WHERE dept_name = ? LIMIT 1";

  db.query(checkDeptSql, [department], (err, deptResult) => {
    if (err) return res.status(500).json({ error: err.message });

    const dept_id = deptResult[0]?.dept_id ?? null;

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

//Login user
const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required",
    });
  }

  if (req.session.user) {
    return res.status(403).json({
      message: `User ${req.session.user.username} is already logged in.`,
    });
  }

  const sql = `
    SELECT user_id, username, password, role, bio_id 
    FROM users 
    WHERE username = ? 
    LIMIT 1
  `;

  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("Database error:", err.sqlMessage);
      return res.status(500).json({
        message: "Database error",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const user = results[0];

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    req.session.user = {
      user_id: user.user_id,
      username: user.username,
      role: user.role,
      bio_id: user.bio_id,
    };

    return res.json({
      message: "Login successful",
      user: req.session.user,
    });
  });
};

//Employee login
const employeeLogin = (req, res) => {
  const schema = Joi.object({
    bio_id: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        "string.pattern.base": "Bio ID must be exactly 6 digits",
      }),
    password: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { bio_id, password } = value;
  const sql = `
    SELECT user_id, username, bio_id, password, role, status
    FROM users
    WHERE bio_id = ? AND role = 'employee'
    LIMIT 1
  `;

  db.query(sql, [bio_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!results.length) {
      return res.status(401).json({ error: "Invalid BioID or password." });
    }

    const user = results[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid BioID or password." });
    }

    if (user.status !== "approved") {
      return res.status(403).json({
        error: "Your account is pending admin approval.",
      });
    }

    req.session.user = {
      user_id: user.user_id,
      username: user.username,
      role: user.role,
      bio_id: user.bio_id,
      status: user.status,
    };

    return res.json({
      message: "Employee login successful",
      user: req.session.user,
    });
  });
};

//Logout user
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }

    res.clearCookie("connect.sid");

    return res.json({ message: "Logged out successfully" });
  });
};

//Get the name of the currently logged in user
const getCurrentUser = (req, res) => {
  if (req.session.user) {
    return res.json({ user: req.session.user });
  } else {
    return res.status(401).json({ message: "No user logged in" });
  }
};

module.exports = { register, login, employeeLogin, logout, getCurrentUser };
