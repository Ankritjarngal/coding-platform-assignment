import express from 'express';
import db from "../middleware/db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

router.get("/question", async (req, res) => {
    try {
        const { id } = req.query;
        
        // 1. Fetch data (using the confirmed 'testcases' column)
        const { rows } = await db.query("SELECT * FROM questions WHERE quesid = $1", [id]);

        if (rows.length === 0) return res.status(404).json({ error: "Question not found" });

        const q = rows[0];

        // 2. PARSE & SANITIZE
        let safeTestCases = [];
        try {
            // Parse the string from DB
            const parsed = typeof q.testcases === 'string' ? JSON.parse(q.testcases) : q.testcases;

            // ✅ CASE A: Your format -> { "examples": [...], "hidden": [...] }
            if (parsed && Array.isArray(parsed.examples)) {
                safeTestCases = parsed.examples; 
            } 
            // ⚠️ CASE B: Flat Array -> [ {input...}, {input...} ]
            else if (Array.isArray(parsed)) {
                safeTestCases = parsed.slice(0, 3);
            }
        } catch (e) {
            console.error("JSON Parsing Error:", e.message);
            safeTestCases = [];
        }

        res.json({
            quesid: q.quesid,
            question: q.title || q.question, 
            description: q.description || q.question, 
            category: q.category,
            testcases: safeTestCases 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});


// Create Question (Now links to Assignment)
router.post('/input', async (req, res) => {
    const { assignmentId, question, category, testcases } = req.body; 

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