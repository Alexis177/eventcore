import { Router } from 'express';
import EventController from '../controllers/EventController.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import validate, { schemas } from '../middlewares/validate.middleware.js';

const router = Router();
const controller = new EventController();

// Públicas
router.get('/', (req, res, next) => controller.listPublished(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));

// Asistente
router.post('/:id/register', authMiddleware, roleMiddleware('attendee'),
  (req, res, next) => controller.register(req, res, next));

// Organizador/Admin — lista de registrados al evento
router.get('/:id/registrations', authMiddleware, roleMiddleware('organizer', 'admin', 'staff'),
  (req, res, next) => controller.listRegistrations(req, res, next));

// Organizador — sus eventos
router.get('/organizer/my-events', authMiddleware, roleMiddleware('organizer', 'admin'),
  (req, res, next) => controller.listMyEvents(req, res, next));

// Admin — todos
router.get('/admin/all', authMiddleware, roleMiddleware('admin'),
  (req, res, next) => controller.listAll(req, res, next));

// CRUD
router.post('/', authMiddleware, roleMiddleware('organizer', 'admin'),
  validate(schemas.createEvent), (req, res, next) => controller.create(req, res, next));
router.put('/:id', authMiddleware, roleMiddleware('organizer', 'admin'),
  validate(schemas.createEvent), (req, res, next) => controller.update(req, res, next));
router.patch('/:id/status', authMiddleware, roleMiddleware('organizer', 'admin'),
  validate(schemas.changeEventStatus), (req, res, next) => controller.changeStatus(req, res, next));

// El organizador/admin actualiza el resumen
router.put('/:id/summary', authMiddleware, roleMiddleware('admin', 'organizer'),
  (req, res, next) => controller.updateSummary(req, res, next));

// Obtener comentarios (público para usuarios autenticados)
router.get('/:id/comments', authMiddleware,
  (req, res, next) => controller.getComments(req, res, next));

// Asistentes agregan comentarios
router.post('/:id/comments', authMiddleware, roleMiddleware('attendee'),
  (req, res, next) => controller.addComment(req, res, next));

// Obtener estadísticas del evento (organizador/admin)
router.get('/:id/stats', authMiddleware, roleMiddleware('organizer', 'admin'),
  (req, res, next) => controller.getStats(req, res, next));

export default router;
