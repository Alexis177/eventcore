import { useState } from 'react';
import { ArrowLeft, UserPlus, Download, Mail, CheckCircle, XCircle, Search } from 'lucide-react';

interface Participant {
  id: number;
  name: string;
  email: string;
  status: 'registered' | 'attended' | 'absent';
  registrationDate: string;
}

interface ParticipantRegistrationProps {
  eventId: number | null;
  onBack: () => void;
}

export default function ParticipantRegistration({ eventId, onBack }: ParticipantRegistrationProps) {
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan.perez@email.com',
      status: 'attended',
      registrationDate: '2026-04-20',
    },
    {
      id: 2,
      name: 'María González',
      email: 'maria.gonzalez@email.com',
      status: 'attended',
      registrationDate: '2026-04-21',
    },
    {
      id: 3,
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@email.com',
      status: 'registered',
      registrationDate: '2026-04-22',
    },
    {
      id: 4,
      name: 'Ana Martínez',
      email: 'ana.martinez@email.com',
      status: 'registered',
      registrationDate: '2026-04-23',
    },
    {
      id: 5,
      name: 'Luis Fernández',
      email: 'luis.fernandez@email.com',
      status: 'absent',
      registrationDate: '2026-04-19',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newParticipant, setNewParticipant] = useState({ name: '', email: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    const participant: Participant = {
      id: participants.length + 1,
      name: newParticipant.name,
      email: newParticipant.email,
      status: 'registered',
      registrationDate: new Date().toISOString().split('T')[0],
    };
    setParticipants([...participants, participant]);
    setNewParticipant({ name: '', email: '' });
    setShowAddModal(false);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'attended':
        return { label: 'Asistió', color: 'bg-green-100 text-green-700', icon: CheckCircle };
      case 'registered':
        return { label: 'Registrado', color: 'bg-blue-100 text-blue-700', icon: Mail };
      case 'absent':
        return { label: 'Ausente', color: 'bg-red-100 text-red-700', icon: XCircle };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: Mail };
    }
  };

  const filteredParticipants = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: participants.length,
    attended: participants.filter((p) => p.status === 'attended').length,
    registered: participants.filter((p) => p.status === 'registered').length,
  };

  return (
    <div className="p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Eventos
      </button>

      <div className="mb-8">
        <h1 className="text-3xl mb-2">Registro de Participantes</h1>
        <p className="text-muted-foreground">Workshop de React Avanzado</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Registrados</p>
              <p className="text-3xl">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Asistieron</p>
              <p className="text-3xl">{stats.attended}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tasa de Asistencia</p>
              <p className="text-3xl">{Math.round((stats.attended / stats.total) * 100)}%</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar participantes..."
              className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-input-background"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 md:flex-initial bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Agregar Participante
            </button>
            <button className="flex-1 md:flex-initial bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Exportar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-4 px-6">Nombre</th>
                <th className="text-left py-4 px-6">Correo</th>
                <th className="text-left py-4 px-6">Fecha Registro</th>
                <th className="text-left py-4 px-6">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((participant) => {
                const statusInfo = getStatusInfo(participant.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <tr key={participant.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-6">{participant.name}</td>
                    <td className="py-4 px-6 text-muted-foreground">{participant.email}</td>
                    <td className="py-4 px-6 text-muted-foreground">{participant.registrationDate}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 w-fit ${statusInfo.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {statusInfo.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl mb-6">Agregar Participante</h2>
            <form onSubmit={handleAddParticipant} className="space-y-4">
              <div>
                <label htmlFor="participant-name" className="block mb-2">
                  Nombre Completo
                </label>
                <input
                  id="participant-name"
                  type="text"
                  value={newParticipant.name}
                  onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-input-background"
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>
              <div>
                <label htmlFor="participant-email" className="block mb-2">
                  Correo Electrónico
                </label>
                <input
                  id="participant-email"
                  type="email"
                  value={newParticipant.email}
                  onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-input-background"
                  placeholder="juan@email.com"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-border py-3 rounded-lg hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
