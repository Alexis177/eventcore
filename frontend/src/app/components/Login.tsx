import { useState } from 'react';
import { LogIn, UserPlus, Loader2, CalendarCheck, QrCode, LineChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  const inp = 'w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-base bg-gray-50 focus:bg-white text-gray-900 transition-all shadow-sm';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-background font-sans">
      
      {/* PANEL IZQUIERDO/SUPERIOR: Presentación del Sistema (Adaptable a móviles y escritorio) */}
      <div className="w-full lg:w-5/12 bg-primary text-white p-8 lg:p-12 relative overflow-hidden shrink-0 flex flex-col justify-between">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#08325a] via-[#08325a] to-[#9d1c34] opacity-95 z-0"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent rounded-full blur-3xl opacity-20 z-0"></div>
        
        <div className="relative z-10 flex flex-col justify-center flex-1 pb-10">
          <div className="flex items-center gap-4 mb-8">
            <img 
              src="/logo.jpg" 
              alt="EventCore Logo" 
              className="h-16 w-16 lg:h-24 lg:w-24 object-contain rounded-2xl shadow-xl bg-white p-2 border border-white/10" 
            />
            <div>
              <span className="text-2xl lg:text-3xl font-extrabold tracking-tight block">EventCore</span>
              <p className="text-white/60 text-xs lg:text-sm font-medium">Gestión integral de eventos</p>
            </div>
          </div>

          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-4 lg:mb-6">
            Gestión inteligente <br />
            <span className="text-accent">para tus eventos.</span>
          </h1>
          <p className="text-sm lg:text-base xl:text-lg text-white/80 max-w-md mb-8 lg:mb-12 leading-relaxed">
            Centraliza la organización, agiliza el registro y controla el acceso en tiempo real en una sola plataforma institucional.
          </p>

          <div className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <CalendarCheck className="w-5 h-5 lg:w-6 lg:h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm lg:text-base">Organización Centralizada</h3>
                <p className="text-xs lg:text-sm text-white/60">Olvídate de las hojas de cálculo dispersas.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <QrCode className="w-5 h-5 lg:w-6 lg:h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm lg:text-base">Acceso Rápido con QR</h3>
                <p className="text-xs lg:text-sm text-white/60">Evita filas y valida entradas en segundos.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <LineChart className="w-5 h-5 lg:w-6 lg:h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm lg:text-base">Reportes en Tiempo Real</h3>
                <p className="text-xs lg:text-sm text-white/60">Métricas exactas de asistencia y aforo.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs lg:text-sm text-white/50 font-medium pt-6 border-t border-white/10">
          © {new Date().getFullYear()} EventCore. Todos los derechos reservados.
        </div>
      </div>

      {/* PANEL DERECHO/INFERIOR: Formulario de Login/Registro */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 xl:p-24 relative bg-gray-50/50">
        <div className="w-full max-w-md">
          {/* Tarjeta del Formulario */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
            
            {/* Selector de Pestañas */}
            <div className="flex border-b border-gray-100">
              <button
                type="button"
                onClick={() => { setTab('login'); setError(null); }}
                className={`flex-1 py-4 text-base font-semibold transition-all cursor-pointer ${
                  tab === 'login'
                    ? 'text-primary border-b-2 border-primary bg-white'
                    : 'text-gray-400 hover:text-gray-600 bg-gray-50/50'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setError(null); }}
                className={`flex-1 py-4 text-base font-semibold transition-all cursor-pointer ${
                  tab === 'register'
                    ? 'text-primary border-b-2 border-primary bg-white'
                    : 'text-gray-400 hover:text-gray-600 bg-gray-50/50'
                }`}
              >
                Crear cuenta
              </button>
            </div>

            <div className="p-8">
              {/* Mensaje Informativo para Registro */}
              {tab === 'register' && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-6 flex gap-3 items-start">
                  <div className="p-1 bg-accent/20 rounded-full text-primary mt-0.5">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-primary font-medium leading-relaxed">
                    Tu cuenta se creará con el rol de <span className="font-bold">Asistente</span>. Para organizar eventos, contacta al administrador del sistema.
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                  <span className="block w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {tab === 'register' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text" value={form.name} onChange={set('name')}
                      className={inp} placeholder="Ej. Juan Pérez" required minLength={2}
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email" value={form.email} onChange={set('email')}
                    className={inp} placeholder="usuario@institucion.edu" required disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password" value={form.password} onChange={set('password')}
                    className={inp} placeholder="••••••••" required
                    minLength={6} disabled={isLoading}
                  />
                </div>

                <button
                  type="submit" disabled={isLoading}
                  className="w-full bg-secondary hover:bg-[#85162a] text-white py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 font-bold text-base mt-4 shadow-lg shadow-secondary/20 hover:shadow-secondary/30 cursor-pointer border-0"
                >
                  {isLoading
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : tab === 'login'
                      ? <LogIn className="w-5 h-5" />
                      : <UserPlus className="w-5 h-5" />
                  }
                  {isLoading
                    ? 'Procesando solicitud...'
                    : tab === 'login' ? 'Acceder al sistema' : 'Registrarme ahora'
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
