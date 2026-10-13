import { readFile, mkdir, writeFile } from 'node:fs/promises'

// GitHub Pages has no SPA rewrite rules. Ship a real entry for the notes route.
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
await mkdir(new URL('../dist/notes/', import.meta.url), { recursive: true })
await writeFile(new URL('../dist/notes/index.html', import.meta.url), html)
