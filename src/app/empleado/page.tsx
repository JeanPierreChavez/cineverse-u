'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { getReservaPorQR, marcarReservaUsada } from '@/lib/supabase/supabasee';
import Link from 'next/link';

// Definir interfaces para los tipos de datos
interface Pelicula {
  titulo: string;
}

interface Funcion {
  fecha: string;
  hora: string;
  sala: string | null;
  peliculas?: Pelicula;
}

interface Reserva {
  id: string;
  funcion_id: string;
  nombre_estudiante: string;
  email_estudiante: string;
  cantidad_entradas: number;
  codigo_qr: string;
  usado: boolean;
  fecha_uso: string | null;
  created_at: string;
  funciones?: Funcion;
}

export default function EmpleadoPage() {
  const [codigoQR, setCodigoQR] = useState('');
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [mostrarScanner, setMostrarScanner] = useState(false);

  async function buscarReserva(codigo: string) {
    const codigoLimpio = codigo.trim();
    
    if (!codigoLimpio) {
      setError('Ingresa un código QR');
      return;
    }

    setBuscando(true);
    setError('');
    setExito('');
    setReserva(null);

    try {
      const data = await getReservaPorQR(codigoLimpio);
      console.log('Datos de reserva:', data);
      setReserva(data as any);
      setMostrarScanner(false);
    } catch (err) {
      setError('Código QR no encontrado o inválido');
      console.error('Error buscando reserva:', err);
    } finally {
      setBuscando(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    buscarReserva(codigoQR);
  }

  function handleScan(result: any) {
    if (result && result[0]?.rawValue) {
      const codigo = result[0].rawValue;
      setCodigoQR(codigo);
      buscarReserva(codigo);
    }
  }

  function handleError(error: any) {
    console.error('Error en el scanner:', error);
    setError('Error al acceder a la cámara. Verifica los permisos.');
  }

  async function validarEntrada() {
    if (!reserva) return;

    if (reserva.usado) {
      setError('Esta entrada ya fue utilizada');
      return;
    }

    try {
      await marcarReservaUsada(reserva.codigo_qr);
      setExito('✅ Entrada validada correctamente');
      
      // Actualizar el estado local
      setReserva({ 
        ...reserva, 
        usado: true,
        fecha_uso: new Date().toISOString()
      });
      
      // Limpiar después de 3 segundos
      setTimeout(() => {
        setCodigoQR('');
        setReserva(null);
        setExito('');
      }, 3000);
    } catch (err: any) {
      setError(err?.message || 'Error al validar la entrada');
      console.error('Error validando:', err);
    }
  }

  function limpiarBusqueda() {
    setCodigoQR('');
    setReserva(null);
    setError('');
    setExito('');
    setMostrarScanner(false);
  }

  function toggleScanner() {
    setMostrarScanner(!mostrarScanner);
    setError('');
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
          >
            ← Volver al inicio
          </Link>
        </div>

        <div className="bg-purple-900 border-2 border-purple-600 rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            👨‍💼 Panel de Empleado
          </h1>
          <p className="text-purple-200">
            Escanea o ingresa el código QR para validar entradas
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 mb-6">
          <div className="flex gap-3 mb-6">
            <button
              onClick={toggleScanner}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                mostrarScanner
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📷 {mostrarScanner ? 'Cerrar Cámara' : 'Escanear con Cámara'}
            </button>
          </div>

          {mostrarScanner && (
            <div className="mb-6">
              <div className="bg-gray-900 rounded-lg overflow-hidden border-4 border-purple-500">
                <Scanner
                  onScan={handleScan}
                  onError={handleError}
                  constraints={{
                    facingMode: 'environment'
                  }}
                  styles={{
                    container: {
                      width: '100%',
                      maxHeight: '400px'
                    }
                  }}
                />
              </div>
              <p className="text-gray-400 text-sm mt-3 text-center">
                📱 Coloca el código QR frente a la cámara
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                O ingresa el código manualmente
              </label>
              <input
                type="text"
                value={codigoQR}
                onChange={(e) => setCodigoQR(e.target.value)}
                placeholder="Ej: CINE-12345678-abcd-..."
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none text-lg font-mono"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={buscando}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
              >
                {buscando ? 'Buscando...' : '🔍 Buscar Reserva'}
              </button>
              <button
                type="button"
                onClick={limpiarBusqueda}
                className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Limpiar
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 bg-red-900 border border-red-700 rounded-lg p-4">
              <p className="text-red-200 font-semibold">❌ {error}</p>
            </div>
          )}

          {exito && (
            <div className="mt-6 bg-green-900 border border-green-700 rounded-lg p-4">
              <p className="text-green-200 font-semibold">{exito}</p>
            </div>
          )}
        </div>

        {reserva && (
          <div className={`rounded-lg p-8 border-4 ${
            reserva.usado
              ? 'bg-red-900 border-red-600'
              : 'bg-green-900 border-green-600'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Información de la Reserva
              </h2>
              <div className={`px-4 py-2 rounded-full font-bold text-lg ${
                reserva.usado
                  ? 'bg-red-700 text-red-100'
                  : 'bg-green-700 text-green-100'
              }`}>
                {reserva.usado ? '❌ YA USADA' : '✅ VÁLIDA'}
              </div>
            </div>

            <div className="bg-black bg-opacity-30 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-300 text-sm mb-1">Película:</p>
                  <p className="text-white text-xl font-bold">
                    🎬 {reserva.funciones?.peliculas?.titulo || 'No disponible'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-300 text-sm mb-1">Sala:</p>
                  <p className="text-white text-xl font-bold">
                    📍 {reserva.funciones?.sala || 'No disponible'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-300 text-sm mb-1">Fecha:</p>
                  <p className="text-white text-lg font-semibold">
                    📅 {reserva.funciones?.fecha 
                      ? new Date(reserva.funciones.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'No disponible'
                    }
                  </p>
                </div>

                <div>
                  <p className="text-gray-300 text-sm mb-1">Hora:</p>
                  <p className="text-white text-2xl font-bold">
                    🕐 {reserva.funciones?.hora?.substring(0, 5) || 'No disponible'}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-600 pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-300 text-sm mb-1">Reservado por:</p>
                    <p className="text-white text-xl font-bold">
                      👤 {reserva.nombre_estudiante}
                    </p>
                    <p className="text-gray-300 text-sm mt-1">
                      📧 {reserva.email_estudiante}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-300 text-sm mb-1">Cantidad de Entradas:</p>
                    <p className="text-white text-4xl font-bold">
                      🎟️ {reserva.cantidad_entradas}
                    </p>
                  </div>
                </div>
              </div>

              {reserva.usado && reserva.fecha_uso && (
                <div className="border-t border-gray-600 pt-4 mt-4">
                  <p className="text-gray-300 text-sm mb-1">Fecha de uso:</p>
                  <p className="text-red-200 font-semibold">
                    {new Date(reserva.fecha_uso).toLocaleString('es-ES')}
                  </p>
                </div>
              )}
            </div>

            {!reserva.usado && (
              <button
                onClick={validarEntrada}
                className="w-full mt-6 bg-white hover:bg-gray-100 text-gray-900 font-bold py-4 rounded-lg transition-colors text-xl"
              >
                ✅ VALIDAR Y MARCAR COMO USADA
              </button>
            )}
          </div>
        )}

        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-3">📋 Instrucciones:</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>1. Haz clic en "Escanear con Cámara" para usar el escáner QR</li>
            <li>2. O ingresa el código manualmente en el campo de texto</li>
            <li>3. Verifica que los datos coincidan (nombre, película, fecha, hora)</li>
            <li>4. Si la entrada es válida, haz clic en "Validar"</li>
            <li>5. Una vez validada, la entrada no podrá usarse nuevamente</li>
          </ul>
        </div>
      </div>
    </div>
  );
}