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

// Merged ADMIN & EMPLOYEE LOGIN
const login = (req, res) => {
  const { username, bio_id, password } = req.body;

  if ((!username && !bio_id) || !password) {
    return res.status(400).json({
      message: "Username/BioID and password are required",
    });
  }

  const sql = `
    SELECT user_id, username, bio_id, password, role, status, active_session_id
    FROM users
    WHERE username = ? OR bio_id = ?
    LIMIT 1
  `;

  db.query(sql, [username || null, bio_id || null], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const user = results[0];

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    //Employee approval check
    if (user.role === "employee" && user.status !== "approved") {
      return res.status(403).json({
        message: "Account pending approval",
      });
    }

    const sessionId = req.session.id;

    if (user.active_session_id && user.active_session_id !== sessionId) {
      return res.status(403).json({
        message: "User already logged in",
      });
    }

    req.session.user = {
      user_id: user.user_id,
      username: user.username,
      role: user.role,
      bio_id: user.bio_id,
    };

    db.query("UPDATE users SET active_session_id = ? WHERE user_id = ?", [
      sessionId,
      user.user_id,
    ]);

    return res.json({
      message: "Login successful",
      user: req.session.user, 
    });
  });
};

//Logout user
const logout = (req, res) => {
  const userId = req.session.user?.user_id;

  if (userId) {
    db.query("UPDATE users SET active_session_id = NULL WHERE user_id = ?", [
      userId,
    ]);
  }

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

//Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const userId = req.session.user?.user_id; 

    if (!userId) {
      return res.status(401).json({ message: "Not logged in" });
    }

    db.query(
      "SELECT * FROM users WHERE user_id = ?",
      [userId],
      async (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: "User not found" });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
          return res.status(400).json({
            message: "Current password is incorrect",
          });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        db.query(
          "UPDATE users SET password = ? WHERE user_id = ?",
          [hashedPassword, userId],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                message: "Error updating password",
              });
            }

            res.json({ message: "Password changed successfully" });
          }
        );
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  changePassword,
};
