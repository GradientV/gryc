import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import Footer from './Footer';
import Header from './Header';

/** new page: back to the top. A #hash in the link: scroll to that section instead */
export function ScrollManager() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
        } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [pathname, hash]);

    return null;
}

export function SkipLink() {
    return (
        <a
            href="#main"
            className="sr-only z-[60] bg-navy-800 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
            Skip to content
        </a>
    );
}

export default function Layout() {
    return (
        <>
            <SkipLink />
            <Header />
            <main id="main" tabIndex={-1} className="outline-none">
                <Outlet />
            </main>
            <Footer />
        </>
    );
}
