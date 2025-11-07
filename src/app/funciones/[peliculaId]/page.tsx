'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getFuncionesPorPelicula } from '@/lib/supabase/supabasee';
import Link from 'next/link';

interface Pelicula {
  titulo: string;
  descripcion: string;
  duracion: number;
  imagen_url: string;
}

interface Funcion {
  id: string;
  pelicula_id: string;
  fecha: string;
  hora: string;
  sala: string;
  entradas_disponibles: number;
  peliculas: Pelicula;
}

export default function FuncionesPage() {
  const params = useParams();
  const peliculaId = params.peliculaId as string;
  
  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [pelicula, setPelicula] = useState<Pelicula | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarFunciones();
  }, [peliculaId]);

  async function cargarFunciones() {
    try {
      const data = await getFuncionesPorPelicula(peliculaId);
      setFunciones(data as any);
      if (data.length > 0) {
        setPelicula(data[0].peliculas as any);
      }
    } catch (error) {
      console.error('Error cargando funciones:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando horarios...</div>
      </div>
    );
  }

  if (!pelicula) {
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl text-white mb-4">Película no encontrada</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Agrupar funciones por fecha
  const funcionesPorFecha = funciones.reduce((acc: Record<string, Funcion[]>, funcion) => {
    const fecha = funcion.fecha;
    if (!acc[fecha]) {
      acc[fecha] = [];
    }
    acc[fecha].push(funcion);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
          >
            ← Volver a la cartelera
          </Link>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 mb-8 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 flex-shrink-0">
            <img
              src={pelicula.imagen_url || '/placeholder-movie.jpg'}
              alt={pelicula.titulo}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-4">
              {pelicula.titulo}
            </h1>
            <p className="text-gray-300 mb-4 text-lg">
              {pelicula.descripcion}
            </p>
            <div className="flex items-center gap-4 text-gray-400">
              <span className="flex items-center gap-2">
                ⏱️ {pelicula.duracion} minutos
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            📅 Horarios Disponibles
          </h2>

          {funciones.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg mb-4">
                No hay funciones disponibles en este momento
              </p>
              <Link href="/" className="text-blue-400 hover:text-blue-300">
                Ver otras películas
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(funcionesPorFecha).map(([fecha, funcionesDia]) => (
                <div key={fecha} className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {funcionesDia.map((funcion) => (
                      <Link
                        key={funcion.id}
                        href={`/reserva/${funcion.id}`}
                        className="block"
                      >
                        <div className="bg-gray-800 hover:bg-gray-900 border-2 border-gray-600 hover:border-blue-500 rounded-lg p-4 transition-all cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl font-bold text-white">
                              🕐 {funcion.hora.substring(0, 5)}
                            </span>
                            <span className="text-sm text-gray-400">
                              {funcion.sala}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">
                              {funcion.entradas_disponibles} entradas disponibles
                            </span>
                            <span className="text-blue-400 font-semibold text-sm">
                              Reservar →
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-900 border-2 border-blue-600 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-3">ℹ️ Información Importante:</h3>
          <ul className="text-blue-100 space-y-2 text-sm">
            <li>• Las entradas son completamente GRATUITAS para estudiantes</li>
            <li>• Puedes reservar hasta 3 entradas por función</li>
            <li>• Recibirás un código QR que debes presentar en el cine</li>
            <li>• Llega 15 minutos antes del inicio de la función</li>
          </ul>
        </div>
      </div>
    </div>
  );
}