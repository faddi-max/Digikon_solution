import { useEffect, useRef, useState } from 'react'

/** Tracks whether an element is on screen and the tab is visible. */
export function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(true)
  const [visible, setVisible] = useState(() => !document.hidden)

  useEffect(() => {
    const el = ref.current
    let io: IntersectionObserver | null = null
    if (el) {
      io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
        rootMargin: '100px',
      })
      io.observe(el)
    }

    const onVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      io?.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return [ref, inView && visible] as const
}