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
        // 👇 Added gemini_api_key here
        const { email, name, password, avatar, gemini_api_key } = req.body; 

        const user = await db.query("SELECT * FROM users WHERE user_email = $1", [email]);

        if (user.rows.length !== 0) {
            return res.status(401).json("User already exists");
        }

        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const bcryptPassword = await bcrypt.hash(password, salt);

        const userAvatar = avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${name}`;
        
        // Handle empty key as NULL
        const finalKey = gemini_api_key && gemini_api_key.trim() !== "" ? gemini_api_key : null;

        //  Updated INSERT query to include gemini_api_key
        const newUser = await db.query(
            "INSERT INTO users (username, user_email, password, avatar, role, gemini_api_key) VALUES ($1, $2, $3, $4, 'student', $5) RETURNING *", 
            [name, email, bcryptPassword, userAvatar, finalKey]
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

        const user = await db.query("SELECT * FROM users WHERE user_email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(401).json("Password or Email is incorrect");
        }

        const dbUser = user.rows[0];
        
        // Handle column name variations
        const dbPassword = dbUser.password || dbUser.userpassword;

        if (!dbPassword) {
            console.error("CRITICAL ERROR: Password column is missing or NULL in the database!");
            return res.status(500).json("Database Error: Password not found");
        }

        const validPassword = await bcrypt.compare(password, dbPassword);
        
        if (!validPassword) return res.status(401).json("Password or Email is incorrect");

        const token = jwtGenerator(dbUser.userid);
        
        res.json({ 
            token, 
            role: dbUser.role,
            user: {
                id: dbUser.userid,
                name: dbUser.username, 
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
            username: u.username,
            email: u.user_email,
            avatar: u.avatar,
            role: u.role,
            // We verify if key exists, but don't send the raw key back for security
            has_api_key: !!u.gemini_api_key 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 4. UPDATE PROFILE 
router.put("/update", authorize, async (req, res) => {
    try {
        //  Added gemini_api_key to allowed updates
        const { name, avatar, password, gemini_api_key } = req.body;
        const userId = req.user.id;

        if (name) await db.query("UPDATE users SET username = $1 WHERE userid = $2", [name, userId]);
        if (avatar) await db.query("UPDATE users SET avatar = $1 WHERE userid = $2", [avatar, userId]);
        
        // Update API Key
        if (gemini_api_key) {
            await db.query("UPDATE users SET gemini_api_key = $1 WHERE userid = $2", [gemini_api_key, userId]);
        }

        if (password && password.length > 0) {
            const salt = await bcrypt.genSalt(10);
            const bcryptPassword = await bcrypt.hash(password, salt);
            await db.query("UPDATE users SET password = $1 WHERE userid = $2", [bcryptPassword, userId]);
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