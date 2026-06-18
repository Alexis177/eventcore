import cron from 'node-cron';
import { Op } from 'sequelize';
import { Event, Registration, CheckIn, QRCode } from '../models/index.js';

export const initCronJobs = () => {
  // ⏱️ Se ejecuta todos los días a las 00:00 hrs de la Ciudad de México
  cron.schedule('0 0 * * *', async () => {
    console.log(`\n🔄 [${new Date().toLocaleTimeString()}] CRON: Iniciando revisión automática diaria de eventos...`);

    try {
      const ahora = new Date();

      // 1. Buscar eventos que ya pasaron de su fecha de finalización y siguen "Publicados"
      const eventosExpirados = await Event.findAll({
        where: {
          endDate: { [Op.lt]: ahora },
          status: 'published'
        }
      });

      if (eventosExpirados.length === 0) {
        console.log('✅ [CRON] Ningún evento expirado el día de hoy.');
        return;
      }

      console.log(`⚠️ [CRON] Se encontraron ${eventosExpirados.length} evento(s) expirado(s). Procesando...`);

      // 2. Procesar cada evento encontrado
      for (const evento of eventosExpirados) {
        // Buscar registros confirmados de este evento
        const regs = await Registration.findAll({ 
          where: { 
            eventId: evento.id, 
            status: 'confirmed' 
          } 
        });
        
        // Obtener todos los CheckIns de este evento junto con la registrationId de su QRCode
        const checkIns = await CheckIn.findAll({
          where: { eventId: evento.id },
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

        let actualizados = 0;
        for (const reg of regs) {
          // Si no tiene CheckIn, es un "No-Show" (Ausente)
          if (!checkedInRegistrationIds.has(reg.id)) {
            await reg.update({ status: 'absent' });
            actualizados++;
          }
        }

        // Pasamos el evento a "Finalizado"
        await evento.update({ status: 'finished' });

        console.log(`✅ [CRON] Evento "${evento.title}" cerrado. ${actualizados} alumno(s) marcados como ausentes.`);
      }

    } catch (error) {
      console.error('❌ [CRON ERROR] Falló la tarea programada:', error);
    }
  }, {
    scheduled: true,
    timezone: "America/Mexico_City"
  });
};
