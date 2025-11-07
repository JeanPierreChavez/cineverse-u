'use client';

import { useEffect, useState } from 'react';
import { getPeliculas } from '@/lib/supabase/supabasee';
import Link from 'next/link';

// Define el tipo de Película
interface Pelicula {
  id: string;
  titulo: string;
  descripcion: string | null;
  duracion: number | null;
  imagen_url: string | null;
  created_at: string;
}

export default function HomePage() {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPeliculas();
  }, []);

  async function cargarPeliculas() {
    try {
      const data = await getPeliculas();
      setPeliculas(data);
    } catch (error) {
      console.error('Error cargando películas:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando películas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🎬 Cartelera de Cine Estudiantil
        </h1>
        <p className="text-gray-300 text-center mb-12">
          Selecciona una película para ver los horarios disponibles
        </p>

        {peliculas.length === 0 ? (
          <div className="text-center text-gray-400">
            No hay películas disponibles en este momento
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {peliculas.map((pelicula) => (
              <Link
                key={pelicula.id}
                href={`/funciones/${pelicula.id}`}
                className="group"
              >
                <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="aspect-[2/3] bg-gray-700 relative">
                    <img
                      src={pelicula.imagen_url || '/placeholder-movie.jpg'}
                      alt={pelicula.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {pelicula.titulo}
                    </h2>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                      {pelicula.descripcion || 'Sin descripción'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">
                        ⏱️ {pelicula.duracion || 0} min
                      </span>
                      <span className="text-blue-400 font-semibold group-hover:text-blue-300">
                        Ver horarios →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/empleado"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            👨‍💼 Acceso Empleados
          </Link>
        </div>
      </div>
    </div>
  );
}