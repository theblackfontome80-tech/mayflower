/**
 * Génère les images optimisées du site à partir des originaux.
 *
 *   source-photos/<nom>.webp →  assets/img/<nom>-640.webp
 *                                assets/img/<nom>-1200.webp
 *                                assets/img/<nom>-1800.webp
 *
 * Pour remplacer une photo : déposez un nouveau fichier portant le même nom
 * dans source-photos/, puis lancez `npm run images`.
 */
import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'source-photos');
const out = path.join(root, 'assets', 'img');
const WIDTHS = [640, 1200, 1800];

await mkdir(out, { recursive: true });
const files = (await readdir(src)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

for (const file of files) {
  const name = file.replace(/\.[^.]+$/, '');
  const input = sharp(path.join(src, file)).rotate();
  const { width, height } = await input.metadata();
  for (const w of WIDTHS) {
    const target = Math.min(w, width);
    await input
      .clone()
      .resize({ width: target, withoutEnlargement: true })
      .webp({ quality: w === 640 ? 72 : 78, effort: 5 })
      .toFile(path.join(out, `${name}-${w}.webp`));
  }
  console.log(`✓ ${name} (${width}×${height})`);
}

// Image de partage (Open Graph) 1200×630
await sharp(path.join(src, 'corbeille-roses-lys.webp'))
  .resize(1200, 630, { fit: 'cover', position: 'attention' })
  .webp({ quality: 82 })
  .toFile(path.join(root, 'assets', 'og-image.webp'));
console.log('✓ og-image.webp');
