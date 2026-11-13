// the photos stay on Wix's image CDN for now: it resizes and converts on the fly,
// so each spot asks for exactly the size it shows (WebP/AVIF where the browser takes it).
// When the GRYC leaves Wix, these move to public/images and this file is the only one to change.
//
// a media id looks like 0632b7_abeb6277e89f42888e4967cfcf0c9230~mv2.png

const CDN = 'https://static.wixstatic.com/media';

type Mode = 'fill' | 'fit';

/** one URL at one size. "fill" crops to the box (centered), "fit" keeps the whole image */
export function wixUrl(id: string, width: number, height: number, mode: Mode = 'fill', quality = 80): string {
    const w = Math.round(width);
    const h = Math.round(height);
    const crop = mode === 'fill' ? ',al_c' : '';
    // the last segment is only a file name; Wix ignores it, but it must be there
    const name = id.replace(/~mv2/, '').replace(/[^a-z0-9._-]/gi, '_');
    return `${CDN}/${id}/v1/${mode}/w_${w},h_${h}${crop},q_${quality},enc_auto/${name}`;
}

/** src + srcset (1x and 2x) for an <img> shown at width × height CSS pixels */
export function wixImage(id: string, width: number, height: number, mode: Mode = 'fill') {
    return {
        src: wixUrl(id, width, height, mode),
        srcSet: `${wixUrl(id, width, height, mode)} 1x, ${wixUrl(id, width * 2, height * 2, mode, 70)} 2x`
    };
}

/** the original file, full size: for flyers people want to read or save */
export function wixOriginal(id: string): string {
    return `${CDN}/${id}`;
}
