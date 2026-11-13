'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const message = error instanceof Error ? error.message : '';
  const database = /database|ECONNREFUSED|querySrv|Server selection|MONGODB_URI/i.test(message);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="panel mx-auto max-w-xl p-6">
      <h1 className="text-xl">{database ? 'The database is not reachable' : 'Something went wrong'}</h1>
      {database ? (
        <div className="mt-3 space-y-2 text-[0.9375rem]">
          <p>
            Locally, check that MongoDB is running (on Windows it is the <b>MongoDB</b> service). Otherwise set{' '}
            <code>MONGODB_URI</code> in <code>.env.local</code> to your Atlas connection string.
          </p>
          <p className="muted">The steps are in docs/atlas-setup.md.</p>
          {message ? <p className="muted break-words text-sm">{message}</p> : null}
        </div>
      ) : (
        <p className="muted mt-3">The page could not load. Your saved work is not affected.</p>
      )}
      <button type="button" className="btn btn-primary mt-5" onClick={() => retry()}>
        Try again
      </button>
    </div>
  );
}
