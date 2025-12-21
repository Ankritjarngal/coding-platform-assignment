import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../middleware/db.js';
import addUserData from "../insertdata.js"

dotenv.config();
const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, user_email, password } = req.body;

    try {
        // Check if user already exists
        const checkUser = await db.query(
            "SELECT * FROM users WHERE username = $1 OR user_email = $2",
            [username, user_email]
        );

        if (checkUser.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Optional: hash password
        // const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = `
            INSERT INTO users (username, user_email, password)
            VALUES ($1, $2, $3)
            RETURNING userid, username, user_email;
        `;

        const result = await db.query(insertQuery, [username, user_email, password]); // replace with hashedPassword if used

        res.status(201).json({
            message: "User registered",
            user: result.rows[0],
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error" });
    }
});



router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const userQuery = await db.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userQuery.rows[0];

        // const isMatch = await bcrypt.compare(password, user.password);
        // if (!isMatch) {
        //     return res.status(401).json({ message: "Incorrect password" });
        // }
        const secretKey = 'gomonkey';
        const token = jwt.sign(
            {
                userid: user.userid,
                username: user.username,
                email: user.user_email,
            },
            secretKey
            ,
            // { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(200).json({ message: "Login successful", token });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;