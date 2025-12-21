import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authorize = async (req, res, next) => {
  try {
    // 1. Get token from header
    const jwtToken = req.header("token");

    if (!jwtToken) {
      return res.status(403).json("Not Authorized");
    }

    // 2. Verify token
    const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);

    // 3. Attach user payload to request
    // This allows us to access req.user.id in our routes
    req.user = payload.user;
    
    next();
  } catch (err) {
    console.error(err.message);
    return res.status(403).json("Not Authorized");
  }
};

export default authorize;