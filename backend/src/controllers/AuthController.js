import AuthService from '../services/AuthService.js';
import ApiResponse from '../utils/ApiResponse.js';
import { User } from '../models/index.js';
import ApiError from '../utils/ApiError.js';

class AuthController {
  constructor() { this.authService = new AuthService(); }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      return ApiResponse.success(res, result, 'Login exitoso');
    } catch (error) { next(error); }
  }

  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const result = await this.authService.register(name, email, password);
      return ApiResponse.created(res, result, 'Cuenta creada exitosamente');
    } catch (error) { next(error); }
  }

  async me(req, res, next) {
    try { return ApiResponse.success(res, req.user); }
    catch (error) { next(error); }
  }

  async updatePreferences(req, res, next) {
    try {
      const { preferences } = req.body;
      const user = await User.findByPk(req.user.id);
      if (!user) throw ApiError.notFound('Usuario no encontrado');
      user.preferences = preferences;
      await user.save();
      return ApiResponse.success(res, user);
    } catch (error) { next(error); }
  }
}

export default AuthController;
