const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

// === 1. AIRTIGHT CORS HEADERS INJECTION ===
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Preflight check OPTIONS request ko turant handshake pass karo
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// === 2. DATABASE INITIALIZATION ===
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

// === 3. GEMINI ENGINE WITH YOUR REAL API KEY ===
const aiEngine = new GoogleGenerativeAI('AQ.Ab8RN6J_m6YGBzPym7VjkYyE8AUXeOcxg0q5uo8bZ9y7Wn8-XQ');

// === 4. ROUTE GATEWAY ===
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
        // Hostel network proxy bypass fail-safe logic
        aiResponseText = `[Smart Local Timetable - Network Fallback Mode]\nFocus Goal: ${goal}\nTotal Study Window: ${hours} Hours\nPeak Energy State: ${timeShift}\nTarget Subjects: ${JSON.stringify(subjects || [])}\n\nPlan locked and structure successfully compiled into the DB loop!`;
    }

    // === 5. INSERT TO DB AND RESPONSE LINK ===
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

// === 6. UNIVERSAL LOCALHOST BINDING ===
const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend Server Running on: http://localhost:${PORT}`);
});
// Agal-bagal agar do baar PORT ki line ho, toh use hata kar sirf ye ek block rakhein
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend Server Running on port: ${PORT}`);
});