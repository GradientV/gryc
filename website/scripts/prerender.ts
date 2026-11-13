// The last step of `npm run build`: draws every page once and saves it as real HTML,
// so search engines and link previews see the content without running JavaScript.
//
// It takes dist/index.html (the browser build) and dist-server/entry-server.js
// (the same app built for Node), then for each address in ALL_PATHS writes
//   /                 -> dist/index.html
//   /programs/pre-k   -> dist/programs/pre-k.html   (vercel.json's cleanUrls serves it without .html)
// plus dist/404.html, dist/sitemap.xml and dist/robots.txt.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

type PathEntry = { path: string; priority: number; changefreq: string; noindex?: boolean };
type ServerEntry = { render: (path: string) => string; ALL_PATHS: PathEntry[]; UPDATED: string; SITE_URL: string };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const serverEntry = pathToFileURL(path.join(root, 'dist-server', 'entry-server.js')).href;

const { render, ALL_PATHS, UPDATED, SITE_URL }: ServerEntry = await import(serverEntry);
const template = await readFile(path.join(dist, 'index.html'), 'utf8');

if (!template.includes('<!--page-head-->') || !template.includes('<!--page-body-->')) {
    throw new Error('dist/index.html is missing the <!--page-head--> or <!--page-body--> marker');
}

// React puts a page's <title>, <meta> and <link> tags (including image preloads) at the
// very start of what it renders. They belong in <head>, so peel them off the front.
const HEAD_TAG = /^(?:<link\b[^>]*\/>|<meta\b[^>]*\/>|<title>[\s\S]*?<\/title>)/;

function splitHead(html: string): { head: string; body: string } {
    let head = '';
    let body = html;
    for (let match = HEAD_TAG.exec(body); match; match = HEAD_TAG.exec(body)) {
        head += match[0];
        body = body.slice(match[0].length);
    }
    return { head, body };
}

/** the page's head tags go between two comments, so main.tsx can find and clear them on the 404 page */
function page(html: string, stamp: string | null): string {
    const { head, body } = splitHead(html);
    const div = stamp ? `<div id="root" data-prerendered="${stamp}">` : '<div id="root">';
    return template
        .replace('<!--page-head-->', () => `<!--page-head-->${head}<!--/page-head-->`)
        .replace('<div id="root"><!--page-body--></div>', () => `${div}${body}</div>`);
}

async function save(file: string, contents: string) {
    const full = path.join(dist, file);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, contents);
}

for (const { path: route } of ALL_PATHS) {
    const file = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
    await save(file, page(render(route), route));
}

// no stamp: main.tsx sees the address doesn't match and draws the right page fresh
await save('404.html', page(render('/this-page-does-not-exist'), null));

const urls = ALL_PATHS.filter((p) => !p.noindex)
    .map((p) => {
        const loc = p.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${p.path}`;
        return `  <url><loc>${loc}</loc><lastmod>${UPDATED}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`;
    })
    .join('\n');
await save('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
await save('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`prerendered ${ALL_PATHS.length} pages, 404.html, sitemap.xml and robots.txt`);
