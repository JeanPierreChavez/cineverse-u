import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================
// PELÍCULAS
// ==========================================

// Obtener todas las películas
export async function getPeliculas() {
  const { data, error } = await supabase
    .from('peliculas')
    .select('*')
    .order('titulo');
  
  if (error) {
    console.error('Error obteniendo películas:', error);
    throw error;
  }
  return data;
}

// ==========================================
// FUNCIONES
// ==========================================

// Obtener funciones de una película (solo futuras y con entradas)
export async function getFuncionesPorPelicula(peliculaId) {
  const hoy = new Date().toISOString().split('T')[0]; // Formato: YYYY-MM-DD
  
  const { data, error } = await supabase
    .from('funciones')
    .select(`
      id,
      pelicula_id,
      fecha,
      hora,
      sala,
      capacidad_total,
      entradas_disponibles,
      created_at,
      peliculas (
        titulo,
        descripcion,
        duracion,
        imagen_url
      )
    `)
    .eq('pelicula_id', peliculaId)
    .gte('fecha', hoy)
    .gt('entradas_disponibles', 0)
    .order('fecha')
    .order('hora');
  
  if (error) {
    console.error('Error obteniendo funciones:', error);
    throw error;
  }
  return data;
}

// Obtener una función específica por ID
export async function getFuncion(funcionId) {
  const { data, error } = await supabase
    .from('funciones')
    .select(`
      id,
      pelicula_id,
      fecha,
      hora,
      sala,
      capacidad_total,
      entradas_disponibles,
      created_at,
      peliculas (
        titulo,
        descripcion,
        duracion,
        imagen_url
      )
    `)
    .eq('id', funcionId)
    .single();
  
  if (error) {
    console.error('Error obteniendo función:', error);
    throw error;
  }
  return data;
}

// ==========================================
// RESERVAS
// ==========================================

// Crear una nueva reserva
export async function crearReserva(reservaData) {
  // Verificar que la función tenga entradas disponibles
  const { data: funcionData, error: funcionError } = await supabase
    .from('funciones')
    .select('entradas_disponibles')
    .eq('id', reservaData.funcion_id)
    .single();
  
  if (funcionError) {
    console.error('Error verificando función:', funcionError);
    throw new Error('No se pudo verificar la disponibilidad');
  }
  
  if (funcionData.entradas_disponibles < reservaData.cantidad_entradas) {
    throw new Error('No hay suficientes entradas disponibles');
  }
  
  // Crear la reserva
  const { data, error } = await supabase
    .from('reservas')
    .insert([{
      funcion_id: reservaData.funcion_id,
      nombre_estudiante: reservaData.nombre_estudiante,
      email_estudiante: reservaData.email_estudiante,
      cantidad_entradas: reservaData.cantidad_entradas,
      codigo_qr: reservaData.codigo_qr,
      usado: false
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creando reserva:', error);
    throw error;
  }
  
  return data;
}

// Obtener reserva por ID (para página de confirmación)
export async function getReserva(reservaId) {
  const { data, error } = await supabase
    .from('reservas')
    .select(`
      id,
      funcion_id,
      nombre_estudiante,
      email_estudiante,
      cantidad_entradas,
      codigo_qr,
      usado,
      fecha_uso,
      created_at,
      funciones (
        fecha,
        hora,
        sala,
        peliculas (
          titulo,
          imagen_url
        )
      )
    `)
    .eq('id', reservaId)
    .single();
  
  if (error) {
    console.error('Error obteniendo reserva:', error);
    throw error;
  }
  return data;
}

// Obtener reserva por código QR (para empleados)
export async function getReservaPorQR(codigoQR) {
  const { data, error } = await supabase
    .from('reservas')
    .select(`
      id,
      funcion_id,
      nombre_estudiante,
      email_estudiante,
      cantidad_entradas,
      codigo_qr,
      usado,
      fecha_uso,
      created_at,
      funciones (
        fecha,
        hora,
        sala,
        peliculas (
          titulo
        )
      )
    `)
    .eq('codigo_qr', codigoQR)
    .single();
  
  if (error) {
    console.error('Error obteniendo reserva por QR:', error);
    throw error;
  }
  return data;
}

// Marcar reserva como usada (cuando el empleado escanea)
export async function marcarReservaUsada(codigoQR) {
  // Primero verificar si ya está usada
  const { data: reservaExistente, error: errorVerificar } = await supabase
    .from('reservas')
    .select('usado')
    .eq('codigo_qr', codigoQR)
    .single();
  
  if (errorVerificar) {
    console.error('Error verificando reserva:', errorVerificar);
    throw errorVerificar;
  }
  
  if (reservaExistente.usado) {
    throw new Error('Esta entrada ya fue utilizada');
  }
  
  // Marcar como usada
  const { data, error } = await supabase
    .from('reservas')
    .update({ 
      usado: true,
      fecha_uso: new Date().toISOString()
    })
    .eq('codigo_qr', codigoQR)
    .select()
    .single();
  
  if (error) {
    console.error('Error marcando reserva como usada:', error);
    throw error;
  }
  
  return data;
}