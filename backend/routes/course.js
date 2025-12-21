import express from 'express';
import db from "../middleware/db.js";
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Temp storage for CSV uploads

// --- HELPER: Smart Enrollment Logic ---
// Returns: "enrolled" (success), "pending" (saved for later), or "error"
async function enrollEmail(email, courseId) {
    try {
        // 1. Check if user exists in the main Users table
        // We use user_email based on your database schema
        const userRes = await db.query("SELECT userid FROM users WHERE user_email = $1", [email]);

        if (userRes.rows.length > 0) {
            // A: User Exists -> Standard Enrollment
            const userId = userRes.rows[0].userid;
            await db.query(
                "INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                [userId, courseId]
            );
            return "enrolled";
        } else {
            // B: User Does NOT Exist -> Add to Pending List
            // They will be automatically enrolled when they register with this email
            await db.query(
                "INSERT INTO pending_enrollments (email, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                [email, courseId]
            );
            return "pending";
        }
    } catch (err) {
        console.error("Enrollment Helper Error:", err.message);
        return "error";
    }
}

// ==========================================
// ROUTES
// ==========================================

// --- 1. Create a New Course ---
router.post('/create', async (req, res) => {
    const { title, description, is_public } = req.body;
    try {
        const result = await db.query(
            "INSERT INTO courses (title, description, is_public) VALUES ($1, $2, $3) RETURNING *",
            [title, description, is_public]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 2. Get Courses for a User (Enrolled + Public) ---
router.get('/my-courses/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        // Admin View: Return ALL courses
        if (userId === 'admin_view') {
             const { rows } = await db.query("SELECT * FROM courses ORDER BY created_at DESC");
             return res.json(rows);
        }

        // Student View: Return Enrolled OR Public courses
        const query = `
            SELECT c.*, 
            CASE WHEN e.user_id IS NOT NULL THEN true ELSE false END as is_enrolled
            FROM courses c
            LEFT JOIN enrollments e ON c.course_id = e.course_id AND e.user_id = $1
            WHERE c.is_public = TRUE OR e.user_id IS NOT NULL
            ORDER BY c.created_at DESC
        `;
        
        const { rows } = await db.query(query, [userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 3. Get Single Course Details (with Questions) ---
router.get('/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const courseRes = await db.query("SELECT * FROM courses WHERE course_id = $1", [courseId]);
        
        if (courseRes.rows.length === 0) return res.status(404).json({ error: "Course not found" });
        
        // Fetch questions belonging to this course
        const questionsRes = await db.query("SELECT * FROM questions WHERE course_id = $1 ORDER BY quesid ASC", [courseId]);

        res.json({ ...courseRes.rows[0], questions: questionsRes.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 4. Enroll Single Student (By Email) ---
router.post('/enroll', async (req, res) => {
    const { email, courseId } = req.body;
    
    if (!email || !courseId) return res.status(400).json({ error: "Email and Course ID required" });

    const status = await enrollEmail(email.trim(), courseId);
    
    if (status === "enrolled") {
        res.json({ message: "Student enrolled successfully." });
    } else if (status === "pending") {
        res.json({ message: "User not on platform yet. Invite saved! They will be enrolled when they sign up." });
    } else {
        res.status(500).json({ error: "Database error during enrollment." });
    }
});

// --- 5. Bulk Enroll (CSV Upload) ---
router.post('/bulk-enroll/:courseId', upload.single('file'), (req, res) => {
    const { courseId } = req.params;
    const emails = [];
    
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Parse CSV
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
            // Try to find email column case-insensitively
            const email = data.email || data.Email || data.user_email || data.EMAIL; 
            if (email) emails.push(email.trim()); 
        })
        .on('end', async () => {
            // Cleanup temp file
            try { fs.unlinkSync(req.file.path); } catch(e) {}
            
            let stats = { enrolled: 0, pending: 0, failed: 0 };

            // Process all emails
            for (const email of emails) {
                const status = await enrollEmail(email, courseId);
                if (status === "enrolled") stats.enrolled++;
                else if (status === "pending") stats.pending++;
                else stats.failed++;
            }
            
            res.json({ 
                message: `Processed CSV. Enrolled: ${stats.enrolled}, Invites Saved: ${stats.pending}, Failed: ${stats.failed}` 
            });
        });
});

export default router;