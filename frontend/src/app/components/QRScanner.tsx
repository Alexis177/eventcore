import { useState, useEffect } from 'react';
import { ScanLine, Loader2, CheckCircle, XCircle, Clock, Trash2, Camera, Keyboard } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { staffService } from '../services/staffService';
import { eventService } from '../services/eventService';
import type { Event } from '../types';

interface ScanEntry {
  id: string;
  attendeeName: string;
  attendeeEmail: string;
  scannedAt: Date;
  success: boolean;
  message: string;
}

export default function QRScanner() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<ScanEntry[]>([]);

  // 1. Cargar los eventos activos para que el Staff seleccione la puerta que está cuidando
  useEffect(() => {
    eventService.getPublishedEvents(1, 100)
      .then((res) => {
        const activeEvents = res.data || [];
        setEvents(activeEvents);
        if (activeEvents.length > 0) setSelectedEventId(activeEvents[0].id);
      })
      .catch(console.error);
  }, []);

  // 2. Función centralizada para procesar el token (viene de cámara o de input manual)
  const processToken = async (scannedToken: string) => {
    if (!scannedToken.trim() || isLoading || !selectedEventId) return;

    setIsLoading(true);
    setToken(''); // Limpiar input manual si se usó

    try {
      // Enviamos el token y el ID del evento que estamos validando
      const data = await staffService.scanQR(scannedToken, selectedEventId);
      
      setHistory((prev) => [
        {
          id: data.checkIn?.id || Date.now().toString(),
          attendeeName: data.attendee?.name || 'Usuario',
          attendeeEmail: data.attendee?.email || '—',
          scannedAt: new Date(),
          success: true,
          message: 'Check-in registrado exitosamente',
        },
        ...prev,
      ]);
    } catch (err) {
      setHistory((prev) => [
        {
          id: `error-${Date.now()}`,
          attendeeName: 'Desconocido',
          attendeeEmail: '—',
          scannedAt: new Date(),
          success: false,
          message: err instanceof Error ? err.message : 'Error al procesar el QR',
        },
        ...prev,
      ]);
    } finally {
      // Pequeña pausa para que la cámara no escanee 100 veces por segundo el mismo código
      setTimeout(() => setIsLoading(false), 1500);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processToken(token);
  };

  const lastScan = history[0] ?? null;
  const successCount = history.filter((h) => h.success).length;
  const errorCount = history.filter((h) => !h.success).length;

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Escáner de Accesos</h1>
        <p className="text-gray-500">Valida los códigos QR en la entrada del evento</p>
      </div>

      {/* Selector de Evento */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          ¿Qué evento estás validando?
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm bg-gray-50 focus:bg-white text-gray-900 transition-all shadow-sm font-semibold"
        >
          <option value="" disabled>Selecciona un evento...</option>
          {Array.isArray(events) && events.map(ev => (
            <option key={ev.id} value={ev.id}>{ev.title}</option>
          ))}
        </select>
      </div>

      {/* Selector de Modo (Cámara vs Pistola/Manual) */}
      <div className="flex border border-gray-200 rounded-xl overflow-hidden mb-6 bg-white shadow-sm p-1">
        <button
          onClick={() => setMode('camera')}
          className={`flex-1 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 rounded-lg cursor-pointer border-0 ${
            mode === 'camera' ? 'bg-primary text-white shadow-md' : 'bg-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Camera className="w-4.5 h-4.5" /> Cámara del Celular
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 rounded-lg cursor-pointer border-0 ${
            mode === 'manual' ? 'bg-primary text-white shadow-md' : 'bg-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Keyboard className="w-4.5 h-4.5" /> Pistola USB / Manual
        </button>
      </div>

      {/* Contenedor del Escáner */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 relative overflow-hidden">
        {!selectedEventId && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
            <ScanLine className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-900 font-bold text-lg">Selecciona un evento</p>
            <p className="text-gray-500 text-sm font-medium">Debes elegir el evento en la parte superior antes de escanear.</p>
          </div>
        )}

        {mode === 'camera' ? (
          <div className="w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 relative bg-gray-50 flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 z-10 bg-black/60 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-white mb-2" />
                <p className="text-white font-bold text-sm tracking-widest">PROCESANDO...</p>
              </div>
            )}
            <Scanner
              onScan={(result) => {
                if (result.length > 0) processToken(result[0].rawValue);
              }}
              styles={{ container: { width: '100%', height: '100%' } }}
              components={{ audio: false, finder: false }}
            />
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-6">
              <ScanLine className="w-8 h-8 text-primary" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Token del QR</label>
              <input
                type="text" value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm font-mono bg-gray-50 focus:bg-white text-gray-900 transition-all shadow-sm"
                placeholder="Pega o escanea el token aquí..."
                autoFocus autoComplete="off"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit" disabled={isLoading || !token.trim()}
              className="w-full py-3.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-0 shadow-lg shadow-primary/20"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Keyboard className="w-5 h-5" />}
              {isLoading ? 'Procesando...' : 'Registrar entrada'}
            </button>
          </form>
        )}
      </div>

      {/* Resultado del último escaneo - UX/UI Mejorado */}
      {lastScan && (
        <div className={`rounded-2xl p-6 flex items-start gap-5 mb-8 border-2 shadow-xl animate-fade-in ${
          lastScan.success
            ? 'bg-green-50 border-green-500'
            : 'bg-red-600 border-red-700 text-white'
        }`}>
          {lastScan.success
            ? <CheckCircle className="w-10 h-10 text-green-600 shrink-0 mt-1" />
            : <XCircle className="w-10 h-10 text-white shrink-0 mt-1" />}
          
          <div className="flex-1">
            <p className={`text-xl font-extrabold uppercase tracking-wide ${lastScan.success ? 'text-green-800' : 'text-white'}`}>
              {lastScan.success ? 'ACCESO AUTORIZADO' : 'ACCESO DENEGADO'}
            </p>
            
            {lastScan.success ? (
              <>
                <p className="text-lg mt-1 text-green-700 font-bold">{lastScan.attendeeName}</p>
                <p className="text-sm text-green-600 font-medium">{lastScan.attendeeEmail}</p>
              </>
            ) : (
              <div className="mt-3 bg-red-800/50 p-4 rounded-xl border border-red-500/30">
                <p className="text-lg font-bold text-red-50 flex items-center gap-2">
                  ⚠️ {lastScan.message}
                </p>
                <p className="text-sm text-red-200 font-medium mt-1">Verifica el evento seleccionado o si el código ya fue usado.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historial de la sesión */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <Clock className="w-4.5 h-4.5 text-gray-400" />
              <span className="font-bold text-sm text-gray-700">Historial de esta sesión</span>
              <div className="flex items-center gap-2">
                {successCount > 0 && (
                  <span className="bg-green-50 text-green-700 border border-green-200/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {successCount} exitoso{successCount !== 1 ? 's' : ''}
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="bg-red-50 text-red-700 border border-red-200/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {errorCount} error{errorCount !== 1 ? 'es' : ''}
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => setHistory([])} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer border-0 bg-transparent">
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {history.map((entry) => (
              <div key={entry.id} className={`flex items-start gap-3 px-5 py-3.5 ${entry.success ? 'hover:bg-green-50/10' : 'hover:bg-red-50/10'} transition-colors`}>
                {entry.success ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-gray-800 truncate">{entry.success ? entry.attendeeName : entry.message}</p>
                    <span className="text-xs text-gray-400 shrink-0 font-semibold">
                      {entry.scannedAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  {entry.success && <p className="text-xs text-gray-500 truncate font-semibold">{entry.attendeeEmail}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
