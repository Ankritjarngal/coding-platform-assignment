import express from 'express';
import db from "../middleware/db.js";
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// --- HELPER: Smart Enrollment ---
async function enrollEmail(email, courseId) {
    try {
        const userRes = await db.query("SELECT userid FROM users WHERE user_email = $1", [email]);
        if (userRes.rows.length > 0) {
            const userId = userRes.rows[0].userid;
            await db.query("INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [userId, courseId]);
            return "enrolled";
        } else {
            await db.query("INSERT INTO pending_enrollments (email, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [email, courseId]);
            return "pending";
        }
    } catch (err) { return "error"; }
}

// 1. Create Course
router.post('/create', async (req, res) => {
    const { title, description, is_public } = req.body;
    try {
        const result = await db.query(
            "INSERT INTO courses (title, description, is_public) VALUES ($1, $2, $3) RETURNING *",
            [title, description, is_public]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Get Courses (Dashboard - FIXED SCORE QUERY)
router.get('/my-courses/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        if (userId === 'admin_view') {
             const { rows } = await db.query("SELECT * FROM courses ORDER BY created_at DESC");
             return res.json(rows);
        }
        
        const parsedUserId = parseInt(userId);
        if (isNaN(parsedUserId)) return res.status(400).json({ error: "Invalid User ID" });

        // 👇 UPDATED QUERY: Sums scores via Assignments -> Questions
        const query = `
            SELECT 
                c.*, 
                CASE WHEN e.user_id IS NOT NULL THEN true ELSE false END as is_enrolled,
                -- Calculate User Score
                COALESCE((
                    SELECT SUM(sq.points)
                    FROM assignments a
                    JOIN questions q ON q.assignment_id = a.assignment_id
                    JOIN solved_questions sq ON sq.question_id = q.quesid
                    WHERE a.course_id = c.course_id AND sq.user_id = $1
                ), 0) as user_score,
                -- Calculate Max Score
                (
                    SELECT SUM(jsonb_array_length(CASE 
                        WHEN q.testcases::text = '' THEN '{"hidden":[]}'::jsonb 
                        WHEN q.testcases IS NULL THEN '{"hidden":[]}'::jsonb 
                        ELSE q.testcases::jsonb 
                    END -> 'hidden')) 
                    FROM assignments a
                    JOIN questions q ON q.assignment_id = a.assignment_id
                    WHERE a.course_id = c.course_id
                ) as total_max_score
            FROM courses c
            LEFT JOIN enrollments e ON c.course_id = e.course_id AND e.user_id = $1
            WHERE c.is_public = TRUE OR e.user_id IS NOT NULL
            ORDER BY c.created_at DESC
        `;
        const { rows } = await db.query(query, [parsedUserId]);
        res.json(rows);
    } catch (err) { 
        console.error("Backend Error:", err);
        res.status(500).json({ error: "Database Error" }); 
    }
});

// 3. Get Single Course Metadata
router.get('/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const courseRes = await db.query("SELECT * FROM courses WHERE course_id = $1", [courseId]);
        if (courseRes.rows.length === 0) return res.status(404).json({ error: "Not found" });
        
        res.json(courseRes.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. Enroll Routes
router.post('/enroll', async (req, res) => {
    const { email, courseId } = req.body;
    const status = await enrollEmail(email.trim(), courseId);
    if (status === "enrolled") res.json({ message: "Student enrolled." });
    else res.json({ message: "Invite saved." });
});

router.post('/bulk-enroll/:courseId', upload.single('file'), (req, res) => {
    const { courseId } = req.params;
    const emails = [];
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
            const email = data.email || data.Email || data.user_email; 
            if (email) emails.push(email.trim()); 
        })
        .on('end', async () => {
            try { fs.unlinkSync(req.file.path); } catch(e) {}
            for (const email of emails) { await enrollEmail(email, courseId); }
            res.json({ message: `Processed ${emails.length} emails` });
        });
});

// 5. Get Students
router.get('/:courseId/students', async (req, res) => {
    const { courseId } = req.params;
    try {
        const activeRes = await db.query(`
            SELECT u.userid, u.username, u.user_email, e.enrolled_at 
            FROM enrollments e
            JOIN users u ON e.user_id = u.userid
            WHERE e.course_id = $1 ORDER BY e.enrolled_at DESC
        `, [courseId]);
        const pendingRes = await db.query(`SELECT email, created_at FROM pending_enrollments WHERE course_id = $1 ORDER BY created_at DESC`, [courseId]);
        res.json({ active: activeRes.rows, pending: pendingRes.rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. Delete Course
router.delete('/:courseId', async (req, res) => {
    const { courseId } = req.params;
    try {
        await db.query("DELETE FROM courses WHERE course_id = $1", [courseId]);
        res.json({ message: "Course deleted successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;