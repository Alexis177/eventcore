import { QRCode, CheckIn, Registration, User } from '../models/index.js';
import ApiError from '../utils/ApiError.js';

class CheckInService {
  async processQRScan(token, staffId, expectedEventId) {
    if (!token) throw ApiError.badRequest('Token QR requerido');
    
    const qrCode = await QRCode.findOne({
      where: { token },
      include: [{ 
        model: Registration, 
        as: 'registration', 
        include: [{ model: User, as: 'attendee', attributes: ['id', 'name', 'email'] }] 
      }],
    });

    if (!qrCode) throw ApiError.notFound('QR inválido o no encontrado');
    if (qrCode.isUsed) throw ApiError.conflict('Este QR ya fue utilizado en la puerta');

    // 🛑 NUEVA VALIDACIÓN DE SEGURIDAD:
    if (qrCode.registration.status === 'cancelled') {
      throw ApiError.forbidden('ACCESO DENEGADO: Este registro fue cancelado por el usuario.');
    }

    // 🛑 VALIDACIÓN DE EVENTO CORRECTO:
    if (expectedEventId && qrCode.registration.eventId !== expectedEventId) {
      throw ApiError.conflict('ACCESO DENEGADO: Este boleto pertenece a otro evento.');
    }

    const eventId = qrCode.registration.eventId;
    const checkIn = await CheckIn.create({ qrCodeId: qrCode.id, scannedById: staffId, eventId });
    
    qrCode.isUsed = true;
    await qrCode.save();

    return { checkIn, attendee: qrCode.registration.attendee, eventId };
  }



  async getEventCheckIns(eventId) {
    return CheckIn.findAll({
      where: { eventId },
      include: [
        { model: User, as: 'scannedBy', attributes: ['id', 'name'] },
        { model: QRCode, as: 'qrCode', include: [{ model: Registration, as: 'registration', include: [{ model: User, as: 'attendee', attributes: ['id', 'name', 'email'] }] }] },
      ],
      order: [['scannedAt', 'DESC']],
    });
  }
}
export default CheckInService;
