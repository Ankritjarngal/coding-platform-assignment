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
        console.error("Enrollment Helper Error:", err.message);
        return "error";
    }
}

// ================= ROUTES =================

// 1. Create Course
router.post('/create', async (req, res) => {
    console.log("👉 HIT: /create");
    const { title, description, is_public } = req.body;
    try {
        const result = await db.query(
            "INSERT INTO courses (title, description, is_public) VALUES ($1, $2, $3) RETURNING *",
            [title, description, is_public]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ ERROR /create:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 2. Get Courses (Updated with 'has_attempted')
router.get('/my-courses/:userId', async (req, res) => {
    console.log(`👉 HIT: /my-courses/${req.params.userId}`);
    const { userId } = req.params;
    try {
        if (userId === 'admin_view') {
             const { rows } = await db.query("SELECT * FROM courses ORDER BY created_at DESC");
             return res.json(rows);
        }
        
        // Fetch course info + attempt status for this user
        const query = `
            SELECT c.*, 
            e.has_attempted,
            CASE WHEN e.user_id IS NOT NULL THEN true ELSE false END as is_enrolled
            FROM courses c
            LEFT JOIN enrollments e ON c.course_id = e.course_id AND e.user_id = $1
            WHERE c.is_public = TRUE OR e.user_id IS NOT NULL
            ORDER BY c.created_at DESC
        `;
        const { rows } = await db.query(query, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("❌ ERROR /my-courses:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 3. Get Students (Updated with 'has_attempted' status)
router.get('/:courseId/students', async (req, res) => {
    const { courseId } = req.params;
    try {
        // Active Students (with attempt status)
        const activeQuery = `
            SELECT u.userid, u.username, u.user_email, e.enrolled_at, e.has_attempted
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

// 4. [NEW] Start Attempt (Locks the course)
router.post('/start-attempt', async (req, res) => {
    const { userId, courseId } = req.body;
    try {
        await db.query(
            "UPDATE enrollments SET has_attempted = TRUE WHERE user_id = $1 AND course_id = $2",
            [userId, courseId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("❌ ERROR /start-attempt:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 5. [NEW] Reset Attempt (Admin unlocks the course)
router.post('/reset-attempt', async (req, res) => {
    const { userId, courseId } = req.body;
    try {
        await db.query(
            "UPDATE enrollments SET has_attempted = FALSE WHERE user_id = $1 AND course_id = $2",
            [userId, courseId]
        );
        res.json({ message: "Student attempt reset." });
    } catch (err) {
        console.error("❌ ERROR /reset-attempt:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 6. Enroll Single Student
router.post('/enroll', async (req, res) => {
    const { email, courseId } = req.body;
    if (!email || !courseId) return res.status(400).json({ error: "Required fields missing" });

    const status = await enrollEmail(email.trim(), courseId);
    if (status === "enrolled") res.json({ message: "Student enrolled." });
    else if (status === "pending") res.json({ message: "Invite saved." });
    else res.status(500).json({ error: "Database error" });
});

// 7. Bulk Enroll
// --- 9. Delete Course ---
router.delete('/:courseId', async (req, res) => {
    console.log(`👉 HIT: /delete/${req.params.courseId}`);
    const { courseId } = req.params;
    try {
        // 1. Clean up dependencies (Enrollments, Questions, Pending Invites)
        // This ensures no "Foreign Key Constraint" errors
        await db.query("DELETE FROM enrollments WHERE course_id = $1", [courseId]);
        await db.query("DELETE FROM pending_enrollments WHERE course_id = $1", [courseId]);
        await db.query("DELETE FROM questions WHERE course_id = $1", [courseId]);

        // 2. Delete the Course
        const result = await db.query("DELETE FROM courses WHERE course_id = $1 RETURNING *", [courseId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Course not found" });
        }

        res.json({ message: "Course deleted successfully" });
    } catch (err) {
        console.error("❌ ERROR /delete:", err.message);
        res.status(500).json({ error: err.message });
    }
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
            let stats = { enrolled: 0, pending: 0, failed: 0 };
            for (const email of emails) {
                const status = await enrollEmail(email, courseId);
                if (status === "enrolled") stats.enrolled++;
                else if (status === "pending") stats.pending++;
                else stats.failed++;
            }
            res.json({ message: `Processed: ${stats.enrolled} Enrolled, ${stats.pending} Pending` });
        });
});

// 8. Get Course Details
router.get('/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const courseRes = await db.query("SELECT * FROM courses WHERE course_id = $1", [courseId]);
        if (courseRes.rows.length === 0) return res.status(404).json({ error: "Not found" });
        const questionsRes = await db.query("SELECT * FROM questions WHERE course_id = $1 ORDER BY quesid ASC", [courseId]);
        res.json({ ...courseRes.rows[0], questions: questionsRes.rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;