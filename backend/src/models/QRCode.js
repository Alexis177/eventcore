import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

class QRCode extends Model {}

QRCode.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  registrationId: { type: DataTypes.UUID, allowNull: false, unique: true },
  token: { type: DataTypes.STRING, allowNull: false, unique: true },
  qrImageUrl: { type: DataTypes.TEXT, allowNull: true },
  isUsed: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { sequelize, modelName: 'QRCode', tableName: 'qr_codes', timestamps: true });
export default QRCode;
