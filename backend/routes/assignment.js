import express from 'express';
import db from "../middleware/db.js";

const router = express.Router();

// Helper to safely parse Test Cases without crashing
const safeParseTestCases = (data) => {
    try {
        if (!data) return { hidden: [] };
        if (typeof data === 'object') return data; // Already parsed by Postgres
        return JSON.parse(data);
    } catch (e) {
        return { hidden: [] }; // Fallback on error
    }
};

// 1. Create Assignment
router.post('/create', async (req, res) => {
    const { courseId, title, description, duration, dueDate } = req.body;
    try {
        const finalDueDate = dueDate ? dueDate : null;
        const result = await db.query(
            "INSERT INTO assignments (course_id, title, description, duration_minutes, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [courseId, title, description, duration || 60, finalDueDate]
        );
        res.json(result.rows[0]);
    } catch (err) { 
        console.error("Create Assignment Error:", err.message);
        res.status(500).json({ error: err.message }); 
    }
});

// 2. Get All Assignments for a Course (With Score & Status)
router.get('/course/:courseId', async (req, res) => {
    const { courseId } = req.params;
    const userId = req.query.userId; 

    try {
        if (userId) {
            // 1. Fetch Assignments basic info
            const query = `
                SELECT a.*, 
                    (SELECT COUNT(*) FROM questions q WHERE q.assignment_id = a.assignment_id) as question_count,
                    aa.has_attempted, 
                    aa.is_disqualified, 
                    aa.warnings_count,
                    COALESCE((
                        SELECT SUM(sq.points) 
                        FROM questions q
                        JOIN solved_questions sq ON sq.question_id = q.quesid
                        WHERE q.assignment_id = a.assignment_id AND sq.user_id = $2
                    ), 0) as user_score
                FROM assignments a
                LEFT JOIN assignment_attempts aa ON a.assignment_id = aa.assignment_id AND aa.user_id = $2
                WHERE a.course_id = $1
                ORDER BY a.created_at ASC
            `;
            const { rows: assignments } = await db.query(query, [courseId, userId]);

            // 2. Fetch Questions to calculate MAX SCORE (Hidden Test Cases count)
            // We do this in a separate query to prevent SQL complexity crashes
            const qQuery = `
                SELECT assignment_id, testcases 
                FROM questions 
                WHERE assignment_id IN (SELECT assignment_id FROM assignments WHERE course_id = $1)
            `;
            const { rows: allQuestions } = await db.query(qQuery, [courseId]);

            // 3. Merge in Javascript (Safe Calculation)
            const result = assignments.map(assign => {
                const assignQuestions = allQuestions.filter(q => q.assignment_id === assign.assignment_id);
                
                // Safe count of hidden test cases
                const maxScore = assignQuestions.reduce((sum, q) => {
                    const tc = safeParseTestCases(q.testcases);
                    const hiddenCount = (tc.hidden && Array.isArray(tc.hidden)) ? tc.hidden.length : 0;
                    return sum + hiddenCount;
                }, 0);

                return {
                    ...assign,
                    max_score: maxScore > 0 ? maxScore : assign.question_count * 5 // Fallback if no test cases defined
                };
            });

            return res.json(result);
        }
        
        // Admin View
        const { rows } = await db.query(`
            SELECT a.*, (SELECT COUNT(*) FROM questions q WHERE q.assignment_id = a.assignment_id) as question_count
            FROM assignments a WHERE course_id = $1 ORDER BY created_at ASC
        `, [courseId]);
        res.json(rows);

    } catch (err) { 
        console.error("Get Course Assignments Error:", err.message); // 👈 Check terminal if 500 happens again
        res.status(500).json({ error: err.message }); 
    }
});

// 3. Get Single Assignment
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.query.userId;

    try {
        const assignmentRes = await db.query("SELECT * FROM assignments WHERE assignment_id = $1", [id]);
        if (assignmentRes.rows.length === 0) return res.status(404).json({ error: "Assignment not found" });

        let questionsQuery = `SELECT quesid, question, category, testcases FROM questions WHERE assignment_id = $1 ORDER BY quesid ASC`;
        let params = [id];

        if (userId) {
            questionsQuery = `
                SELECT q.quesid, q.question, q.category, q.testcases,
                COALESCE(sq.points, 0) as points_earned,
                CASE WHEN sq.question_id IS NOT NULL THEN true ELSE false END as is_solved
                FROM questions q
                LEFT JOIN solved_questions sq ON q.quesid = sq.question_id AND sq.user_id = $2
                WHERE q.assignment_id = $1 
                ORDER BY q.quesid ASC
            `;
            params = [id, userId];
        }

        const questionsRes = await db.query(questionsQuery, params);
        
        // Calculate Totals safely
        let totalMaxScore = 0;
        let totalUserScore = 0;

        const questionsWithData = questionsRes.rows.map(q => {
            const tc = safeParseTestCases(q.testcases);
            const hiddenCount = (tc.hidden && Array.isArray(tc.hidden)) ? tc.hidden.length : 0; // Default 5 if empty? No, 0 is safer.

            totalMaxScore += hiddenCount;
            totalUserScore += (parseInt(q.points_earned) || 0);

            delete q.testcases; // Cleanup
            return q;
        });

        res.json({ 
            ...assignmentRes.rows[0], 
            questions: questionsWithData,
            user_score: totalUserScore,
            max_score: totalMaxScore
        });
    } catch (err) { 
        console.error("Get Single Assignment Error:", err.message);
        res.status(500).json({ error: err.message }); 
    }
});

// 4. Start Attempt
router.post('/start', async (req, res) => {
    const { userId, assignmentId } = req.body;
    try {
        const assign = await db.query("SELECT due_date FROM assignments WHERE assignment_id = $1", [assignmentId]);
        if (assign.rows.length > 0) {
            const dbDate = assign.rows[0].due_date;
            if (dbDate && new Date() > new Date(dbDate)) {
                return res.status(400).json({ error: "Deadline has passed." });
            }
        }
        await db.query(`
            INSERT INTO assignment_attempts (user_id, assignment_id, has_attempted, started_at)
            VALUES ($1, $2, TRUE, NOW())
            ON CONFLICT (user_id, assignment_id) DO NOTHING
        `, [userId, assignmentId]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. Check Status
router.get('/status/:assignmentId/:userId', async (req, res) => {
    const { assignmentId, userId } = req.params;
    try {
        const query = `
            SELECT aa.*,
                EXTRACT(EPOCH FROM (NOW() - aa.started_at)) as seconds_passed,
                (a.duration_minutes * 60) - EXTRACT(EPOCH FROM (NOW() - aa.started_at)) as remaining_seconds
            FROM assignment_attempts aa
            JOIN assignments a ON aa.assignment_id = a.assignment_id
            WHERE aa.user_id = $1 AND aa.assignment_id = $2
        `;
        const { rows } = await db.query(query, [userId, assignmentId]);
        if (rows.length === 0) return res.json({});
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. Reset
router.post('/reset', async (req, res) => {
    const { userId, assignmentId } = req.body;
    try {
        await db.query("DELETE FROM assignment_attempts WHERE user_id = $1 AND assignment_id = $2", [userId, assignmentId]);
        res.json({ message: "Reset successful" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 7. Report Violation
router.post('/report-violation', async (req, res) => {
    const { userId, assignmentId, action } = req.body;
    try {
        if (action === 'disqualify') {
            await db.query("UPDATE assignment_attempts SET is_disqualified = TRUE WHERE user_id = $1 AND assignment_id = $2", [userId, assignmentId]);
        } 
        res.json({ status: 'updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;