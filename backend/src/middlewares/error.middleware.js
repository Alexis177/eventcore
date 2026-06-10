import ApiError from '../utils/ApiError.js';

const errorMiddleware = (err, _req, res, _next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }
  console.error('💥 Error inesperado:', err);
  return res.status(500).json({ success: false, message: 'Error interno del servidor' });
};
export default errorMiddleware;
