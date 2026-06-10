import ApiError from '../utils/ApiError.js';

const validate = (schema) => (req, _res, next) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.body[field];

    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`El campo '${field}' es requerido`);
      continue;
    }
    if (value === undefined || value === null) continue;

    if (rules.type === 'string' && typeof value !== 'string')
      errors.push(`El campo '${field}' debe ser texto`);
    if (rules.type === 'number' && typeof value !== 'number')
      errors.push(`El campo '${field}' debe ser un número`);
    if (rules.minLength && typeof value === 'string' && value.trim().length < rules.minLength)
      errors.push(`El campo '${field}' debe tener al menos ${rules.minLength} caracteres`);
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength)
      errors.push(`El campo '${field}' no puede superar ${rules.maxLength} caracteres`);
    if (rules.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      errors.push(`El campo '${field}' debe ser un email válido`);
    if (rules.isEnum && !rules.isEnum.includes(value))
      errors.push(`El campo '${field}' debe ser uno de: ${rules.isEnum.join(', ')}`);
    if (rules.min !== undefined && typeof value === 'number' && value < rules.min)
      errors.push(`El campo '${field}' debe ser mayor o igual a ${rules.min}`);
  }

  if (errors.length > 0) return next(ApiError.badRequest(errors.join(' | ')));
  next();
};

export const schemas = {
  login: {
    email:    { required: true, type: 'string', isEmail: true },
    password: { required: true, type: 'string', minLength: 6 },
  },
  register: {
    name:     { required: true,  type: 'string', minLength: 2, maxLength: 100 },
    email:    { required: true,  type: 'string', isEmail: true },
    password: { required: true,  type: 'string', minLength: 6 },
  },
  createOrganizer: {
    name:     { required: true, type: 'string', minLength: 2, maxLength: 100 },
    email:    { required: true, type: 'string', isEmail: true },
    password: { required: true, type: 'string', minLength: 8 },
  },
  createStaff: {
    name:     { required: true, type: 'string', minLength: 2, maxLength: 100 },
    email:    { required: true, type: 'string', isEmail: true },
    password: { required: true, type: 'string', minLength: 6 },
  },
  createEvent: {
    title:     { required: true, type: 'string', minLength: 3, maxLength: 200 },
    location:  { required: true, type: 'string', minLength: 3 },
    startDate: { required: true, type: 'string' },
    endDate:   { required: true, type: 'string' },
    capacity:  { required: true, type: 'number', min: 1 },
    category:  { required: false, type: 'string' },
  },
  changeEventStatus: {
    status: { required: true, type: 'string', isEnum: ['draft', 'published', 'cancelled', 'finished'] },
  },
  scanQR: {
    token: { required: true, type: 'string', minLength: 1 },
    eventId: { required: false, type: 'string' },
  },
};

export default validate;
