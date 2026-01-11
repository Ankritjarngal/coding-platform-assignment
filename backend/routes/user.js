import express from 'express';
import bcrypt from 'bcrypt';
import db from '../middleware/db.js';
import jwtGenerator from '../utils/jwtGenerator.js';
import validInfo from '../middleware/validInfo.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

// 1. REGISTER
router.post("/register", validInfo, async (req, res) => {
    try {
        const { email, name, password, avatar } = req.body; 

        const user = await db.query("SELECT * FROM users WHERE user_email = $1", [email]);

        if (user.rows.length !== 0) {
            return res.status(401).json("User already exists");
        }

        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const bcryptPassword = await bcrypt.hash(password, salt);

        const userAvatar = avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${name}`;

        // Uses 'user_password' based on your schema
        const newUser = await db.query(
            "INSERT INTO users (user_name, user_email, user_password, avatar, role) VALUES ($1, $2, $3, $4, 'student') RETURNING *", 
            [name, email, bcryptPassword, userAvatar]
        );

        const token = jwtGenerator(newUser.rows[0].userid);
        res.json({ token, role: newUser.rows[0].role });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 2. LOGIN 
router.post("/login", validInfo, async (req, res) => {
    try {
        const { email, password } = req.body;

        // 🔍 DEBUG LOGS
        console.log("Login Attempt:", email);

        const user = await db.query("SELECT * FROM users WHERE user_email = $1", [email]);

        if (user.rows.length === 0) {
            console.log("User not found in DB");
            return res.status(401).json("Password or Email is incorrect");
        }

        const dbUser = user.rows[0];
        
        // 🔍 DEBUG: Print exact database columns to see the mismatch
        console.log("DB User Columns:", Object.keys(dbUser));

        // SAFETY CHECK: Try both common column names
        const dbPassword = dbUser.user_password || dbUser.password || dbUser.userpassword;

        if (!dbPassword) {
            console.error("CRITICAL ERROR: Password column is missing or NULL in the database!");
            return res.status(500).json("Database Error: Password not found");
        }

        // Compare using the found password
        const validPassword = await bcrypt.compare(password, dbPassword);
        
        if (!validPassword) return res.status(401).json("Password or Email is incorrect");

        const token = jwtGenerator(dbUser.userid);
        
        res.json({ 
            token, 
            role: dbUser.role,
            user: {
                id: dbUser.userid,
                name: dbUser.user_name || dbUser.username, 
                avatar: dbUser.avatar
            }
        });
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).send("Server Error");
    }
});

// 3. GET PROFILE 
router.get("/profile", authorize, async (req, res) => {
    try {
        const user = await db.query("SELECT * FROM users WHERE userid = $1", [req.user.id]);
        
        if (user.rows.length === 0) return res.status(404).json("User not found");

        const u = user.rows[0];
        res.json({
            id: u.userid,
            username: u.user_name || u.username,
            email: u.user_email,
            avatar: u.avatar,
            role: u.role
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 4. UPDATE PROFILE 
router.put("/update", authorize, async (req, res) => {
    try {
        const { name, avatar, password } = req.body;
        const userId = req.user.id;

        if (name) await db.query("UPDATE users SET user_name = $1 WHERE userid = $2", [name, userId]);
        if (avatar) await db.query("UPDATE users SET avatar = $1 WHERE userid = $2", [avatar, userId]);

        if (password && password.length > 0) {
            const salt = await bcrypt.genSalt(10);
            const bcryptPassword = await bcrypt.hash(password, salt);
            // Updating 'user_password'
            await db.query("UPDATE users SET user_password = $1 WHERE userid = $2", [bcryptPassword, userId]);
        }

        res.json("Profile updated successfully");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.get("/is-verify", authorize, async (req, res) => {
    try { res.json(true); } catch (err) { res.status(500).send("Server Error"); }
});

export default router;