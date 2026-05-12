import express from 'express';
import cors from 'cors';
import { loggerMiddleware } from './middleware/loggerMiddleware.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import wardrobeRoutes from './routes/wardrobe.js';
import outfitRoutes from './routes/outfits.js';
import plannerRoutes from './routes/planner.js';
import userRoutes from './routes/user.js';
import { ApiResponse } from './utils/ApiResponse.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.set('etag', 'strong'); // Enable strong ETags for reliable caching
app.use(loggerMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json(ApiResponse.success({ status: 'ok', service: 'wardrobe-backend' }));
});

// Routes
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/outfits', outfitRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/users', userRoutes);

// Error handling (must be last)
app.use(errorMiddleware);

export default app;
