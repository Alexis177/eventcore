import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import database from './config/database.js';
import routes from './routes/index.js';
import errorMiddleware from './middlewares/error.middleware.js';
import env from './config/env.js';
import { initCronJobs } from './jobs/cron.js';

import './models/index.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

// Limita a 100 peticiones cada 15 minutos por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { success: false, message: "Demasiadas peticiones desde esta IP, intenta de nuevo más tarde." }
});
app.use('/api', limiter);

app.use('/api', routes);

app.get('/health', (_req, res) => res.json({ status: 'ok', project: 'EventCore' }));
app.use((_req, res) => res.status(404).json({ success: false, message: 'Ruta no encontrada' }));
app.use(errorMiddleware);

const start = async () => {
  try {
    await database.connect();
    await database.sync();
    initCronJobs();
    app.listen(env.port, () => {
      console.log(`🚀 EventCore API corriendo en http://localhost:${env.port}`);
      console.log(`📌 Entorno: ${env.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};
start();
