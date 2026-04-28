import { LayoutDashboard, Calendar, Users, QrCode, ScanLine, BarChart3, Globe, LogOut } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: 'dashboard' | 'events' | 'participants' | 'qr-codes' | 'qr-scanner' | 'reports' | 'public') => void;
  onLogout: () => void;
}

export default function Sidebar({ currentView, onNavigate, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'Eventos', icon: Calendar },
    { id: 'qr-codes', label: 'Códigos QR', icon: QrCode },
    { id: 'qr-scanner', label: 'Escanear QR', icon: ScanLine },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
    { id: 'public', label: 'Vista Pública', icon: Globe },
  ];

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="bg-secondary p-2 rounded-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl">EventCore</h1>
            <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'hover:bg-sidebar-accent text-sidebar-foreground/80'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
