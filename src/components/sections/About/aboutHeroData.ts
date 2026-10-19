import dashboardImg from '@/assets/images/about-hero-dashboard.png?url'
import teamImg from '@/assets/images/about-hero-team.png?url'
import technologyImg from '@/assets/images/about-hero-technology.png?url'
import workspaceImg from '@/assets/images/about-hero-workspace.png?url'
import analyticsImg from '@/assets/images/products/analytics-reporting.jpg?url'

export type HeroCard = {
  id: string
  /** Small label at the top of the card, shown as "01 / Vision". */
  index: string
  tag: string
  caption: string
  image: string
  /** CSS object-position for the photo crop. */
  focus: string
  /**
   * Widest the caption may run, as a percentage of the card's content width. A narrow
   * measure wraps the caption into short lines, which keeps it clear of any card tucked
   * over a corner, and matches the reference.
   */
  measure: number
  /** Desktop placement, as a percentage of the stage width, and the card's width / height. */
  x: number
  y: number
  w: number
  ratio: number
  /** Parallax depth. Larger values travel further with the pointer and the scroll. */
  depth: number
  /** Resting tilt in degrees. */
  tilt: number
  /** Idle float travel in px and cycle length in seconds. */
  float: number
  floatDur: number
}

/**
 * Positions are read from the supplied layout, as a share of a stage that is 3.1 times
 * wider than it is tall. The photos are the project's existing assets. Replace the
 * imports above to change them, with no other change needed.
 */
export const HERO_CARDS: readonly HeroCard[] = [
  {
    id: 'vision',
    index: '01',
    tag: 'Vision',
    caption: 'See the whole picture.',
    image: teamImg,
    focus: '30% 40%',
    measure: 72,
    x: 2.1,
    y: 3.2,
    w: 15.4,
    ratio: 60 / 71,
    depth: 1,
    tilt: -1.5,
    float: 9,
    floatDur: 4.6,
  },
  {
    id: 'clarity',
    index: '02',
    tag: 'Clarity',
    caption: 'Less noise. More clarity.',
    image: technologyImg,
    focus: '30% 40%',
    measure: 100,
    x: 13.6,
    y: 53.6,
    w: 14.6,
    ratio: 57 / 52,
    depth: 1.3,
    tilt: 1.5,
    float: 8,
    floatDur: 5.4,
  },
  {
    id: 'craft',
    index: '03',
    tag: 'Craft',
    caption: 'Make it matter.',
    image: dashboardImg,
    focus: '38% 30%',
    measure: 80,
    x: 29,
    y: 11.2,
    w: 12,
    ratio: 47 / 58,
    depth: 0.7,
    tilt: 2,
    float: 7,
    floatDur: 4.2,
  },
  {
    id: 'momentum',
    index: '04',
    tag: 'Momentum',
    caption: 'Move forward.',
    image: workspaceImg,
    focus: '58% 62%',
    measure: 80,
    x: 61.2,
    y: 56,
    w: 17.2,
    ratio: 67 / 50,
    depth: 1.2,
    tilt: -1.5,
    float: 9,
    floatDur: 5,
  },
  {
    id: 'connection',
    index: '05',
    tag: 'Connection',
    caption: 'Make connections.',
    image: analyticsImg,
    focus: '50% 55%',
    measure: 92,
    x: 77.4,
    y: 4,
    w: 20.3,
    ratio: 79 / 64,
    depth: 0.9,
    tilt: 1.5,
    float: 8,
    floatDur: 5.8,
  },
]
