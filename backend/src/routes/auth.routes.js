import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate, { schemas } from '../middlewares/validate.middleware.js';

const router = Router();
const controller = new AuthController();

router.post('/login', validate(schemas.login), (req, res, next) => controller.login(req, res, next));
router.post('/register', validate(schemas.register), (req, res, next) => controller.register(req, res, next));
router.get('/me', authMiddleware, (req, res, next) => controller.me(req, res, next));
router.put('/preferences', authMiddleware, (req, res, next) => controller.updatePreferences(req, res, next));

export default router;
