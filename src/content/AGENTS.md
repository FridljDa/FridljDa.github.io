# Blog thumbnail style

Apply this guide to every blog post `image` and to new thumbnails under `blog/`.

- Create a 16:9 landscape raster illustration, composed to survive a centered 2:1 `object-cover` crop. Keep the subject inside the middle 70% of the canvas.
- Use a minimal editorial vector style: crisp geometric forms, rounded corners, consistent dark-navy strokes, flat fills, and at most a faint paper grain. No photorealism or 3D rendering.
- Use the same restrained palette throughout: warm off-white `#F7F4EE` background, dark navy `#17324D` outlines, teal `#2A9D8F`, blue `#4F86C6`, and one sparing accent in coral `#E76F51` or amber `#E9C46A`.
- Express the post with one clear visual metaphor and roughly 2–5 large elements. Prefer a strong silhouette and generous negative space over detail.
- Include no title, words, letters, numbers, logos, brand marks, watermarks, interface copy, equations, or faux code. The article card already supplies the title.
- Avoid dense diagrams, tiny icons, busy backgrounds, neon glow, heavy gradients, glassmorphism, and generic humanoid robots.
- Preserve the full-resolution source under `src/assets/images/blog/<post-slug>/featured.png` and reference it as `/images/blog/<post-slug>/featured.png`. Do not alter other images embedded inside posts, and do not route thumbnails through Astro image optimization.
