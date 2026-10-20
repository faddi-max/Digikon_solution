import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from 'react'


import { cn } from '@/lib/cn'
import { useContactOverlay } from '../sections/contact/ContactOverlayContext'

type CtaButtonProps = ComponentPropsWithoutRef<'a'> & {
  children: ReactNode
}

export function CtaButton({ children, className, href, onClick, ...props }: CtaButtonProps) {
  const contact = useContactOverlay()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || href !== '/contact' || !contact.available) return
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    contact.open()
  }

  return (
    <a className={cn('dk-cta', className)} href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}