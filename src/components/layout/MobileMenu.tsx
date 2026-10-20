import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

import { NAV_LINKS, PRIMARY_CTA } from '@/lib/navigation'

import { CtaButton } from '../ui/CtaButton'

import './MobileMenu.css'

interface MobileMenuProps {
  open: boolean
  onNavigate: () => void
}

const MOBILE_SERVICES = [
  { label: 'Search & SEO', href: '/services/search-seo' },
  { label: 'Web design & build', href: '/services/web-design' },
  { label: 'Content & editorial', href: '/services/content-editorial' },
  { label: 'Analytics & reporting', href: '/services/analytics-reporting' },
  { label: 'Automation & AI', href: '/services/automation-ai' },
] as const

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

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function MobileMenu({ open, onNavigate }: MobileMenuProps) {
  const [servicesExpanded, setServicesExpanded] = useState(false)

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
            {NAV_LINKS.map((link, index) => {
              const isServices = link.label === 'Services'
              return (
                <li key={link.href} className="dk-mobile-menu__item">
                  <div className="flex items-center justify-between">
                    <Link
                      to={link.href}
                      onClick={onNavigate}
                      className="focus-ring dk-mobile-menu__link flex-1"
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
                    {isServices && (
                      <button
                        type="button"
                        aria-expanded={servicesExpanded}
                        aria-label="Toggle services list"
                        onClick={() => setServicesExpanded((e) => !e)}
                        className="px-4 py-3 text-teal-900/60 hover:text-green-600 transition-colors"
                      >
                        <ChevronDownIcon open={servicesExpanded} />
                      </button>
                    )}
                  </div>
                  {isServices && servicesExpanded && (
                    <div className="pl-14 pr-4 pb-4 pt-1 flex flex-col gap-2.5 border-t border-teal-900/5 bg-teal-900/[0.02]">
                      {MOBILE_SERVICES.map((s) => (
                        <Link
                          key={s.href}
                          to={s.href}
                          onClick={onNavigate}
                          className="text-sm font-medium text-teal-950/80 hover:text-green-600 transition-colors py-1 flex items-center justify-between"
                        >
                          <span>{s.label}</span>
                          <span className="text-xs text-green-600 font-mono">→</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              )
            })}
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
