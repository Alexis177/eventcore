import { useEffect, useState } from 'react';
import {
  Calendar, Users, CheckCircle, TrendingUp,
  Plus, QrCode, BarChart3, Loader2, ArrowRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { eventService } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import type { Event } from '../types';

interface DashboardProps { onNavigate: (view: any) => void; }

const STATUS_COLORS: Record<string, string> = {
  published: '#08325a',
  draft:     '#9d1c34',
  cancelled: '#6b7280',
  finished:  '#1b7a47',
};

const STATUS_LABEL: Record<string, string> = {
  published: 'Publicado', draft: 'Borrador',
  cancelled: 'Cancelado', finished: 'Finalizado',
};

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { hasRole } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // CORRECCIÓN: Solicitamos un rango amplio (ej. 100) para procesar métricas globales del Dashboard
    eventService.getPublishedEvents(1, 100)
      .then((res) => {
        // Validación de seguridad de la estructura antes de mutar el estado
        if (res && res.data && Array.isArray(res.data)) {
          setEvents(res.data);
        } else if (Array.isArray(res)) {
          setEvents(res);
        } else {
          setEvents([]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  // Cláusulas de protección ante datos que no sean arrays de forma estricta
  const isEventsArray = Array.isArray(events);
  const publishedCount  = isEventsArray ? events.filter((e) => e.status === 'published').length : 0;
  const finishedCount   = isEventsArray ? events.filter((e) => e.status === 'finished').length : 0;
  const totalCapacity   = isEventsArray ? events.reduce((s, e) => s + e.capacity, 0) : 0;

  const stats = [
    { title: 'Publicados',      value: isLoading ? '…' : String(publishedCount),             change: 'Disponibles ahora',    icon: Calendar,     bg: 'bg-[#e8eef5]', color: 'text-[#08325a]' },
    { title: 'Total eventos',   value: isLoading ? '…' : String(isEventsArray ? events.length : 0), change: 'En el catálogo',       icon: Users,        bg: 'bg-[#f5e8ea]', color: 'text-[#9d1c34]' },
    { title: 'Finalizados',     value: isLoading ? '…' : String(finishedCount),              change: 'Completados',          icon: CheckCircle,  bg: 'bg-emerald-50', color: 'text-emerald-700' },
    { title: 'Capacidad total', value: isLoading ? '…' : totalCapacity.toLocaleString(),     change: 'Lugares totales',      icon: TrendingUp,   bg: 'bg-gray-100',   color: 'text-gray-600' },
  ];

  // Gráfica 1 — eventos por mes
  const byMonth = isEventsArray ? events.reduce<Record<string, number>>((acc, e) => {
    const m = new Date(e.startDate).toLocaleString('es-MX', { month: 'short', year: '2-digit', timeZone: 'America/Mexico_City' });
    acc[m] = (acc[m] ?? 0) + 1;
    return acc;
  }, {}) : {};
  const monthData = Object.entries(byMonth).map(([mes, total]) => ({ mes, total }));

  // Gráfica 2 — distribución por estado
  const statusData = ['published', 'draft', 'cancelled', 'finished']
    .map((s) => ({
      name: STATUS_LABEL[s],
      value: isEventsArray ? events.filter((e) => e.status === s).length : 0,
      color: STATUS_COLORS[s]
    }))
    .filter((d) => d.value > 0);

  // Barras de ocupación — primeros 5 publicados
  const publishedEvents = isEventsArray ? events.filter((e) => e.status === 'published').slice(0, 5) : [];

  return (
    <div className="p-8 md:p-10 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-500 text-base">Resumen de la plataforma EventCore</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className={`${stat.bg} p-3 rounded-xl w-fit mb-4`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm font-semibold text-gray-700 mb-0.5">{stat.title}</p>
              <p className="text-xs text-gray-400">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold">{error}</div>
      )}

      {/* Gráficas */}
      {!isLoading && isEventsArray && events.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Eventos por mes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-sm font-semibold text-gray-700 mb-4">Eventos por mes</p>
              {monthData.length === 0 ? (
                <div className="flex items-center justify-center h-44 text-gray-400 text-sm">Sin datos</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={monthData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="total" name="Eventos" fill="#08325a" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Distribución por estado */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-sm font-semibold text-gray-700 mb-4">Estado de eventos</p>
              {statusData.length === 0 ? (
                <div className="flex items-center justify-center h-44 text-gray-400 text-sm">Sin datos</div>
              ) : (
                <div className="flex flex-col gap-2.5 justify-center h-[180px]">
                  {statusData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between border-b border-gray-50 pb-1.5 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
                        <span className="text-xs text-gray-500 font-medium">{d.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-800">{d.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Capacidad de eventos publicados */}
          {publishedEvents.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
              <p className="text-sm font-semibold text-gray-700 mb-5">Capacidad — eventos publicados</p>
              <div className="space-y-4">
                {publishedEvents.map((event) => {
                  const maxCapacity = events.reduce((m, e) => Math.max(m, e.capacity), 1);
                  const pct = Math.min(100, Math.round((event.capacity / maxCapacity) * 100));
                  return (
                    <div key={event.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-700 font-semibold truncate max-w-[60%]">{event.title}</span>
                        <span className="text-xs text-gray-400 shrink-0 font-medium">{event.capacity.toLocaleString()} lugares</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: pct > 75 ? '#9d1c34' : '#08325a' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Acciones rápidas */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Acciones rápidas</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {hasRole('organizer', 'admin') && (
          <button onClick={() => onNavigate('create-event')}
            className="group bg-[#08325a] text-white p-5 rounded-2xl hover:bg-[#0a3d6e] transition-all flex items-center justify-between shadow-md cursor-pointer border-0">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2.5 rounded-xl"><Plus className="w-5 h-5" /></div>
              <div className="text-left">
                <p className="text-base font-bold">Crear evento</p>
                <p className="text-xs text-white/60 mt-0.5">Añadir al catálogo</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          </button>
        )}
        {hasRole('staff', 'organizer', 'admin') && (
          <button onClick={() => onNavigate('qr-scanner')}
            className="group bg-[#9d1c34] text-white p-5 rounded-2xl hover:bg-[#85162a] transition-all flex items-center justify-between shadow-md cursor-pointer border-0">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2.5 rounded-xl"><QrCode className="w-5 h-5" /></div>
              <div className="text-left">
                <p className="text-base font-bold">Escanear QR</p>
                <p className="text-xs text-white/60 mt-0.5">Control de accesos</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          </button>
        )}
        {hasRole('organizer', 'admin') && (
          <button onClick={() => onNavigate('reports')}
            className="group bg-white border border-gray-200 text-gray-900 p-5 rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-between shadow-sm cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-2.5 rounded-xl"><BarChart3 className="w-5 h-5 text-gray-600" /></div>
              <div className="text-left">
                <p className="text-base font-bold">Ver reportes</p>
                <p className="text-xs text-gray-400 mt-0.5">Métricas y datos</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          </button>
        )}
      </div>
    </div>
  );
}
