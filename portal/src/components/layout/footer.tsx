import { ResetDemo } from './reset-demo';

export function Footer() {
  return (
    <footer className="site-footer mt-16 border-t border-[var(--color-line)] pb-24 md:pb-0">
      <div className="shell flex flex-col gap-3 py-6 text-[0.8125rem] text-[var(--color-ink-3)] md:flex-row md:items-center md:justify-between">
        <p>© 2026 The Greater Ridgewood Youth Council, Inc.</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="flex items-center gap-2">
            Demo with sample data
            <ResetDemo />
          </span>
          <span>
            Designed &amp; built by{' '}
            <a href="https://gradientv.com" target="_blank" rel="noopener">
              GradientV
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
