import jwtUtil from '../utils/jwt.js';
import ApiError from '../utils/ApiError.js';
import { User } from '../models/index.js';

const authMiddleware = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next(ApiError.unauthorized('Token no proporcionado'));
    
    const token = authHeader.split(' ')[1];
    const decoded = jwtUtil.verify(token);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.isActive) return next(ApiError.unauthorized('Usuario no encontrado o inactivo'));
    
    req.user = user;
    next();
  } catch {
    next(ApiError.unauthorized('Token inválido o expirado'));
  }
};
export default authMiddleware;
