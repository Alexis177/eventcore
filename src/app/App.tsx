import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EventManagement from './components/EventManagement';
import CreateEvent from './components/CreateEvent';
import ParticipantRegistration from './components/ParticipantRegistration';
import QRCodes from './components/QRCodes';
import QRScanner from './components/QRScanner';
import Reports from './components/Reports';
import PublicView from './components/PublicView';
import Sidebar from './components/Sidebar';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'events' | 'create-event' | 'participants' | 'qr-codes' | 'qr-scanner' | 'reports' | 'public'>('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto">
        {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}
        {currentView === 'events' && <EventManagement onCreateEvent={() => setCurrentView('create-event')} onSelectEvent={(id) => {
          setSelectedEventId(id);
          setCurrentView('participants');
        }} />}
        {currentView === 'create-event' && <CreateEvent onBack={() => setCurrentView('events')} />}
        {currentView === 'participants' && <ParticipantRegistration eventId={selectedEventId} onBack={() => setCurrentView('events')} />}
        {currentView === 'qr-codes' && <QRCodes />}
        {currentView === 'qr-scanner' && <QRScanner />}
        {currentView === 'reports' && <Reports />}
        {currentView === 'public' && <PublicView />}
      </main>
    </div>
  );
}
