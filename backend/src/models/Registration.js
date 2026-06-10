import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

class Registration extends Model {}

Registration.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  attendeeId: { type: DataTypes.UUID, allowNull: false },
  eventId: { type: DataTypes.UUID, allowNull: false },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'confirmed',
    validate: {
      isIn: [['confirmed', 'pending', 'cancelled', 'absent']] // Agregamos 'absent'
    }
  },
}, {
  sequelize, modelName: 'Registration', tableName: 'registrations', timestamps: true,
  indexes: [{ unique: true, fields: ['attendeeId', 'eventId'] }],
});
export default Registration;
