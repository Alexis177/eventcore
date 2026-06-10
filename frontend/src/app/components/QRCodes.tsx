import { useEffect, useState } from 'react';
import { QrCode, Loader2, X, Calendar, MapPin, AlertCircle, MessageSquare, Send, FileText } from 'lucide-react';
import { attendeeService } from '../services/attendeeService';
import { eventService } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import type { Registration } from '../types';

const STATUS_LABEL: Record<string, string> = { confirmed: 'Asistió', pending: 'Pendiente', cancelled: 'Cancelado', absent: 'Ausente' };
const STATUS_COLOR: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700 border border-green-200/50',
  pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200/50',
  cancelled: 'bg-gray-100 text-gray-600 border border-gray-200',
  absent: 'bg-red-100 text-red-700 border border-red-200/50',
};

// --- NUEVO: Componente Modal de Confirmación ---
function ConfirmCancelModal({ onConfirm, onCancel, isLoading }: { onConfirm: () => void, onCancel: () => void, isLoading: boolean }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertCircle className="w-8 h-8 shrink-0" />
          <h2 className="text-xl font-bold text-gray-900">Cancelar registro</h2>
        </div>
        <p className="text-sm text-gray-600 font-medium mb-6">
          ¿Estás seguro de que deseas cancelar tu registro? Esta acción invalidará tu código QR y liberará tu lugar en el evento.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={isLoading} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold bg-white transition-colors">Volver</button>
          <button onClick={onConfirm} disabled={isLoading} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-red-600/20 border-0">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />} Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedbackModal({ event, onClose }: { event: any; onClose: () => void; }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    eventService.getComments(event.id).then(setComments).catch(console.error);
  }, [event.id]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSending(true);
    try {
      const added = await eventService.addComment(event.id, newComment);
      setComments([added, ...comments]); // Añadirlo visualmente rápido
      setNewComment('');
      toast.success('¡Gracias por tu comentario!');
    } catch (err) { toast.error('Error al enviar comentario'); }
    finally { setIsSending(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900 text-lg truncate pr-4">{event.title}</h2>
          <button onClick={onClose} className="border-0 bg-transparent cursor-pointer text-gray-400 hover:text-gray-700"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-gray-50/50">
          {/* Bloque del Resumen Oficial */}
          {event.summary && (
            <div className="bg-primary/5 p-5 rounded-xl border border-primary/10">
              <h3 className="font-bold text-primary text-sm mb-2 flex items-center gap-2"><FileText className="w-4 h-4"/> Resumen del Organizador</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{event.summary}</p>
            </div>
          )}

          {/* Caja para comentar */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
            <textarea
              value={newComment} onChange={e => setNewComment(e.target.value)}
              placeholder="¿Qué te pareció el evento? Deja un comentario..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent bg-gray-55 focus:bg-white transition-all resize-none text-sm h-24"
            />
            <button onClick={handleSubmit} disabled={isSending || !newComment.trim()} className="self-end bg-accent text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2 border-0 cursor-pointer shadow-md">
              {isSending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>} Enviar
            </button>
          </div>

          {/* Lista de comentarios */}
          <div>
            <h3 className="font-bold text-gray-800 text-sm mb-3">Comentarios de la comunidad</h3>
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm text-gray-900">{c.user?.name || 'Tú'}</span>
                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString('es-MX')}</span>
                  </div>
                  <p className="text-sm text-gray-600">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QRCodes() {
  const { hasRole } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQR, setSelectedQR] = useState<Registration | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null); // Estado para el modal
  const [feedbackEvent, setFeedbackEvent] = useState<any>(null);

  const load = () => {
    setIsLoading(true);
    attendeeService.getMyRegistrations().then(setRegistrations).catch((err) => setError(err.message)).finally(() => setIsLoading(false));
  };

  useEffect(() => { if (hasRole('attendee')) load(); else setIsLoading(false); }, []);

  // Función ejecutada por el Modal
  const executeCancel = async () => {
    if (!confirmCancelId) return;
    setCancelling(confirmCancelId);
    try {
      await attendeeService.cancelRegistration(confirmCancelId);
      toast.success('Registro cancelado exitosamente'); // Reemplaza al alert
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cancelar'); // Reemplaza al alert
    } finally {
      setCancelling(null);
      setConfirmCancelId(null);
    }
  };

  if (!hasRole('attendee')) return <div className="p-8"><p>Sección solo para asistentes.</p></div>;

  const upcomingRegistrations = registrations.filter(reg => reg.event?.status !== 'finished');

  return (
    <div className="p-8 md:p-10 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mis Códigos QR</h1>
        <p className="text-muted-foreground text-base">Tus registros y códigos de acceso a eventos</p>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-semibold">{error}</div>}

      {isLoading ? (
        <div className="flex justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-muted-foreground" /></div>
      ) : upcomingRegistrations.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground bg-white rounded-2xl border border-border p-8 shadow-sm">
          <QrCode className="w-16 h-16 mx-auto mb-4 opacity-30 text-primary" />
          <p className="text-lg font-medium text-gray-650">No tienes eventos próximos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingRegistrations.map((reg) => (
            <div key={reg.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-muted flex justify-center p-6 cursor-pointer hover:bg-muted/70" onClick={() => setSelectedQR(reg)}>
                {reg.qrCode?.qrImageUrl ? <img src={reg.qrCode.qrImageUrl} alt="QR Code" className="w-32 h-32 object-contain rounded-lg shadow-sm" /> : <QrCode className="w-16 h-16 opacity-40" />}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 mb-2 truncate">{reg.event?.title ?? 'Evento'}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1.5 font-semibold"><Calendar className="w-4 h-4 text-accent" /><span>{reg.event ? new Date(reg.event.startDate).toLocaleDateString('es-MX') : '—'}</span></div>
                <div className="flex items-center justify-between mt-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[reg.status]}`}>{STATUS_LABEL[reg.status]}</span>
                  {reg.status === 'confirmed' && (
                    <button onClick={() => setConfirmCancelId(reg.id)} disabled={cancelling === reg.id} className="text-xs text-red-500 hover:text-red-750 font-bold bg-transparent border-0 cursor-pointer hover:underline">
                      Cancelar registro
                    </button>
                  )}
                </div>
                {reg.event?.status === 'finished' && (
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    <button
                      onClick={() => setFeedbackEvent(reg.event)}
                      className="w-full bg-primary/10 text-primary hover:bg-primary/20 py-2.5 rounded-xl text-sm font-bold transition-all border-0 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" /> Ver Resumen y Opinar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Renderizado de Modales */}
      {confirmCancelId && (
        <ConfirmCancelModal 
          isLoading={cancelling === confirmCancelId} 
          onConfirm={executeCancel} 
          onCancel={() => setConfirmCancelId(null)} 
        />
      )}

      {selectedQR && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedQR(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-4"><h2 className="font-bold">{selectedQR.event?.title}</h2><button onClick={() => setSelectedQR(null)} className="border-0 bg-transparent cursor-pointer"><X className="w-5 h-5" /></button></div>
            {selectedQR.qrCode?.qrImageUrl && <img src={selectedQR.qrCode.qrImageUrl} className="w-full aspect-square object-contain mb-4 rounded-xl" />}
          </div>
        </div>
      )}
      {feedbackEvent && <FeedbackModal event={feedbackEvent} onClose={() => setFeedbackEvent(null)} />}
    </div>
  );
}
