import PageIntro from '@/components/PageIntro';
import Seo from '@/components/Seo';
import { POSTS, postUrl } from '@/data/news';
import { PHOTOS } from '@/data/photos';
import { fmtDate } from '@/lib/format';

const YEARS = [...new Set(POSTS.map((p) => p.date.slice(0, 4)))];

export default function News() {
    return (
        <>
            <Seo pageId="news" />
            <PageIntro
                title="News"
                lead="Showcases, championships and highlights from our sites across Queens. Most posts are short videos."
                backdrop={PHOTOS.seniorKnights}
            />
            <div className="shell py-14 lg:py-20">
                {YEARS.map((year) => (
                    <section key={year} aria-labelledby={`y${year}`} className="grid gap-4 border-t border-line pt-6 pb-14 lg:grid-cols-[12rem_minmax(0,1fr)]">
                        <h2 id={`y${year}`} className="display text-[3.2rem] leading-none text-navy-300">
                            {year}
                        </h2>
                        <ul>
                            {POSTS.filter((p) => p.date.startsWith(year)).map((post) => (
                                <li key={post.slug} className="border-b border-line last:border-0">
                                    <a
                                        href={postUrl(post)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group grid gap-1 py-5 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-6"
                                    >
                                        <time dateTime={post.date} className="pt-1.5 text-[0.92rem] text-ink-3">
                                            {fmtDate(post.date).replace(`, ${year}`, '')}
                                        </time>
                                        <span>
                                            <span className="display block text-[1.55rem] leading-tight decoration-1 underline-offset-[5px] group-hover:underline">
                                                {post.title}
                                            </span>
                                            {post.summary ? <span className="mt-1.5 block text-ink-2">{post.summary}</span> : null}
                                            <span className="mt-1 block text-[0.9rem] text-ink-3">
                                                {post.place} <span aria-hidden="true">↗</span>
                                                <span className="sr-only"> (opens in a new tab)</span>
                                            </span>
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </>
    );
}
