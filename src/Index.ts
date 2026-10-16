import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './Config/data-source';
import { userRouter } from './Routes/UserRoutes';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running'
    });
});
app.use('/api/users', userRouter);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Route not found'
        }
    });
});

AppDataSource.initialize()
    .then(() => {
        console.log('✅ Database connected successfully!');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on: http://localhost:${PORT}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
            console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
        });
    })
    .catch((error) => {
        console.error('Error during Data Source initialization:', error);
    });