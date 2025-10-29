// Script para generar iconos PWA básicos
// Este script crea iconos simples usando Canvas API

const fs = require('fs');
const path = require('path');

// Función para crear un icono simple con un círculo azul
function createIcon(size, filename) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Fondo blanco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Círculo azul (color del tema)
  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size * 0.4, 0, 2 * Math.PI);
  ctx.fill();

  // Texto "IPS" en blanco
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('IPS', size/2, size/2);

  return canvas.toDataURL('image/png').split(',')[1];
}

// Generar iconos
const sizes = [192, 512];
sizes.forEach(size => {
  const iconData = createIcon(size, `pwa-${size}x${size}.png`);
  fs.writeFileSync(path.join(__dirname, `pwa-${size}x${size}.png`), iconData, 'base64');
  console.log(`Generated pwa-${size}x${size}.png`);
});

// Crear icono de Apple Touch
const appleIconData = createIcon(180, 'apple-touch-icon.png');
fs.writeFileSync(path.join(__dirname, 'apple-touch-icon.png'), appleIconData, 'base64');
console.log('Generated apple-touch-icon.png');

console.log('PWA icons generated successfully!');