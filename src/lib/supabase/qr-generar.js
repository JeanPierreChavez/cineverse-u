import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

// Generar un código único para el QR
export function generarCodigoUnico() {
  return `CINE-${uuidv4()}`;
}

// Generar imagen QR como data URL (para mostrar en navegador)
export async function generarImagenQR(codigo) {
  try {
    const dataUrl = await QRCode.toDataURL(codigo, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return dataUrl;
  } catch (error) {
    console.error('Error generando QR:', error);
    throw error;
  }
}

// Generar QR como SVG (opcional, para mejor calidad)
export async function generarSVGQR(codigo) {
  try {
    const svg = await QRCode.toString(codigo, {
      type: 'svg',
      width: 400,
      margin: 2
    });
    return svg;
  } catch (error) {
    console.error('Error generando SVG QR:', error);
    throw error;
  }
}