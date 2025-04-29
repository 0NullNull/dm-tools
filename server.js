const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const db = new sqlite3.Database("db.sqlite");

app.use(express.json());
app.use(express.static("public"));

db.run(`
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value REAL,
        date TEXT
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS currency_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        old_value REAL,
        new_value REAL,
        reason TEXT,
        timestamp TEXT,
        gamedate TEXT
    )
`);
db.run(`
    CREATE TABLE IF NOT EXISTS players (
        name TEXT PRIMARY KEY,
        perception REAL,
        maxhp REAL,
        copper REAL,
        silver REAL,
        gold REAL,
        gnaw REAL
    )
`);

// Get current value
app.get("/api/value", (req, res) => {
    db.get("SELECT value, date FROM settings WHERE key = 'currency_value'", [], (err, row) => {
        if (err) return;
        const value = row?.value ?? 0;
        const date = row?.date ?? null;
        res.json({value, date});
    });
});
  
// Update value
app.post("/api/value", (req, res) => {
    const { newValue, reason, gamedate } = req.body;
    const timestamp = new Date().toISOString();

    db.get("SELECT value FROM settings WHERE key = 'currency_value'", [], (err, row) => {
        const oldValue = row?.value ?? 0;

        // Insert log
        db.run(
            "INSERT INTO currency_log (old_value, new_value, reason, timestamp, gamedate) VALUES (?, ?, ?, ?, ?)",
            [oldValue, newValue, reason, timestamp, gamedate]
        );

        // Update setting
        db.run(
            "INSERT OR REPLACE INTO settings (key, value, date) VALUES ('currency_value', ?, ?)",
            [newValue, gamedate],
            () => res.json({ oldValue, newValue, gamedate })
        );
    });
});

// Get full log
app.get("/api/logs", (req, res) => {
    db.all("SELECT * FROM currency_log ORDER BY timestamp DESC", [], (err, rows) => {
    res.json(rows);
    });
});

app.listen(5500, () => {
    console.log("Server running at http://localhost:5500");
});