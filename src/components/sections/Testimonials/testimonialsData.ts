export type Testimonial = {
  id: string
  quote: string
  name: string
  role: string
  company: string
  /** Basename (no extension) of the portrait in src/assets/images/testimonials/. */
  photo: string
}

/**
 * PLACEHOLDERS ONLY, copied from the design. Replace with approved client
 * testimonials before launch, and do not present these as real quotes.
 *
 * The avatar wheel needs at least 3 entries to read as a wheel. With 7 or more it
 * shows three neighbours on each side of the active client; with fewer it shows as
 * many as fit without repeating a face.
 */
export const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: 'client-one',
    quote: 'Placeholder quote: a client describes the result of working with DigiKon.',
    name: 'Client name',
    role: 'Role',
    company: 'Company',
    photo: 'testimonial-1',
  },
  {
    id: 'client-two',
    quote: 'Placeholder quote: a client describes how search, design and data started to work as one.',
    name: 'Client name',
    role: 'Role',
    company: 'Company',
    photo: 'testimonial-2',
  },
  {
    id: 'client-three',
    quote: 'Placeholder quote: a client describes how clearly the team communicated and delivered.',
    name: 'Client name',
    role: 'Role',
    company: 'Company',
    photo: 'testimonial-3',
  },
  {
    id: 'client-four',
    quote: 'Placeholder quote: a client describes what changed once reporting became easy to trust.',
    name: 'Client name',
    role: 'Role',
    company: 'Company',
    photo: 'testimonial-4',
  },
  {
    id: 'client-five',
    quote: 'Placeholder quote: a client describes the first month of working together.',
    name: 'Client name',
    role: 'Role',
    company: 'Company',
    photo: 'testimonial-5',
  },
  {
    id: 'client-six',
    quote: 'Placeholder quote: a client describes how the new website changed their day-to-day work.',
    name: 'Client name',
    role: 'Role',
    company: 'Company',
    photo: 'testimonial-6',
  },
  {
    id: 'client-seven',
    quote: 'Placeholder quote: a client describes why they would work with DigiKon again.',
    name: 'Client name',
    role: 'Role',
    company: 'Company',
    photo: 'testimonial-7',
  },
]
