// the <head> tags for one page: title, description, the canonical address and what a
// shared link looks like. React 19 hoists <title>/<meta>/<link> into <head> wherever they
// render, and scripts/prerender.ts bakes the same tags into each HTML file.
import { getPage, pageUrl, type PageId } from '@/data/pages';
import { SHARE_IMAGE } from '@/data/photos';
import { site } from '@/data/site';
import { wixUrl } from '@/lib/wix';

type Props = {
    pageId?: PageId;
    /** for pages that aren't in pages.ts (locations, 404) */
    path?: string;
    title?: string;
    description?: string;
    noindex?: boolean;
    schema?: object;
};

export default function Seo({ pageId, path, title, description, noindex, schema }: Props) {
    const page = pageId ? getPage(pageId) : undefined;
    const pageTitle = title ?? page?.title ?? site.name;
    const pageDescription = description ?? page?.description ?? '';
    const hidden = noindex ?? page?.noindex ?? false;
    const url = page ? pageUrl(page.path) : path ? pageUrl(path) : undefined;
    const image = wixUrl(SHARE_IMAGE.id, 1200, 630, 'fill', 85);

    return (
        <>
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />
            {hidden ? <meta name="robots" content="noindex, follow" /> : null}
            {url && !hidden ? <link rel="canonical" href={url} /> : null}

            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={site.name} />
            <meta property="og:locale" content="en_US" />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />
            {url ? <meta property="og:url" content={url} /> : null}
            <meta property="og:image" content={image} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={SHARE_IMAGE.alt} />
            <meta name="twitter:card" content="summary_large_image" />

            {/* "<" is escaped so nothing inside the data can close the script tag early */}
            {schema ? (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
            ) : null}
        </>
    );
}
