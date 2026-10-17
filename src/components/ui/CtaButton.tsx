import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '@/lib/cn'

type CtaButtonProps = ComponentPropsWithoutRef<'a'> & {
  children: ReactNode
}

export function CtaButton({ children, className, ...props }: CtaButtonProps) {
  return (
    <a className={cn('dk-cta', className)} {...props}>
      {children}
    </a>
  )
}
