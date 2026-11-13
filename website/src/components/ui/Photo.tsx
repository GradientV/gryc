// one of the GRYC's photos at the size it's shown. `width`/`height` are the CSS box
// the photo fills (for the aspect ratio and the 1x/2x files); CSS can still stretch it.
import { wixImage, wixUrl } from '@/lib/wix';
import { cn } from '@/lib/cn';
import type { Photo as PhotoData } from '@/data/photos';

type Props = {
    photo: PhotoData | { id: string; alt: string };
    width: number;
    height: number;
    className?: string;
    /** the photo people see first: load it right away */
    priority?: boolean;
    fit?: boolean;
};

export default function Photo({ photo, width, height, className, priority, fit }: Props) {
    const { src, srcSet } = wixImage(photo.id, width, height, fit ? 'fit' : 'fill');
    return (
        <img
            src={src}
            srcSet={srcSet}
            alt={photo.alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding="async"
            className={cn('block bg-paper-2', fit ? 'object-contain' : 'object-cover', className)}
        />
    );
}

/** a photo washed into the dark blue behind it, like a faded print: it keeps only its light
    and shade and takes the band's blue. It fills the nearest positioned parent, which needs
    a dark background, `isolate` and `overflow-hidden`. Decorative, so screen readers skip it.
    `className` sets how strong it shows (opacity) and where it's cropped (object-position). */
export function Backdrop({ photo, className, priority }: { photo: { id: string }; className?: string; priority?: boolean }) {
    return (
        <img
            src={wixUrl(photo.id, 1600, 900, 'fill', 60)}
            srcSet={`${wixUrl(photo.id, 800, 450, 'fill', 60)} 800w, ${wixUrl(photo.id, 1600, 900, 'fill', 60)} 1600w`}
            sizes="100vw"
            alt=""
            aria-hidden="true"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className={cn('pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-luminosity select-none', className)}
        />
    );
}
