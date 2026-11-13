import type { ComponentType } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import Layout, { ScrollManager } from '@/components/layout/Layout';
import { ALIASES } from '@/data/aliases';
import { PAGES, type PageId } from '@/data/pages';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Donate from '@/pages/Donate';
import Home from '@/pages/Home';
import JobApply from '@/pages/JobApply';
import Jobs from '@/pages/Jobs';
import LocationDetail from '@/pages/LocationDetail';
import Locations from '@/pages/Locations';
import Login from '@/pages/Login';
import News from '@/pages/News';
import NotFound from '@/pages/NotFound';
import Payments from '@/pages/Payments';
import PreK from '@/pages/PreK';
import ProgramSites from '@/pages/ProgramSites';
import Programs from '@/pages/Programs';
import SignUp from '@/pages/SignUp';
import Syep from '@/pages/Syep';

/** which component draws each page in src/data/pages.ts (the login page has no site header or footer) */
const PAGE_COMPONENTS: Record<Exclude<PageId, 'login'>, ComponentType> = {
    home: Home,
    about: About,
    programs: Programs,
    prek: PreK,
    k5: () => <ProgramSites program="k5" />,
    fee: () => <ProgramSites program="fee" />,
    ms: () => <ProgramSites program="ms" />,
    syep: Syep,
    signup: SignUp,
    locations: Locations,
    jobs: Jobs,
    apply: JobApply,
    payments: Payments,
    donate: Donate,
    contact: Contact,
    news: News
};

export default function App() {
    return (
        <>
            <ScrollManager />
            <Routes>
                <Route path="login" element={<Login />} />
                <Route element={<Layout />}>
                    {PAGES.filter((p) => p.id !== 'login').map((page) => {
                        const Page = PAGE_COMPONENTS[page.id as Exclude<PageId, 'login'>];
                        return page.path === '/' ? <Route key={page.id} index element={<Page />} /> : <Route key={page.id} path={page.path.slice(1)} element={<Page />} />;
                    })}
                    <Route path="locations/:slug" element={<LocationDetail />} />
                    {Object.entries(ALIASES).map(([from, to]) => (
                        <Route key={from} path={from.slice(1)} element={<Navigate to={to} replace />} />
                    ))}
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </>
    );
}
