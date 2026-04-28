import { useState } from 'react';
import { ScanLine, CheckCircle, XCircle, Camera, User, Calendar, Clock } from 'lucide-react';

interface ScanResult {
  success: boolean;
  name: string;
  event: string;
  time: string;
  message: string;
}

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([
    {
      success: true,
      name: 'Juan Pérez',
      event: 'Workshop de React',
      time: '10:30 AM',
      message: 'Asistencia registrada correctamente',
    },
    {
      success: true,
      name: 'María González',
      event: 'Workshop de React',
      time: '10:28 AM',
      message: 'Asistencia registrada correctamente',
    },
    {
      success: false,
      name: 'N/A',
      event: 'N/A',
      time: '10:25 AM',
      message: 'QR inválido o no encontrado',
    },
  ]);

  const handleStartScan = () => {
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      const isSuccess = Math.random() > 0.3;
      const result: ScanResult = isSuccess
        ? {
            success: true,
            name: 'Carlos Rodríguez',
            event: 'Workshop de React Avanzado',
            time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            message: '¡Asistencia registrada correctamente!',
          }
        : {
            success: false,
            name: 'N/A',
            event: 'N/A',
            time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            message: 'QR inválido o no encontrado',
          };

      setScanResult(result);
      setRecentScans([result, ...recentScans.slice(0, 9)]);
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Escáner de QR</h1>
        <p className="text-muted-foreground">Escanea códigos QR para registrar asistencia</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-card rounded-xl shadow-sm border border-border p-8 mb-6">
            <div className="aspect-square bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border-4 border-dashed border-border flex items-center justify-center mb-6 relative overflow-hidden">
              {!isScanning && !scanResult && (
                <div className="text-center">
                  <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Presiona el botón para iniciar el escaneo</p>
                </div>
              )}

              {isScanning && (
                <div className="text-center">
                  <div className="relative">
                    <ScanLine className="w-16 h-16 text-accent mx-auto mb-4 animate-pulse" />
                    <div className="absolute inset-0 border-4 border-accent rounded-lg animate-ping opacity-75"></div>
                  </div>
                  <p className="text-accent">Escaneando código QR...</p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              )}

              {scanResult && (
                <div className="text-center p-6">
                  {scanResult.success ? (
                    <>
                      <div className="bg-secondary/10 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-secondary" />
                      </div>
                      <h3 className="text-2xl mb-2 text-secondary">¡Éxito!</h3>
                      <p className="text-muted-foreground mb-4">{scanResult.message}</p>
                      <div className="bg-background rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2 text-left">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{scanResult.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-left">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{scanResult.event}</span>
                        </div>
                        <div className="flex items-center gap-2 text-left">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{scanResult.time}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-destructive/10 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                        <XCircle className="w-12 h-12 text-destructive" />
                      </div>
                      <h3 className="text-2xl mb-2 text-destructive">Error</h3>
                      <p className="text-muted-foreground">{scanResult.message}</p>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleStartScan}
              disabled={isScanning}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ScanLine className="w-5 h-5" />
              {isScanning ? 'Escaneando...' : scanResult ? 'Escanear Siguiente' : 'Iniciar Escaneo'}
            </button>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-secondary rounded-xl p-6 text-white">
            <h3 className="text-lg mb-2">💡 Consejos para escanear</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>• Asegúrate de tener buena iluminación</li>
              <li>• Mantén el código QR dentro del marco</li>
              <li>• Evita reflejos en el código impreso</li>
              <li>• Mantén el dispositivo estable</li>
            </ul>
          </div>
        </div>

        <div>
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h2 className="mb-6">Escaneos Recientes</h2>

            <div className="space-y-3">
              {recentScans.map((scan, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    scan.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {scan.success ? (
                      <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={scan.success ? 'text-green-900' : 'text-red-900'}>
                          {scan.name}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {scan.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{scan.event}</p>
                      <p className={`text-xs mt-1 ${scan.success ? 'text-green-700' : 'text-red-700'}`}>
                        {scan.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {recentScans.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <ScanLine className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay escaneos recientes</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
              <p className="text-2xl mb-1 text-secondary">{recentScans.filter((s) => s.success).length}</p>
              <p className="text-xs text-muted-foreground">Exitosos</p>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
              <p className="text-2xl mb-1 text-destructive">{recentScans.filter((s) => !s.success).length}</p>
              <p className="text-xs text-muted-foreground">Fallidos</p>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
              <p className="text-2xl mb-1">{recentScans.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
