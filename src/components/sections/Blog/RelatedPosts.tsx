import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'

import { PostCard } from './BlogGrid'
import { BLOG_POSTS, type BlogCategoryId, type BlogPost } from './blogPostsData'

type Props = {
  currentSlug?: string
  category?: BlogCategoryId
  count?: number
  posts?: readonly BlogPost[]
}

export function RelatedPosts({ currentSlug, category, count = 3, posts = BLOG_POSTS }: Props) {
  const related = useMemo(() => {
    const others = posts
      .filter((p) => p.slug !== currentSlug)
      .slice()
      .sort((a, b) => b.date - a.date)
    const same = category ? others.filter((p) => p.category === category) : []
    const rest = others.filter((p) => !same.includes(p))
    return [...same, ...rest].slice(0, count)
  }, [posts, currentSlug, category, count])

  if (!related.length) return null

  return (
    <section
      aria-labelledby="related-heading"
      className="relative isolate overflow-clip bg-teal-900 px-(--gutter) pt-[clamp(3.5rem,6vw,6rem)] pb-[clamp(3rem,6vw,6rem)] text-white [--gutter:clamp(1rem,0.32rem+2.86vw,5rem)]"
    >
      {/* glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_60%_at_100%_100%,rgb(129_216_112/0.28),transparent_72%),radial-gradient(36%_30%_at_8%_0%,rgb(129_216_112/0.08),transparent_72%)]"
      />
      {/* hairline where the article ends */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"
      />

      <div className="mx-auto w-full max-w-[1332px]">
        {/* Heading row: inside the dark section, with a line underneath */}
        <div className="reveal mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-6">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-[0.625rem] font-extrabold tracking-[0.13em] text-green-500 uppercase">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-green-500" />
              Related insights
            </p>
            <h2
              id="related-heading"
              className="font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.05] font-normal tracking-[-0.03em] text-white"
            >
              Keep exploring
            </h2>
          </div>

          <Link
            to="/blog"
            className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-[0.6875rem] font-bold text-white no-underline transition-all duration-200 hover:gap-3 hover:border-green-500 hover:bg-green-500 hover:text-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
          >
            All insights <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
          {related.map((p, i) => (
            <div
              key={p.slug}
              className="reveal min-w-0"
              style={{ '--d': `${i * 90}ms` } as CSSProperties}
            >
              <PostCard post={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}