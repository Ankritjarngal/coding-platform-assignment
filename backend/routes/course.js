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
    } catch (err) {
        return "error";
    }
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

// routes/course.js

router.get('/my-courses/:userId', async (req, res) => {
    const { userId } = req.params;
    
    // 1. Log the attempt to your backend terminal
    console.log(`👉 Fetching courses for User ID: ${userId}`);

    try {
        if (userId === 'admin_view') {
             const { rows } = await db.query("SELECT * FROM courses ORDER BY created_at DESC");
             return res.json(rows);
        }
        
        // 2. Ensure userId is an Integer to prevent SQL type errors
        const parsedUserId = parseInt(userId);
        if (isNaN(parsedUserId)) {
            return res.status(400).json({ error: "Invalid User ID" });
        }

        // 3. Updated Query (Safer)
        const query = `
            SELECT 
                c.*, 
                e.has_attempted,
                CASE WHEN e.user_id IS NOT NULL THEN true ELSE false END as is_enrolled,
                COALESCE(SUM(sq.points), 0) as user_score,
                (
                    SELECT SUM(jsonb_array_length(CASE 
                        WHEN q.testcases::text = '' THEN '{"hidden":[]}'::jsonb 
                        WHEN q.testcases IS NULL THEN '{"hidden":[]}'::jsonb 
                        ELSE q.testcases::jsonb 
                    END -> 'hidden')) 
                    FROM questions q 
                    WHERE q.course_id = c.course_id
                ) as total_max_score
            FROM courses c
            LEFT JOIN enrollments e ON c.course_id = e.course_id AND e.user_id = $1
            LEFT JOIN solved_questions sq ON c.course_id = sq.course_id AND sq.user_id = $1
            WHERE c.is_public = TRUE OR e.user_id IS NOT NULL
            GROUP BY c.course_id, e.has_attempted, e.user_id, e.enrolled_at, c.created_at
            ORDER BY c.created_at DESC
        `;

        const { rows } = await db.query(query, [parsedUserId]);
        res.json(rows);

    } catch (err) {
        // 4. This will print the REAL error in your VS Code terminal
        console.error("❌ BACKEND ERROR:", err.message); 
        res.status(500).json({ error: "Database error. Check backend terminal for details." });
    }
});
// 3. Get Students

router.get('/:courseId/students', async (req, res) => {
    const { courseId } = req.params;
    try {
        // Active Students (with attempt status AND SCORE)
        const activeQuery = `
            SELECT 
                u.userid, 
                u.username, 
                u.user_email, 
                e.enrolled_at, 
                e.has_attempted,
                -- 👇 Get Total Score for this student in this course
                COALESCE((SELECT SUM(points) FROM solved_questions sq WHERE sq.user_id = u.userid AND sq.course_id = $1), 0) as total_score,
                -- 👇 Get Max Score for this course
                (
                    SELECT SUM(jsonb_array_length(CASE 
                        WHEN q.testcases::text = '' THEN '{"hidden":[]}'::jsonb 
                        WHEN q.testcases IS NULL THEN '{"hidden":[]}'::jsonb 
                        ELSE q.testcases::jsonb 
                    END -> 'hidden')) 
                    FROM questions q 
                    WHERE q.course_id = $1
                ) as max_score
            FROM enrollments e
            JOIN users u ON e.user_id = u.userid
            WHERE e.course_id = $1
            ORDER BY e.enrolled_at DESC
        `;
        const activeRes = await db.query(activeQuery, [courseId]);

        // Pending Invites
        const pendingQuery = `SELECT email, created_at FROM pending_enrollments WHERE course_id = $1 ORDER BY created_at DESC`;
        const pendingRes = await db.query(pendingQuery, [courseId]);

        res.json({ active: activeRes.rows, pending: pendingRes.rows });
    } catch (err) { 
        console.error("❌ ERROR /students:", err.message);
        res.status(500).json({ error: err.message }); 
    }
});

// 4. Start Attempt
router.post('/start-attempt', async (req, res) => {
    const { userId, courseId } = req.body;
    try {
        await db.query("UPDATE enrollments SET has_attempted = TRUE WHERE user_id = $1 AND course_id = $2", [userId, courseId]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. Reset Attempt
router.post('/reset-attempt', async (req, res) => {
    const { userId, courseId } = req.body;
    try {
        await db.query("UPDATE enrollments SET has_attempted = FALSE WHERE user_id = $1 AND course_id = $2", [userId, courseId]);
        res.json({ message: "Student attempt reset." });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. Enroll Single
router.post('/enroll', async (req, res) => {
    const { email, courseId } = req.body;
    const status = await enrollEmail(email.trim(), courseId);
    if (status === "enrolled") res.json({ message: "Student enrolled." });
    else res.json({ message: "Invite saved." });
});

// 7. Bulk Enroll
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

// 8. Delete Course
router.delete('/:courseId', async (req, res) => {
    const { courseId } = req.params;
    try {
        await db.query("DELETE FROM enrollments WHERE course_id = $1", [courseId]);
        await db.query("DELETE FROM pending_enrollments WHERE course_id = $1", [courseId]);
        await db.query("DELETE FROM questions WHERE course_id = $1", [courseId]);
        await db.query("DELETE FROM courses WHERE course_id = $1", [courseId]);
        res.json({ message: "Course deleted successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 9. Get Single Course (With Score!)
router.get('/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.query.userId; // Get from Query Params

        const courseRes = await db.query("SELECT * FROM courses WHERE course_id = $1", [courseId]);
        if (courseRes.rows.length === 0) return res.status(404).json({ error: "Not found" });
        
        const questionsRes = await db.query("SELECT * FROM questions WHERE course_id = $1 ORDER BY quesid ASC", [courseId]);

        // Calculate User Score
        let userScore = 0;
        if (userId) {
            const scoreRes = await db.query(
                "SELECT SUM(points) as total FROM solved_questions WHERE user_id = $1 AND course_id = $2", 
                [userId, courseId]
            );
            userScore = scoreRes.rows[0].total || 0;
        }

        // Calculate Max Score
        let maxScore = 0;
        questionsRes.rows.forEach(q => {
            try {
                const tcs = typeof q.testcases === 'string' ? JSON.parse(q.testcases) : q.testcases;
                if(tcs.hidden) maxScore += tcs.hidden.length;
            } catch(e) {}
        });

        res.json({ 
            ...courseRes.rows[0], 
            questions: questionsRes.rows,
            user_score: parseInt(userScore),
            max_score: maxScore
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;