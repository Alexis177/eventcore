import ApiError from '../utils/ApiError.js';

const roleMiddleware = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Acción restringida a: ${allowedRoles.join(', ')}`));
    }
    next();
  };
};
export default roleMiddleware;
