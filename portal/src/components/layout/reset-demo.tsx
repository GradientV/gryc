'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { resetDemoData } from '@/server/actions/demo';
import { useAction } from '../use-action';
import { ConfirmDialog } from '../ui/dialog';

export function ResetDemo() {
  const [open, setOpen] = useState(false);
  const { run, pending } = useAction();
  const router = useRouter();

  return (
    <>
      <button type="button" className="btn btn-quiet btn-sm px-0" onClick={() => setOpen(true)}>
        Reset demo data
      </button>
      <ConfirmDialog
        open={open}
        title="Reset the demo data?"
        message="This wipes every change made in the demo and reloads the sample sites, visits, assessments, mileage and notes."
        confirmLabel="Reset"
        danger
        pending={pending}
        onClose={() => setOpen(false)}
        onConfirm={async () => {
          const r = await run(() => resetDemoData(), { success: 'Demo data reset.' });
          if (r.ok) {
            setOpen(false);
            router.push('/');
          }
        }}
      />
    </>
  );
}
