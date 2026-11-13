// the same <App /> as main.tsx, drawn to a string of HTML instead of to the screen.
// Nothing in the browser loads this file: `npm run build` compiles it, and
// scripts/prerender.ts calls render() once per page to write the real HTML files.
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App';

export { ALL_PATHS, UPDATED } from './data/pages';
export { SITE_URL } from './data/site';

export function render(path: string): string {
    return renderToString(
        <StrictMode>
            <StaticRouter location={path}>
                <App />
            </StaticRouter>
        </StrictMode>
    );
}
