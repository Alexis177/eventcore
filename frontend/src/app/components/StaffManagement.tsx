import { useEffect, useState } from 'react';
import { Plus, Search, Loader2, Users, CheckCircle, XCircle, Eye, EyeOff, X, ScanLine } from 'lucide-react';
import { toast } from 'sonner';
import { staffService } from '../services/staffService';
import type { User } from '../types';

interface CreateStaffFormProps { onClose: () => void; onCreated: () => void; }

function CreateStaffForm({ onClose, onCreated }: CreateStaffFormProps) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await staffService.createStaff(form);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear staff');
    } finally {
      setIsLoading(false);
    }
  };

  const inp = 'w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm bg-gray-50 focus:bg-white text-gray-900 transition-all shadow-sm';
  const lbl = 'block text-sm font-semibold text-gray-700 mb-1.5';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-secondary/10 p-2.5 rounded-xl">
              <ScanLine className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Nuevo Staff</h2>
              <p className="text-xs text-gray-500 font-medium">Acceso al escáner QR</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer border-0 bg-transparent">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-750 rounded-xl text-sm font-semibold">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={lbl}>Nombre completo *</label>
            <input type="text" value={form.name} onChange={set('name')}
              className={inp} placeholder="Nombre del staff" required minLength={2} />
          </div>
          <div>
            <label className={lbl}>Email *</label>
            <input type="email" value={form.email} onChange={set('email')}
              className={inp} placeholder="correo@ejemplo.com" required />
          </div>
          <div>
            <label className={lbl}>Contraseña *</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
                className={`${inp} pr-10`} placeholder="Mínimo 6 caracteres" required minLength={6} />
              <button type="button" onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer border-0 bg-transparent">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-semibold cursor-pointer bg-white">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-2.5 bg-secondary text-white rounded-xl hover:bg-secondary/90 text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-0 shadow-md">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Creando...' : 'Crear staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StaffManagement() {
  const [staff, setStaff] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    staffService.listStaff()
      .then(setStaff)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      await staffService.toggleStaffStatus(id);
      toast.success('Estado del staff actualizado'); // Feedback extra
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar estado'); // Reemplaza al alert
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreated = () => {
    setShowForm(false);
    setSuccessMsg('Staff creado exitosamente');
    setTimeout(() => setSuccessMsg(null), 3000);
    load();
  };

  const filtered = staff.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 md:p-10 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Staff</h1>
          <p className="text-gray-500 text-base">Gestiona los validadores de QR</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-secondary text-white px-5 py-3 rounded-xl hover:bg-secondary/90 transition-all text-sm font-bold shadow-lg shadow-secondary/20 cursor-pointer border-0 shrink-0">
          <Plus className="w-5 h-5" /> Nuevo staff
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {[
          { label: 'Total', value: staff.length, color: 'text-secondary bg-secondary/10' },
          { label: 'Activos', value: staff.filter((s) => s.isActive).length, color: 'text-green-700 bg-green-50 border border-green-200/50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <p className={`text-3xl font-bold mb-1 inline-block px-4 py-1.5 rounded-xl ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-sm text-gray-500 mt-2 font-semibold">{stat.label}</p>
          </div>
        ))}
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2 font-semibold">
          <CheckCircle className="w-4 h-4 shrink-0" />{successMsg}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">{error}</div>
      )}

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Buscar staff..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm bg-gray-50 focus:bg-white text-gray-900 transition-all shadow-sm" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400 bg-white rounded-2xl border border-border p-8 shadow-sm animate-fade-in">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-30 text-secondary" />
          <p className="text-lg font-medium text-gray-650">{staff.length === 0 ? 'Sin staff registrado' : 'Sin resultados'}</p>
          {staff.length === 0 && (
            <button onClick={() => setShowForm(true)} className="mt-4 text-secondary hover:underline text-sm font-bold bg-transparent border-0 cursor-pointer">
              Agregar el primero
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
          {filtered.map((member) => {
            const initials = member.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
            return (
              <div key={member.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-gray-900 truncate">{member.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                      member.isActive ? 'bg-green-100 text-green-700 border border-green-200/50' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {member.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate font-medium">{member.email}</p>
                  <p className="text-xs text-gray-450 mt-1.5 font-medium">
                    {new Date(member.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(member.id)}
                  disabled={togglingId === member.id}
                  className={`p-2.5 rounded-xl transition-colors shrink-0 disabled:opacity-50 cursor-pointer border-0 bg-transparent ${
                    member.isActive
                      ? 'text-red-400 hover:bg-red-50 hover:text-red-650'
                      : 'text-green-500 hover:bg-green-50 hover:text-green-700'
                  }`}
                >
                  {togglingId === member.id
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : member.isActive ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />
                  }
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <CreateStaffForm onClose={() => setShowForm(false)} onCreated={handleCreated} />}
    </div>
  );
}
