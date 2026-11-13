// the GRYC mark (the kids around the big G) with the name set beside it. The G is black,
// so on the dark bands the mark sits on a cream disc
import { Link } from 'react-router';
import { cn } from '@/lib/cn';

export function LogoMark({ size = 44, className }: { size?: number; className?: string }) {
    return (
        <img
            src="/gryc-logo-96.png"
            srcSet="/gryc-logo-96.png 1x, /gryc-logo-192.png 2x"
            width={size}
            height={size}
            alt=""
            className={cn('shrink-0', className)}
        />
    );
}

export default function Logo({ inverted = false, className }: { inverted?: boolean; className?: string }) {
    return (
        <Link to="/" className={cn('group flex shrink-0 items-center gap-2.5 sm:gap-3', className)} aria-label="The Greater Ridgewood Youth Council, home">
            {inverted ? (
                <span className="grid size-[3.25rem] shrink-0 place-items-center rounded-full bg-paper">
                    <LogoMark size={38} />
                </span>
            ) : (
                <LogoMark size={48} className="max-sm:size-[38px]" />
            )}
            <span
                className={cn(
                    'display leading-[1.02] tracking-[-0.01em] whitespace-nowrap',
                    inverted ? 'text-[1.08rem] text-paper sm:text-[1.24rem]' : 'text-[0.95rem] text-navy-900 sm:text-[1.24rem]'
                )}
            >
                Greater Ridgewood
                <br />
                Youth Council
            </span>
        </Link>
    );
}
