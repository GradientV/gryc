import { Suspense } from 'react';
import { SiteHeader, SiteHeaderSkeleton } from '@/components/site/site-header';

export default function SiteTabsLayout({ children, params }: LayoutProps<'/sites/[siteId]'>) {
  return (
    <>
      <Suspense fallback={<SiteHeaderSkeleton />}>
        <SiteHeader params={params} />
      </Suspense>
      {children}
    </>
  );
}
