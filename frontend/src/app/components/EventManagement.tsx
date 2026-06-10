import { useEffect, useState, useMemo } from 'react';
import {
  Plus, Search, Loader2, Calendar, MapPin, Users,
  Pencil, Trash2, X, CheckCircle, Eye, Globe, FileText,
  ChevronLeft, ChevronRight, AlertCircle, BarChart3, UserX, TrendingUp,
  Download
} from 'lucide-react';
import { eventService } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import type { Event, EventStatus } from '../types';

const STATUS_LABEL: Record<EventStatus, string> = {
  draft: 'Borrador', published: 'Publicado', cancelled: 'Cancelado', finished: 'Finalizado',
};
const STATUS_COLOR: Record<EventStatus, string> = {
  draft: 'bg-white/20 text-white border border-white/30',
  published: 'bg-green-500/20 text-green-200 border border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-200 border border-red-500/30',
  finished: 'bg-blue-500/20 text-blue-200 border border-blue-500/30',
};

const PAGE_SIZE = 9;

interface FormErrors {
  title?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  capacity?: string;
}

function validateEventForm(form: {
  title: string; location: string;
  startDate: string; endDate: string; capacity: string;
}): FormErrors {
  const errors: FormErrors = {};
  const start = form.startDate ? new Date(form.startDate) : null;
  const end = form.endDate ? new Date(form.endDate) : null;

  if (!form.title.trim() || form.title.trim().length < 3)
    errors.title = 'El título debe tener al menos 3 caracteres';

  if (!form.location.trim() || form.location.trim().length < 3)
    errors.location = 'La ubicación debe tener al menos 3 caracteres';

  if (!form.startDate)
    errors.startDate = 'La fecha de inicio es requerida';

  if (!form.endDate)
    errors.endDate = 'La fecha de fin es requerida';
  else if (start && end && end <= start)
    errors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';

  if (!form.capacity || Number(form.capacity) < 1)
    errors.capacity = 'La capacidad debe ser al menos 1';

  return errors;
}

const CATEGORIES = ['Tecnología', 'Ciencias', 'Deportes', 'Artes', 'Networking', 'Desarrollo Personal', 'Académico'];

// ── Modal edición ─────────────────────────────────────────────────────────────
interface EditEventModalProps { event: Event; onClose: () => void; onSaved: () => void; }

function EditEventModal({ event, onClose, onSaved }: EditEventModalProps) {
  const toLocal = (iso: string) => new Date(iso).toISOString().slice(0, 16);
  const [form, setForm] = useState({
    title: event.title, description: event.description ?? '',
    location: event.location, startDate: toLocal(event.startDate),
    endDate: toLocal(event.endDate), capacity: String(event.capacity),
    category: event.category || 'Tecnología',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (f: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((p) => ({ ...p, [f]: e.target.value }));
      setFormErrors((p) => ({ ...p, [f]: undefined }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const errors = validateEventForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await eventService.updateEvent(event.id, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        location: form.location.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        capacity: Number(form.capacity),
        category: form.category,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar');
    } finally { setIsLoading(false); }
  };

  const inp = (hasError: boolean) =>
    `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm transition-all bg-gray-50 focus:bg-white text-gray-900 ${
      hasError
        ? 'border-red-300 focus:ring-red-400 focus:border-red-500 bg-red-50/30'
        : 'border-gray-200 focus:ring-accent/50 focus:border-accent'
    }`;
  const lbl = 'block text-sm font-semibold text-gray-700 mb-1.5';
  const fieldError = (msg?: string) => msg ? (
    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-semibold">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />{msg}
    </p>
  ) : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900 text-lg">Editar Evento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer border-0 bg-transparent">
            <X className="w-5 h-5" />
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={lbl}>Título *</label>
            <input type="text" value={form.title} onChange={set('title')} className={inp(!!formErrors.title)} />
            {fieldError(formErrors.title)}
          </div>
          <div>
            <label className={lbl}>
              Descripción <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea value={form.description} onChange={set('description')} className={`${inp(false)} resize-none`} rows={3} />
          </div>
          <div>
            <label className={lbl}>Ubicación *</label>
            <input type="text" value={form.location} onChange={set('location')} className={inp(!!formErrors.location)} />
            {fieldError(formErrors.location)}
          </div>
          <div>
            <label className={lbl}>Categoría del Evento *</label>
            <select
              value={form.category}
              onChange={set('category')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm bg-gray-50 focus:bg-white text-gray-900 transition-all shadow-sm font-medium"
              required
            >
              <option value="" disabled>Selecciona una categoría...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1.5 font-medium">
              Esto ayuda a recomendar tu evento a los alumnos interesados en este tema.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Fecha inicio *</label>
              <input type="datetime-local" value={form.startDate} onChange={set('startDate')} className={inp(!!formErrors.startDate)} />
              {fieldError(formErrors.startDate)}
            </div>
            <div>
              <label className={lbl}>Fecha fin *</label>
              <input type="datetime-local" value={form.endDate} onChange={set('endDate')} className={inp(!!formErrors.endDate)} min={form.startDate} />
              {fieldError(formErrors.endDate)}
            </div>
          </div>
          <div>
            <label className={lbl}>Capacidad *</label>
            <input type="number" min="1" value={form.capacity} onChange={set('capacity')} className={inp(!!formErrors.capacity)} />
            {fieldError(formErrors.capacity)}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-semibold cursor-pointer bg-white">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-0 shadow-md">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal cambio de estado ────────────────────────────────────────────────────
interface ChangeStatusModalProps { event: Event; onClose: () => void; onChanged: () => void; }

function ChangeStatusModal({ event, onClose, onChanged }: ChangeStatusModalProps) {
  const [selected, setSelected] = useState<EventStatus>(event.status);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options: { value: EventStatus; label: string; desc: string; color: string }[] = [
    { value: 'draft',     label: 'Borrador',   desc: 'Solo visible para ti',                  color: 'border-primary text-primary bg-primary/5' },
    { value: 'published', label: 'Publicado',  desc: 'Visible en catálogo, acepta registros', color: 'border-green-500 text-green-700 bg-green-50/50' },
    { value: 'finished',  label: 'Finalizado', desc: 'El evento ya ocurrió',                  color: 'border-blue-500 text-blue-700 bg-blue-50/50' },
    { value: 'cancelled', label: 'Cancelado',  desc: 'Se detienen los registros',             color: 'border-red-500 text-red-700 bg-red-50/50' },
  ];

  const handleSave = async () => {
    if (selected === event.status) { onClose(); return; }
    setIsLoading(true); setError(null);
    try { await eventService.changeStatus(event.id, selected); onChanged(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-gray-900 text-lg">Cambiar estado</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer border-0 bg-transparent"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-gray-500 mb-5 truncate font-medium">{event.title}</p>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">{error}</div>}
        <div className="space-y-3 mb-6">
          {options.map((opt) => (
            <label key={opt.value}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selected === opt.value ? opt.color : 'border-gray-100 hover:border-gray-200'
              }`}>
              <input type="radio" name="status" value={opt.value}
                checked={selected === opt.value} onChange={() => setSelected(opt.value)}
                className="mt-0.5 accent-primary" />
              <div>
                <p className="font-bold text-sm text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-750 rounded-xl hover:bg-gray-50 text-sm font-semibold cursor-pointer bg-white">Cancelar</button>
          <button onClick={handleSave} disabled={isLoading || selected === event.status}
            className="flex-1 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-0 shadow-md">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Guardando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MODAL: REPORTE GERENCIAL POST-EVENTO (HISTORIAL ANALÍTICO) ─────────────────
function PostEventReportModal({ event, onClose }: { event: Event; onClose: () => void; }) {
  const [stats, setStats] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [summary, setSummary] = useState(event.summary || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // LLamadas simultáneas al backend para recuperar la metadata histórica calculada
    eventService.getEventStats(event.id).then(setStats).catch(console.error);
    eventService.getComments(event.id).then(setComments).catch(console.error);
  }, [event.id]);

  const handleSaveSummary = async () => {
    setIsSaving(true);
    try {
      await eventService.updateSummary(event.id, summary);
      toast.success('Conclusiones del resumen guardadas con éxito');
      onClose();
    } catch (err) {
      toast.error('No se pudo guardar el resumen institucional');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[92vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Métricas y Cierre de Evento</h2>
            <p className="text-sm text-gray-500">Historial Logístico — {event.title}</p>
          </div>
          <button onClick={onClose} className="border-0 bg-transparent cursor-pointer text-gray-400 hover:text-gray-700"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-gray-50/50">
          {/* INDICADORES CLAVE EN TIEMPO REAL */}
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-5 h-5"/></div>
                <div><p className="text-xs text-gray-500 font-bold">Ocupación / Aforo</p><p className="text-lg font-bold text-gray-900">{stats.totalRegistrations} / {stats.capacity}</p></div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-green-50 text-green-600 rounded-lg"><CheckCircle className="w-5 h-5"/></div>
                <div><p className="text-xs text-gray-500 font-bold">Asistencia Real</p><p className="text-lg font-bold text-gray-900">{stats.checkIns}</p></div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-red-50 text-red-600 rounded-lg"><UserX className="w-5 h-5"/></div>
                <div><p className="text-xs text-gray-500 font-bold">Ausencias (No-Show)</p><p className="text-lg font-bold text-gray-900">{stats.absents}</p></div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg"><TrendingUp className="w-5 h-5"/></div>
                <div><p className="text-xs text-gray-500 font-bold">Tasa de Efectividad</p><p className="text-lg font-bold text-gray-900">{stats.attendanceRate}%</p></div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-gray-400"/></div>
          )}

          {/* MENSAJE DE CIERRE INSTITUCIONAL */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <label className="block text-sm font-bold text-gray-800 mb-2">Minuta / Conclusiones del Organizador</label>
            <textarea
              value={summary} onChange={e => setSummary(e.target.value)}
              placeholder="Escribe el informe final, agradecimientos o acuerdos logrados..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary text-sm bg-gray-50 focus:bg-white transition-all h-24 resize-none"
            />
            <div className="flex justify-end mt-3">
              <button onClick={handleSaveSummary} disabled={isSaving} className="bg-primary text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-primary/90 flex items-center gap-2 border-0 cursor-pointer shadow-md">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle className="w-4 h-4"/>} Guardar Resumen Oficial
              </button>
            </div>
          </div>

          {/* BUZÓN DE REALTROALIMENTACIÓN DE LOS ALUMNOS */}
          <div>
            <h3 className="font-bold text-gray-800 text-sm mb-3">Feedback y Comentarios de Asistentes ({comments.length})</h3>
            {comments.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-6 bg-white rounded-xl border border-dashed border-gray-200">No se recibieron comentarios de alumnos para este evento.</p>
            ) : (
              <div className="space-y-2">
                {comments.map(c => (
                  <div key={c.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-gray-900">{c.user?.name}</span>
                      <span className="text-xs text-gray-400 font-medium">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-650 leading-relaxed font-medium">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MODAL: DIÁLOGO DE CANCELACIÓN INTERACTIVO (REEMPLAZA CONFIRM) ───────────────
function ConfirmCancelModal({ eventTitle, onConfirm, onCancel, isLoading }: { eventTitle: string, onConfirm: () => void, onCancel: () => void, isLoading: boolean }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertCircle className="w-8 h-8 shrink-0" />
          <h2 className="text-xl font-bold text-gray-900">Cancelar Evento</h2>
        </div>
        <p className="text-sm text-gray-650 font-medium mb-6">
          ¿Estás seguro de que deseas dar de baja <strong>"{eventTitle}"</strong>? Esta acción notificará el paro de admisiones y es irreversible.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={isLoading} className="flex-1 py-2.5 border border-gray-200 text-gray-750 rounded-xl hover:bg-gray-50 font-bold bg-white cursor-pointer">Volver</button>
          <button onClick={onConfirm} disabled={isLoading} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold flex items-center justify-center gap-2 border-0 shadow-md shadow-red-600/10 cursor-pointer">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />} Confirmar Baja
          </button>
        </div>
      </div>
    </div>
  );
}

interface EventManagementProps {
  onCreateEvent: () => void;
  onSelectEvent: (id: string) => void;
}

export default function EventManagement({ onCreateEvent, onSelectEvent }: EventManagementProps) {
  const { hasRole } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<EventStatus | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [changingStatusEvent, setChangingStatusEvent] = useState<Event | null>(null);
  const [reportEvent, setReportEvent] = useState<Event | null>(null);
  const [cancellingEvent, setCancellingEvent] = useState<Event | null>(null);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [page, setPage] = useState(1);

  const handleExportCSV = () => {
    // 1. Usamos punto y coma para compatibilidad regional con Excel
    const separator = ';';

    const headers = [
      'Título',
      'Categoría',
      'Estado',
      'Ubicación',
      'Fecha Inicio',
      'Hora Inicio',
      'Fecha Fin',
      'Hora Fin',
      'Capacidad Aforo'
    ];

    // 2. Función auxiliar para limpiar textos (si alguien usa comillas en el título, no romperá el Excel)
    const cleanText = (text: any) => `"${(text || '').toString().replace(/"/g, '""')}"`;

    const rows = events.map(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      // Mapeo de estados a español
      const statusText = event.status === 'published' ? 'Publicado' 
                       : event.status === 'draft' ? 'Borrador' 
                       : event.status === 'finished' ? 'Finalizado' 
                       : 'Cancelado';

      return [
        cleanText(event.title),
        cleanText(event.category || 'General'),
        cleanText(statusText),
        cleanText(event.location),
        startDate.toLocaleDateString('es-MX'),
        startDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        endDate.toLocaleDateString('es-MX'),
        endDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        event.capacity
      ].join(separator); // Unimos usando el punto y coma
    });

    // 3. Agregamos "sep=;\n" en la primera línea. Esto le dice a Excel qué separador usar.
    const csvContent = "sep=;\n" + [headers.join(separator), ...rows].join('\n');

    // 4. Mantenemos el BOM (\ufeff) para los acentos
    const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 5. Descarga
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reporte_Eventos_ESCOM_${new Date().toLocaleDateString('es-MX')}.csv`);
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const load = async () => {
    setIsLoading(true); setError(null);
    try {
      const data = hasRole('admin') ? await eventService.getAllEvents() : await eventService.getMyEvents();
      setEvents(data);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al mapear eventos');
    } finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [search, filterStatus]);

  const handleCancelAction = async () => {
    if (!cancellingEvent) return;
    setIsCancelLoading(true);
    try {
      await eventService.cancelEvent(cancellingEvent.id);
      toast.success(`Evento "${cancellingEvent.title}" cancelado con éxito`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Fallo operativo');
    } finally {
      setIsCancelLoading(false);
      setCancellingEvent(null);
    }
  };

  const filtered = useMemo(() =>
    events
      .filter((e) => filterStatus === 'all' || e.status === filterStatus)
      .filter((e) => e.title.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase())),
    [events, filterStatus, search]
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const countByStatus = (s: EventStatus) => events.filter((e) => e.status === s).length;

  return (
    <div className="p-8 md:p-10 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-gray-900">Gestión de Eventos</h1>
          <p className="text-gray-500 text-base">Módulo operacional e historial de recintos</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold shadow-sm cursor-pointer">
            <Download className="w-4 h-4" /> Exportar Reporte
          </button>
          
          {hasRole('organizer', 'admin') && (
            <button onClick={onCreateEvent} className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl hover:bg-primary/90 transition-all text-sm font-bold shadow-lg shadow-primary/20 cursor-pointer border-0">
              <Plus className="w-5 h-5" /> Crear Evento
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2.5 mb-6 flex-wrap">
        {([
          { value: 'all',       label: `Todos (${events.length})` },
          { value: 'draft',     label: `Borradores (${countByStatus('draft')})` },
          { value: 'published', label: `Publicados (${countByStatus('published')})` },
          { value: 'finished',  label: `Historial Finalizados (${countByStatus('finished')})` },
          { value: 'cancelled', label: `Cancelados (${countByStatus('cancelled')})` },
        ] as any[]).map(({ value, label }) => (
          <button key={value} onClick={() => setFilterStatus(value)} className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-0 ${filterStatus === value ? 'bg-primary text-white shadow-md' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{label}</button>
        ))}
      </div>

      {/* Buscador */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Filtrar por nombre o recinto..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 text-sm bg-gray-50 text-gray-900 transition-all shadow-sm" />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">{error}</div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30 text-primary" />
          <p className="text-lg font-bold text-gray-800">{events.length === 0 ? 'Aún no has creado eventos' : 'Sin resultados'}</p>
          {events.length === 0 && hasRole('organizer', 'admin') && (
            <button onClick={onCreateEvent} className="mt-4 text-primary hover:underline text-sm font-bold bg-transparent border-0 cursor-pointer">
              Crear tu primer evento
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {paginated.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col">
                <div className="bg-gradient-to-br from-primary to-secondary p-6 text-white">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-white flex-1 truncate mr-2">{event.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${STATUS_COLOR[event.status]}`}>{STATUS_LABEL[event.status]}</span>
                  </div>
                  {event.description && <p className="text-sm text-white/80 line-clamp-2 mt-1 font-medium">{event.description}</p>}
                </div>

                <div className="p-6 space-y-3 flex-1">
                  <div className="flex items-center gap-2.5 text-sm text-gray-500 font-semibold"><Calendar className="w-4.5 h-4.5 text-accent" />{new Date(event.startDate).toLocaleDateString('es-MX')}</div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-500 font-semibold"><MapPin className="w-4.5 h-4.5 text-accent" /><span className="truncate">{event.location}</span></div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-500 font-semibold"><Users className="w-4.5 h-4.5 text-accent" />Capacidad: {event.capacity}</div>
                </div>

                {/* ACCIONES CONDICIONALES DINÁMICAS SEGÚN EL HISTORIAL */}
                <div className="px-6 pb-6 flex items-center gap-2">
                  {event.status === 'finished' ? (
                    <button onClick={() => setReportEvent(event)} className="w-full text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 rounded-xl transition-all font-bold flex items-center justify-center gap-2 cursor-pointer border-0">
                      <BarChart3 className="w-4 h-4" /> Ver Reporte Analítico (Historial)
                    </button>
                  ) : (
                    <>
                      <button onClick={() => onSelectEvent(event.id)} className="flex-1 text-sm bg-primary/10 hover:bg-primary/15 text-primary py-2.5 rounded-xl transition-all font-bold flex items-center justify-center gap-1.5 cursor-pointer border-0">
                        <Eye className="w-4 h-4" /> Lista Asistencia
                      </button>
                      <button onClick={() => setChangingStatusEvent(event)} className="p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl cursor-pointer border-0 bg-transparent"><FileText className="w-4.5 h-4.5" /></button>
                      <button onClick={() => setEditingEvent(event)} className="p-2.5 text-accent hover:bg-accent/10 rounded-xl cursor-pointer border-0 bg-transparent"><Pencil className="w-4.5 h-4.5" /></button>
                      <button onClick={() => setCancellingEvent(event)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer border-0 bg-transparent"><Trash2 className="w-4.5 h-4.5" /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer bg-white"
              >
                <ChevronLeft className="w-4.5 h-4.5" /> Anterior
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 text-sm rounded-xl transition-all font-bold cursor-pointer border-0 ${
                      page === p
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-500 hover:bg-gray-100 border border-gray-200 bg-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer bg-white"
              >
                Siguiente <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* RENDERIZADO CONTROLADO DE LOS MODALES COMPONENTIZADOS */}
      {editingEvent && (
        <EditEventModal event={editingEvent} onClose={() => setEditingEvent(null)}
          onSaved={() => { setEditingEvent(null); toast.success('Evento actualizado exitosamente'); load(); }} />
      )}
      {changingStatusEvent && (
        <ChangeStatusModal event={changingStatusEvent} onClose={() => setChangingStatusEvent(null)}
          onChanged={() => { setChangingStatusEvent(null); toast.success('Estado del evento actualizado'); load(); }} />
      )}
      {reportEvent && <PostEventReportModal event={reportEvent} onClose={() => setReportEvent(null)} />}
      {cancellingEvent && <ConfirmCancelModal eventTitle={cancellingEvent.title} isLoading={isCancelLoading} onConfirm={handleCancelAction} onCancel={() => setCancellingEvent(null)} />}
    </div>
  );
}
