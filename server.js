const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'studyai.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("DB Error: ", err.message);
    else console.log("Database Connected Successfully! 🎉");
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goal TEXT,
        timeShift TEXT,
        hours REAL,
        subjects TEXT
    )`);
});

app.post('/api/save-plan', (req, res) => {
    const { goal, timeShift, hours, subjects } = req.body;
    const query = `INSERT INTO plans (goal, timeShift, hours, subjects) VALUES (?, ?, ?, ?)`;
    
    db.run(query, [
        goal || "General", 
        timeShift || "Morning", 
        hours || 0, 
        JSON.stringify(subjects || [])
    ], function(err) {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.status(201).json({ success: true, message: "Saved!" });
    });
});

app.listen(5000, () => console.log("Backend Server Running on: http://localhost:5000"));