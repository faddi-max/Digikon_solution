
import { Link } from 'react-router-dom'
import './ProductHero.css'

function ArrowRight() {
  return (
    <svg
      width="15"
      height="15"
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

function DashboardIllustration() {
  return (
    <div className="dk-ph-art" aria-hidden="true">
      <svg
        className="dk-ph-art__orbit"
        viewBox="0 0 680 420"
        fill="none"
      >
        <path d="M40 116C16 68 99 43 176 81S328 166 426 94 598 17 635 58" />
        <path d="M53 126C132 222 205 288 330 317S538 380 605 325 635 258 652 242" />
        <path d="M100 55C149 126 185 177 240 209" />
        <circle cx="40" cy="116" r="9" />
        <circle cx="635" cy="58" r="4" />
        <circle cx="605" cy="325" r="6" />
      </svg>

      <div className="dk-ph-art__backdrop">
        <span className="dk-ph-art__backdrop-node dk-ph-art__backdrop-node--one" />
        <span className="dk-ph-art__backdrop-node dk-ph-art__backdrop-node--two" />
        <span className="dk-ph-art__backdrop-node dk-ph-art__backdrop-node--three" />
        <span className="dk-ph-art__backdrop-node dk-ph-art__backdrop-node--four" />
        <span className="dk-ph-art__backdrop-node dk-ph-art__backdrop-node--five" />
        <span className="dk-ph-art__backdrop-node dk-ph-art__backdrop-node--six" />
        <span className="dk-ph-art__backdrop-line dk-ph-art__backdrop-line--one" />
        <span className="dk-ph-art__backdrop-line dk-ph-art__backdrop-line--two" />
        <span className="dk-ph-art__backdrop-line dk-ph-art__backdrop-line--three" />
        <span className="dk-ph-art__backdrop-line dk-ph-art__backdrop-line--four" />
      </div>

      <div className="dk-ph-art__panel dk-ph-art__panel--rear">
        <div className="dk-ph-art__rear-graph">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="dk-ph-art__rear-lines">
          <i />
          <i />
          <i />
        </div>
      </div>

      <div className="dk-ph-art__panel dk-ph-art__panel--dark">
        <div className="dk-ph-art__flow">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="dk-ph-art__panel dk-ph-art__panel--main">
        <div className="dk-ph-art__main-search">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="10.5" cy="10.5" r="6" />
            <path d="m15 15 5 5" />
          </svg>
          <span />
        </div>

        <div className="dk-ph-art__main-content">
          <div className="dk-ph-art__main-copy">
            <span className="dk-ph-art__avatar" />
            <div>
              <i />
              <i />
              <i />
            </div>
          </div>

          <div className="dk-ph-art__main-donut">
            <span />
          </div>

          <div className="dk-ph-art__main-chart">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>

      <div className="dk-ph-art__card dk-ph-art__card--stats">
        <div className="dk-ph-art__card-bars">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <i />
        <i />
      </div>

      <div className="dk-ph-art__card dk-ph-art__card--search">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="10.5" cy="10.5" r="6" />
          <path d="m15 15 5 5" />
        </svg>
        <div>
          <i />
          <i />
        </div>
      </div>

      <div className="dk-ph-art__card dk-ph-art__card--check">
        <div><span>✓</span><i /></div>
        <div><span>✓</span><i /></div>
        <div><span>✓</span><i /></div>
      </div>

      <div className="dk-ph-art__card dk-ph-art__card--chart">
        <div className="dk-ph-art__chart-heading">
          <i />
          <i />
        </div>
        <div className="dk-ph-art__chart-ring" />
        <div className="dk-ph-art__chart-bars">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      <span className="dk-ph-art__orb dk-ph-art__orb--left" />
      <span className="dk-ph-art__orb dk-ph-art__orb--bottom" />
    </div>
  )
}

export function ProductHero() {
  return (
    <section className="dk-ph " aria-labelledby="product-hero-title">
      <div className="dk-ph__grid" aria-hidden="true" />

      <div className="dk-ph__inner">
        <div className="dk-ph__copy">
          <nav className="dk-ph__crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li aria-current="page">Products</li>
            </ol>
          </nav>

          <p className="dk-ph__label">
            <span />
            Products
          </p>

          <h1 id="product-hero-title" className="dk-ph__title">
            <span>Software, built</span>
            <span>the way we <em>wish</em></span>
            <span className="dk-ph__title-accent">
              <em>software was built.</em>
            </span>
          </h1>

          <p className="dk-ph__description">
            DIGIKON is a studio that makes its own products — and makes
            software for the companies we believe in. Below are the tools
            we are shipping, in use, and still shaping.
          </p>

          <Link className="dk-ph__button" to="/products#collection">
            Explore the collection
            <ArrowRight />
          </Link>
        </div>

        <div className="dk-ph__visual">
          <DashboardIllustration />
        </div>
      </div>
    </section>
  )
}

export default ProductHero
