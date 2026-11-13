// a crayon mark, like the kids' art all over the GRYC's photos: a double underline under the
// home page photos and the login panel, a small curl beside them. Drawn here as SVG and
// roughened by a filter (a warp for the wobbly edge, then fine noise punched out of the
// stroke for the waxy grain), so it's original and costs no image.
// It takes the text color: <Scribble className="text-sun-400" />.
import { useId } from 'react';
import { cn } from '@/lib/cn';

type Shape = { viewBox: string; paths: string[]; fit: 'slice' | 'meet' };

const SHAPES = {
    /** two quick strokes under something, like underlining it twice with a crayon */
    underline: {
        viewBox: '0 0 800 110',
        fit: 'meet',
        paths: ['M14 62 C 160 30, 300 82, 440 52 S 650 26, 786 44', 'M60 88 C 210 66, 390 98, 540 76 S 700 66, 760 74']
    },
    /** a small spiral, for a corner */
    curl: {
        viewBox: '0 0 300 300',
        fit: 'meet',
        paths: ['M48 236 C 18 132, 118 44, 200 82 S 246 214, 150 206 S 104 104, 196 70 S 276 70, 286 118']
    }
} satisfies Record<string, Shape>;

type Props = {
    shape?: keyof typeof SHAPES;
    /** stroke width, in the drawing's own units */
    weight?: number;
    className?: string;
};

export default function Scribble({ shape = 'underline', weight = 12, className }: Props) {
    const id = useId().replace(/:/g, '');
    const s: Shape = SHAPES[shape];
    return (
        <svg
            viewBox={s.viewBox}
            preserveAspectRatio={`xMidYMid ${s.fit}`}
            aria-hidden="true"
            focusable="false"
            className={cn('pointer-events-none', className)}
        >
            <defs>
                <filter id={`crayon-${id}`} x="-5%" y="-15%" width="110%" height="130%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7" result="warp" />
                    <feDisplacementMap in="SourceGraphic" in2="warp" scale="10" xChannelSelector="R" yChannelSelector="G" result="rough" />
                    <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="1" seed="3" result="grain" />
                    <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.6 0 0 0 1.75" result="wax" />
                    <feComposite in="rough" in2="wax" operator="in" />
                </filter>
            </defs>
            <g filter={`url(#crayon-${id})`} fill="none" stroke="currentColor" strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round">
                {s.paths.map((d) => (
                    <path key={d} d={d} />
                ))}
            </g>
        </svg>
    );
}
