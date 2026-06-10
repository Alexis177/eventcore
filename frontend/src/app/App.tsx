import { useState } from 'react';
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
import OrganizerManagement from './components/OrganizerManagement';
import UserManagement from './components/UserManagement';
import StaffManagement from './components/StaffManagement';
import Sidebar from './components/Sidebar';
import Profile from './components/Profile';

type View =
  | 'dashboard' | 'events' | 'create-event' | 'participants'
  | 'qr-codes' | 'qr-scanner' | 'reports' | 'public'
  | 'organizers' | 'users' | 'staff' | 'profile';

function AppContent() {
  const { isAuthenticated, logout, user } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  if (!isAuthenticated) return <Login />;

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
        {currentView === 'public'       && <PublicView />}
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
