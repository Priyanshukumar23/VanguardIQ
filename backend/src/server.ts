import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { researchRouter } from './routes/research.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/research', researchRouter);
app.use('/api/companies', researchRouter); // Mount popular endpoint under /api/companies/popular

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'Aegis Alpha Studio - Quantum Wealth Terminal API',
    version: '1.0.0',
    llmProvider: process.env.GEMINI_API_KEY ? 'Google Gemini' : process.env.OPENAI_API_KEY ? 'OpenAI' : 'High-Fidelity Algorithmic Simulation Engine',
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================================`);
  console.log(`🚀 AEGIS ALPHA STUDIO - QUANTUM WEALTH TERMINAL BACKEND`);
  console.log(`📍 Listening on port ${PORT}`);
  console.log(`✨ Health Check: http://localhost:${PORT}/api/health`);
  console.log(`===================================================================`);
});

export default app;
