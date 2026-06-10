import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Comment = sequelize.define('Comment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  content: { type: DataTypes.TEXT, allowNull: false }
}, {
  tableName: 'comments',
  timestamps: true
});

export default Comment;
