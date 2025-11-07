'use client';

import { useState, useEffect } from 'react';
import { generarImagenQR } from '@/lib/qr-generator';

/**
 * Componente para mostrar un código QR
 * @param {Object} props
 * @param {string} props.codigo - El código que se convertirá en QR
 * @param {number} props.size - Tamaño del QR en píxeles (default: 256)
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.showText - Mostrar el código en texto debajo del QR (default: true)
 * @param {boolean} props.downloadable - Permitir descargar el QR (default: false)
 * @param {string} props.downloadName - Nombre del archivo al descargar
 */
export default function QrDisplay({ 
  codigo, 
  size = 256, 
  className = '',
  showText = true,
  downloadable = false,
  downloadName = 'qr-code'
}) {
  const [qrImage, setQrImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (codigo) {
      generarQR();
    }
  }, [codigo]);

  async function generarQR() {
    try {
      setLoading(true);
      setError('');
      const dataUrl = await generarImagenQR(codigo);
      setQrImage(dataUrl);
    } catch (err) {
      console.error('Error generando QR:', err);
      setError('No se pudo generar el código QR');
    } finally {
      setLoading(false);
    }
  }

  function descargarQR() {
    if (!qrImage) return;

    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `${downloadName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div 
          className="animate-pulse bg-gray-200 rounded-lg" 
          style={{ width: size, height: size }}
        />
        <p className="text-gray-500 text-sm mt-3">Generando QR...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div 
          className="bg-red-100 border-2 border-red-400 rounded-lg flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <span className="text-red-600 text-4xl">⚠️</span>
        </div>
        <p className="text-red-600 text-sm mt-3">{error}</p>
        <button
          onClick={generarQR}
          className="mt-2 text-blue-500 hover:text-blue-700 text-sm underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative group">
        <img
          src={qrImage}
          alt="Código QR"
          style={{ width: size, height: size }}
          className="rounded-lg shadow-lg"
        />
        
        {downloadable && (
          <button
            onClick={descargarQR}
            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-60 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
            title="Descargar QR"
          >
            <span className="text-white text-4xl">📥</span>
          </button>
        )}
      </div>

      {showText && (
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-xs font-mono break-all px-4 max-w-xs">
            {codigo}
          </p>
        </div>
      )}

      {downloadable && (
        <button
          onClick={descargarQR}
          className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          📥 Descargar QR
        </button>
      )}
    </div>
  );
}