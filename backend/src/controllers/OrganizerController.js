import OrganizerService from '../services/OrganizerService.js';
import ApiResponse from '../utils/ApiResponse.js';

class OrganizerController {
  constructor() { this.organizerService = new OrganizerService(); }

  async createStaff(req, res, next) {
    try {
      const staff = await this.organizerService.createStaff(req.body, req.user.id);
      return ApiResponse.created(res, staff, 'Staff creado exitosamente');
    } catch (error) { next(error); }
  }

  async listStaff(req, res, next) {
    try {
      const staff = await this.organizerService.listStaff(req.user);
      return ApiResponse.success(res, staff);
    } catch (error) { next(error); }
  }

  async toggleStaffStatus(req, res, next) {
    try {
      const staff = await this.organizerService.toggleStatus(req.params.id, req.user);
      return ApiResponse.success(res, staff, 'Estado actualizado');
    } catch (error) { next(error); }
  }
}

export default OrganizerController;
