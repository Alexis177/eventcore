import { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { attendeeService } from '../services/attendeeService';
import type { Event } from '../types';

// Modal de autenticación rápida reutilizable
interface QuickAuthModalProps {
  eventTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

function QuickAuthModal({ eventTitle, onClose, onSuccess }: QuickAuthModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('register');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (tab === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar');
    } finally {
      setIsLoading(false);
    }
  };

  const inp = 'w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm bg-gray-50 focus:bg-white text-gray-900 transition-all';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-gray-900">Registrarse al evento</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer border-0 bg-transparent">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 truncate font-semibold">{eventTitle}</p>
        </div>
        <div className="flex border-b border-gray-100 bg-gray-55/50">
          {(['register', 'login'] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(null); }}
              className={`flex-1 py-3.5 text-sm font-bold transition-all cursor-pointer border-0 ${
                tab === t ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-500 bg-transparent'
              }`}>
              {t === 'register' ? 'Cuenta nueva' : 'Ya tengo cuenta'}
            </button>
          ))}
        </div>
        <div className="p-5">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre completo</label>
                <input type="text" value={form.name} onChange={set('name')} className={inp}
                  placeholder="Tu nombre" required minLength={2} disabled={isLoading} />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-750 mb-1">Email</label>
              <input type="email" value={form.email} onChange={set('email')} className={inp}
                placeholder="tu@email.com" required disabled={isLoading} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-750 mb-1">Contraseña</label>
              <input type="password" value={form.password} onChange={set('password')} className={inp}
                placeholder="••••••••" required minLength={6} disabled={isLoading} />
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full bg-secondary text-white py-3.5 rounded-xl hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm font-bold mt-4 shadow-lg shadow-secondary/20 cursor-pointer border-0">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : tab === 'register' ? <Users className="w-4 h-4" /> : <Loader2 className="w-4 h-4" />}
              {isLoading ? 'Procesando...' : tab === 'register' ? 'Crear cuenta y registrarme' : 'Entrar y registrarme'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

interface EventDetailProps {
  eventId: string;
  onBack: () => void;
}

export default function EventDetail({ eventId, onBack }: EventDetailProps) {
  const { hasRole, isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Consumir el endpoint público que acabamos de habilitar en el backend
    eventService.getEventById(eventId)
      .then((data) => {
        setEvent(data);
      })
      .catch((err) => {
        setErrorModal({
          title: 'Error de carga',
          message: err instanceof Error ? err.message : 'No se pudo cargar el evento.',
        });
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  // Verificar si ya está registrado si está logueado
  useEffect(() => {
    if (isAuthenticated && hasRole('attendee')) {
      attendeeService.getMyRegistrations()
        .then((myRegs) => {
          const isReg = myRegs.some((reg: any) => reg.eventId === eventId && reg.status !== 'cancelled');
          setIsRegistered(isReg);
        })
        .catch(console.error);
    }
  }, [isAuthenticated, eventId]);

  const doRegister = async () => {
    setRegistering(true);
    try {
      await eventService.registerToEvent(eventId);
      setIsRegistered(true);
      setSuccessMsg('¡Registro exitoso! Revisa "Mis QR" en tu menú para ver tu código de acceso.');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setErrorModal({
        title: 'Inconveniente con el registro',
        message: err instanceof Error ? err.message : 'No se pudo completar la inscripción en este momento.',
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else if (hasRole('attendee')) {
      doRegister();
    }
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    await doRegister();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-gray-500 font-semibold text-sm">Cargando detalles del evento...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-150 text-center shadow-sm">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Evento no encontrado</h2>
          <p className="text-gray-500 mb-6 text-sm font-semibold">El evento solicitado no existe o no se encuentra publicado en este momento.</p>
          <button onClick={onBack} className="bg-primary text-white font-bold py-3 px-6 rounded-xl text-sm transition-all hover:bg-primary/95 cursor-pointer border-0">
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  const isSoldOut = event.registeredCount !== undefined && event.registeredCount >= event.capacity;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto animate-fade-in">
      {/* Botón de retroceso */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-primary transition-all font-bold text-sm mb-6 cursor-pointer border-0 bg-transparent"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al catálogo
      </button>

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 font-semibold">
          <CheckCircle className="w-5 h-5 shrink-0" />{successMsg}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden flex flex-col">
        {/* Cabecera del Evento (Con gradiente premium de EventCore) */}
        <div className="bg-gradient-to-r from-primary to-secondary p-8 md:p-12 text-white">
          <span className="bg-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 inline-block backdrop-blur-sm">
            {event.category || 'General'}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">{event.title}</h1>
          {event.organizer && (
            <p className="text-sm text-white/80 font-medium">Organizado por: <span className="font-bold">{event.organizer.name}</span></p>
          )}
        </div>

        {/* Detalles e Inscripción */}
        <div className="p-8 md:p-12 flex flex-col md:flex-row gap-10 justify-between items-start">
          <div className="space-y-6 flex-1 text-gray-700">
            <div className="flex gap-4 items-start">
              <div className="bg-accent/10 p-2.5 rounded-xl text-accent">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Fecha y Hora</p>
                <p className="text-gray-500 text-sm font-semibold mt-0.5">
                  {new Date(event.startDate).toLocaleDateString('es-MX', {
                    timeZone: 'America/Mexico_City',
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-accent/10 p-2.5 rounded-xl text-accent">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Ubicación</p>
                <p className="text-gray-500 text-sm font-semibold mt-0.5">{event.location}</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-accent/10 p-2.5 rounded-xl text-accent">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Capacidad</p>
                <p className="text-gray-500 text-sm font-semibold mt-0.5">{event.capacity} lugares totales disponibles</p>
              </div>
            </div>

            {event.description && (
              <div className="pt-6 border-t border-gray-100 mt-6">
                <h3 className="font-bold text-gray-900 mb-2">Acerca del evento</h3>
                <p className="text-sm text-gray-550 leading-relaxed font-semibold">{event.description}</p>
              </div>
            )}
          </div>

          {/* Tarjeta de Registro */}
          <div className="w-full md:w-80 bg-gray-50 p-6 rounded-2xl border border-gray-150 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Registro al evento</p>
            <p className="text-sm text-gray-500 mb-6 font-semibold leading-relaxed">
              Asegura tu lugar antes de que se agote el cupo disponible.
            </p>

            {isRegistered ? (
              <div className="w-full bg-green-50 text-green-700 py-4 rounded-xl border border-green-200/50 font-bold text-center flex items-center justify-center gap-2 text-sm shadow-sm">
                <CheckCircle className="w-5 h-5" /> Ya estás registrado
              </div>
            ) : hasRole('organizer', 'admin', 'staff') ? (
              <div className="w-full bg-gray-100 text-gray-500 py-3.5 rounded-xl font-bold border border-gray-200 text-center text-xs">
                Vista de administración
              </div>
            ) : isSoldOut ? (
              <div className="w-full bg-gray-200 text-gray-500 py-4 rounded-xl font-bold border border-gray-300 text-center flex items-center justify-center gap-2 text-sm">
                <XCircle className="w-5 h-5" /> Cupo Lleno (Agotado)
              </div>
            ) : (
              <button
                onClick={handleRegisterClick}
                disabled={registering}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold text-base py-4 rounded-xl shadow-lg shadow-primary/15 hover:shadow-primary/25 transition-all cursor-pointer border-0"
              >
                {registering && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                {registering ? 'Inscribiendo...' : 'Inscribirme ahora'}
              </button>
            )}

            {!isAuthenticated && !isRegistered && (
              <p className="text-[11px] text-gray-400 mt-4 leading-relaxed font-semibold">
                Se requiere una cuenta de Asistente para generar tu pase de acceso QR.
              </p>
            )}
          </div>
        </div>
      </div>

      {showAuthModal && (
        <QuickAuthModal
          eventTitle={event.title}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {errorModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setErrorModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <XCircle className="w-8 h-8 shrink-0" />
              <h2 className="text-xl font-bold text-gray-900">{errorModal.title}</h2>
            </div>
            <p className="text-sm text-gray-650 leading-relaxed font-semibold mb-6">
              {errorModal.message}
            </p>
            <button
              onClick={() => setErrorModal(null)}
              className="w-full bg-primary text-white py-3.5 rounded-xl hover:bg-primary/90 font-bold transition-all cursor-pointer border-0 text-sm shadow-md"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
