// Staff login, for the demo: any email and password signs you in and opens the SYEP
// portal (PORTAL_URL in src/data/site.ts). Nothing typed here is checked, stored or sent
// anywhere; the form only moves the browser to the portal. Real sign-in is planned in
// gryc/portal/docs/next-phase.md.
import { useId, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import Seo from '@/components/Seo';
import Logo from '@/components/brand/Logo';
import Scribble from '@/components/brand/Scribble';
import { SkipLink } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Backdrop } from '@/components/ui/Photo';
import { PHOTOS } from '@/data/photos';
import { PORTAL_URL, site } from '@/data/site';

const field =
    'mt-1.5 block min-h-12 w-full rounded-[var(--radius-ui)] border border-line bg-white/80 px-3.5 text-base text-ink placeholder:text-ink-3/70 focus:border-navy-500 focus:ring-3 focus:ring-navy-100 focus:outline-none';

export default function Login() {
    const [signingIn, setSigningIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const userId = useId();
    const passwordId = useId();
    // no portal address on this deploy yet: say so instead of sending staff nowhere
    const portalOpen = PORTAL_URL !== '';
    const [notOpenYet, setNotOpenYet] = useState(false);

    function signIn(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!portalOpen) {
            setNotOpenYet(true);
            return;
        }
        setSigningIn(true);
        // a short beat so the button visibly changes, then off to the portal
        window.setTimeout(() => window.location.assign(PORTAL_URL), 650);
    }

    return (
        <>
            <Seo pageId="login" />
            <SkipLink />
            <div className="grid min-h-dvh lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <section className="on-dark relative isolate overflow-hidden bg-navy-950 text-white">
                    <Backdrop photo={PHOTOS.staffGroup} priority className="object-[50%_35%] opacity-[0.36]" />
                    <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-navy-950 via-navy-950/70 to-navy-950/30" />
                    <Scribble shape="underline" weight={12} className="absolute bottom-8 left-6 h-12 w-64 text-sun-400 sm:left-10 lg:bottom-14 lg:left-14" />
                    <div className="relative flex h-full flex-col gap-10 px-5 py-6 sm:px-10 sm:py-8 lg:justify-between lg:p-14">
                        <Logo inverted />
                        <div className="pb-10 lg:pb-24">
                            <h1 className="display text-[2.8rem] sm:text-[3.6rem] lg:text-[4.3rem]">Staff portal</h1>
                            <p className="mt-4 max-w-md text-lg leading-relaxed text-white/80">
                                Site visits, timesheets, worksite assessments and mileage for GRYC site monitors, in one place.
                            </p>
                        </div>
                    </div>
                </section>

                <main id="main" tabIndex={-1} className="flex items-center justify-center px-5 py-12 outline-none sm:px-10 lg:py-16">
                    <div className="w-full max-w-sm">
                        <h2 className="display text-[2.5rem]">Log in</h2>
                        <p className="mt-2 text-ink-2">Use your GRYC staff account.</p>

                        <form onSubmit={signIn} className="mt-8 space-y-5">
                            <div>
                                <label htmlFor={userId} className="block text-[0.95rem] font-semibold text-ink">
                                    Email or username
                                </label>
                                <input id={userId} name="username" autoComplete="username" required disabled={signingIn} className={field} />
                            </div>
                            <div>
                                <div className="flex items-baseline justify-between">
                                    <label htmlFor={passwordId} className="block text-[0.95rem] font-semibold text-ink">
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-controls={passwordId}
                                        aria-pressed={showPassword}
                                        className="text-[0.88rem] font-semibold text-navy-600 hover:underline"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                <input
                                    id={passwordId}
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    disabled={signingIn}
                                    className={field}
                                />
                            </div>
                            <Button type="submit" size="lg" className="w-full" disabled={signingIn}>
                                {signingIn ? 'Signing you in…' : 'Log in'}
                            </Button>
                            <p aria-live="polite" className="sr-only">
                                {signingIn ? 'Signing you in to the staff portal.' : ''}
                            </p>
                        </form>

                        {portalOpen ? (
                            <p className="mt-4 text-[0.9rem] text-ink-3">Demo: any email and password signs you in.</p>
                        ) : (
                            <p aria-live="polite" className={notOpenYet ? 'mt-4 text-[0.95rem] font-semibold text-ink' : 'mt-4 text-[0.9rem] text-ink-3'}>
                                The staff portal opens in summer 2027.
                            </p>
                        )}

                        <div className="mt-10 space-y-3 border-t border-line pt-6 text-[0.95rem] text-ink-2">
                            <p>
                                Looking for staff email?{' '}
                                <a href={site.links.staffGmail} target="_blank" rel="noreferrer" className="link">
                                    Log in to staff Gmail
                                </a>
                            </p>
                            <p>
                                <Link to="/" className="link">
                                    Back to the GRYC website
                                </Link>
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
