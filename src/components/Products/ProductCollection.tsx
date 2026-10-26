
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from "react-router-dom";
import './ProductCollection.css'
import videoEditorPreview from '@/assets/images/videoEditorPreview.png'
import analyticsPreview from '@/assets/images/products/analytics-reporting.jpg'
import portalPreview from '@/assets/images/products/client-portal.jpg'
import performancePreview from '@/assets/images/products/performance-hub.jpg'
import automationPreview from '@/assets/images/products/marketing-automation.jpg'

function ArrowRight() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Flips to true once, the first time the element scrolls into view. */
function useRevealOnce<T extends Element>() {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return [ref, shown] as const
}


/** Splits text into words that rise out of a mask, one after another. */
function Words({ text, start = 0 }: { text: string; start?: number }) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        <span key={`${word}-${i}`}>
          <span className="dk-collection__word">
            <span
              className="dk-collection__word-inner"
              style={{ '--w': start + i } as CSSProperties}
            >
              {word}
            </span>
          </span>{' '}
        </span>
      ))}
    </>
  )
}

/** Drifts every [data-parallax] image a few pixels against the scroll. */
function useParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-parallax]'))
    let frame = 0

    const update = () => {
      frame = 0
      const vh = window.innerHeight
      for (const el of items) {
        const rect = el.parentElement!.getBoundingClientRect()
        if (rect.bottom < -100 || rect.top > vh + 100) continue
        const speed = Number(el.dataset.parallax) || 0.06
        const offset = (rect.top + rect.height / 2 - vh / 2) * -speed
        el.style.setProperty('--py', `${Math.max(-18, Math.min(18, offset)).toFixed(1)}px`)
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return ref
}

function ProductCollectionFirst() {
  const [ref, shown] = useRevealOnce<HTMLElement>()
  const parallaxRef = useParallax<HTMLElement>()

  return (
    <section
      ref={(node) => {
        ref.current = node
        parallaxRef.current = node
      }}
      data-shown={shown}
      className="dk-collection relative isolate w-full overflow-hidden bg-[radial-gradient(ellipse_70%_90%_at_0%_0%,rgba(129,216,112,0.28)_0%,rgba(3,23,29,0)_65%),radial-gradient(ellipse_90%_120%_at_105%_100%,#1C2E33_0%,#03171D_70%)] bg-[#03171D] text-[#F7F8F5]">
      {/* 20% opacity grid */}
      <div
        aria-hidden="true"
        className="dk-collection__grid pointer-events-none absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(129,216,112,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(129,216,112,0.12)_1px,transparent_1px)] [background-size:10px_10px]"
      />

      {/* Section container: 1920px frame, 224px horizontal padding */}
      <div className="mx-auto w-full max-w-[1920px] px-5 py-12 sm:px-8 sm:py-16 md:px-12 lg:px-20 xl:px-[224px] xl:py-[80px]">
        {/* Collection heading */}
        <div className="grid grid-cols-1 gap-7 md:grid-cols-[1fr_2fr] md:gap-x-12 lg:gap-x-[72px]">
          <div className="pt-1">
            <p style={{ '--i': 0 } as CSSProperties} className="dk-collection__reveal flex items-center gap-[5px] font-['Manrope'] text-[7px] font-bold uppercase tracking-[0.12em] text-[#DCE2DC]/80">
              <span className="h-1 w-1 bg-[#81D870]" />
              The collection
            </p>
          </div>

          <h2 className="max-w-[708px] font-['DM_Serif_Display'] text-[clamp(36px,4.5vw,65px)] font-normal leading-[1.108] tracking-normal text-[#F7F8F5]">
            <Words text="Each product sits on its own, but reads as part of one studio." start={2} />
          </h2>
        </div>

        {/* Product grid */}
        <div className="mt-12 grid grid-cols-1 items-center gap-y-10 md:mt-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)] md:gap-x-10 lg:mt-[46px] lg:grid-cols-[minmax(0,1fr)_minmax(0,708.40625px)] lg:gap-x-[72px]">
          {/* Product details */}
          <div className="min-w-0">
            <div style={{ '--i': 3 } as CSSProperties} className="dk-collection__reveal mb-4 flex flex-wrap items-center gap-2 font-['Manrope'] text-[7px] font-semibold uppercase tracking-[0.14em] text-[#81D870]/75">
              <span>01 / 05</span>
              <span className="h-[2px] w-[2px] rounded-full bg-[#81D870]/50" />
              <span className="inline-flex items-center gap-1 rounded-full border border-[#81D870]/20 px-2 py-1 text-[#81D870]/70">
                <span className="dk-collection__dot h-[3px] w-[3px] rounded-full bg-[#81D870]" />
                Available
              </span>
            </div>

            <h3 style={{ '--i': 4 } as CSSProperties} className="dk-collection__reveal font-['DM_Serif_Display'] text-[clamp(30px,3vw,40px)] font-normal leading-[1.08] tracking-[-0.04em] text-[#F7F8F5]">
              [Video Editor Name]
            </h3>

            <p style={{ '--i': 5 } as CSSProperties} className="dk-collection__reveal mt-3 max-w-[340px] font-['Manrope'] text-[11px] font-normal leading-[1.7] tracking-[-0.12px] text-[#DCE2DC]/75 sm:text-xs">
              A desktop video editor from DIGIKON, currently in
              development. Positioning, features, and launch window
              will be published here as the build matures. The
              screenshot opposite is a placeholder — a real build
              will replace it.
            </p>

            <div style={{ '--i': 6 } as CSSProperties} className="dk-collection__reveal mt-4 max-w-[340px] border-y border-white/[0.07] py-3">
              <p className="font-['Manrope'] text-[7px] font-semibold uppercase tracking-[0.16em] text-[#647174]">
                Platform
              </p>

              <p className="mt-1 font-['Manrope'] text-[10px] font-medium text-[#F7F8F5] sm:text-[11px]">
                Desktop · macOS, Windows
              </p>
            </div>

            <Link
              to="/products/video-editor"
              style={{ '--i': 7 } as CSSProperties}
              className="dk-collection__reveal dk-collection__cta mt-5 inline-flex min-h-[34px] items-center gap-2 rounded-full border border-[#DCE2DC]/15 px-3 py-2 font-['Manrope'] text-[9px] font-medium text-[#F7F8F5] transition-colors duration-200 hover:border-[#81D870]/60 hover:bg-[#81D870]/[0.07] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#81D870] motion-reduce:transition-none sm:text-[10px]"
            >
              Open product page
              <ArrowRight />
            </Link>
          </div>

          {/* Real product image */}
          <div className="dk-collection__media group relative min-w-0 w-full">
            <div
              aria-hidden="true"
              className="dk-collection__glow pointer-events-none absolute -inset-1 rounded-[10px] bg-[#81D870]/30 blur-[10px]"
            />

            <div className="dk-collection__frame relative aspect-[708.40625/560] w-full overflow-hidden rounded-[8px] border border-[#81D870]/40 bg-[#111918] shadow-[0_0_0_1px_rgba(129,216,112,0.12),0_0_32px_rgba(129,216,112,0.18)]">
              <img
                src={videoEditorPreview}
                alt="Video editor product interface preview"
                data-parallax="0.05"
                className="dk-collection__img absolute inset-0 h-full w-full object-cover object-center"
                loading="lazy"
              />

              {/* Bottom image overlay */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,23,29,0.04)_30%,rgba(3,23,29,0.72)_100%)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type Tone = 'light' | 'dark'

type CollectionProduct = {
  slug: string
  index: string
  status: string
  name: string
  description: string
  image: string
  alt: string
  /** CSS aspect-ratio of the image frame. */
  aspect: string
}

/** PLACEHOLDERS from the design. Replace copy and images with real product content. */
const TWO: CollectionProduct = {
  slug: 'product-two',
  index: '02 / 05',
  status: 'Available',
  name: '[Product Two Name]',
  description:
    '[One-line benefit-oriented description of this product, written from verified information once supplied. Keep it to a sentence or two — enough to help a visitor decide whether to click through.]',
  image: analyticsPreview,
  alt: 'Product two interface preview',
  aspect: '1.68 / 1',
}

const THREE: CollectionProduct = {
  slug: 'product-three',
  index: '03 / 05',
  status: 'In development',
  name: '[Product Three Name]',
  description:
    '[One-line benefit-oriented description of this product, written from verified information once supplied. Keep it to a sentence or two.]',
  image: portalPreview,
  alt: 'Product three interface preview',
  aspect: '1.1 / 1',
}

const FOUR: CollectionProduct = {
  slug: 'product-four',
  index: '04 / 05',
  status: 'Available',
  name: '[Product Four Name]',
  description:
    '[Benefit-oriented sentence, 1–2 sentences, from verified information once supplied. Describe who it is for and what it unlocks for them.]',
  image: performancePreview,
  alt: 'Product four interface preview',
  aspect: '1.68 / 1',
}

const FIVE: CollectionProduct = {
  slug: 'product-five',
  index: '05 / 05',
  status: 'Roadmap',
  name: '[Product Five Name]',
  description:
    '[Benefit-oriented sentence, one or two lines, once supplied.]',
  image: automationPreview,
  alt: 'Product five interface preview',
  aspect: '0.78 / 1',
}

function ProductCard({
  product,
  tone,
  order,
  className = '',
}: {
  product: CollectionProduct
  tone: Tone
  order: number
  className?: string
}) {
  const dark = tone === 'dark'
  const ink = dark ? 'text-[#F7F8F5]' : 'text-[#03171D]'
  const muted = dark ? 'text-[#DCE2DC]/75' : 'text-[#03171D]/65'
  const accent = dark ? 'text-[#81D870]' : 'text-[#03171D]/70'

  return (
    <article
      style={{ '--i': order } as CSSProperties}
      className={`dk-collection__reveal group min-w-0 ${className}`}
    >
      <div
        className={`mb-3 flex items-center gap-2 font-['Manrope'] text-[7px] font-semibold uppercase tracking-[0.14em] ${accent}`}
      >
        <span>{product.index}</span>
        <span className="inline-flex items-center rounded-[3px] border border-current/30 px-[6px] py-[3px]">
          {product.status}
        </span>
      </div>

      <div
        className={`dk-collection__thumb relative w-full overflow-hidden rounded-[6px] border ${
          dark
            ? 'border-[#81D870]/25 shadow-[0_0_28px_rgba(129,216,112,0.12)]'
            : 'border-[#03171D]/10 shadow-[0_8px_30px_rgba(3,23,29,0.12)]'
        }`}
        style={{ aspectRatio: product.aspect }}
      >
        <img
          src={product.image}
          alt={product.alt}
          loading="lazy"
          data-parallax="0.07"
          className="dk-collection__thumb-img absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <h3
        className={`mt-5 font-['DM_Serif_Display'] text-[clamp(24px,2.2vw,32px)] font-normal leading-[1.1] tracking-[-0.03em] ${ink}`}
      >
        {product.name}
      </h3>

      <p
        className={`mt-2 max-w-[460px] font-['Manrope'] text-[11px] leading-[1.7] tracking-[-0.1px] sm:text-xs ${muted}`}
      >
        {product.description}
      </p>

      <div className="mt-3 flex items-center justify-between gap-4 font-['Manrope'] text-[8px] font-semibold uppercase tracking-[0.14em]">
        <Link
          to={`/products/${product.slug}`}
          className={`dk-collection__link inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#81D870] ${accent}`}
        >
          Open product page
          <ArrowRight />
        </Link>
        <span className={dark ? 'text-[#647174]' : 'text-[#03171D]/40'}>
          {product.status}
        </span>
      </div>
    </article>
  )
}

export default function ProductCollection() {
  const [lightRef, lightShown] = useRevealOnce<HTMLElement>()
  const [darkRef, darkShown] = useRevealOnce<HTMLElement>()
  const lightParallax = useParallax<HTMLElement>()
  const darkParallax = useParallax<HTMLElement>()

  return (
    <>
      <ProductCollectionFirst />

      {/* Products two and three: light band, right column staggered lower */}
      <section
        ref={(node) => {
          lightRef.current = node
          lightParallax.current = node
        }}
        data-shown={lightShown}
        className="dk-collection relative w-full overflow-hidden bg-[#F7F8F5] text-[#03171D]"
      >
        <div className="mx-auto w-full max-w-[1920px] px-5 py-12 sm:px-8 sm:py-16 md:px-12 lg:px-20 xl:px-[224px] xl:py-[96px]">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] md:gap-x-10 lg:gap-x-[72px]">
            <ProductCard product={TWO} tone="light" order={0} />
            <ProductCard
              product={THREE}
              tone="light"
              order={2}
              className="md:mt-[64px]"
            />
          </div>
        </div>
      </section>

      {/* Closing statement and products four and five: dark band */}
      <section
        ref={(node) => {
          darkRef.current = node
          darkParallax.current = node
        }}
        data-shown={darkShown}
        className="dk-collection relative isolate w-full overflow-hidden bg-[#03171D] bg-[radial-gradient(ellipse_70%_60%_at_0%_0%,rgba(129,216,112,0.28)_0%,rgba(3,23,29,0)_65%)] text-[#F7F8F5]"
      >
        <div className="mx-auto w-full max-w-[1920px] px-5 py-12 sm:px-8 sm:py-16 md:px-12 lg:px-20 xl:px-[224px] xl:py-[80px]">
          <div className="grid grid-cols-1 gap-7 md:grid-cols-[1fr_2fr] md:gap-x-12 lg:gap-x-[72px]">
            <p
              style={{ '--i': 0 } as CSSProperties}
              className="dk-collection__reveal flex items-start gap-[5px] pt-1 font-['Manrope'] text-[7px] font-bold uppercase tracking-[0.12em] text-[#DCE2DC]/80"
            >
              <span className="mt-[2px] h-1 w-1 bg-[#81D870]" />
              Our standard
            </p>
            <p className="w-full max-w-[820px] font-['DM_Serif_Display'] text-[clamp(28px,3.2vw,40px)] font-normal not-italic leading-[1.25] tracking-normal text-[#F7F8F5] xl:min-h-[250px]">
              <Words text="We would rather ship four tools we are proud of than forty we are not. The products on this page are the ones that passed our own bar: a" start={2} />
              <span className="dk-collection__word">
                <span
                  className="dk-collection__word-inner italic text-[#81D870]"
                  style={{ '--w': 31 } as CSSProperties}
                >
                  useful
                </span>
              </span>{' '}
              <Words text="thing, made with care, worth paying for." start={32} />
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-12 md:mt-14 md:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] md:gap-x-10 lg:gap-x-[72px]">
            <ProductCard product={FOUR} tone="dark" order={2} />
            <ProductCard
              product={FIVE}
              tone="dark"
              order={4}
              className="md:mt-[48px]"
            />
          </div>
        </div>
      </section>
    </>
  )
}
