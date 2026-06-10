import { User } from '../models/index.js';
import ApiError from '../utils/ApiError.js';

class UserService {
  async createUser({ name, email, password, role, createdById = null }) {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw ApiError.conflict('Ya existe un usuario con ese email');
    return User.create({ name, email, password, role, createdById });
  }
  async getUsersByRole(role) { return User.findAll({ where: { role } }); }
  async getAllUsers() { return User.findAll(); }
  async toggleStatus(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw ApiError.notFound('Usuario no encontrado');
    user.isActive = !user.isActive;
    await user.save();
    return user;
  }
}
export default UserService;
