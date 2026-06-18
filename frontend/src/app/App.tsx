import { useState, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EventManagement from './components/EventManagement';
import CreateEvent from './components/CreateEvent';
import ParticipantRegistration from './components/ParticipantRegistration';
import QRCodes from './components/QRCodes';
import QRScanner from './components/QRScanner';
import Reports from './components/Reports';
import PublicView from './components/PublicView';
import EventDetail from './components/EventDetail';
import OrganizerManagement from './components/OrganizerManagement';
import UserManagement from './components/UserManagement';
import StaffManagement from './components/StaffManagement';
import Sidebar from './components/Sidebar';
import Profile from './components/Profile';
import NotFound from './pages/NotFound';
import AccessDenied from './pages/AccessDenied';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function LoginWrapper() {
  const location = useLocation();
  const tab = (location.state as any)?.tab || 'login';
  const navigate = useNavigate();
  return (
    <Login
      initialTab={tab}
      onBackToCatalog={() => navigate('/')}
    />
  );
}

function LayoutPublic() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar público premium */}
      <nav className="bg-white border-b border-gray-150 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2.5 rounded-xl shadow-sm text-white flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-primary">EventCore</span>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Catálogo Público</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { navigate('/login', { state: { tab: 'login' } }); }}
            className="text-gray-650 hover:text-primary font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm bg-transparent border-0"
          >
            Ingresar
          </button>
          <button
            onClick={() => { navigate('/login', { state: { tab: 'register' } }); }}
            className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/15 hover:shadow-primary/25 cursor-pointer text-sm border-0"
          >
            Crear cuenta
          </button>
        </div>
      </nav>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

function LayoutPrivate() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine currentView for active sidebar highlighting.
  const path = location.pathname.substring(1);
  let currentView = path.split('/')[0] || 'dashboard';
  if (currentView === 'create-event') {
    currentView = 'events';
  }

  const handleNavigate = (view: string) => {
    setIsMobileMenuOpen(false);
    navigate('/' + view);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* 1. BOTÓN HAMBURGUESA (Solo visible en celular) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-2.5 bg-primary text-white rounded-xl shadow-lg hover:bg-primary/95 transition-all flex items-center justify-center cursor-pointer border-0"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      <Sidebar 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        onLogout={logout} 
        userRole={user?.role} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 w-full h-full overflow-y-auto relative">
        {/* En móvil, le damos un poco de padding arriba (pt-16) para que el botón de hamburguesa no tape el contenido */}
        <div className="h-full w-full md:pt-0 pt-16">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<LayoutPublic />}>
        <Route path="/" element={<PublicView onSelectEvent={(id) => { setSelectedEventId(id); navigate('/event-detail'); }} />} />
        <Route path="/event-detail" element={<EventDetail eventId={selectedEventId!} onBack={() => navigate('/')} />} />
      </Route>

      <Route path="/login" element={
        <PublicOnlyRoute>
          <LoginWrapper />
        </PublicOnlyRoute>
      } />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute><LayoutPrivate /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard onNavigate={(view) => navigate('/' + view)} />} />
        
        <Route path="/organizers" element={<ProtectedRoute allowedRoles={['admin']}><OrganizerManagement /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
        
        <Route path="/staff" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><StaffManagement /></ProtectedRoute>} />
        
        <Route path="/events" element={<ProtectedRoute allowedRoles={['admin', 'organizer']}><EventManagement onCreateEvent={() => navigate('/create-event')} onSelectEvent={(id) => { setSelectedEventId(id); navigate('/participants'); }} /></ProtectedRoute>} />
        <Route path="/create-event" element={<ProtectedRoute allowedRoles={['admin', 'organizer']}><CreateEvent onBack={() => navigate('/events')} /></ProtectedRoute>} />
        <Route path="/participants" element={<ProtectedRoute allowedRoles={['admin', 'organizer']}><ParticipantRegistration eventId={selectedEventId} onBack={() => navigate('/events')} /></ProtectedRoute>} />
        
        <Route path="/qr-codes" element={<ProtectedRoute allowedRoles={['attendee']}><QRCodes /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={['attendee']}><Profile /></ProtectedRoute>} />
        
        <Route path="/qr-scanner" element={<ProtectedRoute allowedRoles={['staff']}><QRScanner /></ProtectedRoute>} />
        
        <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin', 'organizer']}><Reports /></ProtectedRoute>} />
        
        {/* Public view inside the sidebar layout when authenticated */}
        <Route path="/public" element={<PublicView onSelectEvent={(id) => { setSelectedEventId(id); navigate('/public/event-detail'); }} />} />
        <Route path="/public/event-detail" element={<EventDetail eventId={selectedEventId!} onBack={() => navigate('/public')} />} />
      </Route>

      {/* Error Routes */}
      <Route path="/no-autorizado" element={<AccessDenied />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
