import { Calendar, Users, CheckCircle, TrendingUp, Plus, QrCode, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const stats = [
    {
      title: 'Eventos Activos',
      value: '12',
      change: '+3 este mes',
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Asistentes',
      value: '1,248',
      change: '+124 esta semana',
      icon: Users,
      color: 'bg-secondary',
    },
    {
      title: 'Asistencias Confirmadas',
      value: '892',
      change: '71.5% tasa',
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
    {
      title: 'Tasa de Crecimiento',
      value: '+28%',
      change: 'vs mes anterior',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  const attendanceData = [
    { name: 'Lun', registrados: 45, asistieron: 38 },
    { name: 'Mar', registrados: 52, asistieron: 45 },
    { name: 'Mié', registrados: 38, asistieron: 32 },
    { name: 'Jue', registrados: 65, asistieron: 58 },
    { name: 'Vie', registrados: 48, asistieron: 42 },
    { name: 'Sáb', registrados: 72, asistieron: 68 },
    { name: 'Dom', registrados: 35, asistieron: 30 },
  ];

  const eventTrendData = [
    { month: 'Ene', eventos: 8 },
    { month: 'Feb', eventos: 12 },
    { month: 'Mar', eventos: 10 },
    { month: 'Abr', eventos: 15 },
  ];

  const recentEvents = [
    { id: 1, name: 'Workshop de React', date: '2026-05-02', attendees: 45, status: 'Próximo' },
    { id: 2, name: 'Conferencia de IA', date: '2026-04-28', attendees: 120, status: 'En curso' },
    { id: 3, name: 'Networking Tech', date: '2026-04-25', attendees: 78, status: 'Finalizado' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al panel de control de EventCore</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-xs text-secondary">{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h2 className="mb-4">Asistencia Semanal</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="registrados" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="asistieron" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Registrados</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-secondary rounded-full"></div>
              <span className="text-sm text-muted-foreground">Asistieron</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h2 className="mb-4">Tendencia de Eventos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={eventTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="eventos" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-border mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2>Eventos Recientes</h2>
          <button
            onClick={() => onNavigate('events')}
            className="text-accent hover:underline"
          >
            Ver todos
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">Evento</th>
                <th className="text-left py-3 px-4">Fecha</th>
                <th className="text-left py-3 px-4">Asistentes</th>
                <th className="text-left py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((event) => (
                <tr key={event.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4">{event.name}</td>
                  <td className="py-4 px-4 text-muted-foreground">{event.date}</td>
                  <td className="py-4 px-4">{event.attendees}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        event.status === 'Próximo'
                          ? 'bg-blue-100 text-blue-700'
                          : event.status === 'En curso'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('create-event')}
          className="bg-primary text-primary-foreground p-6 rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-4 shadow-sm"
        >
          <Plus className="w-8 h-8" />
          <div className="text-left">
            <p className="text-lg">Crear Evento</p>
            <p className="text-sm opacity-80">Nuevo evento</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('qr-scanner')}
          className="bg-secondary text-white p-6 rounded-xl hover:bg-secondary/90 transition-colors flex items-center gap-4 shadow-sm"
        >
          <QrCode className="w-8 h-8" />
          <div className="text-left">
            <p className="text-lg">Escanear QR</p>
            <p className="text-sm opacity-80">Registrar asistencia</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="bg-accent text-white p-6 rounded-xl hover:bg-accent/90 transition-colors flex items-center gap-4 shadow-sm"
        >
          <BarChart3 className="w-8 h-8" />
          <div className="text-left">
            <p className="text-lg">Ver Reportes</p>
            <p className="text-sm opacity-80">Análisis completo</p>
          </div>
        </button>
      </div>
    </div>
  );
}
