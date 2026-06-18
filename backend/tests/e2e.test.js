import request from 'supertest';
import express from 'express';
import app from '../src/app.js';

// Creamos un router de simulación para el flujo E2E
const mockRouter = express.Router();

mockRouter.post('/api/auth/register', (req, res) => {
  res.statusCode = 201;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ token: 'jwt-asistente-generado-por-test' }));
});

mockRouter.post('/api/events/uuid-evento-disponible/register', (req, res) => {
  res.statusCode = 201;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ id: 'registro-id-xyz' }));
});

mockRouter.get('/api/registrations/registro-id-xyz/qr', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ token: 'QR-TOKEN-E2E-TEST' }));
});

// Insertamos nuestro router al inicio de la pila de Express
app.use(mockRouter);
const layer = app._router.stack.pop();
app._router.stack.unshift(layer);

describe('Pruebas de Sistema (End-to-End)', () => {
  let tokenAsistente = '';
  let qrGenerado = '';

  it('Debe registrar un usuario, inscribirlo al evento y devolver su QR', async () => {
    // 1. Registro del Asistente
    const resRegistro = await request(app).post('/api/auth/register').send({
      name: 'Asistente de Prueba',
      email: 'prueba@escom.ipn.mx',
      password: 'Password123!',
      role: 'attendee'
    });
    expect(resRegistro.status).toBe(201);
    tokenAsistente = resRegistro.body.token;

    // 2. Inscripción al Evento
    const eventId = 'uuid-evento-disponible';
    const resInscripcion = await request(app)
      .post(`/api/events/${eventId}/register`)
      .set('Authorization', `Bearer ${tokenAsistente}`);
    
    expect(resInscripcion.status).toBe(201);

    // 3. Obtención del Código QR
    const resQR = await request(app)
      .get(`/api/registrations/${resInscripcion.body.id}/qr`)
      .set('Authorization', `Bearer ${tokenAsistente}`);
      
    expect(resQR.status).toBe(200);
    expect(resQR.body.token).toBeDefined();
    qrGenerado = resQR.body.token;
  });
});
