import { useState } from 'react';
import { Plus, Calendar, MapPin, Users, Edit, Trash2, Eye } from 'lucide-react';

interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
  capacity: number;
  registered: number;
  description: string;
  status: 'upcoming' | 'ongoing' | 'finished';
}

interface EventManagementProps {
  onCreateEvent: () => void;
  onSelectEvent: (id: number) => void;
}

export default function EventManagement({ onCreateEvent, onSelectEvent }: EventManagementProps) {
  const [events] = useState<Event[]>([
    {
      id: 1,
      name: 'Workshop de React Avanzado',
      date: '2026-05-02',
      location: 'Auditorio Principal',
      capacity: 50,
      registered: 45,
      description: 'Aprende técnicas avanzadas de React y hooks personalizados',
      status: 'upcoming',
    },
    {
      id: 2,
      name: 'Conferencia de Inteligencia Artificial',
      date: '2026-04-28',
      location: 'Centro de Convenciones',
      capacity: 150,
      registered: 120,
      description: 'Las últimas tendencias en IA y Machine Learning',
      status: 'ongoing',
    },
    {
      id: 3,
      name: 'Networking Tech Startups',
      date: '2026-04-25',
      location: 'Hotel Miraflores',
      capacity: 80,
      registered: 78,
      description: 'Conecta con fundadores y emprendedores tech',
      status: 'finished',
    },
    {
      id: 4,
      name: 'Hackathon 48 Horas',
      date: '2026-05-15',
      location: 'Campus Universitario',
      capacity: 100,
      registered: 35,
      description: 'Crea soluciones innovadoras en 48 horas',
      status: 'upcoming',
    },
    {
      id: 5,
      name: 'Taller de UX/UI Design',
      date: '2026-05-08',
      location: 'Coworking Space',
      capacity: 30,
      registered: 28,
      description: 'Fundamentos de diseño de experiencia de usuario',
      status: 'upcoming',
    },
  ]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700';
      case 'ongoing':
        return 'bg-green-100 text-green-700';
      case 'finished':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Próximo';
      case 'ongoing':
        return 'En curso';
      case 'finished':
        return 'Finalizado';
      default:
        return status;
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2">Gestión de Eventos</h1>
          <p className="text-muted-foreground">Administra todos tus eventos en un solo lugar</p>
        </div>
        <button
          onClick={onCreateEvent}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Crear Evento
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
            }`}
          >
            Vista Cards
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
            }`}
          >
            Vista Tabla
          </button>
        </div>
        <input
          type="search"
          placeholder="Buscar eventos..."
          className="flex-1 max-w-md px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-input-background"
        />
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-32 bg-gradient-to-br from-accent to-secondary"></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg">{event.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(event.status)}`}>
                    {getStatusLabel(event.status)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>
                      {event.registered} / {event.capacity} registrados
                    </span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-4">
                  <div
                    className="bg-secondary h-2 rounded-full transition-all"
                    style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                  ></div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectEvent(event.id)}
                    className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  <button className="bg-muted px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg hover:bg-destructive/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-4 px-6">Evento</th>
                  <th className="text-left py-4 px-6">Fecha</th>
                  <th className="text-left py-4 px-6">Ubicación</th>
                  <th className="text-left py-4 px-6">Capacidad</th>
                  <th className="text-left py-4 px-6">Estado</th>
                  <th className="text-left py-4 px-6">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p>{event.name}</p>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">{event.date}</td>
                    <td className="py-4 px-6 text-muted-foreground">{event.location}</td>
                    <td className="py-4 px-6">
                      {event.registered} / {event.capacity}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(event.status)}`}>
                        {getStatusLabel(event.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onSelectEvent(event.id)}
                          className="bg-primary text-primary-foreground px-3 py-1 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                        >
                          Ver
                        </button>
                        <button className="bg-muted px-3 py-1 rounded-lg hover:bg-muted/80 transition-colors text-sm">
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
