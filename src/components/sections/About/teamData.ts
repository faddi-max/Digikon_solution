import alexImg from '@/assets/images/team/member-alex-morgan.jpg'
import danielImg from '@/assets/images/team/member-daniel-reed.jpg'
import linaImg from '@/assets/images/team/member-lina-ahmed.jpg'
import noahImg from '@/assets/images/team/member-noah-carter.jpg'
import saraImg from '@/assets/images/team/member-sara-khan.jpg'


export type TeamMember = {
  id: string
  name: string
  /** Job title, shown in green capitals above the name. */
  role: string
  /** Department chip, shown on the active card. */
  tag: string
  bio: string
  /** Portrait, 3:4. */
  image: string
}

/**
 * The portraits are placeholders. To use the real photos, either overwrite the files in
 * src/assets/images/team/ with the same names, or change the imports above. Keep them
 * 3:4 (for example 900 x 1200), with the face in the upper half.
 *
 * Names, titles and most lines follow the supplied design. Lina's and Daniel's lines were
 * not legible in it, so they are placeholders: replace them with approved copy.
 */
export const TEAM: readonly TeamMember[] = [
  {
    id: 'lina-ahmed',
    name: 'Lina Ahmed',
    role: 'SEO & Growth Strategist',
    tag: 'Marketing',
    bio: 'Turns search and data insight into growth that lasts.',
    image: linaImg,
  },
  {
    id: 'noah-carter',
    name: 'Noah Carter',
    role: 'Mobile App Developer',
    tag: 'Development',
    bio: 'Creates intuitive mobile experiences designed around everyday needs.',
    image: noahImg,
  },
  {
    id: 'alex-morgan',
    name: 'Alex Morgan',
    role: 'Founder & CEO',
    tag: 'Leadership',
    bio: 'Leads company vision and helps brands grow through thoughtful digital solutions.',
    image: alexImg,
  },
  {
    id: 'sara-khan',
    name: 'Sara Khan',
    role: 'Creative Director',
    tag: 'Design',
    bio: 'Shapes the visual direction and creative quality behind every project.',
    image: saraImg,
  },
  {
    id: 'daniel-reed',
    name: 'Daniel Reed',
    role: 'Lead Developer',
    tag: 'Development',
    bio: 'Builds reliable, scalable products from the first line of code.',
    image: danielImg,
  },
]