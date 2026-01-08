import express from 'express';
import db from "../middleware/db.js";
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);
const router = express.Router();

// --- Helper: Fetch Test Cases ---
async function fetch_testcases(questionId) {
    const query = 'SELECT testcases FROM questions WHERE quesid = $1';
    const { rows } = await db.query(query, [questionId]);
    if (!rows.length) return null;

    let tcs = rows[0].testcases;
    if (typeof tcs === 'string') tcs = JSON.parse(tcs);
    
    if (Array.isArray(tcs)) {
        return { examples: tcs.slice(0, 3), hidden: tcs.slice(3) };
    }
    return tcs; 
}

// --- Docker Command Generator ---
function getDockerCommand(language, codeFilePath, inputFilePath) {
    const langMap = {
        c: {
            image: 'gcc',
            compile: `gcc ${codeFilePath} -o /app/a.out`,
            run: `/app/a.out < ${inputFilePath}`
        },
        cpp: { 
            image: 'gcc', 
            compile: `g++ ${codeFilePath} -o /app/a.out`, 
            run: `/app/a.out < ${inputFilePath}` 
        },
        python: { 
            image: 'python:3', 
            run: `python ${codeFilePath} < ${inputFilePath}` 
        },
        javascript: { 
            image: 'node', 
            run: `node ${codeFilePath} < ${inputFilePath}` 
        }
    };

    const langConfig = langMap[language.toLowerCase()];
    if (!langConfig) throw new Error('Unsupported language');

    const hostTempPath = path.join(process.cwd(), 'temp'); 
    const base = `docker run --rm -v "${hostTempPath}:/app" -w /app ${langConfig.image}`;
    
    if (langConfig.compile) {
        return `${base} sh -c "${langConfig.compile} && ${langConfig.run}"`;
    }
    return `${base} sh -c "${langConfig.run}"`;
}

async function runCodeInDocker({ language, solution, testcaseInput }) {
    const uid = uuidv4();
    const tempDir = path.join(process.cwd(), 'temp');
    
    const extensionMap = { c: 'c', cpp: 'cpp', python: 'py', javascript: 'js' };
    const ext = extensionMap[language.toLowerCase()];
    if (!ext) throw new Error('Unsupported language');

    const codeFileName = `code-${uid}.${ext}`;
    const inputFileName = `input-${uid}.txt`;
    
    const codeFilePath = path.join(tempDir, codeFileName);
    const inputFilePath = path.join(tempDir, inputFileName);

    try {
        await fs.mkdir(tempDir, { recursive: true });
        await fs.writeFile(codeFilePath, solution);
        await fs.writeFile(inputFilePath, testcaseInput || "");

        const command = getDockerCommand(language, `/app/${codeFileName}`, `/app/${inputFileName}`);
        
        // 10s Timeout
        const { stdout, stderr } = await execAsync(command, { timeout: 10000 });
        
        return { output: stdout.trim(), error: stderr.trim() || null };
    } catch (err) {
        return { output: "", error: err.stderr || err.message };
    } finally {
        try {
            await fs.rm(codeFilePath, { force: true });
            await fs.rm(inputFilePath, { force: true });
        } catch (e) {}
    }
}

// --- Endpoint: Run (Examples Only) ---
router.post('/run', async (req, res) => {
    const { language, solution, questionId } = req.body;
    try {
        const tcs = await fetch_testcases(questionId);
        if (!tcs) return res.status(404).json({ error: "Question not found" });

        const exampleCases = tcs.examples || [];
        if (exampleCases.length === 0) return res.status(400).json({ error: "No example cases found" });

        const results = [];

        for (const tc of exampleCases) {
            const result = await runCodeInDocker({ language, solution, testcaseInput: tc.input });
            const passed = result.output.trim() === tc.expected_output.trim();
            
            results.push({
                input: tc.input,
                expected_output: tc.expected_output,
                user_output: result.output,
                error: result.error,
                passed: passed
            });
        }

        res.json({ results }); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Endpoint: Submit (Calculates Score) ---
router.post('/submit', async (req, res) => {
    const { questionId, language, solution, userId, courseId } = req.body;

    try {
        const tcs = await fetch_testcases(questionId);
        if (!tcs) return res.status(404).json({ error: 'Question not found' });

        const exampleCases = tcs.examples || [];
        const hiddenCases = tcs.hidden || [];
        const allCases = [...exampleCases, ...hiddenCases];

        if(allCases.length === 0) return res.status(400).json({ error: "No test cases found" });

        const results = [];
        let allPassed = true;
        let hiddenPassedCount = 0; 

        for (let i = 0; i < allCases.length; i++) {
            const tc = allCases[i];
            const result = await runCodeInDocker({ language, solution, testcaseInput: tc.input });
            
            const passed = result.output.trim() === tc.expected_output.trim();
            if (!passed) allPassed = false;

            if (i >= exampleCases.length && passed) {
                hiddenPassedCount++;
            }

            results.push({
                input: tc.input,
                expected_output: tc.expected_output,
                user_output: result.output,
                passed: passed,
                error: result.error
            });
            
        }

        if (userId && courseId) {
            await db.query(`
                INSERT INTO solved_questions (user_id, question_id, course_id, points)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (user_id, question_id) 
                DO UPDATE SET points = GREATEST(solved_questions.points, EXCLUDED.points);
            `, [userId, questionId, courseId, hiddenPassedCount]);
        }
        
        res.json({ 
            status: allPassed ? "Accepted" : "Wrong Answer",
            total_cases: allCases.length,
            passed_cases: results.filter(r => r.passed).length,
            failed_case: allPassed ? null : results.find(r => !r.passed),
            score_earned: hiddenPassedCount 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;