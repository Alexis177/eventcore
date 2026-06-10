import CheckInService from '../services/CheckInService.js';
import ApiResponse from '../utils/ApiResponse.js';

class StaffController {
  constructor() { this.checkInService = new CheckInService(); }
  async scanQR(req, res, next) {
    try { return ApiResponse.success(res, await this.checkInService.processQRScan(req.body.token, req.user.id, req.body.eventId), 'Check-in exitoso'); } 
    catch (error) { next(error); }
  }
  async listCheckIns(req, res, next) {
    try { return ApiResponse.success(res, await this.checkInService.getEventCheckIns(req.params.eventId)); } 
    catch (error) { next(error); }
  }
}
export default StaffController;
