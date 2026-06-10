import cron from 'node-cron';
import { Op } from 'sequelize';
import { Event, Registration, CheckIn, QRCode } from '../models/index.js';

export const initCronJobs = () => {
  // Se ejecuta todos los días a la medianoche
  cron.schedule('0 0 * * *', async () => {
    try {
      const now = new Date();
      const eventsToFinish = await Event.findAll({
        where: { status: 'published', endDate: { [Op.lt]: now } }
      });

      for (const event of eventsToFinish) {
        // Buscar registros confirmados de este evento
        const regs = await Registration.findAll({ where: { eventId: event.id, status: 'confirmed' } });
        
        // Obtener todos los CheckIns de este evento junto con la registrationId de su QRCode
        const checkIns = await CheckIn.findAll({
          where: { eventId: event.id },
          include: [{
            model: QRCode,
            as: 'qrCode',
            attributes: ['registrationId']
          }]
        });

        // Crear un set de registrationIds que sí hicieron check-in
        const checkedInRegistrationIds = new Set(
          checkIns
            .filter(c => c.qrCode)
            .map(c => c.qrCode.registrationId)
        );

        for (const reg of regs) {
          // Si no tiene CheckIn, es un "No-Show" (Ausente)
          if (!checkedInRegistrationIds.has(reg.id)) {
            await reg.update({ status: 'absent' });
          }
        }
        // Cerrar el evento
        await event.update({ status: 'finished' });
      }
      if(eventsToFinish.length > 0) {
        console.log(`[CRON] ${eventsToFinish.length} eventos finalizados y ausencias calculadas.`);
      }
    } catch (error) {
      console.error('[CRON] Error:', error);
    }
  });
};
