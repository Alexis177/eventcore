import { useEffect, useState } from 'react';
import {
  Plus, Search, Loader2, Users, CheckCircle,
  XCircle, Eye, EyeOff, X, ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '../services/adminService';
import type { User } from '../types';

interface CreateOrganizerFormProps {
  onClose: () => void;
  onCreated: () => void;
}

function CreateOrganizerForm({ onClose, onCreated }: CreateOrganizerFormProps) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await adminService.createOrganizer(form);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear organizador');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm bg-gray-55 focus:bg-white text-foreground transition-all shadow-sm';
  const labelClass = 'block text-sm font-semibold text-foreground mb-1.5';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Nuevo Organizador</h2>
              <p className="text-xs text-muted-foreground">Alta interna — no pública</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-0 bg-transparent">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nombre completo *</label>
            <input
              type="text" value={form.name} onChange={set('name')}
              className={inputClass} placeholder="Nombre del organizador"
              required minLength={2}
            />
          </div>

          <div>
            <label className={labelClass}>Email *</label>
            <input
              type="email" value={form.email} onChange={set('email')}
              className={inputClass} placeholder="correo@ejemplo.com" required
            />
          </div>

          <div>
            <label className={labelClass}>Contraseña *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password} onChange={set('password')}
                className={`${inputClass} pr-10`}
                placeholder="Mínimo 8 caracteres" required minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer border-0 bg-transparent"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Mínimo 8 caracteres</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-input text-foreground rounded-xl hover:bg-muted/50 transition-colors text-sm font-semibold cursor-pointer bg-white"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={isLoading}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-0 shadow-md"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Creando...' : 'Crear organizador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface OrganizerCardProps {
  organizer: User;
  onToggle: (id: string) => void;
  toggling: boolean;
}

function OrganizerCard({ organizer, onToggle, toggling }: OrganizerCardProps) {
  const initials = organizer.name
    .split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-bold text-foreground truncate">{organizer.name}</p>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
            organizer.isActive ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-muted text-muted-foreground'
          }`}>
            {organizer.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate font-medium">{organizer.email}</p>
        <p className="text-xs text-muted-foreground mt-1.5 font-medium">
          Creado: {new Date(organizer.createdAt).toLocaleDateString('es-MX', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </p>
      </div>

      <button
        onClick={() => onToggle(organizer.id)}
        disabled={toggling}
        title={organizer.isActive ? 'Desactivar' : 'Activar'}
        className={`p-2 rounded-xl transition-colors shrink-0 disabled:opacity-50 cursor-pointer border-0 bg-transparent ${
          organizer.isActive
            ? 'text-destructive hover:bg-destructive/10'
            : 'text-green-600 hover:bg-green-500/10'
        }`}
      >
        {toggling ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : organizer.isActive ? (
          <XCircle className="w-5 h-5" />
        ) : (
          <CheckCircle className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}

export default function OrganizerManagement() {
  const [organizers, setOrganizers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const load = () => {
    setIsLoading(true);
    adminService.listOrganizers()
      .then(setOrganizers)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      await adminService.toggleOrganizerStatus(id);
      toast.success('Estado del organizador actualizado'); // Feedback extra
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar estado'); // Reemplaza al alert
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreated = () => {
    setShowForm(false);
    setSuccessMsg('Organizador creado exitosamente');
    setTimeout(() => setSuccessMsg(null), 3500);
    load();
  };

  const filtered = organizers
    .filter((o) => {
      if (filterActive === 'active') return o.isActive;
      if (filterActive === 'inactive') return !o.isActive;
      return true;
    })
    .filter((o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase())
    );

  const activeCount = organizers.filter((o) => o.isActive).length;
  const inactiveCount = organizers.filter((o) => !o.isActive).length;

  return (
    <div className="p-8 md:p-10 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Organizadores</h1>
          <p className="text-muted-foreground text-base">Gestiona los organizadores de la plataforma</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl hover:bg-primary/90 transition-all text-sm font-bold shadow-lg shadow-primary/20 cursor-pointer border-0 shrink-0"
        >
          <Plus className="w-5 h-5" />
          Nuevo organizador
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total', value: organizers.length, color: 'text-primary bg-primary/10' },
          { label: 'Activos', value: activeCount, color: 'text-green-600 bg-green-500/10 border border-green-500/20' },
          { label: 'Inactivos', value: inactiveCount, color: 'text-muted-foreground bg-muted' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border shadow-sm p-5 text-center">
            <p className={`text-3xl font-bold mb-1 inline-block px-4 py-1.5 rounded-xl ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground mt-2 font-semibold">{stat.label}</p>
          </div>
        ))}
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text" placeholder="Buscar por nombre o email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-input-background text-base text-foreground shadow-sm transition-all"
          />
        </div>
        <div className="flex rounded-xl border border-border overflow-hidden text-sm bg-card shrink-0">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f} onClick={() => setFilterActive(f)}
              className={`px-4 py-3.5 transition-all font-bold cursor-pointer border-0 ${
                filterActive === f
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Inactivos'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground bg-white rounded-2xl border border-border p-8 shadow-sm">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-30 text-primary" />
          <p className="text-lg font-medium text-gray-650">
            {organizers.length === 0 ? 'Sin organizadores registrados' : 'No hay resultados'}
          </p>
          {organizers.length === 0 && (
            <button onClick={() => setShowForm(true)} className="mt-4 text-primary hover:underline text-sm font-bold bg-transparent border-0 cursor-pointer">
              Crear el primero
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
          {filtered.map((organizer) => (
            <OrganizerCard
              key={organizer.id}
              organizer={organizer}
              onToggle={handleToggle}
              toggling={togglingId === organizer.id}
            />
          ))}
        </div>
      )}

      {showForm && (
        <CreateOrganizerForm onClose={() => setShowForm(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
