import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { ContactOverlay } from './ContactOverlay'
import { ContactOverlayContext } from './ContactOverlayContext'

export function ContactOverlayProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const value = useMemo(
    () => ({ available: true, isOpen, open, close }),
    [isOpen, open, close],
  )

  return (
    <ContactOverlayContext.Provider value={value}>
      {children}
      <ContactOverlay open={isOpen} onClose={close} />
    </ContactOverlayContext.Provider>
  )
}