'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';

/* A native <dialog>: focus is trapped, Escape closes it, and it is announced
   as a dialog without any extra code. Centred on a laptop, a sheet that rises
   from the bottom on a phone (see .dialog in globals.css). */

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  wide?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  /** wrap the body and footer in a <form> that calls this on submit */
  onSubmit?: () => void;
}

export function Dialog({ open, onClose, title, wide, children, footer, onSubmit }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const inner = (
    <>
      <div className="dialog-b">{children}</div>
      {footer ? <div className="dialog-f">{footer}</div> : null}
    </>
  );

  return (
    <dialog
      ref={ref}
      className={`dialog ${wide ? 'wide' : ''}`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open ? (
        <>
          <div className="dialog-h">
            <h2 id={titleId}>{title}</h2>
          </div>
          {onSubmit ? (
            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
              noValidate
            >
              {inner}
            </form>
          ) : (
            inner
          )}
        </>
      ) : null}
    </dialog>
  );
}

interface ConfirmProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel, danger, pending, onConfirm, onClose }: ConfirmProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn btn-primary ${danger ? 'btn-destructive' : ''}`}
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="text-[0.9375rem]">{message}</div>
    </Dialog>
  );
}
