import express from 'express';
import db from "../middleware/db.js";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Import SDK
import dotenv from 'dotenv';
const router = express.Router();
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function fetch_Question(questionId) {
    const query = 'SELECT * FROM questions WHERE quesid = $1';
    const { rows } = await db.query(query, [questionId]);
    return rows.length ? rows[0] : null;
}

router.get('/question', async (req, res) => {
    const id = req.query.id;
    try {
        if (!id) return res.status(400).json({ error: "Missing question id" });
        const response = await fetch_Question(id);
        if (!response) return res.status(404).json({ error: "Question not found" });
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/input', async (req, res) => {
    const { question, category, testcases } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Question field is required.' });
    }
    try {
        const query = `
            INSERT INTO questions (question, category, testcases)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [question, category, testcases];

        const result = await db.query(query, values);

        console.log("Question data inserted:", result.rows[0]);

        res.status(201).json({
            message: "Question inserted successfully",
            question: result.rows[0],
        });
    } catch (err) {
        console.error("Error while inserting question:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/generate-testcases', async (req, res) => {
    const { description, category, existingTestCases } = req.body;

    if (!description) return res.status(400).json({ error: "Description is required" });

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
            You are a strict QA Engineer for a coding platform (like LeetCode).
            
            **Problem Description:** "${description}"
            **Category:** "${category}"
            **Existing Cases:** ${JSON.stringify(existingTestCases)}

            **Task:** Generate 3 "Example" test cases (simple, standard flow) and 5 "Hidden" test cases (edge cases, large inputs, negatives, zeros).
            
            **Format:** Return ONLY valid JSON. No Markdown. No code blocks. No explanations.
            Structure:
            {
                "examples": [{ "input": "...", "expected_output": "..." }],
                "hidden": [{ "input": "...", "expected_output": "..." }]
            }

            **Rules:**
            1. Input/Output must be strings.
            2. If input has multiple lines, use \\n.
            3. Ensure outputs are mathematically/logically correct based on the description.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // CLEANUP: Remove ```json and ``` if the AI adds them
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const json = JSON.parse(text);
        res.json(json);

    } catch (err) {
        console.error("AI Generation Error:", err);
        res.status(500).json({ error: "Failed to generate test cases. Try again." });
    }
});
router.get('/all', async (req, res) => {
    try {
        // Fetch all questions, ordered by ID
        const query = 'SELECT quesid, question, category FROM questions ORDER BY quesid ASC';
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch questions" });
    }
});



export default router;