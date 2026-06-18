import app from './app.js';
import database from './config/database.js';
import env from './config/env.js';
import { initCronJobs } from './jobs/cron.js';

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
