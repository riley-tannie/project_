const express = require('express');
const bcrypt = require('bcrypt');
const con = require('./db');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== REGISTER =====
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Missing username or password");

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).send("Hashing error");

    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    con.query(sql, [username, hash], (err, result) => {
      if (err) return res.status(500).send("Database insert error");
      res.send("User registered successfully with ID: " + result.insertId);
    });
  });
});

// ===== LOGIN =====
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT id, password FROM users WHERE username = ?";
  con.query(sql, [username], (err, results) => {
    if (err) return res.status(500).send("Database error");
    if (results.length !== 1) return res.status(401).send("Wrong username");

    bcrypt.compare(password, results[0].password, (err, same) => {
      if (err) return res.status(500).send("Hashing error");
      if (same) {
        return res.json({ success: true, userId: results[0].id, message: "Login OK" });
      }
      return res.status(401).send("Wrong password");
    });
  });
});

// ===== ALL EXPENSES =====
app.get('/expenses/:userId', (req, res) => {
  const userId = req.params.userId;
  const sql = "SELECT id, item, paid, date FROM expense WHERE user_id = ? ORDER BY date ASC";
  con.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).send("Database error");
    res.json(results);
  });
});

// ===== TODAY'S EXPENSES =====
app.get('/expenses/:userId/today', (req, res) => {
  const userId = req.params.userId;
  const sql = "SELECT id, item, paid, date FROM expense WHERE user_id = ? AND DATE(date)=CURDATE() ORDER BY date ASC";
  con.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).send("Database error");
    res.json(results);
  });
});

// ===== SEARCH EXPENSES =====
app.get('/expenses/:userId/search', (req, res) => {
  const userId = req.params.userId;
  const keyword = req.query.keyword ? `%${req.query.keyword}%` : "%";
  const sql = "SELECT id, item, paid, date FROM expense WHERE user_id = ? AND item LIKE ? ORDER BY date ASC";
  con.query(sql, [userId, keyword], (err, results) => {
    if (err) return res.status(500).send("Database error");
    res.json(results);
  });
});

// ===== ADD EXPENSE =====
app.post('/expenses/:userId', (req, res) => {
  const userId = req.params.userId;
  const { item, paid } = req.body;

  if (!item || !paid) return res.status(400).send("Missing item or paid");

  const sql = "INSERT INTO expense (user_id, item, paid, date) VALUES (?, ?, ?, NOW())";
  con.query(sql, [userId, item, paid], (err, result) => {
    if (err) return res.status(500).send("Database insert error");
    res.json({ success: true, message: "Expense added", id: result.insertId });
  });
});

// ===== DELETE EXPENSE =====
app.delete('/expenses/:userId/:id', (req, res) => {
  const userId = req.params.userId;
  const id = req.params.id;

  const sql = "DELETE FROM expense WHERE id = ? AND user_id = ?";
  con.query(sql, [id, userId], (err, result) => {
    if (err) return res.status(500).send("Database error");
    if (result.affectedRows === 0) {
      return res.status(404).send("Expense not found");
    }
    res.json({ success: true, message: "Expense deleted" });
  });
});

// ===== START SERVER =====
const PORT = 3000;
app.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT);
});
