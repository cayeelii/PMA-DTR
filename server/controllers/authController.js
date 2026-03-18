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
  const { username, password } = req.body;

  res.json({
    message: "Login successful",
    username: username,
  });
};

module.exports = { register, login };
