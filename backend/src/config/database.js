import { Sequelize } from 'sequelize';
import env from './env.js';

class Database {
  constructor() {
    this.sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
      host: env.db.host,
      port: env.db.port,
      dialect: 'postgres',
      logging: env.nodeEnv === 'development' ? console.log : false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });
  }

  async connect() {
    await this.sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');
  }

  async sync() {
    await this.sequelize.sync({ alter: env.nodeEnv === 'development' });
    console.log('✅ Modelos sincronizados con la base de datos.');
  }
}

const database = new Database();
export const sequelize = database.sequelize;
export default database;
