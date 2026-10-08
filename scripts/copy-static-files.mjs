import { cp, copyFile, mkdir } from 'node:fs/promises';

await mkdir('dist', { recursive: true });
await copyFile('src/index.html', 'dist/index.html');
await cp('src/styles', 'dist/styles', { recursive: true });
await cp('src/assets', 'dist/assets', { recursive: true });
