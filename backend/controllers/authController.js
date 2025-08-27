const pool = require("../db/pool");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { email, password } = req.body;
  
  // Check database connection
  if (!pool) {
    return res.status(500).json({ error: "Database connection not available" });
  }

  try {
    // Check if user exists
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: "Email already in use" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
      [email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Registration error:', err);
    const errorMessage = err.code === '23505' 
      ? 'Email already exists' 
      : `Registration failed: ${err.message}`;
    res.status(err.code === '23505' ? 409 : 500).json({ error: errorMessage });
  }
};

const verifyUser = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, email FROM users WHERE id = $1", [req.userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Authentication verification failed" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  // Check database connection
  if (!pool) {
    return res.status(500).json({ error: "Database connection not available" });
  }

  try {
    // Find user
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: "Email not found" });

    const user = result.rows[0];

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Incorrect password" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ token, user: { id: user.id, email: user.email } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        error: `Login failed: ${err.message}`
      });
    }
};

module.exports = { registerUser, loginUser, verifyUser };
