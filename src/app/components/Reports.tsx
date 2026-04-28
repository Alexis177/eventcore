import { Download, TrendingUp, Users, Calendar, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function Reports() {
  const attendanceData = [
    { event: 'Workshop React', registrados: 45, asistieron: 38 },
    { event: 'Conf. IA', registrados: 120, asistieron: 95 },
    { event: 'Networking', registrados: 78, asistieron: 72 },
    { event: 'Hackathon', registrados: 35, asistieron: 32 },
    { event: 'UX/UI', registrados: 28, asistieron: 25 },
  ];

  const categoryData = [
    { name: 'Workshop', value: 35 },
    { name: 'Conferencia', value: 25 },
    { name: 'Networking', value: 20 },
    { name: 'Hackathon', value: 12 },
    { name: 'Capacitación', value: 8 },
  ];

  const monthlyTrend = [
    { month: 'Ene', eventos: 8, asistentes: 245 },
    { month: 'Feb', eventos: 12, asistentes: 389 },
    { month: 'Mar', eventos: 10, asistentes: 312 },
    { month: 'Abr', eventos: 15, asistentes: 476 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const totalRegistered = attendanceData.reduce((sum, item) => sum + item.registrados, 0);
  const totalAttended = attendanceData.reduce((sum, item) => sum + item.asistieron, 0);
  const averageAttendance = Math.round((totalAttended / totalRegistered) * 100);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2">Reportes y Análisis</h1>
          <p className="text-muted-foreground">Visualiza el rendimiento de tus eventos</p>
        </div>
        <button className="bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors flex items-center gap-2">
          <Download className="w-5 h-5" />
          Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-3xl mb-1">15</p>
          <p className="text-sm text-muted-foreground">Total Eventos</p>
          <p className="text-xs text-secondary mt-2">+3 este mes</p>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-3xl mb-1">{totalRegistered}</p>
          <p className="text-sm text-muted-foreground">Registrados</p>
          <p className="text-xs text-secondary mt-2">+124 esta semana</p>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-3xl mb-1">{totalAttended}</p>
          <p className="text-sm text-muted-foreground">Asistentes</p>
          <p className="text-xs text-secondary mt-2">71.5% tasa</p>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-3xl mb-1">{averageAttendance}%</p>
          <p className="text-sm text-muted-foreground">Asistencia Promedio</p>
          <p className="text-xs text-secondary mt-2">+5% vs anterior</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h2 className="mb-6">Asistencia por Evento</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="event" />
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
          <h2 className="mb-6">Distribución por Categoría</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-border mb-6">
        <h2 className="mb-6">Tendencia Mensual</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Line yAxisId="left" type="monotone" dataKey="eventos" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} />
            <Line yAxisId="right" type="monotone" dataKey="asistentes" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">Eventos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-secondary rounded-full"></div>
            <span className="text-sm text-muted-foreground">Asistentes</span>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h2 className="mb-6">Resumen Detallado por Evento</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-4 px-6">Evento</th>
                <th className="text-left py-4 px-6">Registrados</th>
                <th className="text-left py-4 px-6">Asistieron</th>
                <th className="text-left py-4 px-6">% Asistencia</th>
                <th className="text-left py-4 px-6">Estado</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((event, index) => {
                const percentage = Math.round((event.asistieron / event.registrados) * 100);
                return (
                  <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-6">{event.event}</td>
                    <td className="py-4 px-6">{event.registrados}</td>
                    <td className="py-4 px-6">{event.asistieron}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-muted rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-secondary h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span>{percentage}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          percentage >= 80
                            ? 'bg-green-100 text-green-700'
                            : percentage >= 60
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {percentage >= 80 ? 'Excelente' : percentage >= 60 ? 'Bueno' : 'Bajo'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
