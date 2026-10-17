import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'

import { ScrollRevealText } from '@/components/motion/ScrollRevealText'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { gsap } from '@/lib/motion'
import { useInView } from '@/lib/useInView'

import { PRODUCTS_HREF, TOOLS, type Tool } from './productsData'
import { ToolArt } from './ToolArt'
import './Products.css'

/** Exported screenshots are picked up by filename. A missing file falls back to the built-in illustration. */
const ART = import.meta.glob('../../../assets/images/products/*.{png,webp,jpg,jpeg,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function artFor(name: string): string | undefined {
  const hit = Object.keys(ART).find((p) => p.split('/').pop()?.replace(/\.[^.]+$/, '') === name)
  return hit ? ART[hit] : undefined
}
 
/** Fan geometry. Index 0 is the leftmost card; the arc is symmetric around the middle. */
function fanVars(i: number, n: number): CSSProperties {
  const mid = (n - 1) / 2
  const off = i - mid
  const dist = Math.abs(off)
  return {
    '--i': i,
    '--rot0': `${(off * 2.4).toFixed(2)}deg`,
    '--arc': `${(off * off * 0.32).toFixed(2)}cqw`,
    '--sc0': (1 + (1 - dist / mid) * 0.05).toFixed(3),
    '--z0': 20 - Math.round(dist * 3),
    '--depth': (1.4 - dist * 0.3).toFixed(2),
  } as CSSProperties
}

function ArrowUpRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  )
}

type CardProps = {
  tool: Tool
  index: number
  total: number
  state: 'idle' | 'active' | 'before' | 'after'
  linkRef: (el: HTMLAnchorElement | null) => void
  onEnter: () => void
  onFocus: () => void
  onClick: (e: ReactMouseEvent<HTMLAnchorElement>) => void
}

function ToolCard({ tool, index, total, state, linkRef, onEnter, onFocus, onClick }: CardProps) {
  const art = artFor(tool.art)

  return (
    <li className="dk-prod__item" data-state={state} style={fanVars(index, total)} onPointerEnter={onEnter}>
      <a
        ref={linkRef}
        className="dk-prod__card"
        href={PRODUCTS_HREF}
        onFocus={onFocus}
        onClick={onClick}
      >
        <span className="dk-prod__art" aria-hidden="true">
          {art ? (
            <img src={art} alt="" draggable={false} loading="lazy" decoding="async" />
          ) : (
            <ToolArt kind={tool.kind} />
          )}
        </span>
        <span className="dk-prod__scrim" aria-hidden="true" />
        <span className="dk-prod__body">
          <span className="dk-prod__title">{tool.title}</span>
          <span className="dk-prod__more">
            <span className="dk-prod__blurb">{tool.blurb}</span>
            <span className="dk-prod__go" aria-hidden="true">
              <ArrowUpRight />
            </span>
          </span>
        </span>
      </a>
    </li>
  )
}

export function ProductsSection() {
  const reduced = useReducedMotion()
  const [viewRef, running] = useInView<HTMLElement>()
  const panelRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const links = useRef<(HTMLAnchorElement | null)[]>([])
  const coarse = useRef(false)

  const [entered, setEntered] = useState(reduced)
  const [ready, setReady] = useState(reduced)
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    coarse.current = window.matchMedia('(hover: none)').matches
  }, [])

  // Entrance fires once, when the panel is a fifth in view.
  useEffect(() => {
    if (reduced) {
      setEntered(true)
      setReady(true)
      return
    }
    const el = panelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true)
          io.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  // After the fan has settled, drop the stagger delays so hover reacts instantly.
  useEffect(() => {
    if (!entered || reduced) return
    const id = window.setTimeout(() => setReady(true), 1700)
    return () => window.clearTimeout(id)
  }, [entered, reduced])

  // Pointer depth: the fan tilts a few degrees, cards drift at different depths, and a
  // light follows the cursor across the grid. Fine pointers only, never with reduced motion.
  useEffect(() => {
    const root = viewRef.current
    const panel = panelRef.current
    const stage = stageRef.current
    if (!root || !panel || !stage || reduced) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const p = { px: 0, py: 0, mx: 0, my: 0 }
    const apply = () => {
      stage.style.setProperty('--px', p.px.toFixed(3))
      stage.style.setProperty('--py', p.py.toFixed(3))
      root.style.setProperty('--mx', p.mx.toFixed(1))
      root.style.setProperty('--my', p.my.toFixed(1))
    }
    const to = (vars: Partial<typeof p>) =>
      gsap.to(p, { ...vars, duration: 0.9, ease: 'power3.out', overwrite: 'auto', onUpdate: apply })

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const rr = root.getBoundingClientRect()
      const pr = panel.getBoundingClientRect()
      const nx = ((e.clientX - pr.left) / pr.width) * 2 - 1
      const ny = ((e.clientY - pr.top) / pr.height) * 2 - 1
      root.dataset.pointer = 'true'
      to({
        px: Math.max(-1, Math.min(1, nx)),
        py: Math.max(-1, Math.min(1, ny)),
        mx: e.clientX - rr.left,
        my: e.clientY - rr.top,
      })
    }
    const onLeave = () => {
      root.dataset.pointer = 'false'
      to({ px: 0, py: 0 })
    }

    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerleave', onLeave)
    return () => {
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
      gsap.killTweensOf(p)
    }
  }, [reduced, viewRef])

  // On touch, the first tap opens a card and the second follows the link.
  // A tap outside the fan closes it again.
  useEffect(() => {
    if (active === null || !coarse.current) return
    const onDown = (e: PointerEvent) => {
      if (!stageRef.current?.contains(e.target as Node)) setActive(null)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [active])

  const stateOf = (i: number) =>
    active === null ? 'idle' : i === active ? 'active' : i < active ? 'before' : 'after'

  const onClickCard = (i: number) => (e: ReactMouseEvent<HTMLAnchorElement>) => {
    const railMode = window.matchMedia('(max-width: 600px)').matches
    if (coarse.current && !railMode && active !== i) {
      e.preventDefault()
      setActive(i)
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const cur = links.current.findIndex((el) => el === document.activeElement)
    if (cur < 0) return
    const last = TOOLS.length - 1
    const target =
      e.key === 'ArrowRight' || e.key === 'ArrowDown' ? Math.min(cur + 1, last)
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? Math.max(cur - 1, 0)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : -1
    if (target < 0) return
    e.preventDefault()
    links.current[target]?.focus()
  }

  return (
    <section
      ref={viewRef}
      id="products"
      className="dk-prod"
      aria-label="Products"
      data-in={entered}
      data-ready={ready}
      data-run={running}
    >
      <div className="dk-prod__bg" aria-hidden="true">
        <span className="dk-prod__bg-corner" />
        <span className="dk-prod__bg-depth" />
        <span className="dk-prod__bg-glow" />
        <span className="dk-prod__grid" />
        <span className="dk-prod__grid dk-prod__grid--lit" />
      </div>

      <div className="dk-prod__inner">
        <header className="dk-prod__head">
          <p className="dk-prod__eyebrow">
            <span className="dk-prod__eyebrow-dot" aria-hidden="true" />
            Products
          </p>
          <ScrollRevealText
            as="h2"
            className="dk-prod__heading"
            text="Tools we build, too."
            split="words"
            mode="play"
            duration={1.8}
            stagger={0.12}
            yOffset={20}
            start="top 85%"
          />
        </header>

        <div ref={panelRef} className="dk-prod__panel">
          <div className="dk-prod__copy">
            <p className="dk-prod__kicker">A closer look at the toolkit</p>
            <ScrollRevealText
              as="h3"
              className="dk-prod__headline"
              text="Useful by design. Powerful in practice."
              split="words"
              mode="play"
              accent={['Powerful']}
              duration={1.8}
              stagger={0.12}
              yOffset={18}
              start="top 85%"
            />
            <p className="dk-prod__lead">
              Explore the tools we use and build to keep search, content, data and delivery
              connected, from reporting to automation.
            </p>
            <a className="dk-prod__link" href={PRODUCTS_HREF}>
              <span>Show all tools</span>
              <span className="dk-prod__link-rule" aria-hidden="true" />
            </a>
          </div>

          <div ref={stageRef} className="dk-prod__stage">
            <ul
              className="dk-prod__fan"
              aria-label="Tools"
              data-has-active={active !== null}
              onPointerLeave={(e) => {
                if (e.pointerType !== 'touch') setActive(null)
              }}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActive(null)
              }}
              onKeyDown={onKeyDown}
            >
              {TOOLS.map((tool, i) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  index={i}
                  total={TOOLS.length}
                  state={stateOf(i)}
                  linkRef={(el) => {
                    links.current[i] = el
                  }}
                  onEnter={() => {
                    if (!coarse.current) setActive(i)
                  }}
                  onFocus={() => setActive(i)}
                  onClick={onClickCard(i)}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
