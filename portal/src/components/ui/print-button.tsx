'use client';

export function PrintButton({ label = 'Print or save as PDF', primary }: { label?: string; primary?: boolean }) {
  return (
    <button type="button" className={`btn ${primary ? 'btn-primary' : ''}`} onClick={() => window.print()}>
      {label}
    </button>
  );
}
