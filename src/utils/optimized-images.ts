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

export const IMAGE_QUALITY = 85;

/** ~400px card thumbnails; covers up to 3× on mobile and 2× on desktop grid */
export const BLOG_CARD_IMAGE = {
  widths: [400, 800, 1200, 1600],
  sizes: '(max-width: 768px) 100vw, 400px',
} as const;

/** Post hero up to max-w-4xl (896px); covers 2× and 3× retina */
export const POST_HERO_IMAGE = {
  widths: [896, 1280, 1792, 2560],
  sizes: '(max-width: 1024px) 100vw, 896px',
} as const;

export interface OptimizedImageData {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
}

export async function getOptimizedImageData(
  publicPath: string,
  options: { widths: number[]; sizes: string; quality?: number }
): Promise<OptimizedImageData | null> {
  const metadata = getImageMetadata(publicPath);
  if (!metadata) return null;

  const maxWidth = options.widths[options.widths.length - 1];
  const result = await getImage({
    src: metadata,
    widths: options.widths,
    sizes: options.sizes,
    format: 'webp',
    quality: options.quality ?? IMAGE_QUALITY,
  });

  return {
    src: result.src,
    srcSet: result.srcSet.attribute,
    sizes: options.sizes,
    width: result.attributes.width ?? maxWidth,
    height:
      result.attributes.height ??
      Math.round((maxWidth / metadata.width) * metadata.height),
  };
}
