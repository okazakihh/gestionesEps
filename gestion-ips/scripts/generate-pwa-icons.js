/**
 * Script para generar iconos PWA desde una imagen fuente
 * Requiere: npm install sharp --save-dev
 * 
 * Uso: node scripts/generate-pwa-icons.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const sourceImage = path.join(publicDir, 'logo-source.png');

// Verificar que existe la imagen fuente
if (!fs.existsSync(sourceImage)) {
  console.error('❌ No se encontró la imagen fuente: logo-source.png');
  console.error('Por favor, coloca la imagen en: public/logo-source.png');
  process.exit(1);
}

// Tamaños de iconos a generar
const iconSizes = [
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' }
];

// Generar iconos
async function generateIcons() {
  console.log('🎨 Generando iconos PWA...\n');

  for (const { size, name } of iconSizes) {
    const outputPath = path.join(publicDir, name);
    
    try {
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generado: ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Error generando ${name}:`, error.message);
    }
  }

  console.log('\n🎉 ¡Iconos PWA generados exitosamente!');
  console.log('\n📝 Archivos generados:');
  iconSizes.forEach(({ name }) => {
    console.log(`   - public/${name}`);
  });
}

generateIcons().catch(error => {
  console.error('❌ Error al generar iconos:', error);
  process.exit(1);
});
