require('dotenv').config(); // `.env` file load karne ke liye
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

// Frontend static files ko serve karne ke liye
app.use(express.static(path.join(__dirname, 'public')));

// CORS Headers Setup
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Database Setup
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
        subjects TEXT,
        ai_schedule TEXT
    )`);
});

// Process.env se secure key read karein
const aiEngine = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/save-plan', async (req, res) => {
    const { goal, timeShift, hours, subjects } = req.body;
    let aiResponseText = "";
    
    try {
        const model = aiEngine.getGenerativeModel({ model: "gemini-pro" });
        const aiPrompt = `Create a custom study schedule for Goal: ${goal || "General"}, Hours: ${hours || 5}, Subjects: ${JSON.stringify(subjects || [])}, Peak: ${timeShift || "Morning"}. Format as plain text day breakdown without asterisks.`;

        const aiResult = await model.generateContent(aiPrompt);
        aiResponseText = aiResult.response.text();

    } catch (aiError) {
        console.error("Gemini AI API Error, executing fallback:", aiError.message);
        aiResponseText = `[Smart Local Timetable - Network Fallback Mode]\nFocus Goal: ${goal}\nTotal Study Window: ${hours} Hours\nPeak Energy State: ${timeShift}\nTarget Subjects: ${JSON.stringify(subjects || [])}\n\nPlan locked and structure successfully compiled into the DB loop!`;
    }

    const query = `INSERT INTO plans (goal, timeShift, hours, subjects, ai_schedule) VALUES (?, ?, ?, ?, ?)`;
    
    db.run(query, [
        goal || "General", 
        timeShift || "Morning", 
        hours || 0, 
        JSON.stringify(subjects || []),
        aiResponseText
    ], function(err) {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        return res.status(201).json({ 
            success: true, 
            message: "Saved to database!",
            schedule: aiResponseText 
        });
    });
});

// Saari bachi hui requests ko frontend ke index.html par bheinjein
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// PURE PROJECT MEIN AB SIRF YEH EK SINGLE PORT DECLARATION HAI
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend Server Running on port: ${PORT}`);
});