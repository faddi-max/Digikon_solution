import { useRef, type ReactNode } from 'react'

import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

type RevealProps = {
  children: ReactNode
  /** Animate direct children one after another. */
  stagger?: boolean
  delay?: number
  className?: string
}

export function Reveal({ children, stagger = false, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return
      const targets = stagger ? Array.from(ref.current.children) : ref.current

      gsap.from(targets, {
        autoAlpha: 0,
        y: 24,
        duration: 0.8,
        delay,
        ease: 'expo.out',
        stagger: stagger ? 0.1 : 0,
        scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
      })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}