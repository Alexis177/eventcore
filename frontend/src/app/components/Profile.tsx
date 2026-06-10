import { useState, useEffect } from 'react';
import { Tag, Save, Loader2, History, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { attendeeService } from '../services/attendeeService';
import { toast } from 'sonner';

export default function Profile() {
  const { user, updatePreferences } = useAuth();
  const [activeTab, setActiveTab] = useState<'preferences' | 'history'>('preferences');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  
  const [selectedTopics, setSelectedTopics] = useState<string[]>(user?.preferences?.categories || []);
  const [history, setHistory] = useState<any[]>([]); 

  const topics = ['Tecnología', 'Ciencias', 'Deportes', 'Artes', 'Networking', 'Desarrollo Personal'];

  useEffect(() => {
    attendeeService.getMyRegistrations()
      .then((data) => {
        // El historial solo muestra eventos que ya finalizaron o donde se calculó inasistencia
        const pastEvents = data.filter((reg: any) => reg.event?.status === 'finished' || reg.status === 'absent');
        setHistory(pastEvents);
      })
      .catch(console.error)
      .finally(() => setIsHistoryLoading(false));
  }, []);

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      await updatePreferences({ categories: selectedTopics });
      toast.success('Preferencias guardadas. Tu catálogo destacará estos intereses.');
    } catch (error) { 
      toast.error('Error al actualizar el perfil'); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
  };

  return (
    <div className="p-8 md:p-10 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md">
          {user?.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
          <p className="text-gray-500 font-medium">{user?.email} • Cuenta de Asistente</p>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-8">
        <button onClick={() => setActiveTab('preferences')} className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer border-0 bg-transparent ${activeTab === 'preferences' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>
          Preferencias de Catálogo
        </button>
        <button onClick={() => setActiveTab('history')} className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer border-0 bg-transparent ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>
          Historial Académico ({history.length})
        </button>
      </div>

      {activeTab === 'preferences' ? (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-2xl animate-fade-in">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-gray-900"><Tag className="w-5 h-5 text-accent" /> ¿Qué te interesa?</h3>
          <p className="text-sm text-gray-500 mb-6 font-semibold">Selecciona tus áreas favoritas para personalizar las recomendaciones en tu catálogo de eventos.</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {topics.map(topic => (
              <button key={topic} onClick={() => toggleTopic(topic)} className={`px-4 py-2.5 rounded-full text-sm font-bold border transition-all cursor-pointer ${selectedTopics.includes(topic) ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                {topic}
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button onClick={handleSavePreferences} disabled={isLoading} className="bg-secondary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-secondary/90 transition-all border-0 shadow-lg shadow-secondary/15 cursor-pointer">
              {isLoading ? <Loader2 className="animate-spin w-5 h-5"/> : <Save className="w-5 h-5"/>} Guardar Configuración
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-fade-in">
          <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center gap-2"><History className="w-5 h-5 text-accent" /> Constancias e Historial</h3>
          {isHistoryLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-3 opacity-40" />
              <p className="text-gray-500 font-bold">Aún no registras eventos concluidos.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map(reg => (
                <div key={reg.id} className="py-4 flex justify-between items-center hover:bg-gray-50/50 px-2 rounded-xl transition-colors">
                  <div>
                    <h4 className="font-bold text-gray-800 text-base">{reg.event?.title}</h4>
                    <p className="text-sm text-gray-400 font-semibold mt-0.5">
                      {new Date(reg.event?.startDate).toLocaleDateString('es-MX')} • {reg.event?.location}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    reg.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {reg.status === 'confirmed' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {reg.status === 'confirmed' ? 'Asistió' : 'Ausente (No-Show)'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
