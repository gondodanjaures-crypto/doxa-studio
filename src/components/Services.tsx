import { useContent } from "../data/content";
import { Reveal, SectionTag, SplitText } from "./ui";

export default function Services() {
  const { sections, services } = useContent();
  return (
    <section id="expertises" className="relative overflow-hidden border-b border-white/10 py-24 sm:py-32">
      <div className="absolute right-0 top-24 h-[380px] w-[380px] rounded-full bg-rouge/10 blur-[150px]" />

      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionTag>Nos expertises</SectionTag>
            <h2 className="font-display text-[12vw] uppercase leading-[0.9] sm:text-[8vw] lg:text-[5.4vw]">
              <SplitText text={sections.servicesTitle1} />
              <br />
              <span className="text-stroke">
                <SplitText text={sections.servicesTitle2} delay={0.1} />
              </span>
            </h2>
          </div>
          <Reveal delay={0.2} className="max-w-sm">
            <p className="text-white/60">{sections.servicesIntro}</p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.num} delay={(i % 3) * 0.08} y={26}>
              <article
                data-cursor="link"
                className="group relative flex h-full min-h-[330px] flex-col justify-between overflow-hidden bg-ink p-8 transition-colors duration-500"
              >
                <span className="absolute inset-0 translate-y-full bg-rouge transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-9 w-9 stroke-rouge transition-colors duration-500 group-hover:stroke-white"
                      fill="none"
                      strokeWidth={1.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={s.icon} />
                    </svg>
                    <span className="font-display text-3xl text-white/15 transition-colors duration-500 group-hover:text-white/40">
                      {s.num}
                    </span>
                  </div>

                  <h3 className="mt-8 font-display text-3xl uppercase leading-none">{s.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/55 transition-colors duration-500 group-hover:text-white/90">
                    {s.desc}
                  </p>
                </div>

                <ul className="relative z-10 mt-8 flex flex-wrap gap-2">
                  {s.items.map((it) => (
                    <li
                      key={it}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/60 transition-colors duration-500 group-hover:border-white/50 group-hover:text-white"
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
