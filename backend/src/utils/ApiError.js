class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
  static badRequest(message = 'Solicitud inválida') { return new ApiError(400, message); }
  static unauthorized(message = 'No autenticado') { return new ApiError(401, message); }
  static forbidden(message = 'Sin permisos para esta acción') { return new ApiError(403, message); }
  static notFound(message = 'Recurso no encontrado') { return new ApiError(404, message); }
  static conflict(message = 'Conflicto con el estado actual del recurso') { return new ApiError(409, message); }
  static internal(message = 'Error interno del servidor') { return new ApiError(500, message); }
}
export default ApiError;
