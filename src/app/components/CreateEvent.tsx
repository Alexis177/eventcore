import { useState } from 'react';
import { ArrowLeft, Save, Calendar, MapPin, Users, FileText, Clock } from 'lucide-react';

interface CreateEventProps {
  onBack: () => void;
}

export default function CreateEvent({ onBack }: CreateEventProps) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    description: '',
    capacity: '',
    category: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('¡Evento creado exitosamente!');
    onBack();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

      <div className="max-w-3xl">
        <h1 className="text-3xl mb-2">Crear Nuevo Evento</h1>
        <p className="text-muted-foreground mb-8">Completa la información para crear un nuevo evento</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-xl mb-6">Información Básica</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Nombre del Evento
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-input-background"
                  placeholder="Ej: Workshop de React Avanzado"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Fecha
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-input-background"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="time" className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Hora
                  </label>
                  <input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-input-background"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Ubicación
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-input-background"
                  placeholder="Ej: Auditorio Principal"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block mb-2">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-input-background resize-none"
                  placeholder="Describe de qué trata el evento..."
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="capacity" className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    Capacidad Máxima
                  </label>
                  <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-input-background"
                    placeholder="Ej: 100"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block mb-2">
                    Categoría
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-input-background"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="workshop">Workshop</option>
                    <option value="conference">Conferencia</option>
                    <option value="networking">Networking</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="training">Capacitación</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Guardar Evento
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
