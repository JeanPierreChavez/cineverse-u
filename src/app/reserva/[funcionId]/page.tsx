'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFuncion, crearReserva } from '@/lib/supabase/supabasee';
import { generarCodigoUnico } from '@/lib/supabase/qr-generar';
import Link from 'next/link';

interface Funcion {
  id: string;
  pelicula_id: string;
  fecha: string;
  hora: string;
  sala: string | null;
  entradas_disponibles: number;
  peliculas?: {
    titulo: string;
  };
}

export default function ReservaPage() {
  const params = useParams();
  const router = useRouter();
  const funcionId = params.funcionId as string;

  const [funcion, setFuncion] = useState<Funcion | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    cantidad: 1
  });

  useEffect(() => {
    if (funcionId) {
      cargarFuncion();
    }
  }, [funcionId]);

  async function cargarFuncion() {
    try {
      const data = await getFuncion(funcionId);
      console.log('Datos de función:', data);
      setFuncion(data as any);
    } catch (error) {
      console.error('Error cargando función:', error);
      setError('No se pudo cargar la información de la función');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cantidad' ? parseInt(value) : value
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!formData.nombre.trim()) {
      setError('Por favor ingresa tu nombre completo');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Por favor ingresa un email válido');
      return;
    }

    const cantidad = Number(formData.cantidad);
    if (cantidad < 1 || cantidad > 3) {
      setError('Puedes reservar entre 1 y 3 entradas');
      return;
    }

    if (funcion && cantidad > funcion.entradas_disponibles) {
      setError(`Solo hay ${funcion.entradas_disponibles} entradas disponibles`);
      return;
    }

    setEnviando(true);

    try {
      const codigoQR = generarCodigoUnico();

      const reserva = await crearReserva({
        funcion_id: funcionId,
        nombre_estudiante: formData.nombre.trim(),
        email_estudiante: formData.email.trim().toLowerCase(),
        cantidad_entradas: cantidad,
        codigo_qr: codigoQR,
        usado: false
      });

      router.push(`/confirmacion/${reserva.id}`);
    } catch (error) {
      console.error('Error creando reserva:', error);
      setError('No se pudo crear la reserva. Por favor intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!funcion) {
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl text-white mb-4">Función no encontrada</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (funcion.entradas_disponibles === 0) {
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900 border-2 border-red-600 rounded-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              😞 Función Agotada
            </h1>
            <p className="text-red-200 mb-6">
              Lo sentimos, ya no hay entradas disponibles para esta función.
            </p>
            <Link
              href={`/funciones/${funcion.pelicula_id}`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
            >
              Ver otros horarios
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/funciones/${funcion.pelicula_id}`}
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
          >
            ← Volver a horarios
          </Link>
        </div>

        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            🎫 Reservar Entradas
          </h1>
          <div className="bg-black bg-opacity-30 rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Película:</span>
              <span className="text-white font-bold text-xl">
                {funcion.peliculas?.titulo || 'Sin título'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Fecha:</span>
              <span className="text-white font-semibold">
                {new Date(funcion.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Hora:</span>
              <span className="text-white font-bold text-2xl">
                {funcion.hora.substring(0, 5)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Sala:</span>
              <span className="text-white font-semibold">{funcion.sala || 'Sin asignar'}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-600">
              <span className="text-gray-300">Entradas disponibles:</span>
              <span className="text-green-400 font-bold text-xl">
                {funcion.entradas_disponibles}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Completa tus datos
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                Nombre Completo *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                Email Estudiantil *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu.correo@universidad.edu"
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                Cantidad de Entradas *
              </label>
              <select
                name="cantidad"
                value={formData.cantidad}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value={1}>1 entrada</option>
                <option value={2}>2 entradas</option>
                <option value={3}>3 entradas (máximo)</option>
              </select>
              <p className="text-gray-400 text-sm mt-2">
                Puedes reservar hasta 3 entradas por función
              </p>
            </div>

            {error && (
              <div className="bg-red-900 border border-red-700 rounded-lg p-4">
                <p className="text-red-200 font-semibold">❌ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-4 rounded-lg transition-colors text-lg"
            >
              {enviando ? 'Procesando...' : '🎟️ Confirmar Reserva'}
            </button>
          </form>
        </div>

        <div className="mt-8 bg-yellow-900 border-2 border-yellow-600 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-3">⚠️ Importante:</h3>
          <ul className="text-yellow-100 space-y-2 text-sm">
            <li>• Las entradas son GRATUITAS</li>
            <li>• Recibirás un código QR al confirmar tu reserva</li>
            <li>• Guarda el QR, lo necesitarás en el cine</li>
            <li>• El QR es de un solo uso</li>
            <li>• Llega 15 minutos antes de la función</li>
          </ul>
        </div>
      </div>
    </div>
  );
}