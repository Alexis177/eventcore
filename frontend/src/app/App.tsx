import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
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

type View =
  | 'dashboard' | 'events' | 'create-event' | 'participants'
  | 'qr-codes' | 'qr-scanner' | 'reports' | 'public'
  | 'organizers' | 'users' | 'staff' | 'profile'
  | 'login'
  | 'event-detail';

function AppContent() {
  const { isAuthenticated, logout, user } = useAuth();
  const [currentView, setCurrentView] = useState<View>(isAuthenticated ? 'dashboard' : 'public');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [loginTab, setLoginTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (isAuthenticated) {
      if (currentView === 'login') {
        setCurrentView('dashboard');
      }
    } else {
      if (currentView !== 'login' && currentView !== 'public' && currentView !== 'event-detail') {
        setCurrentView('public');
      }
    }
  }, [isAuthenticated, currentView]);

  if (!isAuthenticated) {
    if (currentView === 'login') {
      return (
        <Login
          initialTab={loginTab}
          onBackToCatalog={() => setCurrentView('public')}
        />
      );
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
              onClick={() => { setLoginTab('login'); setCurrentView('login'); }}
              className="text-gray-650 hover:text-primary font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm"
            >
              Ingresar
            </button>
            <button
              onClick={() => { setLoginTab('register'); setCurrentView('login'); }}
              className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/15 hover:shadow-primary/25 cursor-pointer text-sm border-0"
            >
              Crear cuenta
            </button>
          </div>
        </nav>
        <main className="flex-1 overflow-auto">
          {currentView === 'event-detail' ? (
            <EventDetail eventId={selectedEventId!} onBack={() => setCurrentView('public')} />
          ) : (
            <PublicView onSelectEvent={(id) => { setSelectedEventId(id); setCurrentView('event-detail'); }} />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} onLogout={logout} userRole={user?.role} />
      <main className="flex-1 overflow-auto">
        {currentView === 'dashboard'    && <Dashboard onNavigate={setCurrentView} />}
        {currentView === 'events'       && <EventManagement onCreateEvent={() => setCurrentView('create-event')} onSelectEvent={(id) => { setSelectedEventId(id); setCurrentView('participants'); }} />}
        {currentView === 'create-event' && <CreateEvent onBack={() => setCurrentView('events')} />}
        {currentView === 'participants' && <ParticipantRegistration eventId={selectedEventId} onBack={() => setCurrentView('events')} />}
        {currentView === 'qr-codes'     && <QRCodes />}
        {currentView === 'qr-scanner'   && <QRScanner />}
        {currentView === 'reports'      && <Reports />}
        {currentView === 'public'       && <PublicView onSelectEvent={(id) => { setSelectedEventId(id); setCurrentView('event-detail'); }} />}
        {currentView === 'event-detail' && <EventDetail eventId={selectedEventId!} onBack={() => setCurrentView('public')} />}
        {currentView === 'organizers'   && <OrganizerManagement />}
        {currentView === 'users'        && <UserManagement />}
        {currentView === 'staff'        && <StaffManagement />}
        {currentView === 'profile'      && <Profile />}
      </main>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
