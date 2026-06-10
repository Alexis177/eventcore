import EventService from '../services/EventService.js';
import ApiResponse from '../utils/ApiResponse.js';

class EventController {
  constructor() { this.eventService = new EventService(); }

  async listPublished(req, res, next) {
    try { 
      // Lee los parámetros de la URL (?page=1&limit=9)
      const { page, limit } = req.query;
      const result = await this.eventService.getPublishedEvents(page, limit);
      return ApiResponse.success(res, result); 
    } catch (error) { next(error); }
  }

  async listMyEvents(req, res, next) {
    try {
      const events = req.user.role === 'admin'
        ? await this.eventService.getAllEvents()
        : await this.eventService.getOrganizerEvents(req.user.id);
      return ApiResponse.success(res, events);
    } catch (error) { next(error); }
  }

  async listAll(req, res, next) {
    try { return ApiResponse.success(res, await this.eventService.getAllEvents()); }
    catch (error) { next(error); }
  }

  async listRegistrations(req, res, next) {
    try { return ApiResponse.success(res, await this.eventService.getEventRegistrations(req.params.id)); }
    catch (error) { next(error); }
  }

  async getById(req, res, next) {
    try { return ApiResponse.success(res, await this.eventService.getEventById(req.params.id)); }
    catch (error) { next(error); }
  }

  async create(req, res, next) {
    try {
      const { title, description, location, startDate, endDate, capacity, status, category } = req.body;
      const eventData = {
        title,
        description,
        location,
        startDate,
        endDate,
        capacity,
        status,
        category,
        organizerId: req.user.id
      };
      const event = await this.eventService.createEvent(eventData);
      return ApiResponse.created(res, event, 'Evento creado exitosamente');
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const { title, description, location, startDate, endDate, capacity, status, category, summary } = req.body;
      const updateData = {
        title,
        description,
        location,
        startDate,
        endDate,
        capacity,
        status,
        category,
        summary
      };
      const updatedEvent = await this.eventService.updateEvent(req.params.id, updateData, req.user);
      return ApiResponse.success(res, updatedEvent, 'Evento actualizado');
    } catch (error) { next(error); }
  }

  async changeStatus(req, res, next) {
    try { return ApiResponse.success(res, await this.eventService.changeStatus(req.params.id, req.body.status, req.user), 'Estado actualizado'); }
    catch (error) { next(error); }
  }

  async register(req, res, next) {
    try {
      const result = await this.eventService.registerAttendee(req.params.id, req.user.id);
      return ApiResponse.created(res, result, 'Registro exitoso. Tu QR ha sido generado.');
    } catch (error) { next(error); }
  }

  async updateSummary(req, res, next) {
    try {
      const result = await this.eventService.updateSummary(req.params.id, req.body.summary, req.user.id, req.user.role);
      return ApiResponse.success(res, result);
    } catch (e) { next(e); }
  }

  async addComment(req, res, next) {
    try {
      const result = await this.eventService.addComment(req.params.id, req.user.id, req.body.content);
      return ApiResponse.created(res, result, 'Comentario agregado exitosamente');
    } catch (e) { next(e); }
  }

  async getComments(req, res, next) {
    try {
      const result = await this.eventService.getComments(req.params.id);
      return ApiResponse.success(res, result);
    } catch (e) { next(e); }
  }

  async getStats(req, res, next) {
    try {
      const result = await this.eventService.getEventStats(req.params.id);
      return ApiResponse.success(res, result);
    } catch (e) { next(e); }
  }
}

export default EventController;
