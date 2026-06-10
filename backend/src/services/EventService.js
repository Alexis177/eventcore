import { Event, Registration, QRCode, User, Comment } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import QRService from './QRService.js';

class EventService {
  constructor() { this.qrService = new QRService(); }

  async getPublishedEvents(page = 1, limit = 9) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Event.findAndCountAll({
      where: { status: 'published' },
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'email'] },
        { model: Registration, as: 'registrations', attributes: ['id'] }
      ],
      order: [['startDate', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const events = rows.map(e => {
      const data = e.toJSON();
      data.registeredCount = data.registrations ? data.registrations.length : 0;
      delete data.registrations;
      return data;
    });

    return {
      data: events,
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit)
    };
  }

  getOrganizerEvents(organizerId) {
    return Event.findAll({
      where: { organizerId },
      include: [{ model: User, as: 'organizer', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
  }

  getAllEvents() {
    return Event.findAll({
      include: [{ model: User, as: 'organizer', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
  }

  async getEventById(eventId) {
    const event = await Event.findByPk(eventId, {
      include: [{ model: User, as: 'organizer', attributes: ['id', 'name', 'email'] }],
    });
    if (!event) throw ApiError.notFound('Evento no encontrado');
    return event;
  }

  // Lista de todos los registrados a un evento con su QR y estado de check-in
  getEventRegistrations(eventId) {
    return Registration.findAll({
      where: { eventId },
      include: [
        { model: User, as: 'attendee', attributes: ['id', 'name', 'email'] },
        {
          model: QRCode, as: 'qrCode',
          attributes: ['id', 'token', 'isUsed'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });
  }

  // ── Validación de fechas ──────────────────────────────────────────────────
  #validateDates(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (isNaN(start.getTime())) {
      throw ApiError.badRequest('La fecha de inicio no es válida');
    }
    if (isNaN(end.getTime())) {
      throw ApiError.badRequest('La fecha de fin no es válida');
    }
    if (end <= start) {
      throw ApiError.badRequest('La fecha de fin debe ser posterior a la fecha de inicio');
    }
    if (start < now) {
      throw ApiError.badRequest('La fecha de inicio no puede ser en el pasado');
    }
  }

  async createEvent(data) {
    this.#validateDates(data.startDate, data.endDate);
    await this._checkLocationAvailability(data.location, data.startDate, data.endDate);
    return Event.create(data);
  }

  async updateEvent(eventId, data, requestingUser) {
    const event = await this.getEventById(eventId);
    this.#checkOwnership(event, requestingUser);

    // Solo validar fechas si alguna cambia
    const newStart = data.startDate ?? event.startDate;
    const newEnd = data.endDate ?? event.endDate;
    this.#validateDates(newStart, newEnd);

    // Validar disponibilidad del recinto
    const newLocation = data.location ?? event.location;
    await this._checkLocationAvailability(newLocation, newStart, newEnd, eventId);

    await event.update(data);
    return event;
  }

  async changeStatus(eventId, status, requestingUser) {
    const event = await this.getEventById(eventId);
    this.#checkOwnership(event, requestingUser);
    event.status = status;
    await event.save();
    return event;
  }

  async registerAttendee(eventId, attendeeId) {
    const event = await this.getEventById(eventId);
    if (event.status !== 'published') throw ApiError.badRequest('El evento no está disponible para registro');
    
    // Buscamos si existe algún registro previo del usuario para este evento
    const existing = await Registration.findOne({ where: { attendeeId, eventId } });
    
    if (existing) {
      // SI EL REGISTRO EXISTE PERO ESTABA CANCELADO, PERMITIMOS RE-INSCRIPCIÓN
      if (existing.status === 'cancelled') {
        const count = await Registration.count({ where: { eventId, status: 'confirmed' } });
        if (count >= event.capacity) throw ApiError.conflict('El evento ha alcanzado su capacidad máxima');
        
        // Reactivamos el registro cambiando el estado a confirmado
        existing.status = 'confirmed';
        await existing.save();
        
        // Buscamos su código QR previo para reactivarlo y marcarlo como no usado
        const qrCode = await QRCode.findOne({ where: { registrationId: existing.id } });
        if (qrCode) {
          qrCode.isUsed = false;
          await qrCode.save();
        }
        
        return { registration: existing, qrCode };
      } else {
        // Si el registro existe y está activo (confirmed o pending), lanzamos el conflicto
        throw ApiError.conflict('Ya estás registrado de forma activa en este evento');
      }
    }

    // Flujo normal para un registro completamente nuevo
    const count = await Registration.count({ where: { eventId, status: 'confirmed' } });
    if (count >= event.capacity) throw ApiError.conflict('El evento ha alcanzado su capacidad máxima');
    
    const registration = await Registration.create({ attendeeId, eventId, status: 'confirmed' });
    const qrCode = await this.qrService.generateForRegistration(registration.id);
    return { registration, qrCode };
  }


  #checkOwnership(event, user) {
    if (user.role !== 'admin' && event.organizerId !== user.id)
      throw ApiError.forbidden('No tienes permiso para modificar este evento');
  }

  // --- 1. PREVENCIÓN DE EMPALMES DE RECINTOS ---
  async _checkLocationAvailability(location, startDate, endDate, excludeEventId = null) {
    const { Event } = await import('../models/index.js');
    const { Op } = await import('sequelize');

    const overlapping = await Event.findOne({
      where: {
        location: { [Op.iLike]: location }, // Case insensitive
        status: { [Op.notIn]: ['cancelled'] }, // Cancelados no ocupan lugar
        ...(excludeEventId && { id: { [Op.ne]: excludeEventId } }),
        [Op.and]: [
          { startDate: { [Op.lt]: endDate } },
          { endDate: { [Op.gt]: startDate } }
        ]
      }
    });

    if (overlapping) throw ApiError.conflict(`El recinto "${location}" ya está reservado para el evento "${overlapping.title}" en ese horario.`);
  }

  // --- 2. GENERACIÓN DEL REPORTE GERENCIAL (STATS) ---
  async getEventStats(eventId) {
    const { Registration, CheckIn } = await import('../models/index.js');
    const event = await this.getEventById(eventId);
    
    // Contamos solo los que no cancelaron
    const totalRegistrations = await Registration.count({ where: { eventId, status: ['confirmed', 'absent'] } });
    const checkIns = await CheckIn.count({ where: { eventId } });
    const absents = await Registration.count({ where: { eventId, status: 'absent' } });
    
    const attendanceRate = totalRegistrations > 0 ? Math.round((checkIns / totalRegistrations) * 100) : 0;
    const fillRate = Math.round((totalRegistrations / event.capacity) * 100);

    return { capacity: event.capacity, totalRegistrations, checkIns, absents, attendanceRate, fillRate };
  }

  // --- NUEVAS FUNCIONES PARA RESUMEN Y COMENTARIOS ---
  async updateSummary(eventId, summary, userId, role) {
    const event = await this.getEventById(eventId);
    if (role === 'organizer' && event.organizerId !== userId) {
      throw ApiError.forbidden('No tienes permiso para editar este evento');
    }
    if (event.status !== 'finished') {
      throw ApiError.badRequest('El evento debe estar finalizado para agregar un resumen');
    }
    event.summary = summary;
    await event.save();
    return event;
  }

  async addComment(eventId, userId, content) {
    const event = await this.getEventById(eventId);
    if (event.status !== 'finished') {
      throw ApiError.badRequest('El evento debe estar finalizado para comentar');
    }
    // Validamos que el usuario haya estado registrado en el evento
    const reg = await Registration.findOne({ where: { eventId, attendeeId: userId } });
    if (!reg) throw ApiError.forbidden('Debes haber estado registrado para comentar');

    return await Comment.create({ eventId, userId, content });
  }

  async getComments(eventId) {
    return await Comment.findAll({
      where: { eventId },
      include: [{ model: User, as: 'user', attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
  }
}

export default EventService;
