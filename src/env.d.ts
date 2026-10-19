declare namespace App {
  interface Locals {
    /**
     * Set by the Confluence copy of a post (/post/<slug>/confluence). Figures
     * drawn with CSS or SVG check it and render something a paste keeps instead.
     */
    confluence?: boolean;
  }
}
