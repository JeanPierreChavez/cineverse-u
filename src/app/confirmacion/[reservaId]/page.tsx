'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getReserva } from '@/lib/supabase/supabasee';
import { generarImagenQR } from '@/lib/supabase/qr-generar';
import Link from 'next/link';

interface Reserva {
  id: string;
  codigo_qr: string;
  nombre_estudiante: string;
  email_estudiante: string;
  cantidad_entradas: number;
  funciones: {
    fecha: string;
    hora: string;
    sala: string;
    peliculas: {
      titulo: string;
      imagen_url: string;
    };
  };
}

export default function ConfirmacionPage() {
  const params = useParams();
  const reservaId = params.reservaId as string;

  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [qrImage, setQrImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (reservaId) {
      cargarReserva();
    }
  }, [reservaId]);

  async function cargarReserva() {
    try {
      console.log('Cargando reserva:', reservaId);
      const data = await getReserva(reservaId);
      console.log('Datos de reserva:', data);
      setReserva(data as any);

      // Generar el QR
      const qrDataUrl = await generarImagenQR(data.codigo_qr);
      setQrImage(qrDataUrl);
    } catch (error) {
      console.error('Error cargando reserva:', error);
      setError('No se pudo cargar la información de la reserva');
    } finally {
      setLoading(false);
    }
  }

  function descargarQR() {
    if (!qrImage || !reserva) return;

    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `entrada-cine-${reserva.codigo_qr}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function imprimirQR() {
    window.print();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando tu reserva...</div>
      </div>
    );
  }

  if (error || !reserva) {
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-900 border-2 border-red-600 rounded-lg p-8">
            <h1 className="text-2xl text-white mb-4">❌ Error</h1>
            <p className="text-red-200 mb-6">{error || 'Reserva no encontrada'}</p>
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Mensaje de éxito */}
        <div className="bg-green-900 border-2 border-green-600 rounded-lg p-8 mb-8 text-center print:hidden">
          <h1 className="text-4xl font-bold text-white mb-4">
            ✅ ¡Reserva Confirmada!
          </h1>
          <p className="text-green-200 text-lg">
            Tu entrada ha sido reservada exitosamente
          </p>
        </div>

        {/* Tarjeta de entrada con QR */}
        <div className="bg-white rounded-lg overflow-hidden shadow-2xl mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              🎬 ENTRADA DE CINE
            </h2>
            <p className="text-purple-100">Sistema de Reservas Estudiantil 1</p>
          </div>

          {/* Información de la película */}
          <div className="p-8 bg-gray-50">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Columna izquierda: Datos */}
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">
                    PELÍCULA
                  </p>
                  <p className="text-gray-900 text-2xl font-bold">
                    {reserva.funciones?.peliculas?.titulo || 'Sin título'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">
                      FECHA
                    </p>
                    <p className="text-gray-900 font-bold">
                      {reserva.funciones?.fecha 
                        ? new Date(reserva.funciones.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })
                        : 'No disponible'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">
                      HORA
                    </p>
                    <p className="text-gray-900 font-bold text-2xl">
                      {reserva.funciones?.hora?.substring(0, 5) || '--:--'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">
                      SALA
                    </p>
                    <p className="text-gray-900 font-bold">
                      {reserva.funciones?.sala || 'Sin asignar'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">
                      ENTRADAS
                    </p>
                    <p className="text-gray-900 font-bold text-2xl">
                      {reserva.cantidad_entradas}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <p className="text-gray-600 text-sm font-semibold mb-1">
                    RESERVADO POR
                  </p>
                  <p className="text-gray-900 font-bold">
                    {reserva.nombre_estudiante}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {reserva.email_estudiante}
                  </p>
                </div>
              </div>

              {/* Columna derecha: QR */}
              <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg border-4 border-dashed border-gray-300">
                {qrImage ? (
                  <div className="text-center">
                    <img
                      src={qrImage}
                      alt="Código QR"
                      className="w-64 h-64 mb-4"
                    />
                    <p className="text-gray-600 text-xs font-mono break-all px-4">
                      {reserva.codigo_qr}
                    </p>
                    <p className="text-gray-500 text-sm mt-3">
                      Presenta este código en el cine
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="animate-pulse">
                      <div className="w-64 h-64 bg-gray-200 rounded mb-4"></div>
                    </div>
                    <p className="text-gray-500">Generando código QR...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer con advertencias */}
          <div className="bg-yellow-50 border-t-2 border-yellow-200 p-6">
            <p className="text-yellow-800 font-semibold mb-2">
              ⚠️ IMPORTANTE:
            </p>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Llega 15 minutos antes del inicio de la función</li>
              <li>• Este código QR es de un solo uso</li>
              <li>• Presenta tu código al personal del cine</li>
              <li>• Entrada gratuita - No requiere pago</li>
            </ul>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="grid md:grid-cols-3 gap-4 mb-8 print:hidden">
          <button
            onClick={descargarQR}
            disabled={!qrImage}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            📥 Descargar QR
          </button>
          <button
            onClick={imprimirQR}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            🖨️ Imprimir Entrada
          </button>
          <Link
            href="/"
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            🎬 Ver Más Películas
          </Link>
        </div>

        {/* Instrucciones adicionales */}
        <div className="bg-gray-800 rounded-lg p-6 print:hidden">
          <h3 className="text-white font-bold mb-4 text-lg">
            📝 ¿Qué hacer ahora?
          </h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex gap-3">
              <span className="font-bold text-blue-400">1.</span>
              <div>
                <p className="font-semibold">Guarda tu código QR</p>
                <p className="text-sm text-gray-400">
                  Descárgalo o toma una captura de pantalla. También puedes imprimirlo.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-blue-400">2.</span>
              <div>
                <p className="font-semibold">Llega con anticipación</p>
                <p className="text-sm text-gray-400">
                  Te recomendamos llegar 15 minutos antes del inicio de la función.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-blue-400">3.</span>
              <div>
                <p className="font-semibold">Presenta tu QR</p>
                <p className="text-sm text-gray-400">
                  Muestra el código al personal en la entrada del cine.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-blue-400">4.</span>
              <div>
                <p className="font-semibold">¡Disfruta la película! 🍿</p>
                <p className="text-sm text-gray-400">
                  Tu entrada es completamente gratuita. Solo necesitas tu QR.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="mt-8 text-center text-gray-500 text-sm print:hidden">
          <p>¿Tienes problemas con tu reserva?</p>
          <p>Contacta al equipo del hackathon para obtener ayuda</p>
        </div>
      </div>

      {/* Estilos para impresión */}
      <style jsx>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}