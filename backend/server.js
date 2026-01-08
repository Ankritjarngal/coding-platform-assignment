import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from "./middleware/db.js";

import authRoutes from './routes/user.js';
import questionRoutes from './routes/questions.js';
import solutionRoutes from './routes/solutions.js';
import courseRoutes from './routes/course.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Use Routes
app.use('/auth', authRoutes);
app.use('/Question', questionRoutes);
app.use('/Solution', solutionRoutes);
app.use('/Course', courseRoutes); 

// Test Route
app.get('/', (req, res) => {
    res.send('gomonkey');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});