import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Users, CheckCircle, QrCode } from 'lucide-react';
import { staffService } from '../services/staffService';
import { eventService } from '../services/eventService';
import type { CheckIn, Event, Registration } from '../types';

interface ParticipantRegistrationProps { eventId: string | null; onBack: () => void; }
type Tab = 'registrados' | 'checkins';

const REG_STATUS_COLOR: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700 border border-green-200/50',
  pending:   'bg-yellow-100 text-yellow-700 border border-yellow-200/50',
  cancelled: 'bg-gray-100 text-gray-600 border border-gray-200',
  absent:    'bg-red-100 text-red-700 border border-red-200/50',
};
const REG_STATUS_LABEL: Record<string, string> = {
  confirmed: 'Asistió', pending: 'Pendiente', cancelled: 'Cancelado', absent: 'Ausente',
};

export default function ParticipantRegistration({ eventId, onBack }: ParticipantRegistrationProps) {
  const [tab, setTab] = useState<Tab>('registrados');
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) { setIsLoading(false); return; }
    Promise.all([
      eventService.getEventById(eventId),
      eventService.getEventRegistrations(eventId),
      staffService.getEventCheckIns(eventId),
    ])
      .then(([ev, regs, ci]) => { setEvent(ev); setRegistrations(regs); setCheckIns(ci); })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [eventId]);

  const confirmedRegs = registrations.filter((r) => r.status === 'confirmed').length;

  return (
    <div className="p-8 md:p-10 max-w-7xl mx-auto animate-fade-in">
      <button onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm cursor-pointer border-0 bg-transparent font-semibold">
        <ArrowLeft className="w-4 h-4" /> Volver a eventos
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 text-primary">{event?.title ?? 'Participantes'}</h1>
        <p className="text-gray-500 text-base font-medium">
          {event?.location} {event && '—'} {event && new Date(event.startDate).toLocaleDateString('es-MX', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Capacidad', value: event?.capacity ?? '—', icon: Users, color: 'bg-primary/10 text-primary' },
          { label: 'Registrados', value: confirmedRegs, icon: QrCode, color: 'bg-green-50 text-green-600 border border-green-200/50' },
          { label: 'Check-ins', value: checkIns.length, icon: CheckCircle, color: 'bg-secondary/10 text-secondary' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1 font-semibold">{label}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-750 rounded-xl text-sm font-semibold">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-250 mb-8 bg-gray-50/50 rounded-t-xl overflow-hidden">
        {([
          { id: 'registrados' as Tab, label: 'Registrados', count: confirmedRegs },
          { id: 'checkins' as Tab, label: 'Check-ins', count: checkIns.length },
        ]).map(({ id, label, count }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-6 py-4 text-base font-bold border-b-2 -mb-px transition-all cursor-pointer ${
              tab === id ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {label}
            {count > 0 && (
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${tab === id ? 'bg-primary/15 text-primary' : 'bg-gray-100 text-gray-600'}`}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      ) : tab === 'registrados' ? (
        registrations.length === 0 ? (
          <div className="text-center py-24 text-gray-400 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <QrCode className="w-16 h-16 mx-auto mb-4 opacity-30 text-primary" />
            <p className="text-lg font-medium text-gray-650">Sin registros aún</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-55/10">
                    <th className="text-left py-3.5 px-5 text-sm font-semibold text-gray-500">Asistente</th>
                    <th className="text-left py-3.5 px-5 text-sm font-semibold text-gray-500">Email</th>
                    <th className="text-left py-3.5 px-5 text-sm font-semibold text-gray-500">Estado</th>
                    <th className="text-left py-3.5 px-5 text-sm font-semibold text-gray-500">QR usado</th>
                    <th className="text-left py-3.5 px-5 text-sm font-semibold text-gray-500">Registrado</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="border-b border-gray-55/5 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-5 text-sm font-bold text-gray-800">{reg.attendee?.name ?? '—'}</td>
                      <td className="py-4 px-5 text-sm text-gray-550 font-medium">{reg.attendee?.email ?? '—'}</td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${REG_STATUS_COLOR[reg.status]}`}>
                          {REG_STATUS_LABEL[reg.status]}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-sm font-bold">
                        {reg.qrCode?.isUsed
                          ? <span className="text-green-600">✓ Sí</span>
                          : <span className="text-gray-400">No</span>}
                      </td>
                      <td className="py-4 px-5 text-sm text-gray-500 font-medium">
                        {new Date(reg.createdAt).toLocaleDateString('es-MX')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        checkIns.length === 0 ? (
          <div className="text-center py-24 text-gray-400 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-30 text-secondary" />
            <p className="text-lg font-medium text-gray-650">Sin check-ins aún</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-55/10">
                    <th className="text-left py-3.5 px-5 text-sm font-semibold text-gray-500">Asistente</th>
                    <th className="text-left py-3.5 px-5 text-sm font-semibold text-gray-500">Email</th>
                    <th className="text-left py-3.5 px-5 text-sm font-semibold text-gray-500">Hora entrada</th>
                    <th className="text-left py-3.5 px-5 text-sm font-semibold text-gray-500">Escaneado por</th>
                  </tr>
                </thead>
                <tbody>
                  {checkIns.map((ci) => (
                    <tr key={ci.id} className="border-b border-gray-55/5 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-5 text-sm font-bold text-gray-800">{ci.qrCode?.registration?.attendee?.name ?? '—'}</td>
                      <td className="py-4 px-5 text-sm text-gray-550 font-medium">{ci.qrCode?.registration?.attendee?.email ?? '—'}</td>
                      <td className="py-4 px-5 text-sm text-gray-500 font-medium">{new Date(ci.scannedAt).toLocaleString('es-MX')}</td>
                      <td className="py-4 px-5 text-sm text-gray-500 font-medium">{ci.scannedBy?.name ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
