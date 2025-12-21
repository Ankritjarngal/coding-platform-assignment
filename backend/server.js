import express from 'express';
import cors from 'cors'
import questionRoutes from './routes/questions.js';
import solutionRoutes from './routes/solutions.js';
import userRoutes from './routes/user.js';
import { authenticateToken } from './middleware/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

// Route handlers
app.use('/Question', questionRoutes);
app.use('/Solution', authenticateToken, solutionRoutes);
app.use('/user', userRoutes);
console.log(process.env.JWT_SECRET)
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
