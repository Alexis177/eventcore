import { useState } from 'react';
import { ArrowLeft, Loader2, CheckCircle, Info, AlertCircle, CalendarPlus } from 'lucide-react';
import { eventService } from '../services/eventService';
import type { Event } from '../types';

interface CreateEventProps {
  onBack: () => void;
  event?: Event;
}

interface FormErrors {
  title?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  capacity?: string;
}

const CATEGORIES = ['Tecnología', 'Ciencias', 'Deportes', 'Artes', 'Networking', 'Desarrollo Personal', 'Académico'];

export default function CreateEvent({ onBack, event }: CreateEventProps) {
  const toLocal = (iso?: string) => iso ? new Date(iso).toISOString().slice(0, 16) : '';
  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    location: event?.location || '',
    startDate: toLocal(event?.startDate),
    endDate: toLocal(event?.endDate),
    capacity: event?.capacity ? String(event.capacity) : '',
  });

  // Si estás editando, toma la categoría del evento, si es nuevo, pon 'Tecnología' por defecto
  const [category, setCategory] = useState(event?.category || 'Tecnología');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((p) => ({ ...p, [field]: e.target.value }));
      // Limpiar error del campo al editar
      setFormErrors((p) => ({ ...p, [field]: undefined }));
    };

  const validate = (): boolean => {
    const errors: FormErrors = {};
    const now = new Date();
    const start = form.startDate ? new Date(form.startDate) : null;
    const end = form.endDate ? new Date(form.endDate) : null;

    if (!form.title.trim() || form.title.trim().length < 3) {
      errors.title = 'El título debe tener al menos 3 caracteres';
    }
    if (!form.location.trim() || form.location.trim().length < 3) {
      errors.location = 'La ubicación debe tener al menos 3 caracteres';
    }
    if (!form.startDate) {
      errors.startDate = 'La fecha de inicio es requerida';
    } else if (!event && start && start < now) {
      errors.startDate = 'La fecha de inicio no puede ser en el pasado';
    }
    if (!form.endDate) {
      errors.endDate = 'La fecha de fin es requerida';
    } else if (start && end && end <= start) {
      errors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    if (!form.capacity || Number(form.capacity) < 1) {
      errors.capacity = 'La capacidad debe ser al menos 1';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      if (event?.id) {
        await eventService.updateEvent(event.id, {
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          location: form.location.trim(),
          startDate: form.startDate,
          endDate: form.endDate,
          capacity: Number(form.capacity),
          category,
        });
      } else {
        await eventService.createEvent({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          location: form.location.trim(),
          startDate: form.startDate,
          endDate: form.endDate,
          capacity: Number(form.capacity),
          category,
        });
      }
      setSuccess(true);
      setTimeout(onBack, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el evento');
    } finally {
      setIsLoading(false);
    }
  };

  const inp = (hasError: boolean) =>
    `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm transition-all shadow-sm ${
      hasError
        ? 'border-red-300 focus:ring-red-400 bg-red-50 text-gray-900'
        : 'border-gray-200 focus:ring-accent/50 focus:border-accent bg-gray-50 focus:bg-white text-gray-900'
    }`;
  const lbl = 'block text-sm font-semibold text-gray-700 mb-2';

  if (success) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="text-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100 max-w-sm">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{event ? '¡Evento guardado!' : '¡Evento creado!'}</h2>
        <p className="text-gray-500 text-sm">
          Guardado como <strong className="text-gray-900">Borrador</strong>.
          Publícalo desde Gestión de Eventos.
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-8 md:p-10 max-w-3xl mx-auto">
      <button onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-primary mb-8 font-semibold transition-colors cursor-pointer border-0 bg-transparent">
        <ArrowLeft className="w-4 h-4" /> Volver a eventos
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{event ? 'Editar Evento' : 'Crear Evento'}</h1>
        <p className="text-gray-500 text-base">{event ? 'Edita los datos del evento institucional' : 'Completa los datos del nuevo evento institucional'}</p>
      </div>

      <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/20 rounded-xl mb-8 text-sm text-primary font-semibold">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-accent" />
        <p>
          El evento se creará en estado <strong className="text-primary">Borrador</strong>.
          Publícalo desde la Gestión de Eventos para que sea visible en el catálogo público.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* Título */}
        <div>
          <label className={lbl}>Título *</label>
          <input type="text" value={form.title} onChange={set('title')}
            className={inp(!!formErrors.title)} placeholder="Ej. Congreso Nacional de Sistemas" />
          {formErrors.title && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{formErrors.title}
            </p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className={lbl}>Descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
          <textarea value={form.description} onChange={set('description')}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm bg-gray-50 focus:bg-white text-gray-900 transition-all shadow-sm resize-none"
            rows={4} placeholder="Detalles, ponentes, agenda..." />
        </div>

        {/* Ubicación */}
        <div>
          <label className={lbl}>Ubicación *</label>
          <input type="text" value={form.location} onChange={set('location')}
            className={inp(!!formErrors.location)} placeholder="Auditorio Principal, ESCOM" />
          {formErrors.location && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{formErrors.location}
            </p>
          )}
        </div>

        {/* Categoría del Evento */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Categoría del Evento
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm bg-gray-50 focus:bg-white text-gray-900 transition-all shadow-sm font-medium"
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

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={lbl}>Fecha y hora de inicio *</label>
            <input type="datetime-local" value={form.startDate} onChange={set('startDate')}
              className={inp(!!formErrors.startDate)}
              min={new Date().toISOString().slice(0, 16)}
            />
            {formErrors.startDate && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{formErrors.startDate}
              </p>
            )}
          </div>
          <div>
            <label className={lbl}>Fecha y hora de fin *</label>
            <input type="datetime-local" value={form.endDate} onChange={set('endDate')}
              className={inp(!!formErrors.endDate)}
              min={form.startDate || new Date().toISOString().slice(0, 16)}
            />
            {formErrors.endDate && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{formErrors.endDate}
              </p>
            )}
          </div>
        </div>

        {/* Capacidad */}
        <div>
          <label className={lbl}>Capacidad *</label>
          <input type="number" min="1" value={form.capacity} onChange={set('capacity')}
            className={inp(!!formErrors.capacity)} placeholder="Número máximo de asistentes" />
          {formErrors.capacity && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{formErrors.capacity}
            </p>
          )}
        </div>

        <div className="flex gap-4 pt-6 border-t border-gray-100">
          <button type="button" onClick={onBack}
            className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-bold cursor-pointer bg-white text-sm">
            Cancelar
          </button>
          <button type="submit" disabled={isLoading}
            className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-bold disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-0 text-sm">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CalendarPlus className="w-5 h-5" />}
            {isLoading ? (event ? 'Guardando...' : 'Creando...') : (event ? 'Guardar Cambios' : 'Crear Evento')}
          </button>
        </div>
      </form>
    </div>
  );
}
