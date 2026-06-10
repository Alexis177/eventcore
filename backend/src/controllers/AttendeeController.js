import AttendeeService from '../services/AttendeeService.js';
import ApiResponse from '../utils/ApiResponse.js';

class AttendeeController {
  constructor() {
    this.attendeeService = new AttendeeService();
  }

  async getMyRegistrations(req, res, next) {
    try {
      const registrations = await this.attendeeService.getMyRegistrations(req.user.id);
      return ApiResponse.success(res, registrations);
    } catch (error) {
      next(error);
    }
  }

  async getMyQR(req, res, next) {
    try {
      const registration = await this.attendeeService.getMyQR(
        req.params.registrationId,
        req.user.id
      );
      return ApiResponse.success(res, registration);
    } catch (error) {
      next(error);
    }
  }

  async cancelRegistration(req, res, next) {
    try {
      const registration = await this.attendeeService.cancelRegistration(
        req.params.registrationId,
        req.user.id
      );
      return ApiResponse.success(res, registration, 'Registro cancelado exitosamente');
    } catch (error) {
      next(error);
    }
  }
}

export default AttendeeController;
