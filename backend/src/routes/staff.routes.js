import { Router } from 'express';
import StaffController from '../controllers/StaffController.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import validate, { schemas } from '../middlewares/validate.middleware.js';

const router = Router();
const controller = new StaffController();

router.use(authMiddleware, roleMiddleware('staff', 'organizer', 'admin'));

router.post('/scan', validate(schemas.scanQR), (req, res, next) => controller.scanQR(req, res, next));
router.get('/events/:eventId/checkins', (req, res, next) => controller.listCheckIns(req, res, next));

export default router;
