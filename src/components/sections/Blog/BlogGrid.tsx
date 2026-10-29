import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

import { BLOG_CATEGORIES, BLOG_POSTS, type BlogCategoryId, type BlogPost } from './blogPostsData'

const PAGE_SIZE = 9

type Sort = 'recent' | 'popular'

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 4 4" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

export function PostCard({ post }: { post: BlogPost }) {
  const [from, to] = post.avatar ?? ['#1c2e33', '#80c76e']
  return (
    <article data-bg="card" className="group relative min-w-0">
      <div className="relative aspect-[1.55] overflow-clip rounded-2xl border border-white/10 bg-teal-900">
        <img
          src={post.image}
          alt={post.imageAlt}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-black/35" />
        <span className="absolute top-3 left-3.5 rounded-full border border-white/15 bg-teal-900/85 px-2.5 py-1.5 text-[0.5rem] font-extrabold tracking-[0.08em] text-white uppercase backdrop-blur-sm">
          {post.tag}
        </span>
        <span className="absolute right-3.5 bottom-3 text-[0.625rem] font-extrabold tracking-[0.12em] text-white uppercase [text-shadow:0_1px_5px_rgb(0_0_0/0.4)]">
          {post.step}
        </span>
      </div>

      <div className="px-0.5 pt-4">
        <p className="mb-2.5 text-[0.5625rem] font-extrabold tracking-[0.13em] text-green-500 uppercase">{post.categoryLabel}</p>
        <h3 className="mb-2.5 max-w-[21.25rem] text-[1.0625rem] leading-[1.42] font-extrabold tracking-[-0.035em] text-[#f2f7f3]">
          <Link
            to={`/blog/${post.slug}`}
            className="no-underline transition-colors duration-200 group-hover:text-green-300 after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-500"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mb-4 text-[0.75rem] leading-[1.7] text-white/60">{post.excerpt}</p>
        <div className="flex items-center gap-2.5 text-[0.625rem] text-white/60">
          <span
            aria-hidden="true"
            className="grid size-[26px] place-items-center rounded-full text-[0.5625rem] font-extrabold text-white"
            style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            {post.initials}
          </span>
          <span className="font-bold text-[#dce8e1]">{post.author}</span>
          <span className="ml-auto inline-flex items-center gap-1.5 whitespace-nowrap">
            <ClockIcon className="size-3 text-green-500" />
            {post.readMinutes} min read
          </span>
        </div>
      </div>
    </article>
  )
}

/**
 * Article grid for the Blog page: search, category filters, sort, a 3-column card grid and
 * pagination. Everything is client state; swap BLOG_POSTS for fetched data when the CMS is ready.
 *
 * Motion (GSAP): the cards rise in whenever the visible set changes (filter, sort, page), never
 * on typing. Reduced motion skips it.
 */
export function BlogGrid({ posts = BLOG_POSTS }: { posts?: readonly BlogPost[] }) {
  const root = useRef<HTMLElement>(null)
  const top = useRef<HTMLDivElement>(null)
  const first = useRef(true)
  const motion = !useMediaQuery('(prefers-reduced-motion: reduce)')

  const [category, setCategory] = useState<'all' | BlogCategoryId>('all')
  const [sort, setSort] = useState<Sort>('recent')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts
      .filter((p) => (category === 'all' || p.category === category) && p.title.toLowerCase().includes(q))
      .slice()
      .sort((a, b) => (sort === 'popular' ? b.popular - a.popular : b.date - a.date))
  }, [posts, category, sort, query])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  useEffect(() => {
    if (page > pages) setPage(pages)
  }, [page, pages])

  useGSAP(
    () => {
      const el = root.current
      if (!el || !motion) {
        first.current = false
        return
      }
      const cards = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('[data-bg="card"]'))

      // Filter, sort or page change: the new set of cards rises in.
      if (!first.current) {
        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', clearProps: 'opacity,visibility,transform' },
        )
        return
      }
      first.current = false

      // Entrance: search and filters, then the cards, once, when the section scrolls into view.
      const intro = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('[data-bg="search"], [data-bg="toolbar"]'))
      gsap.set(intro, { autoAlpha: 0, y: 18 })
      gsap.set(cards, { autoAlpha: 0, y: 32, scale: 0.96, transformOrigin: '50% 100%' })

      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
      tl.to(intro, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.1, clearProps: 'opacity,visibility,transform' }, 0)
      tl.to(
        cards,
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, stagger: 0.07, clearProps: 'opacity,visibility,transform' },
        0.25,
      )

      ScrollTrigger.create({ trigger: el, start: 'top 80%', once: true, onEnter: () => tl.play() })
    },
    { scope: root, dependencies: [category, sort, current, motion] },
  )

  const goTo = (n: number) => {
    setPage(n)
    top.current?.scrollIntoView({ behavior: motion ? 'smooth' : 'auto', block: 'start' })
  }

  const chip =
    'inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-[0.6875rem] font-bold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500'

  return (
    <section
      id="posts"
      ref={root}
      aria-label="Blog articles"
      className="relative isolate overflow-clip bg-teal-900 px-(--gutter) pt-10 pb-[clamp(3rem,6vw,6rem)] text-white [--gutter:clamp(1rem,0.32rem+2.86vw,5rem)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40%_50%_at_100%_70%,rgb(129_216_112/0.22),transparent_72%),radial-gradient(36%_30%_at_8%_0%,rgb(129_216_112/0.08),transparent_72%)]"
      />

      <div ref={top} className="mx-auto w-full max-w-[1332px] scroll-mt-24">
        <label data-bg="search" className="relative mb-8 ml-auto block w-full max-w-[340px]">
          <span className="sr-only">Search articles</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-[15px] size-[17px] -translate-y-1/2 text-white/60" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Search articles..."
            className="h-[47px] w-full rounded-[31px] border border-[#2b4244] bg-[#10272C] pt-3.5 pr-4 pb-3.5 pl-[43px] text-[0.75rem] text-white opacity-100 outline-none placeholder:text-white/45 focus:border-green-500 focus:shadow-[0_0_0_3px_rgb(129_216_112/0.15)]"
          />
        </label>

        <div data-bg="toolbar" className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div role="group" aria-label="Filter articles" className="flex flex-wrap gap-2">
            {BLOG_CATEGORIES.map((c) => {
              const on = category === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setCategory(c.id)
                    setPage(1)
                  }}
                  className={`${chip} ${
                    on
                      ? 'border-green-500 bg-green-500 text-teal-900'
                      : 'border-white/15 bg-white/5 text-white/75 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              )
            })}
          </div>

          <label className="flex items-center gap-2 text-[0.6875rem] tracking-[0.04em] whitespace-nowrap text-white/55 uppercase">
            Sort by
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as Sort)
                setPage(1)
              }}
              className="cursor-pointer rounded border-0 bg-transparent text-[0.6875rem] font-extrabold tracking-normal text-white normal-case outline-none focus-visible:outline-2 focus-visible:outline-green-500 [&>option]:bg-teal-900"
            >
              <option value="recent">Most recent</option>
              <option value="popular">Most popular</option>
            </select>
          </label>
        </div>

        {visible.length ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-9 md:grid-cols-2 lg:grid-cols-3 lg:gap-y-10">
            {visible.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        ) : (
          <div role="status" className="px-5 py-16 text-center text-white/60">
            <strong className="font-display mb-2 block text-3xl font-normal text-white">No articles found.</strong>
            Try another search or choose a different category.
          </div>
        )}

        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`Page ${n}`}
                aria-current={n === current ? 'page' : undefined}
                onClick={() => goTo(n)}
                className={`h-10 min-w-10 rounded-[10px] border text-[0.6875rem] font-extrabold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 ${
                  n === current
                    ? 'border-green-500 bg-green-500 text-teal-900'
                    : 'border-white/15 bg-white/5 text-white/75 hover:border-white/30 hover:text-white'
                }`}
              >
                {n}
              </button>
            ))}
            {current < pages && (
              <button
                type="button"
                onClick={() => goTo(current + 1)}
                className="h-10 rounded-[10px] border border-white/15 bg-white/5 px-4 text-[0.6875rem] font-extrabold text-white/75 transition-colors duration-200 hover:border-white/30 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
              >
                Next
              </button>
            )}
          </nav>
        )}
      </div>
    </section>
  )
}