import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export default async (req, res, next) => {
    try {
        const token = req.header("token");

        if (!token) {
            return res.status(403).json("Not Authorized: No Token");
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);

        req.user = payload.user;
        
        next();
    } catch (err) {
        console.error("Auth Error:", err.message);
        return res.status(403).json("Not Authorized: Invalid Token");
    }
};