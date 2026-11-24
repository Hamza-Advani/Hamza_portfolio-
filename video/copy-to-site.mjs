// Copies the rendered video, poster and social image into the website's public folder.
import fs from 'node:fs';
const out = new URL('./out/', import.meta.url);
const pub = new URL('../client/public/', import.meta.url);
fs.mkdirSync(new URL('media/', pub), { recursive: true });
fs.copyFileSync(new URL('intro.mp4', out), new URL('media/intro.mp4', pub));
fs.copyFileSync(new URL('intro-poster.jpg', out), new URL('media/intro-poster.jpg', pub));
// og-image.jpg is now designed separately (brand share card) — not overwritten by the video build.
console.log('✔ Copied intro.mp4, intro-poster.jpg to client/public');
