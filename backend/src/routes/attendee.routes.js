import { Router } from 'express';
import AttendeeController from '../controllers/AttendeeController.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const router = Router();
const controller = new AttendeeController();

router.use(authMiddleware, roleMiddleware('attendee'));

router.get('/my-registrations', (req, res, next) =>
  controller.getMyRegistrations(req, res, next)
);

router.get('/my-registrations/:registrationId/qr', (req, res, next) =>
  controller.getMyQR(req, res, next)
);

router.patch('/my-registrations/:registrationId/cancel', (req, res, next) =>
  controller.cancelRegistration(req, res, next)
);

export default router;
