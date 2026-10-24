
import { Link } from "react-router-dom";
import videoEditorPreview from '@/assets/images/videoEditorPreview.png'

function ArrowRight() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function ProductCollection() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-[radial-gradient(ellipse_241.01%_301.51%_at_112.81%_79.82%,#1C2E33_0%,#03171D_60.18%,#81D870_140%)] text-[#F7F8F5]">
      {/* 20% opacity grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(129,216,112,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(129,216,112,0.12)_1px,transparent_1px)] [background-size:10px_10px]"
      />

      {/* Section container: 1920px frame, 224px horizontal padding */}
      <div className="mx-auto w-full max-w-[1920px] px-5 py-12 sm:px-8 sm:py-16 md:px-12 lg:px-20 xl:px-[224px] xl:py-[80px]">
        {/* Collection heading */}
        <div className="grid grid-cols-1 gap-7 md:grid-cols-[1fr_2fr] md:gap-x-12 lg:gap-x-[72px]">
          <div className="pt-1">
            <p className="flex items-center gap-[5px] font-['Manrope'] text-[7px] font-bold uppercase tracking-[0.12em] text-[#DCE2DC]/80">
              <span className="h-1 w-1 bg-[#81D870]" />
              The collection
            </p>
          </div>

          <h2 className="max-w-[708px] font-['DM_Serif_Display'] text-[clamp(36px,4.5vw,65px)] font-normal leading-[1.108] tracking-normal text-[#F7F8F5]">
            Each product sits on its own, but reads as part of one studio.
          </h2>
        </div>

        {/* Product grid */}
        <div className="mt-12 grid grid-cols-1 items-center gap-y-10 md:mt-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)] md:gap-x-10 lg:mt-[46px] lg:grid-cols-[minmax(0,1fr)_minmax(0,708.40625px)] lg:gap-x-[72px]">
          {/* Product details */}
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2 font-['Manrope'] text-[7px] font-semibold uppercase tracking-[0.14em] text-[#81D870]/75">
              <span>01 / 05</span>
              <span className="h-[2px] w-[2px] rounded-full bg-[#81D870]/50" />
              <span className="inline-flex items-center gap-1 rounded-full border border-[#81D870]/20 px-2 py-1 text-[#81D870]/70">
                <span className="h-[3px] w-[3px] rounded-full bg-[#81D870]" />
                Available
              </span>
            </div>

            <h3 className="font-['DM_Serif_Display'] text-[clamp(30px,3vw,40px)] font-normal leading-[1.08] tracking-[-0.04em] text-[#F7F8F5]">
              [Video Editor Name]
            </h3>

            <p className="mt-3 max-w-[340px] font-['Manrope'] text-[11px] font-normal leading-[1.7] tracking-[-0.12px] text-[#DCE2DC]/75 sm:text-xs">
              A desktop video editor from DIGIKON, currently in
              development. Positioning, features, and launch window
              will be published here as the build matures. The
              screenshot opposite is a placeholder — a real build
              will replace it.
            </p>

            <div className="mt-4 max-w-[340px] border-y border-white/[0.07] py-3">
              <p className="font-['Manrope'] text-[7px] font-semibold uppercase tracking-[0.16em] text-[#647174]">
                Platform
              </p>

              <p className="mt-1 font-['Manrope'] text-[10px] font-medium text-[#F7F8F5] sm:text-[11px]">
                Desktop · macOS, Windows
              </p>
            </div>

            <Link
              to="/products/video-editor"
              className="mt-5 inline-flex min-h-[34px] items-center gap-2 rounded-full border border-[#DCE2DC]/15 px-3 py-2 font-['Manrope'] text-[9px] font-medium text-[#F7F8F5] transition-colors duration-200 hover:border-[#81D870]/60 hover:bg-[#81D870]/[0.07] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#81D870] motion-reduce:transition-none sm:text-[10px]"
            >
              Open product page
              <ArrowRight />
            </Link>
          </div>

          {/* Real product image */}
          <div className="group relative min-w-0 w-full">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-1 rounded-[10px] bg-[#81D870]/20 opacity-20 blur-[8px] transition-opacity duration-300 group-hover:opacity-40"
            />

            <div className="relative aspect-[708.40625/560] w-full overflow-hidden rounded-[8px] border border-[#81D870]/20 bg-[#111918] shadow-[0_0_0_1px_rgba(129,216,112,0.08)]">
              <img
                src={videoEditorPreview}
                alt="Video editor product interface preview"
                className="absolute inset-0 h-full w-full object-cover object-center"
                loading="lazy"
              />

              {/* Bottom image overlay */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,23,29,0.04)_30%,rgba(3,23,29,0.72)_100%)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
