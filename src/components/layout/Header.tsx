import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import logo from '@/assets/images/logo.svg'
import { NAV_LINKS, PRIMARY_CTA } from '@/lib/navigation'

import './Header.css'
import { MobileMenu } from './MobileMenu'
import { CtaButton } from '../ui/CtaButton'

const focusableSelector = 'a[href], button:not([disabled])'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef(false)

  const closeMenu = (returnFocus = false) => {
    returnFocusRef.current = returnFocus
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu(true)
      return
    }
    setIsMenuOpen(true)
  }

  useEffect(() => {
    if (!isMenuOpen) {
      if (returnFocusRef.current) {
        toggleRef.current?.focus()
        returnFocusRef.current = false
      }
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusFirstMenuItem = window.setTimeout(() => {
      document
        .getElementById('mobile-menu')
        ?.querySelector<HTMLElement>(focusableSelector)
        ?.focus()
    }, 0)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu(true)
        return
      }
      if (event.key !== 'Tab') return

      const focusableElements = Array.from(
        document
          .getElementById('mobile-menu')
          ?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      )
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(focusFirstMenuItem)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  return (
    <header className="dk-header">
      <div className="container-page dk-header__inner">
        <Link className="dk-header__brand" to="/">
          <img src={logo} alt="DigiKon Solutions home" />
        </Link>

        <nav className="dk-desktop-nav" aria-label="Primary">
          {NAV_LINKS.map(({ href, label }) => (
            <NavLink className="dk-desktop-nav__link" to={href} key={href}>
              {label}
            </NavLink>
          ))}
        </nav>

        <CtaButton className="dk-desktop-cta" href={PRIMARY_CTA.href}>
          {PRIMARY_CTA.label}
        </CtaButton>

        <div className="dk-header__controls">
          <CtaButton className="dk-mobile-cta" href={PRIMARY_CTA.href}>
            {PRIMARY_CTA.label}
          </CtaButton>

          <button
            className="dk-menu-toggle"
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={toggleMenu}
            ref={toggleRef}
          >
            <span aria-hidden="true" className="dk-menu-toggle__icon" />
          </button>
        </div>
      </div>

      <MobileMenu open={isMenuOpen} onNavigate={() => closeMenu(true)} />
    </header>
  )
}
