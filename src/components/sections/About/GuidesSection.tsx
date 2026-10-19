import { Reveal } from '@/components/motion/Reveal'

import { GUIDES } from './guidesData'
import './Guides.css'

export function GuidesSection() {
  return (
    <section
      id="guides"
      className="dk-guides"
      aria-label="What guides us"
    >
      <Reveal className="dk-guides__list" stagger>
        {GUIDES.map((guide) => (
          <div className="dk-guides__item" role="group" key={guide.id}>
            <p className="dk-guides__mark">{guide.mark}</p>
            <p className="dk-guides__label">{guide.label}</p>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
