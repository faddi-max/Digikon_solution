
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import logo from '@/assets/images/logo.svg'
import { NAV_LINKS, PRIMARY_CTA } from '@/lib/navigation'

import './Header.css'
import { MobileMenu } from './MobileMenu'
import { CtaButton } from '../ui/CtaButton'
import { useContactOverlay } from '../sections/contact/ContactOverlayContext'

const focusableSelector = 'a[href], button:not([disabled])'

const SERVICE_MENU = [
  { label: 'SEO & Growth', href: '/services#search-seo', icon: 'search' },
  { label: 'Web design & build', href: '/services#web-design', icon: 'web' },
  {
    label: 'Content & editorial',
    href: '/services#content-editorial',
    icon: 'sparkle',
  },
  {
    label: 'Analytics & reporting',
    href: '/services#analytics-reporting',
    icon: 'analytics',
  },
  {
    label: 'Automation & AI',
    href: '/services#automation-ai',
    icon: 'automation',
  },
] as const

function ServiceMenuIcon({
  icon,
}: {
  icon: (typeof SERVICE_MENU)[number]['icon']
}) {
  const iconProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icon === 'search' && (
        <>
          <circle cx="10.5" cy="10.5" r="4.5" {...iconProps} />
          <path d="m14 14 4 4" {...iconProps} />
        </>
      )}

      {icon === 'web' && (
        <>
          <rect
            x="4.5"
            y="5.5"
            width="15"
            height="13"
            rx="1.5"
            {...iconProps}
          />
          <path d="M4.5 9h15" {...iconProps} />
        </>
      )}

      {icon === 'sparkle' && (
        <path
          d="M12 3.5 13.8 10.2 20.5 12l-6.7 1.8L12 20.5l-1.8-6.7L3.5 12l6.7-1.8L12 3.5Z"
          {...iconProps}
        />
      )}

      {icon === 'analytics' && (
        <>
          <rect
            x="7.5"
            y="3.5"
            width="9"
            height="17"
            rx="1.5"
            {...iconProps}
          />
          <path d="M10.5 17.5h3" {...iconProps} />
        </>
      )}

      {icon === 'automation' && (
        <>
          <path d="m12 3.5 7 4v9l-7 4-7-4v-9l7-4Z" {...iconProps} />
          <circle cx="12" cy="12" r="2" {...iconProps} />
        </>
      )}
    </svg>
  )
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)

  const toggleRef = useRef<HTMLButtonElement>(null)
  const servicesMenuRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef(false)

  const contact = useContactOverlay()
  const { pathname } = useLocation()

  const isServicesRoute = pathname.startsWith('/services')

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

  const handleContactClick = () => {
    if (isContactOpen) {
      setIsContactOpen(false)
      return
    }

    setIsServicesOpen(false)
    setIsContactOpen(true)
    contact.open()
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
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
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

  useEffect(() => {
    if (!isServicesOpen) return

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!servicesMenuRef.current?.contains(event.target as Node)) {
        setIsServicesOpen(false)
      }
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsServicesOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isServicesOpen])

  useEffect(() => {
    setIsServicesOpen(false)
    setIsContactOpen(false)
  }, [pathname])

  return (
    <header className="dk-header">
      <div className="container-page dk-header__inner">
        <Link className="dk-header__brand" to="/">
          <img src={logo} alt="DigiKon Solutions home" />
        </Link>

        <nav className="dk-desktop-nav" aria-label="Primary">
          {NAV_LINKS.map(({ href, label }) =>
            label === 'Services' ? (
              <div
                ref={servicesMenuRef}
                className="dk-service-menu"
                data-active={isServicesRoute}
                data-open={isServicesOpen}
                key={href}
              >
                <button
                  className="dk-desktop-nav__link dk-service-menu__toggle"
                  type="button"
                  aria-expanded={isServicesOpen}
                  aria-controls="services-menu"
                  aria-current={isServicesRoute ? 'page' : undefined}
                  onClick={() => {
                    setIsContactOpen(false)
                    setIsServicesOpen((open) => !open)
                  }}
                >
                  {label}
                </button>

                <div
                  id="services-menu"
                  className="dk-service-menu__panel"
                >
                  <div className="dk-service-menu__content">
                    <div className="dk-service-menu__heading">
                      <span>Explore services</span>
                      <i aria-hidden="true" />
                    </div>

                    <div className="dk-service-menu__links">
                      {SERVICE_MENU.map(
                        ({
                          href: serviceHref,
                          icon,
                          label: serviceLabel,
                        }) => (
                          <Link
                            className="dk-service-menu__link"
                            to={serviceHref}
                            key={serviceHref}
                            onClick={() => setIsServicesOpen(false)}
                          >
                            <span className="dk-service-menu__icon">
                              <ServiceMenuIcon icon={icon} />
                            </span>

                            <span>{serviceLabel}</span>
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <NavLink
                className="dk-desktop-nav__link"
                to={href}
                key={href}
                onClick={() => {
                  setIsServicesOpen(false)
                  setIsContactOpen(false)
                }}
              >
                {label}
              </NavLink>
            ),
          )}

          <NavLink
            to="/team"
            className="dk-desktop-nav__link"
            onClick={() => {
              setIsServicesOpen(false)
              setIsContactOpen(false)
            }}
          >
            Our Team
          </NavLink>
        </nav>

        <CtaButton
          className="dk-desktop-cta"
          href={PRIMARY_CTA.href}
        >
          {PRIMARY_CTA.label}
        </CtaButton>

        <div className="dk-header__controls">
          <CtaButton
            className="dk-mobile-cta"
            href={PRIMARY_CTA.href}
          >
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

      <MobileMenu
        open={isMenuOpen}
        onNavigate={() => closeMenu(true)}
      />
    </header>
  )
}
