class ApiResponse {
  constructor(statusCode, data, message = 'OK') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
  static success(res, data = null, message = 'OK', statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
  }
  static created(res, data = null, message = 'Recurso creado exitosamente') {
    return res.status(201).json(new ApiResponse(201, data, message));
  }
}
export default ApiResponse;
