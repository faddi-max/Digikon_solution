import { createContext, useContext } from 'react'

export type ContactOverlayValue = {
  available: boolean
  isOpen: boolean
  open: () => void
  close: () => void
}

export const ContactOverlayContext = createContext<ContactOverlayValue>({
  available: false,
  isOpen: false,
  open: () => {},
  close: () => {},
})

export const useContactOverlay = () => useContext(ContactOverlayContext)