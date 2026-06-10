import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';

class User extends Model {
  async verifyPassword(plainPassword) { return bcrypt.compare(plainPassword, this.password); }
  toJSON() { const values = { ...this.get() }; delete values.password; return values; }
}

User.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'organizer', 'attendee', 'staff'), allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  createdById: { type: DataTypes.UUID, allowNull: true },
  preferences: { type: DataTypes.JSONB, defaultValue: { categories: [] }, allowNull: true },
  availability: { type: DataTypes.JSONB, defaultValue: { weekdays: false, weekends: false, mornings: false, afternoons: false }, allowNull: true },
}, {
  sequelize, modelName: 'User', tableName: 'users', timestamps: true,
  hooks: {
    beforeCreate: async (user) => { user.password = await bcrypt.hash(user.password, 12); },
    beforeUpdate: async (user) => { if (user.changed('password')) user.password = await bcrypt.hash(user.password, 12); },
  },
});
export default User;
