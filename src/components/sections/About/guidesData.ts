export type Guide = {
  id: string
  /** Large figure shown above the label. */
  mark: string
  label: string
}

/** Content lives here, not in the component, so it can later come from a CMS or API. */
export const GUIDES: readonly Guide[] = [
  { id: 'strategy', mark: '01', label: 'Strategy before execution' },
  { id: 'clarity', mark: '02', label: 'Clarity in every interaction' },
  { id: 'purpose', mark: '03', label: 'Design with a purpose' },
  { id: 'learning', mark: '∞', label: 'Always learning and improving' },
]
