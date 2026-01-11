import express from 'express';
import db from "../middleware/db.js";

const router = express.Router();

// ... (Keep Create, Get All, Get Single, Start routes the same) ...

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
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Get All Assignments
router.get('/course/:courseId', async (req, res) => {
    const { courseId } = req.params;
    const userId = req.query.userId; 
    try {
        if (userId) {
            const query = `
                SELECT a.*, 
                    (SELECT COUNT(*) FROM questions q WHERE q.assignment_id = a.assignment_id) as question_count,
                    aa.has_attempted, aa.is_disqualified, aa.warnings_count
                FROM assignments a
                LEFT JOIN assignment_attempts aa ON a.assignment_id = aa.assignment_id AND aa.user_id = $2
                WHERE a.course_id = $1 ORDER BY a.created_at ASC
            `;
            const { rows } = await db.query(query, [courseId, userId]);
            return res.json(rows);
        }
        const { rows } = await db.query("SELECT * FROM assignments WHERE course_id = $1", [courseId]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Get Single Assignment
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const assignmentRes = await db.query("SELECT * FROM assignments WHERE assignment_id = $1", [id]);
        if (assignmentRes.rows.length === 0) return res.status(404).json({ error: "Assignment not found" });
        const questionsRes = await db.query("SELECT quesid, question, category FROM questions WHERE assignment_id = $1 ORDER BY quesid ASC", [id]);
        res.json({ ...assignmentRes.rows[0], questions: questionsRes.rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. Start Attempt
router.post('/start', async (req, res) => {
    const { userId, assignmentId } = req.body;
    try {
        const assign = await db.query("SELECT due_date FROM assignments WHERE assignment_id = $1", [assignmentId]);
        if (assign.rows.length > 0) {
            const dbDate = assign.rows[0].due_date;
            if (dbDate && new Date() > new Date(dbDate)) {
                return res.status(400).json({ error: "Deadline has passed. You cannot start this assignment." });
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

// 5. Check Status (UPDATED WITH SQL MATH)
router.get('/status/:assignmentId/:userId', async (req, res) => {
    const { assignmentId, userId } = req.params;
    try {
        // 👇 This query calculates remaining seconds directly in the DB
        // logic: (duration * 60) - (NOW() - started_at in seconds)
        const query = `
            SELECT 
                aa.*,
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