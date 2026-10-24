
import { Link } from "react-router-dom";

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
  );
}

export default function BuildingSomething() {
  return (
    <section
      aria-labelledby="building-something-title"
      className="relative isolate w-full overflow-hidden py-14 bg-[#81D870] text-[#03171D]"
    >
      {/* Grid background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(3,23,29,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(3,23,29,0.055)_1px,transparent_1px)] bg-[size:clamp(18px,3.2vw,31px)_clamp(18px,3.2vw,31px)]"
      />

      {/* Main container */}
      <div
        className="
          mx-auto grid w-full max-w-[1360px]
          grid-cols-1 items-center
          gap-y-8 px-5 py-10
          min-[375px]:px-6
          sm:gap-y-10 sm:px-8 sm:py-12
          md:grid-cols-2 md:gap-x-10 md:gap-y-12 md:px-10 md:py-14
          lg:gap-x-16 lg:gap-y-16 lg:px-12
          xl:gap-x-[80px] xl:gap-y-[80px] xl:px-0 xl:py-0
        "
      >
        {/* Left: Heading */}
        <div className="min-w-0">
          <h2
            id="building-something-title"
            className="
              font-['DM_Serif_Display']
              text-[clamp(42px,8.5vw,64px)]
              font-normal
              leading-[0.98]
              tracking-[-0.045em]
              min-[480px]:text-[clamp(48px,7vw,68px)]
              sm:text-[clamp(56px,7vw,76px)]
              md:text-[clamp(42px,4.8vw,60px)]
              lg:text-[clamp(55px,5vw,76px)]
              xl:text-[100px]
              xl:leading-[98px]
              xl:tracking-[-1.92px]
            "
          >
            <span className="block">Building</span>
            <span className="block">something of</span>
            <span className="block">your own?</span>
          </h2>
        </div>

        {/* Right: Description and buttons */}
        <div className="min-w-0 w-full">
          <p
            className="
              max-w-[520px]
              font-['Manrope']
              text-[14px]
              font-normal
              leading-[1.7]
              tracking-[-0.2px]
              text-[#03171D]/80
              sm:text-base
              md:text-[17px]
              lg:text-[18px]
              xl:text-[20px]
              xl:leading-[31px]
              xl:tracking-[-0.45px]
            "
          >
            Alongside our own products, DIGIKON builds custom
            software for the teams we partner with. If you have
            an idea worth making well, we would like to hear
            about it.
          </p>

          {/* CTA buttons */}
          <div
            className="
              mt-5 flex flex-wrap items-center gap-2.5
              sm:mt-6
            "
          >
            <Link
              to="/contact"
              className="
                inline-flex min-h-10 max-w-full
                items-center justify-center gap-2
                rounded-full border border-transparent
                bg-[#03171D]
                px-3.5 py-2
                font-['Manrope']
                text-[11px] font-medium
                leading-tight text-white
                transition-colors duration-200
                hover:bg-[#16343A]
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-[#03171D]
                sm:px-[18px] sm:text-xs
                motion-reduce:transition-none
              "
            >
              <span>Discuss your project</span>
              <ArrowRight />
            </Link>

            <Link
              to="/work"
              className="
                inline-flex min-h-10 max-w-full
                items-center justify-center
                rounded-full
                border border-[#03171D]/25
                bg-transparent
                px-3.5 py-2
                font-['Manrope']
                text-[11px] font-medium
                leading-tight text-[#03171D]
                transition-colors duration-200
                hover:border-[#03171D]
                hover:bg-[#03171D]/5
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-[#03171D]
                sm:px-[18px] sm:text-xs
                motion-reduce:transition-none
              "
            >
              See how we work
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
