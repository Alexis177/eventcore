import { User } from '../models/index.js';
import ApiError from '../utils/ApiError.js';

class OrganizerService {
  async createStaff({ name, email, password }, createdById) {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw ApiError.conflict('Ya existe un usuario con ese email');
    return User.create({ name, email, password, role: 'staff', createdById });
  }

  async listStaff(requestingUser) {
    // Admin ve todo el staff; organizador solo el que él creó
    if (requestingUser.role === 'admin') {
      return User.findAll({ where: { role: 'staff' } });
    }
    return User.findAll({ where: { role: 'staff', createdById: requestingUser.id } });
  }

  async toggleStatus(staffId, requestingUser) {
    const staff = await User.findByPk(staffId);
    if (!staff || staff.role !== 'staff') throw ApiError.notFound('Staff no encontrado');

    // Organizador solo puede modificar su propio staff
    if (requestingUser.role !== 'admin' && staff.createdById !== requestingUser.id) {
      throw ApiError.forbidden('No puedes modificar este staff');
    }

    staff.isActive = !staff.isActive;
    await staff.save();
    return staff;
  }
}

export default OrganizerService;
