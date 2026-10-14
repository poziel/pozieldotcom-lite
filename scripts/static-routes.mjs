import { readFile, mkdir, writeFile } from 'node:fs/promises'

// GitHub Pages has no SPA rewrite rules. Ship an entry for each subpage.
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
for (const route of ['notes', 'about', 'uses']) {
  await mkdir(new URL(`../dist/${route}/`, import.meta.url), { recursive: true })
  await writeFile(new URL(`../dist/${route}/index.html`, import.meta.url), html)
}
