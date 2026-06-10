import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

const imageModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/images/**/*.{jpg,jpeg,png,webp,avif}',
  { eager: true }
);

const imageByPublicPath = new Map<string, ImageMetadata>();

for (const [filePath, mod] of Object.entries(imageModules)) {
  const relativePath = filePath.replace('../assets/images/', '');
  imageByPublicPath.set(`/images/${relativePath}`, mod.default);
}

export function getImageMetadata(publicPath: string): ImageMetadata | undefined {
  return imageByPublicPath.get(publicPath);
}

export interface OptimizedImageData {
  src: string;
  srcSet: string;
  width: number;
  height: number;
}

export async function getOptimizedImageData(
  publicPath: string,
  options: { widths: number[]; sizes: string }
): Promise<OptimizedImageData | null> {
  const metadata = getImageMetadata(publicPath);
  if (!metadata) return null;

  const result = await getImage({
    src: metadata,
    widths: options.widths,
    sizes: options.sizes,
    format: 'webp',
  });

  return {
    src: result.src,
    srcSet: result.srcSet.attribute,
    width: result.attributes.width ?? options.widths[options.widths.length - 1],
    height: result.attributes.height ?? options.widths[options.widths.length - 1],
  };
}
