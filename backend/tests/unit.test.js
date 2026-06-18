import bcrypt from 'bcryptjs';
import crypto from 'crypto';

describe('Pruebas Unitarias - Algoritmos Core', () => {
  it('Debe generar un hash seguro para las contraseñas (RNF2)', async () => {
    const passwordOriginal = 'Escom2026!';
    const saltRounds = 10;
    const hash = await bcrypt.hash(passwordOriginal, saltRounds);
    
    expect(hash).not.toBe(passwordOriginal);
    
    const isValid = await bcrypt.compare(passwordOriginal, hash);
    expect(isValid).toBe(true);
  });

  it('Debe generar tokens QR únicos para cada participante', () => {
    const token1 = crypto.randomUUID();
    const token2 = crypto.randomUUID();
    
    expect(token1).not.toBe(token2);
    expect(token1.length).toBeGreaterThan(10);
  });
});
