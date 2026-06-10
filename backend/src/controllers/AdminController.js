import UserService from '../services/UserService.js';
import ApiResponse from '../utils/ApiResponse.js';

class AdminController {
  constructor() { this.userService = new UserService(); }
  async createOrganizer(req, res, next) {
    try {
      const organizer = await this.userService.createUser({ ...req.body, role: 'organizer', createdById: req.user.id });
      return ApiResponse.created(res, organizer, 'Organizador creado exitosamente');
    } catch (error) { next(error); }
  }
  async listOrganizers(req, res, next) {
    try { return ApiResponse.success(res, await this.userService.getUsersByRole('organizer')); } 
    catch (error) { next(error); }
  }
  async toggleOrganizerStatus(req, res, next) {
    try { return ApiResponse.success(res, await this.userService.toggleStatus(req.params.id), 'Estado actualizado'); } 
    catch (error) { next(error); }
  }
  async listUsers(req, res, next) {
    try { return ApiResponse.success(res, await this.userService.getAllUsers()); } 
    catch (error) { next(error); }
  }
}
export default AdminController;
