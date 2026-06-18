import { useEffect, useState, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, RadialBarChart,
  RadialBar, Cell, PieChart, Pie,
} from 'recharts';
import {
  Loader2, Calendar, Users, CheckCircle, TrendingUp,
  Download, Printer, FileText, MapPin,
} from 'lucide-react';
import { eventService } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import type { Event } from '../types';
import { toast } from 'sonner';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Borrador', published: 'Publicado',
  cancelled: 'Cancelado', finished: 'Finalizado',
};
const STATUS_COLOR: Record<string, string> = {
  draft:     'bg-gray-100 text-gray-600 border border-gray-200',
  published: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
  finished:  'bg-blue-50 text-blue-700 border border-blue-200',
};

async function exportToCSV() {
  try {
    toast.loading('Generando reporte analítico de eventos...');
    const blob = await eventService.downloadAnalyticsReportCSV();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fechaReporte = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Reporte_Analitico_Eventos_${fechaReporte}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.dismiss();
    toast.success('Reporte analítico descargado con éxito');
  } catch (err) {
    toast.dismiss();
    toast.error(err instanceof Error ? err.message : 'Error al descargar el reporte');
  }
}

function printReport(printRef: React.RefObject<HTMLDivElement | null>) {
  const content = printRef.current;
  if (!content) return;
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
    <title>Reporte EventCore — ${new Date().toLocaleDateString('es-MX')}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;font-size:13px;color:#111;padding:32px;}
      h1{font-size:22px;margin-bottom:4px;color:#08325a;}.subtitle{color:#666;margin-bottom:24px;font-size:12px;}
      .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px;}
      .stat-card{border:1px solid #e5e7eb;border-radius:8px;padding:14px;}
      .stat-value{font-size:26px;font-weight:700;margin-bottom:4px;color:#0f172a;}.stat-label{font-size:11px;color:#6b7280;}
      table{width:100%;border-collapse:collapse;margin-top:8px;}
      th{text-align:left;padding:8px 10px;background:#f9fafb;border-bottom:2px solid #e5e7eb;font-size:11px;color:#6b7280;text-transform:uppercase;}
      td{padding:9px 10px;border-bottom:1px solid #f3f4f6;font-size:12px;}
      .badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:500;}
      .badge-draft{background:#f3f4f6;color:#6b7280;}.badge-published{background:#dcfce7;color:#16a34a;}
      .badge-cancelled{background:#fee2e2;color:#dc2626;}.badge-finished{background:#dbeafe;color:#2563eb;}
      .footer{margin-top:24px;font-size:11px;color:#9ca3af;text-align:right;}
      @media print{body{padding:20px;}}
    </style></head><body>${content.innerHTML}
    <div class="footer">Generado el ${new Date().toLocaleString('es-MX')} · EventCore — ESCOM IPN</div>
    </body></html>`);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
}

export default function Reports() {
  const { hasRole } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = hasRole('admin') ? eventService.getAllEvents() : eventService.getMyEvents();
    fetch.then(setEvents).catch((err) => setError(err.message)).finally(() => setIsLoading(false));
  }, []);

  // ── Cálculos ──────────────────────────────────────────────────────────────
  const totalCapacity  = events.reduce((s, e) => s + e.capacity, 0);
  const publishedCount = events.filter((e) => e.status === 'published').length;
  const finishedCount  = events.filter((e) => e.status === 'finished').length;
  const cancelledCount = events.filter((e) => e.status === 'cancelled').length;

  // Tasa de éxito = finalizados / (finalizados + cancelados)
  const completionRate = finishedCount + cancelledCount > 0
    ? Math.round((finishedCount / (finishedCount + cancelledCount)) * 100)
    : 0;

  // Área acumulada de eventos por mes
  const byMonth = events.reduce<Record<string, number>>((acc, e) => {
    const m = new Date(e.startDate).toLocaleString('es-MX', { month: 'short', year: '2-digit' });
    acc[m] = (acc[m] ?? 0) + 1;
    return acc;
  }, {});
  let cumulative = 0;
  const areaData = Object.entries(byMonth).map(([mes, count]) => {
    cumulative += count;
    return { mes, nuevos: count, acumulado: cumulative };
  });

  // Eventos por ubicación (top 6)
  const byLocation = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.location] = (acc[e.location] ?? 0) + 1;
    return acc;
  }, {});
  const locationData = Object.entries(byLocation)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([ubicacion, total]) => ({ ubicacion: ubicacion.slice(0, 20), total }));

  // Top 5 eventos por capacidad
  const topCapacity = [...events]
    .sort((a, b) => b.capacity - a.capacity)
    .slice(0, 5)
    .map((e) => ({ name: e.title.slice(0, 18), capacidad: e.capacity, status: e.status }));

  // Radial — distribución por estado
  const radialData = [
    { name: 'Publicados', value: publishedCount, fill: '#08325a' },
    { name: 'Finalizados', value: finishedCount, fill: '#1b7a47' },
    { name: 'Cancelados', value: cancelledCount, fill: '#9d1c34' },
  ].filter((d) => d.value > 0);

  const stats = [
    { label: 'Total eventos',     value: events.length,                  icon: Calendar,    bg: 'bg-[#e8eef5]',  color: 'text-[#08325a]'  },
    { label: 'Publicados',        value: publishedCount,                  icon: TrendingUp,  bg: 'bg-emerald-50', color: 'text-emerald-700' },
    { label: 'Capacidad total',   value: totalCapacity.toLocaleString(), icon: Users,       bg: 'bg-[#f5e8ea]',  color: 'text-[#9d1c34]'  },
    { label: 'Tasa de éxito',     value: `${completionRate}%`,            icon: CheckCircle, bg: 'bg-gray-100',   color: 'text-gray-600'   },
  ];

  const tooltipStyle = { border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 };

  return (
    <div className="p-8 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-[#08325a]">Reportes</h1>
          <p className="text-gray-500 text-base">Análisis y estadísticas de eventos</p>
        </div>
        {!isLoading && events.length > 0 && (
          <div className="flex items-center gap-3">
            <button onClick={exportToCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all text-sm font-bold shadow-md cursor-pointer border-0">
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
            <button onClick={() => printReport(printRef)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#08325a] text-white rounded-xl hover:bg-[#0a3d6e] transition-all text-sm font-bold shadow-md cursor-pointer border-0">
              <Printer className="w-4 h-4" /> Imprimir / PDF
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">{error}</div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-30 text-[#08325a]" />
          <p className="text-lg font-bold text-gray-800">Sin datos para mostrar</p>
          <p className="text-sm mt-1 text-gray-500">Crea y publica eventos para ver reportes</p>
        </div>
      ) : (
        <div ref={printRef}>
          {/* Título para impresión */}
          <div className="hidden print:block mb-6">
            <h1 className="text-2xl font-bold text-[#08325a]">Reporte de Eventos — EventCore</h1>
            <p className="text-gray-500 text-sm">Generado el {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          {/* Stats */}
          <div className="stats grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {stats.map(({ label, value, icon: Icon, bg, color }) => (
              <div key={label} className="stat-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="stat-value text-2xl font-bold text-gray-900">{value}</p>
                <p className="stat-label text-sm text-gray-500 mt-1.5 font-semibold">{label}</p>
              </div>
            ))}
          </div>

          {/* Fila 1: área acumulada + eventos por ubicación */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5 print:hidden">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-sm font-bold text-gray-700 mb-1">Crecimiento acumulado de eventos</p>
              <p className="text-xs text-gray-400 mb-4">Nuevos eventos por mes vs total acumulado</p>
              {areaData.length === 0 ? (
                <div className="flex items-center justify-center h-52 text-gray-400 text-sm">Sin datos suficientes</div>
              ) : (
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={areaData}>
                    <defs>
                      <linearGradient id="gradAcum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#08325a" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#08325a" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradNuev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9d1c34" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#9d1c34" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="acumulado" name="Acumulado" stroke="#08325a" strokeWidth={2} fill="url(#gradAcum)" dot={{ r: 3, fill: '#08325a' }} />
                    <Area type="monotone" dataKey="nuevos" name="Nuevos" stroke="#9d1c34" strokeWidth={2} fill="url(#gradNuev)" dot={{ r: 3, fill: '#9d1c34' }} strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-3 h-0.5 bg-[#08325a] rounded" />Acumulado
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-3 h-0.5 bg-[#9d1c34] rounded border-dashed" style={{ borderTop: '2px dashed #9d1c34', background: 'none' }} />Nuevos por mes
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-bold text-gray-700">Eventos por ubicación</p>
              </div>
              <p className="text-xs text-gray-400 mb-4">Top ubicaciones más utilizadas</p>
              {locationData.length === 0 ? (
                <div className="flex items-center justify-center h-52 text-gray-400 text-sm">Sin datos</div>
              ) : (
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={locationData} layout="vertical" barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis dataKey="ubicacion" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="total" name="Eventos" fill="#9d1c34" radius={[0, 5, 5, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Fila 2: top capacidad + radial */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8 print:hidden">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-sm font-bold text-gray-700 mb-1">Top 5 eventos por capacidad</p>
              <p className="text-xs text-gray-400 mb-4">Eventos con mayor aforo planificado</p>
              {topCapacity.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Sin datos</div>
              ) : (
                <div className="space-y-4">
                  {topCapacity.map((e, i) => {
                    const max = topCapacity[0].capacidad;
                    const pct = Math.round((e.capacidad / max) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-sm text-gray-700 font-medium truncate max-w-[65%]">{e.name}</span>
                          <span className="text-xs text-gray-400 shrink-0">{e.capacidad.toLocaleString()} lugares</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: i === 0 ? '#08325a' : '#4a7a9b' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-sm font-bold text-gray-700 mb-1">Distribución por estado</p>
              <p className="text-xs text-gray-400 mb-4">Proporción de eventos según su ciclo de vida</p>
              {radialData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Sin datos</div>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={radialData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                        {radialData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-4 flex-1">
                    {radialData.map((d) => (
                      <div key={d.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: d.fill }} />
                            <span className="text-xs text-gray-500">{d.name}</span>
                          </div>
                          <span className="text-xs font-bold text-gray-800">{d.value}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {Math.round((d.value / events.length) * 100)}% del total
                        </div>
                      </div>
                    ))}
                    {completionRate > 0 && (
                      <div className="mt-2 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">Tasa de éxito</p>
                        <p className="text-xl font-bold text-[#1b7a47]">{completionRate}%</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabla resumen — visible en pantalla e impresión */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-[#08325a]">Resumen completo de eventos</h2>
              <span className="text-sm font-semibold text-gray-400">{events.length} eventos</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3.5 px-5 text-sm font-semibold text-gray-500">Evento</th>
                    <th className="text-left py-3.5 px-5 text-sm font-semibold text-gray-500">Estado</th>
                    <th className="text-left py-3.5 px-5 text-sm font-semibold text-gray-500">Ubicación</th>
                    <th className="text-left py-3.5 px-5 text-sm font-semibold text-gray-500">Fecha inicio</th>
                    <th className="text-left py-3.5 px-5 text-sm font-semibold text-gray-500">Capacidad</th>
                    {hasRole('admin') && (
                      <th className="text-left py-3.5 px-5 text-sm font-semibold text-gray-500">Organizador</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-5 text-sm font-bold text-gray-800 max-w-[200px] truncate">{event.title}</td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[event.status]}`}>
                          {STATUS_LABEL[event.status]}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-sm text-gray-500 max-w-[160px] truncate">{event.location}</td>
                      <td className="py-4 px-5 text-sm text-gray-500 font-semibold">
                        {new Date(event.startDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-5 text-sm font-bold text-gray-700">{event.capacity}</td>
                      {hasRole('admin') && (
                        <td className="py-4 px-5 text-sm text-gray-500">{event.organizer?.name ?? '—'}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
