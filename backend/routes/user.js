import express from 'express';
import bcrypt from 'bcrypt';
import db from '../middleware/db.js';
import jwtGenerator from '../middleware/auth.js'; // Ensure this path is correct
import validInfo from '../middleware/validInfo.js';  // Ensure this path is correct
import authorize from '../middleware/authorize.js';  // Ensure this path is correct

const router = express.Router();

// --- REGISTER ROUTE ---
router.post('/register', validInfo, async (req, res) => {
    const { email, name, password } = req.body;

    try {
        // 1. Check if user already exists
        const user = await db.query("SELECT * FROM users WHERE user_email = $1", [email]);

        if (user.rows.length > 0) {
            return res.status(401).json("User already exists!");
        }

        // 2. Bcrypt the password
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const bcryptPassword = await bcrypt.hash(password, salt);

        // 3. Insert the new user
        const newUser = await db.query(
            "INSERT INTO users (username, user_email, password) VALUES ($1, $2, $3) RETURNING *",
            [name, email, bcryptPassword]
        );
        
        const userId = newUser.rows[0].userid;

        // =========================================================
        // 4. [NEW FEATURE] Check for Pending Course Invites
        // =========================================================
        try {
            // Check pending_enrollments table for this email
            const pendingRes = await db.query("SELECT course_id FROM pending_enrollments WHERE email = $1", [email]);
            
            if (pendingRes.rows.length > 0) {
                console.log(`Found ${pendingRes.rows.length} pending invites for ${email}`);
                
                for (const row of pendingRes.rows) {
                    // Enroll user in the actual table
                    await db.query(
                        "INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                        [userId, row.course_id]
                    );
                }
                
                // Remove processed invites
                await db.query("DELETE FROM pending_enrollments WHERE email = $1", [email]);
                console.log("✅ Pending invites processed successfully.");
            }
        } catch (inviteErr) {
            // If invite processing fails, we DO NOT stop registration. Log it and continue.
            console.error("Error processing pending invites:", inviteErr);
        }
        // =========================================================

        // 5. Generate JWT Token
        const token = jwtGenerator(newUser.rows[0].userid);
        res.json({ token });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});
// --- LOGIN ROUTE ---
router.post('/login', validInfo, async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.query("SELECT * FROM users WHERE user_email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(401).json("Password or Email is incorrect");
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);

        if (!validPassword) {
            return res.status(401).json("Password or Email is incorrect");
        }

        const token = jwtGenerator(user.rows[0].userid);
        
        // 👇 NEW: Return the role along with the token
        res.json({ 
            token,
            role: user.rows[0].role 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// --- VERIFY ROUTE ---
router.get('/is-verify', authorize, async (req, res) => {
    try {
        res.json(true);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

export default router;