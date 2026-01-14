import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import db from "../middleware/db.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

router.post("/get-hint", authorize, async (req, res) => {
    try {
        const { 
            studentQuery, 
            problemDescription, 
            userCode, 
            testResults 
        } = req.body;

        const userId = req.user.id;

        const userRes = await db.query("SELECT gemini_api_key FROM users WHERE userid = $1", [userId]);
        const apiKey = userRes.rows[0]?.gemini_api_key;

        if (!apiKey) {
            return res.status(400).json({ error: "API Key missing. Please go to Profile -> Settings to add your Gemini Key." });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are an expert Computer Science Teaching Assistant. You are helping a student debug their code.
        
        --- CONTEXT ---
        1. THE PROBLEM: 
        ${problemDescription}

        2. STUDENT'S CODE:
        ${userCode}

        3. RECENT TEST RESULTS / ERRORS:
        ${JSON.stringify(testResults || "No test run yet")}

        4. STUDENT'S QUESTION:
        "${studentQuery}"

        --- INSTRUCTIONS ---
        - Do NOT write the correct code for them.
        - Do NOT give the direct answer.
        - Analyze why their code might be failing based on the test results provided.
        - Give a subtle hint or ask a guiding question to help them realize their mistake.
        - Keep your response short (max 3 sentences).
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ hint: text });

    } catch (err) {
        console.error("AI Error:", err.message);
        res.status(500).json({ error: "Failed to generate hint. Ensure your API Key is valid." });
    }
});

export default router;