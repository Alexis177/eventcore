import { Registration, Event, QRCode, User } from '../models/index.js';
import ApiError from '../utils/ApiError.js';

class AttendeeService {
  async getMyRegistrations(attendeeId) {
    return Registration.findAll({
      where: { attendeeId },
      include: [
        {
          model: Event,
          as: 'event',
          include: [{ model: User, as: 'organizer', attributes: ['id', 'name', 'email'] }],
        },
        {
          model: QRCode,
          as: 'qrCode',
          attributes: ['id', 'token', 'qrImageUrl', 'isUsed'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async getMyQR(registrationId, attendeeId) {
    const registration = await Registration.findOne({
      where: { id: registrationId, attendeeId },
      include: [
        { model: Event, as: 'event', attributes: ['id', 'title', 'startDate', 'location'] },
        { model: QRCode, as: 'qrCode' },
      ],
    });

    if (!registration) {
      throw ApiError.notFound('Registro no encontrado o no te pertenece');
    }

    if (!registration.qrCode) {
      throw ApiError.notFound('QR no generado para este registro');
    }

    return registration;
  }

  async cancelRegistration(registrationId, attendeeId) {
    const registration = await Registration.findOne({
      where: { id: registrationId, attendeeId },
      include: [{ model: Event, as: 'event' }],
    });

    if (!registration) {
      throw ApiError.notFound('Registro no encontrado o no te pertenece');
    }

    if (registration.status === 'cancelled') {
      throw ApiError.conflict('Este registro ya fue cancelado');
    }

    if (new Date() >= new Date(registration.event.startDate)) {
      throw ApiError.badRequest('No puedes cancelar un registro de un evento que ya inició');
    }

    registration.status = 'cancelled';
    await registration.save();

    return registration;
  }
}

export default AttendeeService;
