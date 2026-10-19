import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

import { NAV_LINKS, PRIMARY_CTA } from '@/lib/navigation'

import { CtaButton } from '../ui/CtaButton'

import './MobileMenu.css'

interface MobileMenuProps {
  open: boolean
  onNavigate: () => void
}

function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function MobileMenu({ open, onNavigate }: MobileMenuProps) {
  // Portal to <body> so the menu sits above every page section (including the
  // Three.js hero canvas) and is positioned against the real viewport.
  return createPortal(
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      data-open={open}
      className="dk-mobile-menu lg:hidden"
    >
      <div className="container-page dk-mobile-menu__container">
        <p className="dk-mobile-menu__eyebrow">
          <span aria-hidden="true" className="dk-mobile-menu__eyebrow-line" />
          Menu
        </p>

        <nav aria-label="Mobile">
          <ul className="dk-mobile-menu__list">
            {NAV_LINKS.map((link, index) => (
              <li key={link.href} className="dk-mobile-menu__item">
                <Link
                  to={link.href}
                  onClick={onNavigate}
                  className="focus-ring dk-mobile-menu__link"
                  style={{ '--i': index } as React.CSSProperties}
                >
                  <span className="dk-mobile-menu__index" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="dk-mobile-menu__label">{link.label}</span>
                  <span className="dk-mobile-menu__arrow" aria-hidden="true">
                    <ArrowIcon />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="dk-mobile-menu__foot">
          <p className="dk-mobile-menu__statement">
            Attention, turned into <em>revenue.</em>
          </p>
          <div className="dk-mobile-menu__cta-wrap">
            <CtaButton
              href={PRIMARY_CTA.href}
              onClick={onNavigate}
              className="dk-mobile-menu__cta"
            >
              {PRIMARY_CTA.label}
            </CtaButton>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
