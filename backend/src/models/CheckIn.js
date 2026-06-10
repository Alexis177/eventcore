import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

class CheckIn extends Model {}

CheckIn.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  qrCodeId: { type: DataTypes.UUID, allowNull: false },
  scannedById: { type: DataTypes.UUID, allowNull: false },
  eventId: { type: DataTypes.UUID, allowNull: false },
  scannedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { sequelize, modelName: 'CheckIn', tableName: 'check_ins', timestamps: false });
export default CheckIn;
