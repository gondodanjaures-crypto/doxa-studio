import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useContent } from "../data/content";
import type { Project } from "../data/site";
import { getPublished, subscribePublished } from "../data/store";
import { cn } from "../utils/cn";
import { Reveal, SectionTag, SplitText } from "./ui";

function Card({ project, index }: { project: Project; index: number }) {
  const [hover, setHover] = useState(false);

  const span =
    project.size === "wide"
      ? "sm:col-span-2 aspect-[16/10]"
      : project.size === "tall"
        ? "sm:row-span-2 aspect-[3/4] sm:aspect-auto"
        : "aspect-[4/3]";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-cursor="media"
      data-cursor-label={project.video ? "Play" : "Voir"}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-ink-2",
        span,
      )}
    >
      <img
        src={project.image}
        alt={project.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] group-hover:grayscale-0"
      />

      {project.video && hover && (
        <video
          src={project.video}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-95" />

      {/* Filet rouge animé */}
      <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-rouge transition-transform duration-500 ease-out group-hover:scale-x-100" />

      <div className="absolute left-5 top-5 z-10 flex items-center gap-2">
        <span className="rounded-full bg-ink/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
          {project.category}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-rouge">
              {project.client} — {project.year}
            </p>
            <h3 className="mt-2 font-display text-2xl uppercase leading-none sm:text-3xl">
              {project.title}
            </h3>
            <div className="mt-3 max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-24 group-hover:opacity-100">
              <div className="flex flex-wrap gap-2">
                {project.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/25 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/70"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 transition-all duration-500 group-hover:border-rouge group-hover:bg-rouge">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 -rotate-45 transition-transform duration-500 group-hover:rotate-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export default function Portfolio() {
  const [filter, setFilter] = useState<string>("Tout");
  const { sections } = useContent();

  /* Projets de la vitrine (éditables dans l'admin) + projets Espace Studio */
  const { projects } = useContent();
  const published = useSyncExternalStore(subscribePublished, getPublished);
  const all = useMemo(() => [...published, ...projects], [published, projects]);

  const categories = useMemo(
    () => ["Tout", ...Array.from(new Set(all.map((p) => p.category)))],
    [all],
  );

  const filtered = useMemo(
    () => (filter === "Tout" ? all : all.filter((p) => p.category === filter)),
    [filter, all],
  );

  return (
    <section id="realisations" className="relative border-b border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionTag>Réalisations</SectionTag>
            <h2 className="font-display text-[12vw] uppercase leading-[0.9] sm:text-[8vw] lg:text-[5.4vw]">
              <SplitText text={sections.portfolioTitle1} />{" "}
              <span className="text-rouge">
                <SplitText text={sections.portfolioTitle2} delay={0.12} />
              </span>
            </h2>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                data-cursor="link"
                className={cn(
                  "relative overflow-hidden rounded-full border px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300",
                  filter === c
                    ? "border-rouge bg-rouge text-white"
                    : "border-white/15 text-white/60 hover:border-white/40 hover:text-white",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          layout
          className="mt-14 grid auto-rows-auto grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <Card key={p.id} project={p} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        <Reveal delay={0.1} className="mt-14 flex justify-center">
          <a
            href="#contact"
            data-cursor="link"
            className="group inline-flex items-center gap-4 text-sm uppercase tracking-[0.22em] text-white/70 transition-colors hover:text-white"
          >
            <span className="link-underline">Votre projet mérite cette page</span>
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 transition-all duration-500 group-hover:border-rouge group-hover:bg-rouge">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
