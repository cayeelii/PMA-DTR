const db = require("../config/db");
const bcrypt = require("bcrypt");
const Joi = require("joi");

//register user
const register = (req, res) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
      .required(),
    bio_id: Joi.string().alphanum().min(3).max(10).required(),
    role: Joi.string().valid("employee").default("employee"),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { username, password, bio_id, role } = value;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql =
    "INSERT INTO users (username, password, role, bio_id) VALUES (?, ?, ?, ?)";

  db.query(sql, [username, hashedPassword, role, bio_id], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ error: "Username or Bio ID already exists." });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({
      message: "Employee registered successfully",
      id: result.insertId,
    });
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
