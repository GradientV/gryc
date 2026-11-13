import Link from 'next/link';
import { RegisterSiteForm } from '@/components/site/register-form';
import { PageHeader } from '@/components/ui/bits';

export const metadata = { title: 'Register a worksite' };

export default function NewSitePage() {
  return (
    <>
      <PageHeader
        crumbs={
          <>
            <Link href="/">Sites</Link> <span aria-hidden="true">/</span> Register a worksite
          </>
        }
        title="Register a worksite"
        sub="The fields follow the DYCD Worksite Application. Anything left out can be filled in later."
      />
      <RegisterSiteForm />
    </>
  );
}
