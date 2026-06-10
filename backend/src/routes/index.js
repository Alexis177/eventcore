import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import eventRoutes from './event.routes.js';
import staffRoutes from './staff.routes.js';
import attendeeRoutes from './attendee.routes.js';
import organizerRoutes from './organizer.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/events', eventRoutes);
router.use('/staff', staffRoutes);
router.use('/attendee', attendeeRoutes);
router.use('/organizer', organizerRoutes);

export default router;
