import jwt from 'jsonwebtoken';
import env from '../config/env.js';

class JwtUtil {
  sign(payload) { return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn }); }
  verify(token) { return jwt.verify(token, env.jwt.secret); }
}
export default new JwtUtil();
