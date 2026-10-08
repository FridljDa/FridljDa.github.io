/**
 * LinkedIn's limits for a feed post, shared by the content schema, the copy
 * page (/post/<slug>/linkedin) and its test. The text and comment limits come
 * from third-party guides; the image limits from LinkedIn's help center.
 */
export const LINKEDIN = {
  /** Characters in the post text, spaces and line breaks included. */
  maxPostLength: 3000,
  /** Characters in a comment, which is where the link to the post often goes. */
  maxCommentLength: 1250,
  /** Images in one multi-photo post. */
  maxImages: 20,
  /** Roughly how much text shows before "see more", which also cuts after about three lines. */
  foldDesktop: 210,
  foldMobile: 140,
} as const;

/** Counts code points rather than UTF-16 units, so an emoji counts once. */
export function countCharacters(text: string): number {
  return [...text].length;
}
