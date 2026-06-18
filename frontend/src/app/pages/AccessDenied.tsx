import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
      <div className="bg-red-50 p-8 rounded-full mb-6">
        <ShieldAlert className="w-20 h-20 text-red-500" />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Acceso Restringido</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md font-medium">
        Tu rol actual no tiene los permisos necesarios para visualizar esta sección del sistema.
      </p>
      <Link 
        to="/" 
        className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-md border-0"
      >
        Regresar al inicio
      </Link>
    </div>
  );
}
