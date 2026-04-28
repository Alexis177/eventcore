import { useState } from 'react';
import { Download, QrCode, Mail, Search } from 'lucide-react';

interface QRCodeData {
  id: number;
  name: string;
  email: string;
  event: string;
  qrCode: string;
}

export default function QRCodes() {
  const [qrCodes] = useState<QRCodeData[]>([
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan.perez@email.com',
      event: 'Workshop de React Avanzado',
      qrCode: 'QR-001-REACT-2026',
    },
    {
      id: 2,
      name: 'María González',
      email: 'maria.gonzalez@email.com',
      event: 'Workshop de React Avanzado',
      qrCode: 'QR-002-REACT-2026',
    },
    {
      id: 3,
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@email.com',
      event: 'Conferencia de IA',
      qrCode: 'QR-003-IA-2026',
    },
    {
      id: 4,
      name: 'Ana Martínez',
      email: 'ana.martinez@email.com',
      event: 'Workshop de React Avanzado',
      qrCode: 'QR-004-REACT-2026',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null);

  const filteredQRCodes = qrCodes.filter(
    (qr) =>
      qr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.event.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateQRPlaceholder = (code: string) => {
    return (
      <svg width="200" height="200" viewBox="0 0 200 200" className="w-full h-full">
        <rect width="200" height="200" fill="white" />
        <g transform="translate(20, 20)">
          {Array.from({ length: 16 }).map((_, i) =>
            Array.from({ length: 16 }).map((_, j) => {
              const shouldFill = (i + j + code.charCodeAt(0)) % 3 !== 0;
              return (
                <rect
                  key={`${i}-${j}`}
                  x={j * 10}
                  y={i * 10}
                  width="10"
                  height="10"
                  fill={shouldFill ? '#0d1117' : 'white'}
                />
              );
            })
          )}
        </g>
      </svg>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Códigos QR</h1>
        <p className="text-muted-foreground">Gestiona y descarga códigos QR de participantes</p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email o evento..."
              className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-input-background"
            />
          </div>
          <button className="w-full md:w-auto bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            Descargar Todos
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredQRCodes.map((qrData) => (
            <div
              key={qrData.id}
              className="bg-background rounded-xl p-4 border border-border hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedQR(qrData)}
            >
              <div className="bg-white p-4 rounded-lg mb-4">{generateQRPlaceholder(qrData.qrCode)}</div>
              <div className="space-y-2">
                <p className="truncate">{qrData.name}</p>
                <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {qrData.email}
                </p>
                <p className="text-sm text-muted-foreground truncate">{qrData.event}</p>
                <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                  {qrData.qrCode}
                </p>
              </div>
              <button className="w-full mt-4 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm">
                <Download className="w-4 h-4" />
                Descargar
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedQR && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedQR(null)}
        >
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl">Código QR</h2>
              <button onClick={() => setSelectedQR(null)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="bg-white p-8 rounded-lg mb-6 flex items-center justify-center">
              <div className="w-64 h-64">{generateQRPlaceholder(selectedQR.qrCode)}</div>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Participante</p>
                <p className="text-lg">{selectedQR.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{selectedQR.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Evento</p>
                <p>{selectedQR.event}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Código</p>
                <p className="font-mono text-sm bg-muted px-3 py-2 rounded">{selectedQR.qrCode}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Descargar QR
              </button>
              <button className="flex-1 bg-secondary text-white py-3 rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2">
                <Mail className="w-5 h-5" />
                Enviar por Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
