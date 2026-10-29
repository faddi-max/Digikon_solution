import { useEffect, useRef, useState } from "react";

/*
  Tailwind + React article page (no header nav).

  Setup:
  1. Add the Google Fonts link to your index.html <head>:
     <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  2. Optional tailwind.config.js extension so the font classes resolve:
     theme: { extend: { fontFamily: {
       sans: ['Manrope', 'Arial', 'sans-serif'],
       serif: ['"DM Serif Display"', 'Georgia', 'serif'],
     } } }
  3. Replace the cover placeholder with a real image by setting COVER_IMAGE below.
*/
import coverImg from "@/assets/images/about-hero-team.png";
import { RelatedPosts } from "@/components/sections/Blog/RelatedPosts";

const COVER_IMAGE = coverImg;

const TOC = [
  { id: "start-with-problem", label: "Start with the problem" },
  { id: "build-foundations", label: "Build foundations" },
  { id: "design-for-people", label: "Design for people" },
  { id: "ship-learn", label: "Ship, learn, improve" },
  { id: "takeaway", label: "The takeaway" },
];

const TITLE_WORDS = ["From", "idea", "to", "impact:", "building", "software", "that"];

const CHECKLIST = [
  ["Define clear responsibilities.", "Give each service or module a specific role."],
  ["Design around real workflows.", "Make the core user journeys easy to follow and maintain."],
  ["Plan for security.", "Treat access control, data protection, and sensible permissions as foundational requirements."],
  ["Measure performance.", "Establish a baseline before optimizing, then monitor the areas that matter to users."],
];

const STYLES = `
html{scroll-behavior:smooth;scroll-padding-top:40px}
@keyframes rise{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
@keyframes wordUp{from{transform:translateY(112%)}to{transform:none}}
@keyframes sweep{from{background-size:0 100%}to{background-size:100% 100%}}
@keyframes pulseDot{0%{box-shadow:0 0 0 0 rgba(129,216,112,.6)}70%{box-shadow:0 0 0 8px rgba(129,216,112,0)}100%{box-shadow:0 0 0 0 rgba(129,216,112,0)}}
@keyframes ring{from{transform:scale(1)}to{transform:scale(1.35)}}
.rise{animation:rise .7s cubic-bezier(.16,1,.3,1) both;animation-delay:var(--d,0ms)}
.h1-word{display:inline-block;overflow:hidden;vertical-align:top;padding:0 .04em .16em;margin:0 -.04em -.16em}
.h1-word>span{display:inline-block;animation:wordUp .95s cubic-bezier(.16,1,.3,1) both;animation-delay:calc(220ms + var(--i)*70ms)}
.h1-em{background:linear-gradient(transparent 66%,rgba(129,216,112,.55) 66%,rgba(129,216,112,.55) 92%,transparent 92%) no-repeat left/0 100%;animation:sweep .8s cubic-bezier(.65,0,.35,1) 1.35s forwards}
.pill-dot::before{content:"";width:6px;height:6px;background:#81d870;border-radius:50%;animation:pulseDot 2.4s ease-out infinite}
.side-ring::after{content:"";position:absolute;width:100px;height:100px;border:1px solid #81d87055;border-radius:50%;right:-44px;top:-44px;box-shadow:0 0 0 15px #81d8700a;z-index:-1;animation:ring 5s ease-in-out infinite alternate}
.reveal{opacity:0;transform:translateY(20px);transition:opacity .6s cubic-bezier(.16,1,.3,1) var(--d,0ms),transform .7s cubic-bezier(.16,1,.3,1) var(--d,0ms)}
.reveal.reveal-right{transform:translateX(24px)}
.reveal.in{opacity:1;transform:none}
.h2-rule::after{content:"";position:absolute;left:0;bottom:0;height:3px;width:56px;border-radius:3px;background:#81d870;transform:scaleX(0);transform-origin:left;transition:transform .8s cubic-bezier(.65,0,.35,1) .25s}
.h2-rule.in::after{transform:none}
.callout-bar::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:#81d870;transform:scaleY(0);transform-origin:top;transition:transform .8s cubic-bezier(.65,0,.35,1) .2s}
.callout-bar.in::before{transform:none}
.check-item::before{content:"✓";position:absolute;left:0;top:3px;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;background:#e4f5df;color:#2f7f3a;font-size:11px;font-weight:800;line-height:20px;text-align:center;transform:scale(0);transition:transform .5s cubic-bezier(.34,1.56,.64,1) calc(var(--d,0ms) + 150ms)}
.reveal.in .check-item::before{transform:none}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  *,*::before,*::after{animation:none!important;transition-duration:.01ms!important;transition-delay:0s!important}
  .reveal{opacity:1;transform:none}
  .h1-word>span{transform:none}
  .h1-em{background-size:100% 100%}
  .h2-rule::after,.callout-bar::before,.check-item::before{transform:none}
}
`;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function ArticlePage() {
  const rootRef = useRef(null);
  const contentRef = useRef(null);
  const barRef = useRef(null);
  const fillRef = useRef(null);
  const thumbRef = useRef(null);
  const tocRefs = useRef([]);

  const [pct, setPct] = useState("0%");
  const [activeIdx, setActiveIdx] = useState(-1);
  const [showTop, setShowTop] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const shareTimer = useRef(null);

  const say = (msg) => {
    setShareMsg(msg);
    clearTimeout(shareTimer.current);
    shareTimer.current = setTimeout(() => setShareMsg(""), 2600);
  };

  /* Scroll reveals (also covers .reveal elements inside RelatedPosts) */
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = rootRef.current.querySelectorAll(".reveal");
    if (reduced || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* Reading progress, active TOC item, back-to-top */
  useEffect(() => {
    const headings = TOC.map((t) => document.getElementById(t.id));
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const vh = window.innerHeight;

      const content = contentRef.current;
      const top = content.getBoundingClientRect().top + y;
      const p = clamp((y + vh * 0.4 - top) / content.offsetHeight, 0, 1);
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
      setPct(p >= 0.995 ? "Done" : Math.round(p * 100) + "%");

      let idx = -1;
      headings.forEach((h, k) => {
        if (h && h.getBoundingClientRect().top < vh * 0.35) idx = k;
      });
      if (p > 0.985) idx = headings.length - 1;
      setActiveIdx(idx);

      setShowTop(y > 700);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* TOC thumb follows the active link */
  useEffect(() => {
    const place = () => {
      const a = tocRefs.current[activeIdx];
      const thumb = thumbRef.current;
      if (!thumb) return;
      if (!a) {
        thumb.style.height = "0px";
        return;
      }
      thumb.style.height = a.offsetHeight + "px";
      thumb.style.transform = `translateY(${a.offsetTop}px)`;
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [activeIdx]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      say("Article link copied.");
    } catch {
      say("Copy this page URL from your browser address bar.");
    }
  };

  const shareLinkedIn = () =>
    window.open(
      "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(window.location.href),
      "_blank",
      "noopener,noreferrer"
    );

  const shareEmail = () => {
    window.location.href =
      "mailto:?subject=" + encodeURIComponent(document.title) + "&body=" + encodeURIComponent(window.location.href);
  };

  const scrollTop = () =>
    window.scrollTo({
      top: 0,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });

  return (
    <div ref={rootRef} className="-mt-[var(--header-content-clearance)] min-h-screen bg-white font-sans text-[#03171D] antialiased overflow-x-clip">
      <style>{STYLES}</style>

      <a
        href="#articleContent"
        className="fixed left-4 top-4 z-[200] -translate-y-[200%] rounded-lg bg-[#81D870] px-4 py-3 text-xs font-extrabold text-[#03171D] transition-transform duration-200 focus:translate-y-0"
      >
        Skip to article
      </a>

      {/* Reading progress bar */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-[3px]" aria-hidden="true">
        <i ref={barRef} className="block h-full origin-left bg-[#81D870] will-change-transform" style={{ transform: "scaleX(0)" }} />
      </div>

      {/* Hero: pale green wash, title, author, cover */}
      <section className="bg-gradient-to-b from-[#e6f6e0] via-[#f3fbf0] to-white pt-[calc(var(--header-content-clearance)+1.5rem)] max-[650px]:pt-[calc(var(--header-content-clearance)+0.5rem)]">
        <div className="mx-auto w-[min(1000px,calc(100%-56px))] max-[650px]:w-[calc(100%-34px)]">
          <div className="mx-auto max-w-[900px] text-center max-[650px]:text-left">
            <span
              className="pill-dot rise inline-flex items-center gap-[7px] rounded-full border border-[#dce8d9] bg-white/70 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#2f7f3a]"
              style={{ "--d": "120ms" }}
            >
              Software development
            </span>

            <h1
              aria-label="From idea to impact: building software that scales."
              className="mx-auto mb-[17px] mt-[22px] max-w-[880px] font-serif text-[clamp(40px,5.4vw,68px)] font-normal leading-[1.04] tracking-[-0.04em] max-[650px]:mb-3.5 max-[650px]:mt-[18px] max-[650px]:text-[44px]"
            >
              {TITLE_WORDS.map((w, i) => (
                <span key={w}>
                  <span className="h1-word" aria-hidden="true">
                    <span style={{ "--i": i }}>{w}</span>
                  </span>{" "}
                </span>
              ))}
              <span className="h1-word" aria-hidden="true">
                <span style={{ "--i": 7 }}>
                  <em className="h1-em not-italic text-[#2f7f3a]">scales.</em>
                </span>
              </span>
            </h1>

            <p className="rise mx-auto max-w-[670px] text-[15px] leading-[1.8] text-[#5b696b] max-[650px]:text-sm" style={{ "--d": "700ms" }}>
              Great software doesn’t happen by accident. A practical guide to creating digital products that solve real problems today — and keep working as your business grows.
            </p>

            <div className="rise mt-[27px] flex flex-wrap items-center justify-center gap-[11px] text-[11px] text-[#647174] max-[650px]:justify-start" style={{ "--d": "820ms" }}>
              <span className="grid h-[35px] w-[35px] place-items-center rounded-full bg-gradient-to-br from-[#1c2e33] to-[#81d870] text-[10px] font-extrabold text-white">
                DK
              </span>
              <div className="text-left leading-[1.7]">
                <strong className="block text-[11px] text-[#203638]">DigiKon Editorial Team</strong>
                <span className="block">Ideas from our digital specialists</span>
              </div>
              <span className="h-[3px] w-[3px] rounded-full bg-[#a8b5af]" />
              <span>October 22, 2026</span>
              <span className="h-[3px] w-[3px] rounded-full bg-[#a8b5af]" />
              <span>7 min read</span>
            </div>
          </div>

          {/* Cover */}
          <figure className="rise mx-auto mb-14 mt-12 max-w-[1000px] max-[650px]:mb-10 max-[650px]:mt-8" style={{ "--d": "550ms" }}>
            <div
              role="img"
              aria-label="Abstract illustration of a modern digital product interface"
              className="relative h-[380px] overflow-hidden rounded-[22px] border border-[#dfe8df] bg-gradient-to-br from-[#09272b] via-[#153c38] to-[#0b2429] max-[1000px]:h-[300px] max-[650px]:h-[220px] max-[650px]:rounded-[15px]"
            >
              {COVER_IMAGE ? (
                <img src={COVER_IMAGE} alt="" className="h-full w-full object-cover" />
              ) : (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_18%,#81d87040,transparent_32%),radial-gradient(ellipse_at_20%_100%,#3c876b50,transparent_45%)]" />
                  <div className="absolute inset-0 opacity-[.14] [background-image:linear-gradient(#b4e4ad_1px,transparent_1px),linear-gradient(90deg,#b4e4ad_1px,transparent_1px)] [background-size:38px_38px]" />
                </>
              )}
              <figcaption className="absolute bottom-4 right-5 inline-flex h-8 w-[207px] items-center justify-center gap-2.5 whitespace-nowrap rounded-[18px] bg-[#81D870] p-2.5 text-[8px] font-extrabold tracking-[0.08em] text-[#03171D] max-[650px]:bottom-3 max-[650px]:right-3">
                DIGITAL THINKING · BUILT TO SCALE
              </figcaption>
            </div>
          </figure>
        </div>
      </section>

      {/* Article + sidebar */}
      <main className="mx-auto w-[min(1180px,calc(100%-56px))] max-[650px]:w-[calc(100%-34px)]">
        <div className="grid items-start justify-center gap-[65px] min-[1000px]:grid-cols-[minmax(0,760px)_240px] max-[1000px]:grid-cols-[minmax(0,760px)] max-[1000px]:gap-[35px]">
          <article ref={contentRef} id="articleContent" className="min-w-0 text-[16px] leading-[1.9] text-[#3f5153] max-[650px]:text-[15px] max-[650px]:leading-[1.85]">
            <p className="reveal mb-[23px] text-[19px] leading-[1.8] text-[#263e40] max-[650px]:text-[17px]">
              When a business grows, its digital needs grow with it. What starts as a useful tool can become a core part of how your team serves customers, makes decisions, and gets work done. The right foundations help that tool evolve without becoming harder to maintain.
            </p>
            <p className="reveal mb-[23px]">
              Building scalable software is not about predicting every future requirement. It is about making thoughtful decisions now, keeping the system understandable, and leaving room to adapt when the next opportunity arrives.
            </p>

            <H2 id="start-with-problem">01. Start with the problem, not the platform</H2>
            <p className="reveal mb-[23px]">
              Before choosing a framework or mapping out features, get clear on the problem you are solving. Talk to the people who experience it, map the current workflow, and define what a better outcome looks like.
            </p>
            <div className="callout-bar reveal relative my-[30px] overflow-hidden rounded-r-xl bg-[#f4f8f3] py-[23px] pl-7 pr-[25px] text-[#344b4b]">
              <strong className="mb-1 block text-[#03171D]">Strategy before stack.</strong>
              A focused first release that solves a real problem is more valuable than a large feature set built around assumptions.
            </div>
            <p className="reveal mb-[23px]">
              Turn those findings into a short, testable scope. Separate essential capabilities from ideas that can wait, and agree on how you will measure success. This creates a shared point of reference for design, engineering, and business stakeholders.
            </p>

            <H2 id="build-foundations">02. Build foundations that can evolve</H2>
            <p className="reveal mb-[23px]">
              Scalable products benefit from clear boundaries, consistent data models, secure defaults, and code that another developer can understand. Keep components focused and avoid adding complexity until there is a demonstrated need for it.
            </p>
            <h3 className="reveal mb-[11px] mt-[29px] text-[17px] leading-[1.4] text-[#03171D]">Keep the architecture intentional</h3>
            <ul className="reveal my-5 mb-[30px] list-none p-0">
              {CHECKLIST.map(([strong, rest], i) => (
                <li key={strong} className="check-item relative pb-[13px] pl-8" style={{ "--d": `${i * 110}ms` }}>
                  <strong className="text-[#1e3538]">{strong}</strong> {rest}
                </li>
              ))}
            </ul>
            <p className="reveal mb-[23px]">
              Good architecture is not the most complicated architecture. It is the simplest structure that supports your current needs while allowing the product to change safely.
            </p>

            <H2 id="design-for-people">03. Make the experience part of the product</H2>
            <p className="reveal mb-[23px]">
              Performance and maintainability matter, but so does the experience people have every day. Clear navigation, helpful feedback, accessible contrast, and predictable interactions reduce friction and help users trust the product.
            </p>
            <p className="reveal mb-[23px]">
              Test early with the people who will use the software. Watch where they hesitate, which terms confuse them, and what they try to do next. Small usability improvements can remove more friction than another round of features.
            </p>
            <div className="reveal my-5 mb-[30px] rounded-xl border border-[#e0e8e1] bg-[#fbfcfb] px-5 py-[18px] text-[13px] leading-[1.8] text-[#445657]">
              <strong className="text-[#1e3538]">Design check:</strong> Can a first-time user understand where to begin, complete the main task, and recover from a mistake without asking for help?
            </div>

            <H2 id="ship-learn">04. Ship, learn, and improve</H2>
            <p className="reveal mb-[23px]">
              Release in manageable increments. A useful delivery rhythm gives the team a chance to validate assumptions, gather feedback, and adjust priorities before too much time is invested in the wrong direction.
            </p>
            <p className="reveal mb-[23px]">
              After launch, pay attention to actual usage, support requests, reliability, and business outcomes. Use those signals to decide what to improve next. Continuous improvement is a practical habit, not a one-time project phase.
            </p>

            <H2 id="takeaway">The takeaway</H2>
            <p className="reveal mb-[23px]">
              Software that scales begins with a clear problem, a maintainable foundation, and a genuine understanding of the people using it. Keep the first version focused, make decisions deliberately, and let evidence guide what comes next.
            </p>
            <p className="reveal mb-[23px]">
              Whether you are modernizing an existing platform or starting something new, a thoughtful approach helps you build with confidence — and adapt as your business changes.
            </p>

            <div className="reveal mt-[42px] border-t border-[#e3e9e5] pt-[25px]">
              <strong className="text-[#03171D]">Topics in this article</strong>
              <div className="my-[17px] mb-7 flex flex-wrap gap-2">
                {["Software development", "Product strategy", "Scalable systems", "UX"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[#dfe8df] bg-[#f8faf8] px-[13px] py-[9px] text-[11px] text-[#3f5a53] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#81D870] hover:bg-[#e4f5df]"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <strong className="text-xs text-[#03171D]">Found this useful? Share it.</strong>
                <div className="flex gap-2">
                  <ShareButton label="Copy article link" onClick={copyLink}>↗</ShareButton>
                  <ShareButton label="Share on LinkedIn" onClick={shareLinkedIn}>in</ShareButton>
                  <ShareButton label="Share by email" onClick={shareEmail}>✉</ShareButton>
                </div>
              </div>
              <div
                role="status"
                aria-live="polite"
                className={`mt-2.5 min-h-[16px] text-[11px] text-[#2f7f3a] transition-all duration-300 ${shareMsg ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"}`}
              >
                {shareMsg}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside
            aria-label="Article tools"
            className="grid gap-3.5 self-start p-0.5 min-[1000px]:sticky min-[1000px]:top-6 max-[1000px]:grid-cols-2 max-[650px]:grid-cols-1"
          >
            <div className="reveal reveal-right rounded-[14px] border border-[#e3eae4] bg-[#fbfcfb] p-5 max-[1000px]:mb-0">
              <div className="mb-[15px] flex justify-between text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#647174]">
                <span>In this article</span>
                <b className="font-extrabold tabular-nums tracking-[0.06em] text-[#2f7f3a]" aria-hidden="true">{pct}</b>
              </div>
              <nav aria-label="Table of contents" className="relative flex flex-col gap-0.5">
                <span ref={thumbRef} className="absolute left-0 top-0 h-0 w-0.5 rounded-sm bg-[#81D870] transition-transform duration-[450ms]" aria-hidden="true" />
                <span className="absolute bottom-0 left-0 top-0 w-0.5 rounded-sm bg-[#e1e8e2]" aria-hidden="true" />
                {TOC.map((t, i) => {
                  const active = i === activeIdx;
                  return (
                    <a
                      key={t.id}
                      href={`#${t.id}`}
                      ref={(el) => (tocRefs.current[i] = el)}
                      aria-current={active ? "location" : undefined}
                      className={`relative min-h-[36px] py-[9px] pl-3.5 text-xs leading-[1.5] transition-[color,transform] duration-300 hover:translate-x-[3px] hover:text-[#2f7f3a] ${active ? "translate-x-[3px] font-bold text-[#1e6f2d]" : "text-[#5b6c6a]"}`}
                    >
                      {t.label}
                    </a>
                  );
                })}
              </nav>
              <div className="mt-[17px] h-[3px] overflow-hidden rounded-[5px] bg-[#e1e9e1]" aria-hidden="true">
                <div ref={fillRef} className="h-full w-full origin-left bg-[#81D870] will-change-transform" style={{ transform: "scaleX(0)" }} />
              </div>
            </div>

            <div className="side-ring reveal reveal-right relative isolate overflow-hidden rounded-[14px] bg-[#03171D] p-[21px] text-white" style={{ "--d": "120ms" }}>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#81D870]">Building something new?</div>
              <h3 className="my-3.5 mb-2.5 font-serif text-[25px] font-normal leading-[1.08]">Make your next idea real.</h3>
              <p className="mb-[17px] text-xs leading-[1.7] text-[#b4c5c0]">
                Let’s talk about a software experience that fits your goals and grows with your business.
              </p>
              <a
                href="#"
                className="group flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-[#81D870] text-[11px] font-extrabold text-[#03171D] transition-[background-color,gap] duration-200 hover:gap-2.5 hover:bg-[#b2ee9e]"
              >
                Talk to DigiKon <span aria-hidden="true">↗</span>
              </a>
            </div>
          </aside>
        </div>

        {/* breathing room before the dark related section */}
        <div className="h-16 max-[650px]:h-10" aria-hidden="true" />
      </main>

      {/* Related posts: heading, divider and "All insights" live inside this dark section */}
      <RelatedPosts currentSlug="from-idea-to-impact" category="software" />

      <button
        type="button"
        onClick={scrollTop}
        aria-label="Back to top"
        className={`fixed bottom-5 right-5 z-[90] h-12 w-12 rounded-full bg-[#81D870] text-lg font-extrabold text-[#03171D] shadow-[0_12px_28px_-10px_rgba(3,23,29,.5)] transition-[opacity,transform,background-color] duration-300 hover:bg-[#b2ee9e] max-[650px]:bottom-3.5 max-[650px]:right-3.5 ${
          showTop ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-4 scale-90 opacity-0"
        }`}
      >
        ↑
      </button>
    </div>
  );
}

function H2({ id, children }) {
  return (
    <h2
      id={id}
      className="h2-rule reveal relative mb-[17px] mt-12 scroll-mt-10 pb-3.5 font-serif text-[34px] font-normal leading-[1.2] tracking-[-0.025em] text-[#03171D] max-[650px]:mt-[38px] max-[650px]:text-[29px]"
    >
      {children}
    </h2>
  );
}

function ShareButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="h-11 w-11 rounded-full border border-[#dfe7e0] bg-white text-sm text-[#284345] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#03171D] hover:bg-[#03171D] hover:text-white active:scale-[.92]"
    >
      {children}
    </button>
  );
}