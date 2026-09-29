import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { useContent } from "../data/content";
import { cn } from "../utils/cn";
import { Reveal, SectionTag, SplitText } from "./ui";

const BUDGETS = ["< 500 K FCFA", "500 K – 2 M", "2 – 5 M FCFA", "> 5 M FCFA"];
const NEEDS = [
  "Motion Design",
  "3D / Archi",
  "Identité Visuelle",
  "Film / Vidéo",
  "Stratégie",
  "Print",
];

type Fields = { name: string; email: string; company: string; message: string };

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  textarea = false,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  textarea?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/45"
      >
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          rows={4}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full resize-none rounded-xl border bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-rouge focus:bg-white/[0.06]",
            error ? "border-rouge" : "border-white/12",
          )}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-xl border bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-rouge focus:bg-white/[0.06]",
            error ? "border-rouge" : "border-white/12",
          )}
        />
      )}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1.5 text-[11px] text-rouge"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Contact() {
  const { contact } = useContent();
  const { sections } = useContent();
  const [f, setF] = useState<Fields>({ name: "", email: "", company: "", message: "" });
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [budget, setBudget] = useState<string>(BUDGETS[1]);
  const [needs, setNeeds] = useState<string[]>(["Motion Design"]);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof Fields) => (v: string) => {
    setF((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const toggleNeed = (n: string) =>
    setNeeds((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Partial<Fields> = {};
    if (!f.name.trim()) err.name = "Votre nom, s'il vous plaît.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) err.email = "Email invalide.";
    if (f.message.trim().length < 12)
      err.message = "Décrivez un peu plus votre projet (12+ car.).";
    setErrors(err);
    if (Object.keys(err).length) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1100);
  };

  const rows = [
    { l: "Email", v: contact.email, h: `mailto:${contact.email}` },
    ...(contact.phones.length
      ? contact.phones.map((p, i) => ({
          l: i === 0 ? "Téléphone" : `Ligne ${i + 1}`,
          v: p.display,
          h: `tel:${p.tel}`,
        }))
      : []),
    { l: "WhatsApp", v: "Discuter maintenant", h: contact.whatsapp },
    { l: "Studio", v: contact.location, h: "#agence" },
  ];

  return (
    <section id="contact" className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-rouge/12 blur-[170px]" />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          {/* Colonne infos */}
          <div>
            <SectionTag>Contact</SectionTag>
            <h2 className="font-display text-[12vw] uppercase leading-[0.88] sm:text-[8vw] lg:text-[5vw]">
              <SplitText text={sections.contactTitle1} />
              <br />
              <span className="text-rouge">
                <SplitText text={sections.contactTitle2} delay={0.1} />
              </span>
            </h2>

            <Reveal delay={0.15}>
              <p className="mt-7 max-w-md text-white/60">{contact.intro}</p>
            </Reveal>

            <div className="mt-10 space-y-px overflow-hidden rounded-xl bg-white/10">
              {rows.map((c) => (
                <a
                  key={c.l}
                  href={c.h}
                  target={c.h.startsWith("http") ? "_blank" : undefined}
                  rel={c.h.startsWith("http") ? "noreferrer" : undefined}
                  data-cursor="link"
                  className="group flex items-center justify-between gap-4 bg-ink px-5 py-4 transition-colors duration-400 hover:bg-rouge"
                >
                  <span className="shrink-0 text-[10px] uppercase tracking-[0.24em] text-white/45 transition-colors group-hover:text-white/80">
                    {c.l}
                  </span>
                  <span className="flex items-center gap-3 text-right text-[13px] font-medium sm:text-sm">
                    {c.v}
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5 -rotate-45 text-rouge transition-all duration-400 group-hover:rotate-0 group-hover:text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Formulaire */}
          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-ink-2/70 p-6 backdrop-blur-xl sm:p-10">
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="ok"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex min-h-[420px] flex-col items-center justify-center text-center"
                  >
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 14 }}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-rouge"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-9 w-9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 12.5l5 5L20 6.5" />
                      </svg>
                    </motion.span>
                    <h3 className="mt-8 font-display text-4xl uppercase">Message envoyé</h3>
                    <p className="mt-3 max-w-sm text-white/60">
                      Merci {f.name.split(" ")[0]} ! Notre équipe revient vers vous sous 24 h
                      ouvrées. En attendant, jetez un œil à nos dernières réalisations.
                    </p>
                    <button
                      onClick={() => {
                        setSent(false);
                        setF({ name: "", email: "", company: "", message: "" });
                      }}
                      data-cursor="link"
                      className="mt-8 text-[11px] uppercase tracking-[0.22em] text-rouge link-underline"
                    >
                      Envoyer un autre message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={submit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        id="name"
                        label="Nom complet *"
                        value={f.name}
                        onChange={set("name")}
                        error={errors.name}
                        placeholder="Jean Dupont"
                      />
                      <Field
                        id="email"
                        label="Email *"
                        type="email"
                        value={f.email}
                        onChange={set("email")}
                        error={errors.email}
                        placeholder="jean@marque.com"
                      />
                    </div>

                    <Field
                      id="company"
                      label="Entreprise / Marque"
                      value={f.company}
                      onChange={set("company")}
                      placeholder="Doxa Corp."
                    />

                    <div>
                      <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-white/45">
                        Vos besoins
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {NEEDS.map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => toggleNeed(n)}
                            data-cursor="link"
                            className={cn(
                              "rounded-full border px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] transition-all duration-300",
                              needs.includes(n)
                                ? "border-rouge bg-rouge text-white"
                                : "border-white/15 text-white/55 hover:border-white/40 hover:text-white",
                            )}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-white/45">
                        Budget envisagé
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {BUDGETS.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setBudget(b)}
                            data-cursor="link"
                            className={cn(
                              "rounded-xl border px-3 py-3 text-[11px] transition-all duration-300",
                              budget === b
                                ? "border-rouge bg-rouge/15 text-white"
                                : "border-white/12 text-white/50 hover:border-white/35",
                            )}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Field
                      id="message"
                      label="Votre projet *"
                      textarea
                      value={f.message}
                      onChange={set("message")}
                      error={errors.message}
                      placeholder="Contexte, objectifs, deadline…"
                    />

                    <button
                      type="submit"
                      data-cursor="link"
                      disabled={loading}
                      className="group relative w-full overflow-hidden rounded-full bg-rouge px-8 py-4.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white disabled:opacity-70"
                    >
                      <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
                      <span className="relative z-10 flex items-center justify-center gap-3 py-1 transition-colors duration-300 group-hover:text-ink">
                        {loading ? (
                          <>
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            Envoi en cours
                          </>
                        ) : (
                          <>Envoyer le brief</>
                        )}
                      </span>
                    </button>

                    <p className="text-center text-[10.5px] text-white/35">
                      En envoyant ce formulaire, vous acceptez d'être recontacté par Doxa Studio.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
