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

  async downloadCompleteReportCSV(req, res, next) {
    try {
      const { id: eventId } = req.params;
      const { Event, Registration, User, QRCode, CheckIn, Comment } = await import('../models/index.js');

      const evento = await Event.findByPk(eventId);
      if (!evento) return res.status(404).json({ message: 'Evento no encontrado' });

      const inscripciones = await Registration.findAll({
        where: { eventId },
        include: [
          { model: User, as: 'attendee', attributes: ['name', 'email'] },
          {
            model: QRCode,
            as: 'qrCode',
            include: [{ model: CheckIn, as: 'checkIn' }]
          }
        ]
      });

      const comentarios = await Comment.findAll({
        where: { eventId },
        include: [{ model: User, as: 'user', attributes: ['name'] }]
      });

      const activeRegistrations = inscripciones.filter(insc => ['confirmed', 'absent'].includes(insc.status));
      const totalRegistrados = activeRegistrations.length;
      let asistencias = 0;
      let ausencias = 0;

      activeRegistrations.forEach(insc => {
        const tieneCheckIn = !!(insc.qrCode && insc.qrCode.checkIn);
        if (tieneCheckIn) {
          asistencias++;
        } else {
          ausencias++;
        }
      });

      const tasaAsistencia = totalRegistrados > 0 ? ((asistencias / totalRegistrados) * 100).toFixed(2) : 0;
      const tasaNoShow = totalRegistrados > 0 ? ((ausencias / totalRegistrados) * 100).toFixed(2) : 0;

      let csvContent = '\uFEFF';

      csvContent += '--- RESUMEN EJECUTIVO DEL EVENTO ---\n';
      csvContent += `Nombre del Evento:, "${evento.title}"\n`;
      csvContent += `Categoría:, "${evento.category || 'General'}"\n`;
      csvContent += `Fecha:, "${new Date(evento.startDate).toLocaleString('es-MX')}"\n`;
      csvContent += `Capacidad Máxima:, ${evento.capacity} lugares\n`;
      csvContent += '\n';
      csvContent += '--- MÉTRICAS DE RENDIMIENTO ---\n';
      csvContent += `Total de Registros:, ${totalRegistrados}\n`;
      csvContent += `Asistencias Validadas:, ${asistencias} (${tasaAsistencia}%)\n`;
      csvContent += `Ausencias (No-Show):, ${ausencias} (${tasaNoShow}%)\n`;
      csvContent += '\n\n';

      csvContent += '--- AUDITORÍA NOMINAL DE ACCESOS ---\n';
      csvContent += 'ID Registro,Nombre del Alumno,Correo Institucional,Estado,Fecha de Inscripción,Hora Exacta de Entrada\n';

      inscripciones.forEach(insc => {
        const nombre = insc.attendee?.name || '—';
        const correo = insc.attendee?.email || '—';
        const tieneCheckIn = !!(insc.qrCode && insc.qrCode.checkIn);
        const estado = tieneCheckIn ? 'Asistió' : 'Ausente';
        const fechaReg = new Date(insc.createdAt).toLocaleString('es-MX');
        const horaAcceso = tieneCheckIn ? new Date(insc.qrCode.checkIn.scannedAt).toLocaleTimeString('es-MX') : 'Sin acceso';

        csvContent += `"${insc.id}","${nombre}","${correo}","${estado}","${fechaReg}","${horaAcceso}"\n`;
      });

      csvContent += '\n\n';

      csvContent += '--- COMENTARIOS Y FEEDBACK DE LOS PARTICIPANTES ---\n';
      if (comentarios.length === 0) {
        csvContent += 'No hay comentarios registrados para este evento.\n';
      } else {
        csvContent += 'Autor del Comentario,Comentario,Fecha\n';
        comentarios.forEach(com => {
          const autor = com.user?.name || 'Anónimo';
          const contenidoLimpiado = (com.content || '').replace(/\r?\n|\r/g, ' '); 
          const fechaComentario = new Date(com.createdAt).toLocaleString('es-MX');

          csvContent += `"${autor}","${contenidoLimpiado}","${fechaComentario}"\n`;
        });
      }

      const filename = `Reporte_Inteligente_${evento.title.replace(/\s+/g, '_')}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      return res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  }

  async downloadGlobalEventsReport(req, res, next) {
    try {
      const { Event, Registration, QRCode, CheckIn } = await import('../models/index.js');

      // 1. Filtrar eventos por organizador (o todos si es admin)
      const whereClause = req.user.role === 'admin' ? {} : { organizerId: req.user.id };

      const eventos = await Event.findAll({
        where: whereClause,
        include: [
          {
            model: Registration,
            as: 'registrations',
            attributes: ['status'],
            include: [
              {
                model: QRCode,
                as: 'qrCode',
                attributes: ['id'],
                include: [{ model: CheckIn, as: 'checkIn', attributes: ['id'] }]
              }
            ]
          }
        ],
        order: [['startDate', 'DESC']]
      });

      // 2. Cabeceras con BOM para acentos
      let csvContent = '\uFEFF';
      csvContent += 'Título,Categoría,Estado,Ubicación,Fecha y Hora de Inicio,Fecha y Hora de Fin,Capacidad Máxima,Total Inscritos,Asistencias Reales,Ausencias (No-Show),Tasa de Ocupación,Gráfico de Aforo\n';

      // 3. Procesar eventos y calcular métricas
      eventos.forEach(ev => {
        const titulo = ev.title.replace(/"/g, '""');
        const categoria = (ev.category || 'General').replace(/"/g, '""');
        const estado = ev.status;
        const ubicacion = ev.location.replace(/"/g, '""');
        
        const fechaInicio = new Date(ev.startDate).toLocaleString('es-MX');
        const fechaFin = new Date(ev.endDate).toLocaleString('es-MX');
        const capacidad = ev.capacity;

        const inscripciones = ev.registrations || [];
        const activeRegistrations = inscripciones.filter(r => ['confirmed', 'absent'].includes(r.status));
        const totalInscritos = activeRegistrations.length;
        
        let asistencias = 0;
        let ausencias = 0;

        activeRegistrations.forEach(reg => {
          const tieneCheckIn = !!(reg.qrCode && reg.qrCode.checkIn);
          if (tieneCheckIn) {
            asistencias++;
          } else {
            ausencias++;
          }
        });

        const tasaOcupacion = capacidad > 0 ? (totalInscritos / capacidad) * 100 : 0;
        const barLength = Math.min(10, Math.round(tasaOcupacion / 10));
        const barra = '█'.repeat(barLength) + '░'.repeat(10 - barLength);

        csvContent += `"${titulo}","${categoria}","${estado}","${ubicacion}","${fechaInicio}","${fechaFin}",${capacidad},${totalInscritos},${asistencias},${ausencias},"${tasaOcupacion.toFixed(1)}%","[${barra}]"\n`;
      });

      const fechaReporte = new Date().toISOString().split('T')[0];
      const filename = `Reporte_Operativo_Eventos_${fechaReporte}.csv`;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      return res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  }

  async downloadAnalyticsReportCSV(req, res, next) {
    try {
      const { Event, Registration, QRCode, CheckIn } = await import('../models/index.js');

      // 1. Filtrar eventos por organizador (o todos si es admin)
      const whereClause = req.user.role === 'admin' ? {} : { organizerId: req.user.id };

      const eventos = await Event.findAll({
        where: whereClause,
        include: [
          {
            model: Registration,
            as: 'registrations',
            attributes: ['status'],
            include: [
              {
                model: QRCode,
                as: 'qrCode',
                attributes: ['id'],
                include: [{ model: CheckIn, as: 'checkIn', attributes: ['id'] }]
              }
            ]
          }
        ],
        order: [['startDate', 'DESC']]
      });

      // KPIs Globales
      let totalEventos = eventos.length;
      let totalCapacidad = 0;
      let totalInscritos = 0;
      let totalAsistencias = 0;
      let totalAusencias = 0;
      
      let drafts = 0;
      let published = 0;
      let finished = 0;
      let cancelled = 0;

      // Distribución por categoría
      const categoriasMap = {};
      
      // Distribución por ubicación
      const ubicacionesMap = {};
      
      // Histórico mensual
      const mensualMap = {};

      eventos.forEach(ev => {
        totalCapacidad += ev.capacity;
        
        if (ev.status === 'draft') drafts++;
        else if (ev.status === 'published') published++;
        else if (ev.status === 'finished') finished++;
        else if (ev.status === 'cancelled') cancelled++;

        const activeRegs = (ev.registrations || []).filter(r => ['confirmed', 'absent'].includes(r.status));
        const inscritos = activeRegs.length;
        totalInscritos += inscritos;

        let asistencias = 0;
        let ausencias = 0;
        activeRegs.forEach(reg => {
          const tieneCheckIn = !!(reg.qrCode && reg.qrCode.checkIn);
          if (tieneCheckIn) asistencias++;
          else ausencias++;
        });

        totalAsistencias += asistencias;
        totalAusencias += ausencias;

        const cat = ev.category || 'General';
        if (!categoriasMap[cat]) categoriasMap[cat] = { count: 0, capacity: 0, registrations: 0 };
        categoriasMap[cat].count++;
        categoriasMap[cat].capacity += ev.capacity;
        categoriasMap[cat].registrations += inscritos;

        const loc = ev.location || 'Sin Ubicación';
        if (!ubicacionesMap[loc]) ubicacionesMap[loc] = { count: 0, checkIns: 0 };
        ubicacionesMap[loc].count++;
        ubicacionesMap[loc].checkIns += asistencias;

        const date = new Date(ev.startDate);
        const yyyymm = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        mensualMap[yyyymm] = (mensualMap[yyyymm] || 0) + 1;
      });

      const tasaAsistenciaGeneral = totalInscritos > 0 ? ((totalAsistencias / totalInscritos) * 100).toFixed(2) : 0;
      const tasaExitoEventos = (finished + cancelled) > 0 ? ((finished / (finished + cancelled)) * 100).toFixed(2) : 0;

      let csvContent = '\uFEFF';

      // --- BLOQUE 1: RESUMEN EJECUTIVO ANALÍTICO ---
      csvContent += '--- REPORTE EJECUTIVO ANALÍTICO DE EVENTOS ---\n';
      csvContent += `Fecha de Generación:, "${new Date().toLocaleString('es-MX')}"\n`;
      csvContent += `Total de Eventos Registrados:, ${totalEventos}\n`;
      csvContent += `Aforo Total Planificado:, ${totalCapacidad} lugares\n`;
      csvContent += `Total de Alumnos Inscritos:, ${totalInscritos}\n`;
      csvContent += `Asistencias Totales Validadas:, ${totalAsistencias} (${tasaAsistenciaGeneral}% de asistencia general)\n`;
      csvContent += `Ausencias Totales (No-Show):, ${totalAusencias}\n`;
      csvContent += `Tasa de Cierre Exitoso de Eventos:, ${tasaExitoEventos}% (Finalizados vs Cancelados)\n`;
      csvContent += '\n';

      csvContent += '--- DISTRIBUCIÓN POR ESTADOS ---\n';
      csvContent += `Borradores:, ${drafts}\n`;
      csvContent += `Publicados:, ${published}\n`;
      csvContent += `Finalizados:, ${finished}\n`;
      csvContent += `Cancelados:, ${cancelled}\n`;
      csvContent += '\n';

      // --- BLOQUE 2: DISTRIBUCIÓN POR CATEGORÍAS ---
      csvContent += '--- MÓDULO DE INTERÉS POR CATEGORÍAS ---\n';
      csvContent += 'Categoría,Total Eventos,Aforo Planificado,Total Inscritos,Tasa de Llenado Promedio,Gráfico de Interés\n';
      Object.entries(categoriasMap).forEach(([cat, data]) => {
        const llenado = data.capacity > 0 ? (data.registrations / data.capacity) * 100 : 0;
        const barLength = Math.min(10, Math.round(llenado / 10));
        const barra = '█'.repeat(barLength) + '░'.repeat(10 - barLength);
        csvContent += `"${cat}",${data.count},${data.capacity},${data.registrations},"${llenado.toFixed(1)}%","[${barra}]"\n`;
      });
      csvContent += '\n';

      // --- BLOQUE 3: USO DE UBICACIONES ---
      csvContent += '--- ESTADÍSTICAS DE USO DE RECINTOS ---\n';
      csvContent += 'Recinto,Total Eventos,Check-ins Registrados,Gráfico de Frecuencia\n';
      const sortedLocations = Object.entries(ubicacionesMap).sort((a, b) => b[1].count - a[1].count);
      const maxEventsInLocation = sortedLocations.length > 0 ? sortedLocations[0][1].count : 1;
      sortedLocations.forEach(([loc, data]) => {
        const relFreq = Math.min(10, Math.round((data.count / maxEventsInLocation) * 10));
        const barra = '█'.repeat(relFreq) + '░'.repeat(10 - relFreq);
        csvContent += `"${loc}",${data.count},${data.checkIns},"[${barra}]"\n`;
      });
      csvContent += '\n';

      // --- BLOQUE 4: HISTÓRICO Y CRECIMIENTO MENSUAL ---
      csvContent += '--- CRECIMIENTO HISTÓRICO MENSUAL ---\n';
      csvContent += 'Año-Mes,Nuevos Eventos Creados,Total Acumulado,Gráfico de Crecimiento\n';
      const sortedMonths = Object.entries(mensualMap).sort((a, b) => a[0].localeCompare(b[0]));
      let acumulado = 0;
      const maxMonthEvents = sortedMonths.length > 0 ? Math.max(...sortedMonths.map(m => m[1])) : 1;
      sortedMonths.forEach(([mes, count]) => {
        acumulado += count;
        const relGrowth = Math.min(10, Math.round((count / maxMonthEvents) * 10));
        const barra = '█'.repeat(relGrowth) + '░'.repeat(10 - relGrowth);
        csvContent += `"${mes}",${count},${acumulado},"[${barra}]"\n`;
      });
      csvContent += '\n';

      // --- BLOCK 5: DETALLE COMPLETO DE EVENTOS ---
      csvContent += '--- DETALLE OPERACIONAL DE TODOS LOS EVENTOS ---\n';
      csvContent += 'Título,Categoría,Estado,Ubicación,Inicio,Fin,Capacidad,Total Inscritos,Asistencias,Ausencias,Tasa Ocupación,Gráfico de Aforo\n';
      eventos.forEach(ev => {
        const titulo = ev.title.replace(/"/g, '""');
        const categoria = (ev.category || 'General').replace(/"/g, '""');
        const estado = ev.status;
        const ubicacion = ev.location.replace(/"/g, '""');
        
        const fechaInicio = new Date(ev.startDate).toLocaleString('es-MX');
        const fechaFin = new Date(ev.endDate).toLocaleString('es-MX');
        const capacidad = ev.capacity;

        const activeRegs = (ev.registrations || []).filter(r => ['confirmed', 'absent'].includes(r.status));
        const totalInscritos = activeRegs.length;
        
        let asistencias = 0;
        let ausencias = 0;
        activeRegs.forEach(reg => {
          const tieneCheckIn = !!(reg.qrCode && reg.qrCode.checkIn);
          if (tieneCheckIn) asistencias++;
          else ausencias++;
        });

        const tasaOcupacion = capacidad > 0 ? (totalInscritos / capacidad) * 100 : 0;
        const barLength = Math.min(10, Math.round(tasaOcupacion / 10));
        const barra = '█'.repeat(barLength) + '░'.repeat(10 - barLength);

        csvContent += `"${titulo}","${categoria}","${estado}","${ubicacion}","${fechaInicio}","${fechaFin}",${capacidad},${totalInscritos},${asistencias},${ausencias},"${tasaOcupacion.toFixed(1)}%","[${barra}]"\n`;
      });

      const fechaReporte = new Date().toISOString().split('T')[0];
      const filename = `Reporte_Analitico_Eventos_${fechaReporte}.csv`;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      return res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  }
}

export default EventController;
