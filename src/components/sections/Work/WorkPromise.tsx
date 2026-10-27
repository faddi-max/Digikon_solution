import './WorkPromise.css'

const POINTS = [
  { no: '01', text: 'Clearer journeys for every user' },
  { no: '02', text: 'Systems built to scale with you' },
  { no: '03', text: 'Results you can measure, not just see' },
] as const

/**
 * Dark statement banner under the Work showcase: eyebrow, two-line headline with the second
 * line in green, three numbered promises and a soft green orb on the right edge. The card is a
 * size container, so type and spacing scale with its width.
 */
export function WorkPromise() {
  return (
    <section className="dk-wp" aria-labelledby="work-promise-title">
      <div className="dk-wp__card">
        <span className="dk-wp__orb" aria-hidden="true" />

        <div className="dk-wp__lead">
          <p className="dk-wp__eyebrow">
            <span aria-hidden="true" />
            What good work should do
          </p>
          <h2 id="work-promise-title" className="dk-wp__title">
            <span>Not just look better.</span>
            <span className="dk-wp__accent">Work better.</span>
          </h2>
        </div>

        <ol className="dk-wp__points">
          {POINTS.map((p) => (
            <li key={p.no} className="dk-wp__point">
              <span className="dk-wp__no">{p.no}</span>
              <span className="dk-wp__text">{p.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default WorkPromise
