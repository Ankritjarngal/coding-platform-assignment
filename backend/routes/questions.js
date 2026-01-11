import express from 'express';
import db from "../middleware/db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// --- GEMINI CONFIG ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

// --- GET SINGLE QUESTION ---
router.get('/question', async (req, res) => {
    const { id } = req.query;
    try {
        const { rows } = await db.query('SELECT * FROM questions WHERE quesid = $1', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Question not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ... imports

// Create Question (Now links to Assignment)
router.post('/input', async (req, res) => {
    const { assignmentId, question, category, testcases } = req.body; // 👈 assignmentId is required now

    try {
        const result = await db.query(
            "INSERT INTO questions (assignment_id, question, category, testcases) VALUES ($1, $2, $3, $4) RETURNING *",
            [assignmentId, question, category, testcases]
        );
        res.json({ message: "Question added successfully", question: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ... (Generate AI and Get Question endpoints remain mostly the same)
// Just ensure 'Get Question' doesn't fail. The query 'SELECT * FROM questions WHERE quesid = $1' works regardless of parent.
// --- GENERATE AI TEST CASES ---
router.post('/generate-testcases', async (req, res) => {
    const { description, category, existingTestCases } = req.body;
    if (!description) return res.status(400).json({ error: "Description is required" });

    try {
        const prompt = `
            You are a strict QA Engineer for a coding platform.
            Problem: "${description}"
            Category: "${category}"
            Existing Cases: ${JSON.stringify(existingTestCases)}

            Task: Generate 3 "Example" cases (simple) and 5 "Hidden" cases (edge cases).
            Format: JSON ONLY. No Markdown.
            Structure: { "examples": [{ "input": "...", "expected_output": "..." }], "hidden": [...] }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        // Cleanup Markdown
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const json = JSON.parse(text);
        res.json(json);
    } catch (err) {
        console.error("AI Error:", err);
        res.status(500).json({ error: "AI Generation Failed" });
    }
});

export default router;