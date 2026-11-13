import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="panel mx-auto max-w-xl p-6">
      <h1 className="text-xl">Not found</h1>
      <p className="muted mt-2">That page or worksite does not exist, or it is not assigned to you.</p>
      <Link href="/" className="btn mt-5">
        Back to your sites
      </Link>
    </div>
  );
}
