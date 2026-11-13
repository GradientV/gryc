import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
// fonts are served from node_modules: no Google Fonts request, no third-party host
import '@fontsource-variable/newsreader/opsz.css'; // headlines (weight + optical size axes)
import '@fontsource-variable/albert-sans/wght.css'; // body text
import '@fontsource-variable/albert-sans/wght-italic.css';
import './index.css';

const container = document.getElementById('root');
if (!container) throw new Error('missing #root');

const app = (
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
);

// after `npm run build`, the HTML for this exact page is already inside #root
// (scripts/prerender.ts drew it and stamped the div with the page's address):
// hydrate = keep that HTML and wire up the clicks. With `npm run dev`, or on the
// 404 page, React draws the page from scratch.
const here = window.location.pathname.replace(/(.)\/$/, '$1');

if (container.dataset.prerendered === here) {
    hydrateRoot(container, app);
} else {
    clearPrerenderedHead();
    createRoot(container).render(app);
}

/** when the HTML that arrived is for a different page (the 404), its <title> and <meta>
    tags are wrong. prerender.ts fences them with two comments; this removes them */
function clearPrerenderedHead() {
    const nodes = [...document.head.childNodes];
    const isMarker = (node: ChildNode, text: string) => node.nodeType === Node.COMMENT_NODE && (node as Comment).data === text;
    const start = nodes.findIndex((node) => isMarker(node, 'page-head'));
    const end = nodes.findIndex((node) => isMarker(node, '/page-head'));
    if (start === -1 || end === -1) return;
    nodes.slice(start + 1, end).forEach((node) => node.remove());
}
