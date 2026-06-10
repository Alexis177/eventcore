import { Router } from 'express';
import AdminController from '../controllers/AdminController.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import validate, { schemas } from '../middlewares/validate.middleware.js';

const router = Router();
const controller = new AdminController();

router.use(authMiddleware, roleMiddleware('admin'));

router.post('/organizers', validate(schemas.createOrganizer), (req, res, next) => controller.createOrganizer(req, res, next));
router.get('/organizers', (req, res, next) => controller.listOrganizers(req, res, next));
router.patch('/organizers/:id/status', (req, res, next) => controller.toggleOrganizerStatus(req, res, next));
router.get('/users', (req, res, next) => controller.listUsers(req, res, next));

export default router;
