import type { AutomationHeroData } from './automationHeroData'
import { OutcomeGlyph } from './AutomationIcons'

/**
 * The strip under the hero card: a dark lead cell and three outcomes.
 *
 * It states what the work is for without a single number, because none of them are real yet.
 * Sizes use design pixels from `lg` (the parent sets `--u`); below that it stacks, with the
 * three outcomes in a row from `sm`.
 */
export function AutomationOutcomes({ outcomes }: { outcomes: AutomationHeroData['outcomes'] }) {
  return (
    <section
      data-ah="strip"
      aria-labelledby="automation-outcomes-title"
      className="lg:u-h-151.5 lg:u-rounded-22 grid overflow-clip rounded-[1.25rem] border border-border-subtle bg-white lg:grid-cols-[calc(369*var(--u))_1fr_1fr_1fr] sm:grid-cols-3"
    >
      <div
        className="lg:u-pl-28 lg:u-pr-28 lg:u-pt-27 relative isolate overflow-clip bg-teal-800 px-6 py-6 sm:col-span-3 lg:col-span-1"
        // A green wash from the left edge that is gone by about 60% of the cell, and a slight
        // darkening toward the bottom. Both are over the flat teal.
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgb(129 216 112 / 0.66) 0%, rgb(129 216 112 / 0.34) 27%, rgb(129 216 112 / 0.12) 47%, rgb(129 216 112 / 0) 63%), linear-gradient(180deg, rgb(28 46 51 / 0) 0%, rgb(28 46 51 / 0.22) 100%)',
        }}
      >
        <h2
          id="automation-outcomes-title"
          className="font-display text-[1.5rem] leading-[1.18] font-normal text-green-500 lg:text-wrap! lg:u-text-[24.5] lg:u-leading-28.5 [--tf:20px]"
        >
          {outcomes.title}
        </h2>
        <p className="mt-2 text-[0.8125rem] leading-[1.6] font-normal text-white/85 lg:text-wrap! lg:u-mt-8.5 lg:u-text-[11.2] lg:u-leading-[19.2] [--tf:11px]">
          {outcomes.note}
        </p>
      </div>

      {outcomes.items.map((item) => (
        <div
          key={item.title}
          data-ah="outcome"
          className="lg:u-pl-25 lg:u-pt-34.5 border-t border-border-subtle px-6 py-5 sm:border-t-0 sm:border-l lg:border-l"
        >
          <span className="lg:u-size-28 flex size-7 items-center justify-center" aria-hidden="true">
            <OutcomeGlyph icon={item.icon} />
          </span>
          <h3 className="mt-3 text-[0.875rem] leading-5 font-semibold text-teal-900 lg:u-mt-17 lg:u-text-[13.5] lg:u-leading-18 [--tf:13px]">
            {item.title}
          </h3>
          <p className="mt-1 text-[0.8125rem] leading-5 font-medium text-ink-muted lg:u-mt-11 lg:u-text-[11.2] lg:u-leading-15 [--tf:11px]">
            {item.caption}
          </p>
        </div>
      ))}
    </section>
  )
}
