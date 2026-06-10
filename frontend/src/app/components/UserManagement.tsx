import { useEffect, useState } from 'react';
import { Search, Loader2, Users, ShieldCheck, Calendar, QrCode, ScanLine } from 'lucide-react';
import { adminService } from '../services/adminService';
import type { User, UserRole } from '../types';

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; icon: any }> = {
  admin:     { label: 'Admin',       color: 'bg-destructive/15 text-destructive border border-destructive/20',    icon: ShieldCheck },
  organizer: { label: 'Organizador', color: 'bg-primary/15 text-primary border border-primary/20',            icon: Calendar },
  attendee:  { label: 'Asistente',   color: 'bg-green-500/10 text-green-600 border border-green-500/20',        icon: QrCode },
  staff:     { label: 'Staff',       color: 'bg-secondary/15 text-secondary border border-secondary/20',      icon: ScanLine },
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');

  useEffect(() => {
    adminService.listAllUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = users
    .filter((u) => filterRole === 'all' || u.role === filterRole)
    .filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );

  const countByRole = (role: UserRole) => users.filter((u) => u.role === role).length;

  return (
    <div className="p-8 md:p-10 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Usuarios</h1>
        <p className="text-muted-foreground text-base">Vista global de todos los usuarios registrados</p>
      </div>

      {/* Stat cards por rol */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG[UserRole]][]).map(
          ([role, { label, color, icon: Icon }]) => (
            <div
              key={role}
              onClick={() => setFilterRole(filterRole === role ? 'all' : role)}
              className={`bg-card rounded-2xl border shadow-sm p-5 cursor-pointer transition-all hover:shadow-md ${
                filterRole === role
                  ? 'border-accent ring-2 ring-accent/20'
                  : 'border-border'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{countByRole(role)}</p>
              <p className="text-sm text-muted-foreground mt-1 font-semibold">{label}s</p>
            </div>
          )
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Buscador y filtro */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text" placeholder="Buscar por nombre o email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-input-background text-base text-foreground shadow-sm transition-all"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as UserRole | 'all')}
          className="px-4 py-3.5 border border-input rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-input-background text-foreground shadow-sm transition-all cursor-pointer"
        >
          <option value="all">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="organizer">Organizador</option>
          <option value="attendee">Asistente</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground bg-white rounded-2xl border border-border p-8 shadow-sm">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No hay usuarios que coincidan</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border text-sm text-muted-foreground font-semibold">
            {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left py-3.5 px-5 text-sm font-semibold text-muted-foreground">Usuario</th>
                  <th className="text-left py-3.5 px-5 text-sm font-semibold text-muted-foreground">Email</th>
                  <th className="text-left py-3.5 px-5 text-sm font-semibold text-muted-foreground">Rol</th>
                  <th className="text-left py-3.5 px-5 text-sm font-semibold text-muted-foreground">Estado</th>
                  <th className="text-left py-3.5 px-5 text-sm font-semibold text-muted-foreground">Creado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const roleConf = ROLE_CONFIG[user.role];
                  const Icon = roleConf.icon;
                  const initials = user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
                  return (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                            {initials}
                          </div>
                          <span className="text-sm font-semibold text-foreground">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-sm text-muted-foreground font-medium">{user.email}</td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${roleConf.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {roleConf.label}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.isActive ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-muted text-muted-foreground'
                        }`}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-sm text-muted-foreground font-medium">
                        {new Date(user.createdAt).toLocaleDateString('es-MX', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
