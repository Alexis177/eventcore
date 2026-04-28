import { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Search, CheckCircle } from 'lucide-react';

interface PublicEvent {
  id: number;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  capacity: number;
  registered: number;
  category: string;
  image: string;
}

export default function PublicView() {
  const [events] = useState<PublicEvent[]>([
    {
      id: 1,
      name: 'Workshop de React Avanzado',
      date: '2026-05-02',
      time: '10:00 AM',
      location: 'Auditorio Principal',
      description: 'Aprende técnicas avanzadas de React, hooks personalizados, y optimización de rendimiento.',
      capacity: 50,
      registered: 45,
      category: 'Workshop',
      image: 'react',
    },
    {
      id: 2,
      name: 'Conferencia de Inteligencia Artificial',
      date: '2026-04-28',
      time: '2:00 PM',
      location: 'Centro de Convenciones',
      description: 'Descubre las últimas tendencias en IA, Machine Learning y Deep Learning.',
      capacity: 150,
      registered: 120,
      category: 'Conferencia',
      image: 'ai',
    },
    {
      id: 3,
      name: 'Networking Tech Startups',
      date: '2026-05-10',
      time: '6:00 PM',
      location: 'Hotel Miraflores',
      description: 'Conecta con fundadores, emprendedores y profesionales del sector tecnológico.',
      capacity: 80,
      registered: 35,
      category: 'Networking',
      image: 'networking',
    },
    {
      id: 4,
      name: 'Hackathon 48 Horas',
      date: '2026-05-15',
      time: '9:00 AM',
      location: 'Campus Universitario',
      description: 'Participa en un desafío de 48 horas para crear soluciones innovadoras.',
      capacity: 100,
      registered: 35,
      category: 'Hackathon',
      image: 'hackathon',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null);
  const [registrationForm, setRegistrationForm] = useState({ name: '', email: '', phone: '' });
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = ['all', 'Workshop', 'Conferencia', 'Networking', 'Hackathon'];

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedEvent(null);
      setRegistrationForm({ name: '', email: '', phone: '' });
    }, 3000);
  };

  const getGradient = (image: string) => {
    const gradients: { [key: string]: string } = {
      react: 'from-blue-500 to-cyan-500',
      ai: 'from-purple-500 to-pink-500',
      networking: 'from-green-500 to-teal-500',
      hackathon: 'from-orange-500 to-red-500',
    };
    return gradients[image] || 'from-gray-500 to-gray-700';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-primary via-primary to-accent text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="w-12 h-12" />
          </div>
          <h1 className="text-5xl mb-4">EventCore</h1>
          <p className="text-xl opacity-90 mb-8">Descubre y regístrate en eventos increíbles</p>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar eventos..."
              className="w-full pl-12 pr-4 py-4 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border hover:bg-muted'
              }`}
            >
              {category === 'all' ? 'Todos' : category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const spotsLeft = event.capacity - event.registered;
            const percentageFull = (event.registered / event.capacity) * 100;

            return (
              <div
                key={event.id}
                className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className={`h-40 bg-gradient-to-br ${getGradient(event.image)} flex items-center justify-center`}>
                  <Calendar className="w-16 h-16 text-white opacity-50" />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                      {event.category}
                    </span>
                    <span
                      className={`text-sm ${
                        spotsLeft < 10 ? 'text-destructive' : 'text-secondary'
                      }`}
                    >
                      {spotsLeft} cupos
                    </span>
                  </div>
                  <h3 className="text-xl mb-3">{event.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
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
                      className={`h-2 rounded-full transition-all ${
                        percentageFull > 90 ? 'bg-destructive' : 'bg-secondary'
                      }`}
                      style={{ width: `${percentageFull}%` }}
                    ></div>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(event)}
                    disabled={spotsLeft === 0}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {spotsLeft === 0 ? 'Cupos Agotados' : 'Registrarse'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl mb-2">No se encontraron eventos</h3>
            <p className="text-muted-foreground">Intenta con otra búsqueda o categoría</p>
          </div>
        )}
      </div>

      {selectedEvent && !showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedEvent(null)}>
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl mb-2">Registro para evento</h2>
            <p className="text-muted-foreground mb-6">{selectedEvent.name}</p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="reg-name" className="block mb-2">
                  Nombre Completo
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={registrationForm.name}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-input-background"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              <div>
                <label htmlFor="reg-email" className="block mb-2">
                  Correo Electrónico
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={registrationForm.email}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-input-background"
                  placeholder="juan@email.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="reg-phone" className="block mb-2">
                  Teléfono
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={registrationForm.phone}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-input-background"
                  placeholder="+51 999 999 999"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Confirmar Registro
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 border border-border py-3 rounded-lg hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="bg-secondary/10 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-secondary" />
            </div>
            <h2 className="text-2xl mb-2 text-secondary">¡Registro Exitoso!</h2>
            <p className="text-muted-foreground mb-4">
              Te hemos enviado un correo de confirmación con tu código QR.
            </p>
            <p className="text-sm text-muted-foreground">
              Guarda tu QR para registrar tu asistencia el día del evento.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
