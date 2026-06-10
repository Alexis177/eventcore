import { User } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import jwtUtil from '../utils/jwt.js';

class AuthService {
  async login(email, password) {
    if (!email || !password) throw ApiError.badRequest('Email y contraseña son requeridos');
    const user = await User.findOne({ where: { email } });
    if (!user || !user.isActive) throw ApiError.unauthorized('Credenciales inválidas');
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) throw ApiError.unauthorized('Credenciales inválidas');
    const token = jwtUtil.sign({ id: user.id, role: user.role });
    return { token, user };
  }

  async register(name, email, password) {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw ApiError.conflict('Ya existe una cuenta con ese email');

    const user = await User.create({ name, email, password, role: 'attendee' });
    const token = jwtUtil.sign({ id: user.id, role: user.role });
    return { token, user };
  }
}

export default AuthService;
