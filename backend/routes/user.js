import express from 'express';
import bcrypt from 'bcrypt';
import db from '../middleware/db.js';
import jwtGenerator from '../utils/jwtGenerator.js';
import validInfo from '../middleware/validInfo.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

router.post("/register", validInfo, async (req, res) => {
    try {
        // 1. Destructure 'avatar' from req.body
        const { email, name, password, avatar } = req.body; 

        const user = await db.query("SELECT * FROM users WHERE user_email = $1", [email]);

        if (user.rows.length !== 0) {
            return res.status(401).json("User already exists");
        }

        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const bcryptPassword = await bcrypt.hash(password, salt);

        // 2. Use the provided avatar, or fallback to a default
        const userAvatar = avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${name}`;

        // 3. 👇 CRITICAL STEP: Add 'avatar' to the INSERT statement 👇
        const newUser = await db.query(
            "INSERT INTO users (user_name, user_email, user_password, avatar) VALUES ($1, $2, $3, $4) RETURNING *", 
            [name, email, bcryptPassword, userAvatar]
        );

        const token = jwtGenerator(newUser.rows[0].userid);
        res.json({ token, role: newUser.rows[0].role });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 2. LOGIN (Keep as is, but ensure logic is solid)
router.post("/login", validInfo, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.query("SELECT * FROM users WHERE user_email = $1", [email]);

        if (user.rows.length === 0) return res.status(401).json("Password or Email is incorrect");

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) return res.status(401).json("Password or Email is incorrect");

        const token = jwtGenerator(user.rows[0].userid);
        
        // Return avatar and name too for the frontend to cache locally if needed
        res.json({ 
            token, 
            role: user.rows[0].role,
            user: {
                name: user.rows[0].username,
                avatar: user.rows[0].avatar
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 3. GET PROFILE (New)
router.get("/profile", authorize, async (req, res) => {
    try {
        const user = await db.query("SELECT username, user_email, avatar, role FROM users WHERE userid = $1", [req.user.id]);
        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 4. UPDATE PROFILE (New - Password & Avatar)
router.put("/update", authorize, async (req, res) => {
    try {
        const { name, avatar, password } = req.body;
        const userId = req.user.id;

        // Update basic info
        if (name) await db.query("UPDATE users SET username = $1 WHERE userid = $2", [name, userId]);
        if (avatar) await db.query("UPDATE users SET avatar = $1 WHERE userid = $2", [avatar, userId]);

        // Update Password if provided
        if (password && password.length > 0) {
            const salt = await bcrypt.genSalt(10);
            const bcryptPassword = await bcrypt.hash(password, salt);
            await db.query("UPDATE users SET userpassword = $1 WHERE userid = $2", [bcryptPassword, userId]);
        }

        res.json("Profile updated successfully");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Verify route (Keep as is)
router.get("/is-verify", authorize, async (req, res) => {
    try { res.json(true); } catch (err) { res.status(500).send("Server Error"); }
});

export default router;