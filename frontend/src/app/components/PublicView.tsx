import { useEffect, useState, useMemo } from 'react';
import {
  Calendar, MapPin, Users, Loader2, CheckCircle,
  LogIn, UserPlus, X, Search, SlidersHorizontal, XCircle, Star
} from 'lucide-react';
import { toast } from 'sonner';
import { eventService } from '../services/eventService';
import { attendeeService } from '../services/attendeeService';
import { useAuth } from '../context/AuthContext';
import type { Event } from '../types';

// ── Modal auth rápido ─────────────────────────────────────────────────────────
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-gray-900">Registrarse al evento</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer border-0 bg-transparent">
              <X className="w-5 h-5" />
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
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : tab === 'register' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {isLoading ? 'Procesando...' : tab === 'register' ? 'Crear cuenta y registrarme' : 'Entrar y registrarme'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Vista principal ───────────────────────────────────────────────────────────
export default function PublicView() {
  const { hasRole, isAuthenticated, user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState<string | null>(null);
  const [registered, setRegistered] = useState<Set<string>>(new Set());

  // Estados para la paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pendingEventId, setPendingEventId] = useState<string | null>(null);
  const [pendingEventTitle, setPendingEventTitle] = useState('');
  
  // Nuevo estado para controlar el modal de errores de registro
  const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);

  // ── Filtros ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Cargar eventos del catálogo
  useEffect(() => {
    setIsLoading(true);
    eventService.getPublishedEvents(1)
      .then((response) => {
        setEvents(response.data);
        setTotalPages(response.totalPages);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  // Cargar registros existentes del alumno para deshabilitar botones inicialmente
  useEffect(() => {
    if (isAuthenticated && hasRole('attendee')) {
      attendeeService.getMyRegistrations()
        .then((myRegs) => {
          // Filtramos solo las inscripciones activas (que no estén canceladas)
          const activeEventIds = myRegs
            .filter((reg: any) => reg.status !== 'cancelled')
            .map((reg: any) => reg.eventId);
          setRegistered(new Set(activeEventIds));
        })
        .catch(console.error);
    } else {
      setRegistered(new Set());
    }
  }, [isAuthenticated]);

  const locations = useMemo(() =>
    [...new Set(events.map((e) => e.location))].sort(),
    [events]
  );

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        !search ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase());

      const matchLocation = !filterLocation || e.location === filterLocation;
      const matchDateFrom = !filterDateFrom || new Date(e.startDate) >= new Date(filterDateFrom);
      const matchDateTo = !filterDateTo || new Date(e.startDate) <= new Date(filterDateTo + 'T23:59:59');

      const now = new Date();
      const matchNotExpired = new Date(e.endDate) >= now; // Solo mostrar eventos que no han terminado

      return matchSearch && matchLocation && matchDateFrom && matchDateTo && matchNotExpired;
    });
  }, [events, search, filterLocation, filterDateFrom, filterDateTo]);

  const { recommendedEvents, otherEvents } = useMemo(() => {
    const userPrefs = user?.preferences?.categories || [];
    if (userPrefs.length === 0) return { recommendedEvents: [], otherEvents: filtered };

    const recommended: Event[] = [];
    const others: Event[] = [];

    filtered.forEach(event => {
      if (userPrefs.includes(event.category || '')) recommended.push(event);
      else others.push(event);
    });
    return { recommendedEvents: recommended, otherEvents: others };
  }, [filtered, user]);

  const activeFilterCount = [search, filterLocation, filterDateFrom, filterDateTo].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setFilterLocation('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const doRegister = async (eventId: string) => {
    setRegistering(eventId);
    try {
      await eventService.registerToEvent(eventId);
      setRegistered((prev) => {
        const next = new Set(prev);
        next.add(eventId);
        return next;
      });
      setSuccessMsg('¡Registro exitoso! Revisa "Mis QR" para ver tu código de acceso.');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      // REEMPLAZO DEL ALERT: Guardamos los datos para desplegar el modal interactivo
      setErrorModal({
        title: 'Inconveniente con el registro',
        message: err instanceof Error ? err.message : 'No se pudo completar la inscripción en este momento.',
      });
    } finally {
      setRegistering(null);
    }
  };

  const handleLoadMore = async () => {
    if (page >= totalPages) return;
    setIsLoadingMore(true);
    try {
      const next = page + 1;
      const res = await eventService.getPublishedEvents(next);
      setEvents((prev) => [...prev, ...res.data]);
      setPage(next);
    } catch (err) {
      toast.error('Error al cargar más eventos');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleRegisterClick = (event: Event) => {
    if (!isAuthenticated) {
      setPendingEventId(event.id);
      setPendingEventTitle(event.title);
    } else if (hasRole('attendee')) {
      doRegister(event.id);
    }
  };

  const handleAuthSuccess = async () => {
    setPendingEventId(null);
    if (pendingEventId) await doRegister(pendingEventId);
  };

  const renderEventCard = (event: Event) => {
    const isSoldOut = event.registeredCount !== undefined && event.registeredCount >= event.capacity;
    return (
      <div key={event.id}
        className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_25px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
        <div className="bg-gradient-to-br from-primary to-secondary p-6 text-white">
          <h3 className="text-lg font-bold text-white mb-1 truncate">{event.title}</h3>
          {event.organizer && (
            <p className="text-xs text-white/70 font-semibold mt-1">Organizador: {event.organizer.name}</p>
          )}
        </div>
        <div className="p-6 flex flex-col flex-1 gap-3">
          {event.description && (
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed font-semibold">{event.description}</p>
          )}
          <div className="flex items-center gap-2.5 text-sm text-gray-500 font-semibold mt-1">
            <Calendar className="w-4.5 h-4.5 shrink-0 text-accent" />
            {new Date(event.startDate).toLocaleDateString('es-MX', {
              timeZone: 'America/Mexico_City',
              weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
            })}
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-500 font-semibold">
            <MapPin className="w-4.5 h-4.5 shrink-0 text-accent" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-500 font-semibold">
            <Users className="w-4.5 h-4.5 shrink-0 text-accent" />
            Capacidad: {event.capacity}
          </div>
          
          <div className="mt-auto pt-4 border-t border-gray-100/5">
            {registered.has(event.id) ? (
              <button
                disabled
                className="w-full bg-green-50 text-green-700 py-3.5 rounded-xl border border-green-200/50 font-bold text-center flex items-center justify-center gap-2 cursor-not-allowed text-sm"
              >
                <CheckCircle className="w-4.5 h-4.5" /> Ya estás registrado
              </button>
            ) : hasRole('organizer', 'admin', 'staff') ? (
              <p className="text-xs text-gray-400 text-center font-bold bg-gray-50 py-2 rounded-lg">
                Vista de administración
              </p>
            ) : isSoldOut ? (
              <div className="w-full bg-gray-100 text-gray-500 py-3.5 rounded-xl font-bold border border-gray-200 text-center flex items-center justify-center gap-2 text-sm">
                <XCircle className="w-4 h-4" /> Cupo Lleno (Agotado)
              </div>
            ) : (
              <button
                onClick={() => handleRegisterClick(event)}
                disabled={registering === event.id}
                className="w-full bg-primary text-white py-3.5 rounded-xl hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/15 cursor-pointer border-0 text-sm"
              >
                {registering === event.id && <Loader2 className="w-4 h-4 animate-spin" />}
                {registering === event.id ? 'Registrando...' : 'Registrarme ahora'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 md:p-10 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Catálogo de Eventos</h1>
        <p className="text-gray-500 text-base">Encuentra y regístrate en los eventos disponibles</p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text" placeholder="Buscar por nombre, descripción o lugar..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm bg-gray-50 focus:bg-white text-gray-900 transition-all shadow-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-5 py-3.5 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
            showFilters || activeFilterCount > 0
              ? 'bg-primary text-white border-primary shadow-lg shadow-primary/15'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="w-4.5 h-4.5" />
          Filtros
          {activeFilterCount > 0 && (
            <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
              showFilters || activeFilterCount > 0 ? 'bg-white text-primary' : 'bg-primary text-white'
            }`}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-650 mb-1.5">Ubicación</label>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-gray-50 focus:bg-white text-gray-900 transition-all"
              >
                <option value="">Todas las ubicaciones</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-650 mb-1.5">Fecha desde</label>
              <input
                type="date" value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-gray-50 focus:bg-white text-gray-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-650 mb-1.5">Fecha hasta</label>
              <input
                type="date" value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                min={filterDateFrom}
                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-gray-50 focus:bg-white text-gray-900 transition-all"
              />
            </div>
          </div>
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
              <button onClick={clearFilters} className="text-sm font-bold text-red-500 hover:text-red-700 cursor-pointer border-0 bg-transparent">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 font-semibold">
          <CheckCircle className="w-5 h-5 shrink-0" />{successMsg}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-semibold">{error}</div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30 text-primary" />
          <p className="text-lg font-bold text-gray-800">
            {events.length === 0 ? 'No hay eventos publicados' : 'Sin resultados'}
          </p>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="mt-4 text-primary hover:underline text-sm font-bold cursor-pointer border-0 bg-transparent">
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* SECCIÓN 1: RECOMENDADOS (Si hace match con sus preferencias) */}
          {recommendedEvents.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-amber-500/10 rounded-lg"><Star className="w-5 h-5 text-amber-500" /></div>
                <h2 className="text-2xl font-bold text-gray-900">Recomendados para ti</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {recommendedEvents.map(renderEventCard)}
              </div>
            </div>
          )}

          {/* SECCIÓN 2: OTROS EVENTOS */}
          {otherEvents.length > 0 && (
            <div>
              {recommendedEvents.length > 0 && <h2 className="text-xl font-bold text-gray-800 mb-6 border-t border-gray-100 pt-8">Explora más eventos</h2>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {otherEvents.map(renderEventCard)}
              </div>
            </div>
          )}

          {page < totalPages && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-3 bg-white border border-gray-200 text-primary font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
              >
                {isLoadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoadingMore ? 'Cargando...' : 'Cargar más eventos'}
              </button>
            </div>
          )}
        </div>
      )}

      {pendingEventId && (
        <QuickAuthModal
          eventTitle={pendingEventTitle}
          onClose={() => setPendingEventId(null)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* COMPONENTE NUEVO: Modal de control de error interactivo (Reemplaza al alert nativo) */}
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
