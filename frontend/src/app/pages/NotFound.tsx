import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
      <div className="bg-white p-8 rounded-full shadow-sm border border-gray-100 mb-6">
        <SearchX className="w-20 h-20 text-gray-400" />
      </div>
      <h1 className="text-6xl font-extrabold text-primary mb-2">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Página no encontrada</h2>
      <p className="text-gray-600 mb-8 max-w-md font-medium">
        El evento que buscas no existe, ya terminó o la URL fue escrita incorrectamente.
      </p>
      <Link 
        to="/" 
        className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 border-0"
      >
        Volver a la Cartelera
      </Link>
    </div>
  );
}
