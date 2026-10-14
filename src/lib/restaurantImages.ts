import { existsSync } from 'node:fs';
import path from 'node:path';

// Imágenes de cada restaurante, sin tocar ningún código ni datos: basta con dejar los archivos en
// public/images/restaurantes/ con el id del restaurante (el campo «id» de src/data/restaurants.json):
//   <id>-logo.png   (también .webp, .svg, .jpg)   → logo, a la izquierda de la tarjeta
//   <id>-banner.jpg (también .webp, .png)         → foto de comida que va por detrás de la tarjeta
// Si un archivo no existe, la tarjeta usa el degradado naranja y el icono de siempre.
const DIR = path.join(process.cwd(), 'public', 'images', 'restaurantes');
const EXT: Record<'logo' | 'banner', string[]> = {
  logo: ['png', 'webp', 'svg', 'jpg', 'jpeg'],
  banner: ['jpg', 'jpeg', 'webp', 'png']
};

export function restaurantImage(id: string, kind: 'logo' | 'banner'): string | null {
  for (const ext of EXT[kind]) {
    if (existsSync(path.join(DIR, `${id}-${kind}.${ext}`))) return `/images/restaurantes/${id}-${kind}.${ext}`;
  }
  return null;
}
