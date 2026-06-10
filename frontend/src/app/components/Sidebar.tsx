import {
  Calendar, LayoutDashboard, Users, QrCode,
  ScanLine, BarChart3, Globe, LogOut, ShieldCheck, UserCog,
} from 'lucide-react';
import type { UserRole } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: any) => void;
  onLogout: () => void;
  userRole?: UserRole;
}

const allNavItems = [
  { id: 'dashboard',    label: 'Dashboard',     icon: LayoutDashboard, roles: ['admin', 'organizer', 'attendee', 'staff'] },
  { id: 'organizers',   label: 'Organizadores', icon: ShieldCheck,     roles: ['admin'] },
  { id: 'users',        label: 'Usuarios',      icon: UserCog,         roles: ['admin'] },
  { id: 'staff',        label: 'Staff',         icon: ScanLine,        roles: ['organizer', 'admin'] },
  { id: 'events',       label: 'Eventos',       icon: Calendar,        roles: ['admin', 'organizer'] },
  { id: 'participants', label: 'Participantes', icon: Users,           roles: ['admin', 'organizer'] },
  { id: 'qr-codes',     label: 'Mis QR',        icon: QrCode,          roles: ['attendee'] },
  { id: 'profile',      label: 'Mi Perfil',     icon: UserCog,         roles: ['attendee'] }, // <-- CAMBIO: Exclusivo para Asistentes (Usuarios)
  { id: 'qr-scanner',   label: 'Escáner QR',    icon: ScanLine,        roles: ['staff'] },
  { id: 'reports',      label: 'Reportes',      icon: BarChart3,       roles: ['admin', 'organizer'] },
  { id: 'public',       label: 'Catálogo',      icon: Globe,           roles: ['admin', 'organizer', 'attendee', 'staff'] },
];

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrador', organizer: 'Organizador',
  attendee: 'Asistente', staff: 'Staff',
};

export default function Sidebar({ currentView, onNavigate, onLogout, userRole }: SidebarProps) {
  const navItems = allNavItems.filter((item) => !userRole || item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-primary border-r border-primary flex flex-col shadow-xl shrink-0 text-white">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2.5 rounded-xl shadow-sm">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight">EventCore</span>
            {userRole && <p className="text-xs text-accent font-medium mt-0.5">{ROLE_LABEL[userRole]}</p>}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer border-0 bg-transparent text-left ${
                isActive 
                  ? 'bg-accent/20 text-accent font-bold shadow-sm' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}>
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-accent' : 'opacity-70'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer font-medium border-0 bg-transparent text-left">
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
