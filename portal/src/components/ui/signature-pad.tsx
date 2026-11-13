'use client';

import { useEffect, useRef, useState } from 'react';

/* Draw with a finger, stylus or mouse, or type the name. The value is either
   "typed:Full Name" or a PNG data URL, kept small (one pixel per CSS pixel)
   so a signed form stays light. */

export function SignatureView({ value, className = '' }: { value: string; className?: string }) {
  if (!value) return <span className="muted">Not signed</span>;
  if (value.startsWith('typed:')) return <span className={`sig-typed ${className}`}>{value.slice(6)}</span>;
  // eslint-disable-next-line @next/next/no-img-element -- a data URL, nothing to optimize
  return <img src={value} alt="Signature" className={`max-h-14 ${className}`} />;
}

export function SignaturePad({
  value,
  onChange,
  name,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  /** pre-fills "type instead" */
  name: string;
  label: string;
}) {
  const [mode, setMode] = useState<'draw' | 'saved' | 'type'>(value ? 'saved' : 'draw');
  const [typed, setTyped] = useState(name);
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const inked = useRef(false);
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  useEffect(() => {
    if (mode !== 'draw') return;
    const el = canvas.current;
    const box = wrap.current;
    if (!el || !box) return;
    const fit = () => {
      const r = box.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      el.width = Math.max(1, Math.round(r.width * dpr));
      el.height = Math.max(1, Math.round(r.height * dpr));
      const ctx = el.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#15171c';
      inked.current = false;
      /* resizing wipes a canvas; put back what was already drawn */
      if (latest.current.startsWith('data:image/png')) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, r.width, r.height);
        img.src = latest.current;
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [mode]);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function exportPng(): string {
    const el = canvas.current;
    const box = wrap.current;
    if (!el || !box) return '';
    const r = box.getBoundingClientRect();
    const out = document.createElement('canvas');
    out.width = Math.round(Math.min(r.width, 640));
    out.height = Math.round((r.height * out.width) / r.width);
    out.getContext('2d')?.drawImage(el, 0, 0, out.width, out.height);
    return out.toDataURL('image/png');
  }

  return (
    <div>
      {mode === 'saved' ? (
        <div className="sigpad signed flex items-center px-4">
          <SignatureView value={value} />
        </div>
      ) : mode === 'type' ? (
        <div className="sigpad signed flex flex-col justify-center gap-2 px-4">
          <span className="label mb-0">Type the full name</span>
          <div className="flex gap-2">
            <input
              aria-label={`${label}: typed name`}
              className="input"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoFocus
            />
            <button
              type="button"
              className="btn btn-primary"
              disabled={!typed.trim()}
              onClick={() => {
                onChange(`typed:${typed.trim()}`);
                setMode('saved');
              }}
            >
              Sign
            </button>
          </div>
        </div>
      ) : (
        <div ref={wrap} className={`sigpad ${value ? 'signed' : ''}`}>
          <canvas
            ref={canvas}
            aria-label={`${label}: draw a signature`}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              const ctx = e.currentTarget.getContext('2d');
              const p = point(e);
              drawing.current = true;
              ctx?.beginPath();
              ctx?.moveTo(p.x, p.y);
              ctx?.lineTo(p.x + 0.1, p.y + 0.1);
              ctx?.stroke();
            }}
            onPointerMove={(e) => {
              if (!drawing.current) return;
              const ctx = e.currentTarget.getContext('2d');
              const p = point(e);
              ctx?.lineTo(p.x, p.y);
              ctx?.stroke();
              inked.current = true;
            }}
            onPointerUp={() => {
              if (!drawing.current) return;
              drawing.current = false;
              if (inked.current) onChange(exportPng());
            }}
            onPointerCancel={() => {
              drawing.current = false;
            }}
          />
          {!value ? <div className="ph">Sign here with a finger or the mouse</div> : null}
        </div>
      )}
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
        <span className="kicker">{label}</span>
        <span className="flex gap-1">
          {mode !== 'type' ? (
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => setMode('type')}>
              Type instead
            </button>
          ) : (
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => setMode(value ? 'saved' : 'draw')}>
              Draw instead
            </button>
          )}
          {value ? (
            <button
              type="button"
              className="btn btn-quiet btn-sm"
              onClick={() => {
                onChange('');
                setMode('draw');
              }}
            >
              Clear
            </button>
          ) : null}
        </span>
      </div>
    </div>
  );
}
