import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

class Event extends Model {}

Event.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  category: { type: DataTypes.STRING(100), defaultValue: 'Tecnología', allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  summary: { type: DataTypes.TEXT, allowNull: true },
  location: { type: DataTypes.STRING(255), allowNull: false },
  startDate: { type: DataTypes.DATE, allowNull: false },
  endDate: { type: DataTypes.DATE, allowNull: false },
  capacity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  status: { type: DataTypes.ENUM('draft', 'published', 'cancelled', 'finished'), defaultValue: 'draft' },
  organizerId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'Event', tableName: 'events', timestamps: true });

export default Event;
