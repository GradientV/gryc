// the program finder: every school site plus the two Pre-K centers, narrowed by grade,
// cost and neighborhood. It starts unfiltered, so the prerendered HTML and the first
// browser pass match; filtering happens after that, in the browser.
import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { LOCATIONS } from '@/data/locations';
import { locationPath } from '@/data/pages';
import { PREK_CENTERS } from '@/data/programs';
import { cn } from '@/lib/cn';
import { plural } from '@/lib/format';

type Band = '3-K & Pre-K' | 'K–5' | '6–8' | 'K–12';

type Entry = {
    key: string;
    name: string;
    address: string;
    area: string;
    band: Band;
    grades: string;
    cost: 'free' | 'fee';
    hours: string;
    kind: string;
    href: string;
};

const KIND: Record<string, string> = {
    COMPASS: 'COMPASS after school',
    SONYC: 'SONYC middle school',
    Beacon: 'Beacon community center',
    'GRYC fee-based': 'GRYC after school'
};

const ENTRIES: Entry[] = [
    ...PREK_CENTERS.map((c) => ({
        key: c.key,
        name: c.name,
        address: c.street,
        area: 'Ridgewood',
        band: '3-K & Pre-K' as const,
        grades: '3-K, Pre-K',
        cost: 'free' as const,
        hours: 'Full day, Mon–Fri',
        kind: 'Little Stars 3-K & Pre-K',
        href: '/programs/pre-k'
    })),
    ...LOCATIONS.map((l) => ({
        key: l.slug,
        name: l.short,
        address: l.address.split(',')[0],
        area: l.area,
        band: l.grades as Band,
        grades: l.grades,
        cost: l.cost,
        hours: l.hours,
        kind: KIND[l.model],
        href: locationPath(l.slug)
    }))
];

/** neighborhoods from Ridgewood outward, so the list starts close to home */
const AREA_ORDER = [
    'Ridgewood',
    'Glendale',
    'Middle Village',
    'Maspeth',
    'Woodhaven',
    'Richmond Hill',
    'Elmhurst',
    'Flushing',
    'Astoria',
    'South Ozone Park',
    'Rosedale',
    'Brooklyn'
];
const rank = (area: string) => {
    const i = AREA_ORDER.indexOf(area);
    return i === -1 ? AREA_ORDER.length : i;
};
const BAND_ORDER: Band[] = ['3-K & Pre-K', 'K–5', '6–8', 'K–12'];

ENTRIES.sort(
    (a, b) =>
        rank(a.area) - rank(b.area) ||
        BAND_ORDER.indexOf(a.band) - BAND_ORDER.indexOf(b.band) ||
        a.name.localeCompare(b.name, 'en', { numeric: true })
);

const AREAS = [...new Set(ENTRIES.map((e) => e.area))];

const GRADES = [
    { id: 'all', label: 'All ages' },
    { id: 'prek', label: '3-K & Pre-K' },
    { id: 'k5', label: 'K–5' },
    { id: 'ms', label: '6–8' },
    { id: 'teen', label: 'Teens & adults' }
] as const;

const COSTS = [
    { id: 'all', label: 'Free and fee-based' },
    { id: 'free', label: 'Free' },
    { id: 'fee', label: 'Fee-based' }
] as const;

type GradeId = (typeof GRADES)[number]['id'];
type CostId = (typeof COSTS)[number]['id'];

function matchesGrade(e: Entry, g: GradeId) {
    if (g === 'all') return true;
    if (g === 'prek') return e.band === '3-K & Pre-K';
    if (g === 'k5') return e.band === 'K–5' || e.band === 'K–12';
    if (g === 'ms') return e.band === '6–8' || e.band === 'K–12';
    return e.band === 'K–12';
}

/** a row of text options. The chosen one is underlined, like the header's menu */
function Options<T extends string>({ label, options, value, onChange }: { label: string; options: readonly { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
    return (
        <fieldset className="m-0 flex min-w-0 flex-wrap gap-x-1 gap-y-1 border-0 p-0">
            <legend className="sr-only">{label}</legend>
            {options.map((o) => (
                <button
                    key={o.id}
                    type="button"
                    aria-pressed={value === o.id}
                    onClick={() => onChange(o.id)}
                    className={cn(
                        'relative min-h-10 px-2.5 text-[0.95rem] font-semibold transition-colors',
                        'after:absolute after:inset-x-2.5 after:bottom-1 after:h-[3px]',
                        value === o.id ? 'text-navy-700 after:bg-sun-400' : 'text-ink-2 hover:text-navy-700'
                    )}
                >
                    {o.label}
                </button>
            ))}
        </fieldset>
    );
}

export default function Finder({ limit, className }: { limit?: number; className?: string }) {
    const [grade, setGrade] = useState<GradeId>('all');
    const [cost, setCost] = useState<CostId>('all');
    const [area, setArea] = useState('all');
    const [showAll, setShowAll] = useState(false);
    const areaId = useId();

    const results = useMemo(
        () => ENTRIES.filter((e) => matchesGrade(e, grade) && (cost === 'all' || e.cost === cost) && (area === 'all' || e.area === area)),
        [grade, cost, area]
    );
    const filtered = grade !== 'all' || cost !== 'all' || area !== 'all';
    const shown = limit && !showAll && !filtered ? results.slice(0, limit) : results;

    function reset() {
        setGrade('all');
        setCost('all');
        setArea('all');
    }

    return (
        <div className={className}>
            <div className="grid gap-x-8 gap-y-3 border-y border-line py-3 lg:grid-cols-[auto_auto_1fr] lg:items-center">
                <div className="flex flex-wrap items-center gap-x-2">
                    <span aria-hidden="true" className="label w-16 shrink-0">
                        Grade
                    </span>
                    <Options label="Grade" options={GRADES} value={grade} onChange={setGrade} />
                </div>
                <div className="flex flex-wrap items-center gap-x-2">
                    <span aria-hidden="true" className="label w-16 shrink-0 lg:w-auto">
                        Cost
                    </span>
                    <Options label="Cost" options={COSTS} value={cost} onChange={setCost} />
                </div>
                <div className="flex items-center gap-3 lg:justify-end">
                    <label htmlFor={areaId} className="label w-16 shrink-0 lg:w-auto">
                        Area
                    </label>
                    <select
                        id={areaId}
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="min-h-10 rounded-[var(--radius-ui)] border border-line bg-paper px-3 pr-8 text-[0.95rem] font-semibold text-ink"
                    >
                        <option value="all">All neighborhoods</option>
                        {AREAS.map((a) => (
                            <option key={a} value={a}>
                                {a}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3 text-[0.95rem] text-ink-3" aria-live="polite">
                <p>
                    {filtered ? `${plural(results.length, 'program')} match` : `${plural(results.length, 'program')} in Queens and Brooklyn`}
                    {shown.length < results.length ? `, showing ${shown.length}` : ''}
                </p>
                {filtered ? (
                    <button type="button" onClick={reset} className="font-semibold text-navy-600 hover:underline">
                        Clear filters
                    </button>
                ) : null}
            </div>

            {results.length ? (
                <ul className="mt-3 border-t border-line">
                    {shown.map((e) => (
                        <li key={e.key} className="border-b border-line">
                            <Link
                                to={e.href}
                                className="group grid gap-x-6 gap-y-1 px-1 py-4 transition-colors hover:bg-white/70 md:grid-cols-[minmax(0,2.3fr)_minmax(0,0.75fr)_minmax(0,0.8fr)_minmax(0,1.45fr)_1.5rem] md:items-center md:px-3"
                            >
                                <span className="min-w-0">
                                    <span className="display block text-[1.3rem] text-ink group-hover:text-navy-700 group-hover:underline">{e.name}</span>
                                    <span className="block text-[0.88rem] text-ink-3">
                                        {e.area} · {e.kind}
                                    </span>
                                </span>
                                <span className="text-[0.95rem] text-ink-2">
                                    <span className="sr-only">Grades </span>
                                    {e.grades}
                                </span>
                                <span className={cn('text-[0.95rem] font-semibold', e.cost === 'free' ? 'text-navy-600' : 'text-ink-2')}>
                                    {e.cost === 'free' ? 'Free' : 'Fee-based'}
                                </span>
                                <span className="text-[0.92rem] text-ink-3">{e.hours}</span>
                                <span aria-hidden="true" className="hidden text-navy-600 transition-transform group-hover:translate-x-0.5 md:block">
                                    →
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="mt-3 border-y border-line px-3 py-10 text-center">
                    <p className="font-semibold">No programs match all three.</p>
                    <button type="button" onClick={reset} className="mt-3 font-semibold text-navy-600 hover:underline">
                        Clear filters
                    </button>
                </div>
            )}

            {shown.length < results.length ? (
                <button type="button" onClick={() => setShowAll(true)} className="mt-5 font-semibold text-navy-600 hover:underline">
                    Show all {results.length} programs
                </button>
            ) : null}
        </div>
    );
}
