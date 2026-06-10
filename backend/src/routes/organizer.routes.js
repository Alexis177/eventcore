import { Router } from 'express';
import OrganizerController from '../controllers/OrganizerController.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import validate, { schemas } from '../middlewares/validate.middleware.js';

const router = Router();
const controller = new OrganizerController();

router.use(authMiddleware, roleMiddleware('organizer', 'admin'));

// Staff
router.post('/staff', validate(schemas.createStaff), (req, res, next) => controller.createStaff(req, res, next));
router.get('/staff', (req, res, next) => controller.listStaff(req, res, next));
router.patch('/staff/:id/status', (req, res, next) => controller.toggleStaffStatus(req, res, next));

export default router;
