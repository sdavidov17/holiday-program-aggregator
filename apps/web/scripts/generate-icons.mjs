#!/usr/bin/env node

/**
 * PWA Icon Generator
 * Generates PNG icons in all required sizes from the base SVG
 */

import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '../public/icons');
const svgPath = join(iconsDir, 'icon.svg');

// All required icon sizes for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  // Ensure icons directory exists
  if (!existsSync(iconsDir)) {
    mkdirSync(iconsDir, { recursive: true });
  }

  const svgBuffer = readFileSync(svgPath);

  console.log('Generating PWA icons...\n');

  for (const size of sizes) {
    const outputPath = join(iconsDir, `icon-${size}x${size}.png`);

    await sharp(svgBuffer).resize(size, size).png().toFile(outputPath);

    console.log(`✓ Generated icon-${size}x${size}.png`);
  }

  // Generate favicon.ico (using 32x32 PNG as base)
  const faviconPath = join(__dirname, '../public/favicon.ico');
  await sharp(svgBuffer).resize(32, 32).png().toFile(faviconPath.replace('.ico', '.png'));

  console.log('\n✓ Generated favicon.png (rename to favicon.ico if needed)');
  console.log('\nIcon generation complete!');
}

generateIcons().catch(console.error);
