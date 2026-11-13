// the top of every page, on cream: a thin top row (phone, contact, social, like the old
// site's top bar), then the logo, the menu, Donate and the Staff login button.
// Wide screens get the full menu with a Programs drop-down; smaller ones get a Menu button.
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import Logo from '@/components/brand/Logo';
import { ButtonLink } from '@/components/ui/Button';
import SocialIcons from '@/components/ui/SocialIcons';
import { PROGRAMS } from '@/data/programs';
import { MAIN_NAV, PROGRAM_NAV, site } from '@/data/site';
import { cn } from '@/lib/cn';

/** the one-line description under each Programs menu item */
const PROGRAM_NOTES: Record<string, string> = Object.fromEntries([
    ...PROGRAMS.map((p) => [p.path, `${p.who} · ${p.cost}`]),
    ['/programs', 'Everything we run, in one place'],
    ['/programs/sign-up', 'Applying through DYCD Connect']
]);

function UtilityBar() {
    return (
        <div className="border-b border-line-2 text-[0.84rem] text-ink-3">
            <div className="shell flex h-9 items-center justify-between gap-4">
                <p className="hidden sm:block">{site.tagline}</p>
                <div className="flex w-full items-center justify-between gap-5 sm:w-auto sm:justify-end">
                    <a href={`tel:${site.phone.tel}`} className="font-semibold text-ink hover:text-navy-700 hover:underline">
                        {site.phone.display}
                    </a>
                    <div className="flex items-center gap-4">
                        <Link to="/contact" className="hover:text-navy-700 hover:underline">
                            Contact us
                        </Link>
                        <SocialIcons className="-mr-2 text-ink-3 [&_a:hover]:text-navy-700" iconClassName="h-4 w-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}

const navLink = (active: boolean) =>
    cn(
        'relative flex h-full items-center px-3 text-[0.97rem] font-semibold transition-colors',
        'after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:transition-colors',
        active ? 'text-navy-700 after:bg-navy-600' : 'text-ink-2 hover:text-navy-700 after:bg-transparent hover:after:bg-line'
    );

function ProgramsMenu() {
    const { pathname } = useLocation();
    // the menu remembers which page it was opened on, so going to another page closes it
    const [openOn, setOpenOn] = useState<string | null>(null);
    const open = openOn === pathname;
    const wrapRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // close on a click elsewhere and on Escape
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!wrapRef.current?.contains(e.target as Node)) setOpenOn(null);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpenOn(null);
                buttonRef.current?.focus();
            }
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const active = pathname.startsWith('/programs');

    return (
        <div ref={wrapRef} className="relative h-full">
            <button
                ref={buttonRef}
                type="button"
                aria-expanded={open}
                aria-controls="programs-menu"
                onClick={() => setOpenOn(open ? null : pathname)}
                className={cn(navLink(active), 'gap-1.5')}
            >
                Programs
                <svg viewBox="0 0 12 12" aria-hidden="true" className={cn('h-2.5 w-2.5 transition-transform', open && 'rotate-180')}>
                    <path d="M1.5 4 6 8.5 10.5 4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
            </button>
            <div
                id="programs-menu"
                hidden={!open}
                className="absolute top-full left-0 z-40 w-[23rem] border border-line bg-paper py-2"
            >
                <ul>
                    {PROGRAM_NAV.map((item) => (
                        <li key={item.to}>
                            <Link to={item.to} className="block px-4 py-2.5 hover:bg-paper-2 focus-visible:bg-paper-2">
                                <span className="block font-semibold text-ink">{item.label}</span>
                                <span className="block text-[0.84rem] text-ink-3">{PROGRAM_NOTES[item.to]}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

/** the full-screen menu on phones and tablets. A modal <dialog> keeps keyboard focus
    inside, closes on Escape and hides the page behind it from screen readers */
function MobileMenu({ onClose }: { onClose: () => void }) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (dialog && !dialog.open) dialog.showModal();
    }, []);

    const item = 'display block py-2 text-[1.45rem] text-ink';

    return (
        <dialog
            ref={ref}
            onClose={onClose}
            aria-label="Menu"
            className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-paper p-0 text-ink backdrop:bg-ink/40"
        >
            <div className="shell flex h-[84px] items-center justify-between border-b border-line">
                <Logo />
                <button type="button" onClick={() => ref.current?.close()} className="min-h-11 px-2 font-semibold text-navy-700">
                    Close
                </button>
            </div>
            <nav aria-label="Main" className="shell py-6">
                <p className="label">Programs</p>
                <ul className="mt-1 border-b border-line pb-4">
                    {PROGRAM_NAV.map((l) => (
                        <li key={l.to}>
                            <NavLink to={l.to} end className={({ isActive }) => cn(item, isActive && 'text-navy-600')}>
                                {l.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
                <ul className="mt-4 border-b border-line pb-4">
                    {[...MAIN_NAV, { to: '/contact', label: 'Contact us' }, { to: '/donate', label: 'Donate' }].map((l) => (
                        <li key={l.to}>
                            <NavLink to={l.to} className={({ isActive }) => cn(item, isActive && 'text-navy-600')}>
                                {l.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
                <div className="mt-6 grid gap-3">
                    <ButtonLink to="/login" size="lg">
                        Staff login
                    </ButtonLink>
                    <a href={`tel:${site.phone.tel}`} className="text-center font-semibold text-navy-700">
                        Call {site.phone.display}
                    </a>
                </div>
            </nav>
        </dialog>
    );
}

export default function Header() {
    const { pathname } = useLocation();
    // like the Programs menu: opened on one page, so a new page closes it
    const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
    const menuOpen = menuOpenOn === pathname;
    const setMenuOpen = (next: boolean) => setMenuOpenOn(next ? pathname : null);

    return (
        <header>
            <UtilityBar />
            <div className="border-b border-line bg-paper">
                <div className="shell flex h-[84px] items-center gap-3 sm:gap-4">
                    <Logo />
                    <nav aria-label="Main" className="ml-auto hidden h-full items-stretch xl:flex">
                        <ProgramsMenu />
                        {MAIN_NAV.map((l) => (
                            <NavLink key={l.to} to={l.to} className={({ isActive }) => navLink(isActive)}>
                                {l.label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="ml-auto flex items-center gap-1.5 sm:gap-2 xl:ml-3">
                        <ButtonLink to="/donate" variant="outline" size="sm" className="max-sm:hidden">
                            Donate
                        </ButtonLink>
                        <ButtonLink to="/login" size="sm" className="max-sm:px-3">
                            Staff login
                        </ButtonLink>
                        <button
                            type="button"
                            onClick={() => setMenuOpen(true)}
                            aria-haspopup="dialog"
                            className="-mr-1 min-h-11 px-1.5 font-semibold text-navy-700 sm:px-2 xl:hidden"
                        >
                            Menu
                        </button>
                    </div>
                </div>
            </div>
            {menuOpen ? <MobileMenu onClose={() => setMenuOpen(false)} /> : null}
        </header>
    );
}
