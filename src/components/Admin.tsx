import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import {
  addBanner,
  addProjectItem,
  addService,
  addStat,
  addStep,
  addTestimonial,
  addValue,
  exportJSON,
  importJSON,
  moveProjectItem,
  moveService,
  moveStat,
  moveStep,
  moveTestimonial,
  removeBanner,
  removeProjectItem,
  removeService,
  removeStat,
  removeStep,
  removeTestimonial,
  removeValue,
  resetContent,
  resetProjects,
  resetServices,
  setAbout,
  setClients,
  setContact,
  setDelayBox,
  setFooter,
  setHero,
  setLogo,
  setSections,
  setFounder,
  setShowreel,
  updateProjectItem,
  updateService,
  updateStat,
  updateStep,
  updateTestimonial,
  updateValue,
  useContent,
  type Banner,
  type ProjectItem,
  type ServiceItem,
  type StatItem,
  type StepItem,
  type TestimonialItem,
  type ValueItem,
} from "../data/content";
import { type SessionUser } from "../data/store";
import BrandMark from "./BrandLogo";
import { cn } from "../utils/cn";

/* ------------------------------------------------------------------ */
/* Utilitaires fichiers                                                 */
/* ------------------------------------------------------------------ */
function fileToImageUrl(file: File, max = 1600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.84));
      };
      img.onerror = () => reject(new Error("image"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

function fileToVideoUrl(file: File, maxBytes = 8 * 1024 * 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > maxBytes) {
      reject(new Error("too-big"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

function download(name: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ------------------------------------------------------------------ */
/* Petits composants UI                                                 */
/* ------------------------------------------------------------------ */
const inputCls =
  "w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-rouge focus:bg-white/[0.06]";

function TextField({
  label,
  value,
  onChange,
  textarea,
  className,
  placeholder,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  className?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">
        {label}
      </label>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputCls, "resize-none")}
        />
      ) : (
        <input
          type={type ?? "text"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      )}
    </div>
  );
}

function Group({
  title,
  desc,
  children,
  action,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-ink-2/60 p-6 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-xl uppercase">{title}</h3>
        <div className="flex items-center gap-3">
          {action}
          <span className="flex shrink-0 items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/35">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rouge" />
            Auto-enregistré
          </span>
        </div>
      </div>
      {desc && <p className="-mt-3 mb-5 text-xs text-white/40">{desc}</p>}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** Champ média : téléversement + URL + aperçu (image ou vidéo). */
function MediaField({
  label,
  value,
  onChange,
  kind,
  notify,
  allowClear,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  kind: "image" | "video";
  notify: (m: string) => void;
  allowClear?: boolean;
  hint?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const onFile = async (f?: File | null) => {
    if (!f) return;
    setBusy(true);
    try {
      if (kind === "image") {
        onChange(await fileToImageUrl(f));
        notify("Image mise à jour sur le site.");
      } else {
        onChange(await fileToVideoUrl(f));
        notify("Vidéo mise à jour sur le site.");
      }
    } catch (e) {
      notify(
        e instanceof Error && e.message === "too-big"
          ? "Vidéo trop lourde (> 8 Mo) — utilisez une URL mp4."
          : "Impossible de charger ce fichier.",
      );
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">
        {label}
      </label>
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-ink">
          {kind === "image" ? (
            <img src={value} alt="Aperçu" className="h-44 w-full object-cover" />
          ) : (
            <video src={value} muted playsInline preload="metadata" className="h-44 w-full object-cover" />
          )}
          <div className="flex flex-wrap gap-2 p-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              data-cursor="link"
              className="rounded-full bg-rouge px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-85"
            >
              {busy ? "Traitement…" : "Remplacer"}
            </button>
            {allowClear && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  notify("Média retiré.");
                }}
                data-cursor="link"
                className="rounded-full border border-white/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60 hover:border-rouge hover:text-rouge"
              >
                Retirer
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          data-cursor="link"
          className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 text-white/40 transition-colors hover:border-rouge hover:text-rouge"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
          </svg>
          <span className="text-[10px] uppercase tracking-[0.18em]">
            {busy ? "Traitement…" : kind === "image" ? "Téléverser une image" : "Téléverser une vidéo (< 8 Mo)"}
          </span>
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept={kind === "image" ? "image/png,image/jpeg,image/webp" : "video/mp4,video/webm"}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <div className="mt-2 flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="…ou collez une URL puis « OK »"
          className={cn(inputCls, "py-2.5 text-[13px]")}
        />
        <button
          type="button"
          data-cursor="link"
          onClick={() => {
            if (!/^https?:\/\/.+/.test(url.trim())) {
              notify("URL invalide.");
              return;
            }
            onChange(url.trim());
            setUrl("");
            notify("Média appliqué depuis l'URL.");
          }}
          className="shrink-0 rounded-xl border border-white/20 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70 hover:border-rouge hover:text-rouge"
        >
          OK
        </button>
      </div>
      {hint && <p className="mt-1.5 text-[11px] text-white/35">{hint}</p>}
    </div>
  );
}

/** Boutons monter / descendre. */
function MoveBtns({ onUp, onDown }: { onUp: () => void; onDown: () => void }) {
  const cls =
    "flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/50 transition-colors hover:border-white/50 hover:text-white";
  return (
    <div className="flex gap-1.5">
      <button type="button" onClick={onUp} aria-label="Monter" data-cursor="link" className={cls}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M6 11l6-6 6 6" />
        </svg>
      </button>
      <button type="button" onClick={onDown} aria-label="Descendre" data-cursor="link" className={cls}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      </button>
    </div>
  );
}

/** Suppression en 2 temps (anti-clic accidentel). */
function DeleteBtn({ onDelete, label }: { onDelete: () => void; label: string }) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      data-cursor="link"
      onClick={() => {
        if (!armed) {
          setArmed(true);
          window.setTimeout(() => setArmed(false), 3000);
          return;
        }
        setArmed(false);
        onDelete();
      }}
      onBlur={() => setArmed(false)}
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-full border px-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition-all duration-300",
        armed
          ? "border-rouge bg-rouge text-white"
          : "border-rouge/40 text-rouge hover:bg-rouge hover:text-white",
      )}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" />
      </svg>
      {armed ? "Sûr ?" : ""}
    </button>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="link"
      className="group relative w-full overflow-hidden rounded-full bg-rouge px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white"
    >
      <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
      <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-300 group-hover:text-ink">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        {label}
      </span>
    </button>
  );
}

function GhostBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="link"
      className="rounded-full border border-white/20 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60 transition-colors duration-300 hover:border-rouge hover:text-rouge"
    >
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Accueil (hero)                                              */
/* ------------------------------------------------------------------ */
function AccueilTab({ notify }: { notify: (m: string) => void }) {
  const { hero } = useContent();
  return (
    <div className="space-y-6">
      <Group title="Titre & accroche">
        <TextField label="Badge d'état" value={hero.badge} onChange={(v) => setHero({ badge: v })} />
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="Titre — ligne 1" value={hero.line1} onChange={(v) => setHero({ line1: v })} />
          <TextField label="Titre — ligne 2" value={hero.line2} onChange={(v) => setHero({ line2: v })} />
          <TextField label="Mot d'accent (contour rouge)" value={hero.accent} onChange={(v) => setHero({ accent: v })} />
        </div>
        <TextField label="Sous-titre" textarea value={hero.subtitle} onChange={(v) => setHero({ subtitle: v })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Bouton principal" value={hero.cta1} onChange={(v) => setHero({ cta1: v })} />
          <TextField label="Bouton secondaire" value={hero.cta2} onChange={(v) => setHero({ cta2: v })} />
        </div>
        <TextField
          label="Mots du bandeau défilant (séparés par des virgules)"
          value={hero.marquee}
          onChange={(v) => setHero({ marquee: v })}
        />
      </Group>
      <Group title="Vidéo de fond" desc="Boucle plein écran derrière le titre. Changez-la à tout moment.">
        <MediaField
          label="Vidéo de fond (mp4)"
          kind="video"
          value={hero.video}
          notify={notify}
          onChange={(v) => setHero({ video: v })}
          hint="Fichier < 8 Mo ou URL mp4 (ex. Pexels, votre hébergeur)."
        />
        <MediaField
          label="Image d'attente (poster)"
          kind="image"
          value={hero.poster}
          notify={notify}
          onChange={(v) => setHero({ poster: v })}
          hint="Affichée pendant le chargement de la vidéo."
        />
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Réalisations (CRUD projets)                                 */
/* ------------------------------------------------------------------ */
const SIZES = [
  { value: "std", label: "Standard" },
  { value: "wide", label: "Paysage" },
  { value: "tall", label: "Vertical" },
] as const;

function ProjectEditor({
  p,
  categories,
  notify,
}: {
  p: ProjectItem;
  categories: string[];
  notify: (m: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-ink">
      <div className="flex items-center gap-3 p-3">
        <img src={p.image} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base uppercase">{p.title || "Sans titre"}</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">
            {p.client} · {p.category} · {p.year}
          </p>
        </div>
        <MoveBtns onUp={() => moveProjectItem(p.id, -1)} onDown={() => moveProjectItem(p.id, 1)} />
        <DeleteBtn label="Supprimer le projet" onDelete={() => { removeProjectItem(p.id); notify("Projet supprimé du site."); }} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          data-cursor="link"
          aria-label="Modifier"
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
            open ? "border-rouge bg-rouge text-white" : "border-white/20 text-white/60 hover:border-white/50 hover:text-white",
          )}
        >
          <svg viewBox="0 0 24 24" className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-white/10 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Titre" value={p.title} onChange={(v) => updateProjectItem(p.id, { title: v })} />
                <TextField label="Client / Marque" value={p.client} onChange={(v) => updateProjectItem(p.id, { client: v })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">Catégorie</label>
                  <input
                    value={p.category}
                    list={`cats-${p.id}`}
                    onChange={(e) => updateProjectItem(p.id, { category: e.target.value })}
                    className={inputCls}
                  />
                  <datalist id={`cats-${p.id}`}>
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <TextField label="Année" value={p.year} onChange={(v) => updateProjectItem(p.id, { year: v })} />
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">Format</label>
                  <select
                    value={p.size}
                    onChange={(e) => updateProjectItem(p.id, { size: e.target.value as ProjectItem["size"] })}
                    className={cn(inputCls, "appearance-none")}
                  >
                    {SIZES.map((s) => (
                      <option key={s.value} value={s.value} className="bg-ink-2">{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <MediaField label="Image du projet" kind="image" value={p.image} notify={notify} onChange={(v) => updateProjectItem(p.id, { image: v })} />
              <MediaField
                label="Extrait vidéo (optionnel — joué au survol)"
                kind="video"
                value={p.video ?? ""}
                notify={notify}
                allowClear
                onChange={(v) => updateProjectItem(p.id, { video: v || undefined })}
              />
              <TextField
                label="Tags (séparés par des virgules)"
                value={p.tags.join(", ")}
                onChange={(v) =>
                  updateProjectItem(p.id, {
                    tags: v.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 6),
                  })
                }
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjetsTab({ notify }: { notify: (m: string) => void }) {
  const { projects } = useContent();
  const categories = Array.from(new Set(projects.map((p) => p.category)));
  return (
    <div className="space-y-4">
      <Group
        title={`Projets de la vitrine (${projects.length})`}
        desc="Tout est modifiable : images, vidéos, titres, catégories. L'ordre ici = l'ordre sur le site."
        action={<GhostBtn label="Restaurer l'original" onClick={() => { resetProjects(); notify("Projets d'origine restaurés."); }} />}
      >
        <AddBtn
          label="Ajouter un projet"
          onClick={() => {
            addProjectItem({
              id: Date.now(),
              title: "Nouveau projet",
              client: "Client",
              category: categories[0] ?? "Motion Design",
              year: String(new Date().getFullYear()),
              image: "",
              tags: [],
              size: "std",
            });
            notify("Projet créé — ajoutez son image.");
          }}
        />
        <div className="space-y-3">
          {projects.map((p) => (
            <ProjectEditor key={p.id} p={p} categories={categories} notify={notify} />
          ))}
        </div>
        {projects.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-white/40">
            Aucun projet — la section Réalisations est vide sur le site.
          </p>
        )}
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Expertises (CRUD services)                                  */
/* ------------------------------------------------------------------ */
const ICON_PRESETS = [
  { label: "Média / Play", path: "M8 5v14l11-7z" },
  { label: "Volume 3D", path: "M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5" },
  { label: "Palette", path: "M12 3a9 9 0 100 18 4.5 4.5 0 000-9 4.5 4.5 0 010-9zM7.5 9.5h.01M9.5 6.5h.01M14.5 6.5h.01" },
  { label: "Caméra", path: "M3 6h13v12H3zM16 10l5-3v10l-5-3z" },
  { label: "Croissance", path: "M4 19V5M4 19h16M8 16V9M12 16v-5M16 16V6" },
  { label: "Calques", path: "M6 3h12v6H6zM6 15h12v6H6zM4 9h16v6H4z" },
  { label: "Mégaphone", path: "M3 11v3l4 1 4 5V6l-4 5H4zM15 9a4 4 0 010 6" },
  { label: "Étoile", path: "M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z" },
];

function ServiceEditor({ s, notify }: { s: ServiceItem; notify: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-ink">
      <div className="flex items-center gap-3 p-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rouge/15">
          <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-rouge" fill="none" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d={s.icon} />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base uppercase">{s.num} — {s.title || "Sans titre"}</p>
          <p className="truncate text-[11px] text-white/40">{s.items.join(" · ")}</p>
        </div>
        <MoveBtns onUp={() => moveService(s.id, -1)} onDown={() => moveService(s.id, 1)} />
        <DeleteBtn label="Supprimer le service" onDelete={() => { removeService(s.id); notify("Service supprimé."); }} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          data-cursor="link"
          aria-label="Modifier"
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
            open ? "border-rouge bg-rouge text-white" : "border-white/20 text-white/60 hover:border-white/50 hover:text-white",
          )}
        >
          <svg viewBox="0 0 24 24" className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-white/10 p-4">
              <div className="grid gap-4 sm:grid-cols-[100px_1fr]">
                <TextField label="N°" value={s.num} onChange={(v) => updateService(s.id, { num: v })} />
                <TextField label="Titre" value={s.title} onChange={(v) => updateService(s.id, { title: v })} />
              </div>
              <TextField label="Description" textarea value={s.desc} onChange={(v) => updateService(s.id, { desc: v })} />
              <TextField
                label="Prestations (séparées par des virgules)"
                value={s.items.join(", ")}
                onChange={(v) =>
                  updateService(s.id, {
                    items: v.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8),
                  })
                }
              />
              <div>
                <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">Icône</label>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {ICON_PRESETS.map((ic) => (
                    <button
                      key={ic.label}
                      type="button"
                      title={ic.label}
                      onClick={() => updateService(s.id, { icon: ic.path })}
                      data-cursor="link"
                      className={cn(
                        "flex h-11 items-center justify-center rounded-xl border transition-all duration-300",
                        s.icon === ic.path
                          ? "border-rouge bg-rouge/15"
                          : "border-white/12 hover:border-white/40",
                      )}
                    >
                      <svg viewBox="0 0 24 24" className={cn("h-5 w-5", s.icon === ic.path ? "stroke-rouge" : "stroke-white/50")} fill="none" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                        <path d={ic.path} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ServicesTab({ notify }: { notify: (m: string) => void }) {
  const { services } = useContent();
  return (
    <Group
      title={`Expertises (${services.length})`}
      desc="Cartes de la section Expertises : titre, description, prestations, icône."
      action={<GhostBtn label="Restaurer l'original" onClick={() => { resetServices(); notify("Services d'origine restaurés."); }} />}
    >
      <AddBtn
        label="Ajouter un service"
        onClick={() => {
          addService({
            id: Date.now(),
            num: String(services.length + 1).padStart(2, "0"),
            title: "Nouveau service",
            desc: "Décrivez ce savoir-faire en une phrase.",
            items: ["Prestation 1", "Prestation 2"],
            icon: ICON_PRESETS[0].path,
          });
          notify("Service créé.");
        }}
      />
      <div className="space-y-3">
        {services.map((s) => (
          <ServiceEditor key={s.id} s={s} notify={notify} />
        ))}
      </div>
    </Group>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Showreel                                                    */
/* ------------------------------------------------------------------ */
function ShowreelTab({ notify }: { notify: (m: string) => void }) {
  const { showreel } = useContent();
  return (
    <div className="space-y-6">
      <Group title="Vidéo du showreel" desc="Bandeau plein écran + lecture en plein pot au clic.">
        <MediaField label="Vidéo" kind="video" value={showreel.video} notify={notify} onChange={(v) => setShowreel({ video: v })} />
        <MediaField label="Image d'attente (poster)" kind="image" value={showreel.poster} notify={notify} onChange={(v) => setShowreel({ poster: v })} />
      </Group>
      <Group title="Textes du showreel">
        <TextField label="Grand titre" value={showreel.title} onChange={(v) => setShowreel({ title: v })} />
        <TextField label="Sous-titre" value={showreel.subtitle} onChange={(v) => setShowreel({ subtitle: v })} />
        <TextField
          label="Bandeau défilant (séparé par des virgules)"
          value={showreel.marquee}
          onChange={(v) => setShowreel({ marquee: v })}
        />
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Fondateur                                                     */
/* ------------------------------------------------------------------ */
function FondateurTab({ notify }: { notify: (m: string) => void }) {
  const { founder } = useContent();
  return (
    <div className="space-y-6">
      <Group
        title="Photo du fondateur"
        desc="Portrait affiché dans la section « Le visage derrière Doxa ». Téléversez votre photo : elle apparaît aussitôt sur le site."
      >
        <MediaField
          label="Portrait (format vertical idéal)"
          kind="image"
          value={founder.photo}
          notify={notify}
          allowClear
          onChange={(v) => setFounder({ photo: v })}
          hint="Une photo nette sur fond sombre s'intègre parfaitement au design du site."
        />
      </Group>
      <Group title="Identité">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nom" value={founder.name} onChange={(v) => setFounder({ name: v })} />
          <TextField label="Rôle" value={founder.role} onChange={(v) => setFounder({ role: v })} />
        </div>
      </Group>
      <Group title="Présentation">
        <TextField label="Paragraphe 1" textarea value={founder.bio1} onChange={(v) => setFounder({ bio1: v })} />
        <TextField label="Paragraphe 2" textarea value={founder.bio2} onChange={(v) => setFounder({ bio2: v })} />
        <TextField label="Citation signature" textarea value={founder.quote} onChange={(v) => setFounder({ quote: v })} />
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Agence (photo, valeurs, chiffres, clients)                  */
/* ------------------------------------------------------------------ */
function ValueEditor({ v, notify }: { v: ValueItem; notify: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-ink p-3">
      <div className="flex items-center gap-3">
        <p className="flex-1 truncate font-display text-base uppercase">{v.title || "Sans titre"}</p>
        <DeleteBtn label="Supprimer" onDelete={() => { removeValue(v.id); notify("Valeur supprimée."); }} />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          data-cursor="link"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/60 hover:border-white/50 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
          <TextField label="Titre" value={v.title} onChange={(t) => updateValue(v.id, { title: t })} />
          <TextField label="Texte" textarea value={v.text} onChange={(t) => updateValue(v.id, { text: t })} />
        </div>
      )}
    </div>
  );
}

function StatEditor({ s, notify }: { s: StatItem; notify: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-ink p-3">
      <div className="flex items-center gap-3">
        <p className="flex-1 font-display text-xl">
          {s.value}
          <span className="text-rouge">{s.suffix}</span>
          <span className="ml-2 align-middle font-sans text-[10px] uppercase tracking-[0.16em] text-white/40">{s.label}</span>
        </p>
        <MoveBtns onUp={() => moveStat(s.id, -1)} onDown={() => moveStat(s.id, 1)} />
        <DeleteBtn label="Supprimer" onDelete={() => { removeStat(s.id); notify("Chiffre supprimé."); }} />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          data-cursor="link"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/60 hover:border-white/50 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="mt-3 grid gap-3 border-t border-white/10 pt-3 sm:grid-cols-3">
          <TextField label="Valeur (nombre)" type="number" value={String(s.value)} onChange={(v) => updateStat(s.id, { value: parseInt(v, 10) || 0 })} />
          <TextField label="Suffixe (+, M, ans…)" value={s.suffix} onChange={(v) => updateStat(s.id, { suffix: v })} />
          <TextField label="Libellé" value={s.label} onChange={(v) => updateStat(s.id, { label: v })} />
        </div>
      )}
    </div>
  );
}

function AgenceTab({ notify }: { notify: (m: string) => void }) {
  const c = useContent();
  const [clientsText, setClientsText] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <Group title="Textes de l'agence">
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="Titre — ligne 1" value={c.about.title1} onChange={(v) => setAbout({ title1: v })} />
          <TextField label="Ligne 2 (rouge)" value={c.about.title2} onChange={(v) => setAbout({ title2: v })} />
          <TextField label="Ligne 3 (contour)" value={c.about.title3} onChange={(v) => setAbout({ title3: v })} />
        </div>
        <TextField label="Paragraphe 1" textarea value={c.about.p1} onChange={(v) => setAbout({ p1: v })} />
        <TextField label="Paragraphe 2" textarea value={c.about.p2} onChange={(v) => setAbout({ p2: v })} />
        <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
          <TextField label="Chiffre (badge rouge)" value={c.about.statValue} onChange={(v) => setAbout({ statValue: v })} />
          <TextField label="Texte sous le chiffre" value={c.about.statLabel} onChange={(v) => setAbout({ statLabel: v })} />
        </div>
      </Group>

      <Group title="Photo de l'agence" desc="Portrait vertical affiché à gauche de la section.">
        <MediaField label="Photo" kind="image" value={c.about.image} notify={notify} onChange={(v) => setAbout({ image: v })} hint="Format portrait idéal (ex. 1100 × 1400)." />
      </Group>

      <Group title={`Valeurs (${c.about.values.length})`} desc="Les 3 cartes sous le texte (ajoutez-en ou retirez-en librement).">
        <AddBtn
          label="Ajouter une valeur"
          onClick={() => {
            addValue({ id: Date.now(), title: "Nouvelle valeur", text: "Décrivez-la en une phrase." });
            notify("Valeur ajoutée.");
          }}
        />
        <div className="space-y-3">
          {c.about.values.map((v) => (
            <ValueEditor key={v.id} v={v} notify={notify} />
          ))}
        </div>
      </Group>

      <Group title={`Chiffres clés (${c.stats.length})`} desc="Compteurs animés sous la section.">
        <AddBtn
          label="Ajouter un chiffre"
          onClick={() => {
            addStat({ id: Date.now(), value: 100, suffix: "+", label: "Nouveau chiffre" });
            notify("Chiffre ajouté.");
          }}
        />
        <div className="space-y-3">
          {c.stats.map((s) => (
            <StatEditor key={s.id} s={s} notify={notify} />
          ))}
        </div>
      </Group>

      <Group title="Clients (bandeau défilant)" desc="Un client par ligne.">
        <textarea
          rows={5}
          value={clientsText ?? c.clients.join("\n")}
          onChange={(e) => setClientsText(e.target.value)}
          onBlur={() => {
            if (clientsText !== null) {
              setClients(clientsText.split("\n").map((l) => l.trim()).filter(Boolean));
              setClientsText(null);
              notify("Liste clients mise à jour.");
            }
          }}
          className={cn(inputCls, "resize-none font-display uppercase tracking-wide")}
        />
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Méthode & Avis                                              */
/* ------------------------------------------------------------------ */
function StepEditor({ s, notify }: { s: StepItem; notify: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-ink p-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rouge font-display text-sm">{s.step}</span>
        <p className="flex-1 truncate font-display text-base uppercase">{s.title || "Sans titre"}</p>
        <MoveBtns onUp={() => moveStep(s.id, -1)} onDown={() => moveStep(s.id, 1)} />
        <DeleteBtn label="Supprimer" onDelete={() => { removeStep(s.id); notify("Étape supprimée."); }} />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          data-cursor="link"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/60 hover:border-white/50 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
          <div className="grid gap-3 sm:grid-cols-[100px_1fr]">
            <TextField label="N°" value={s.step} onChange={(v) => updateStep(s.id, { step: v })} />
            <TextField label="Titre" value={s.title} onChange={(v) => updateStep(s.id, { title: v })} />
          </div>
          <TextField label="Texte" textarea value={s.text} onChange={(v) => updateStep(s.id, { text: v })} />
        </div>
      )}
    </div>
  );
}

function TestimonialEditor({ t, notify }: { t: TestimonialItem; notify: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-ink p-3">
      <div className="flex items-center gap-3">
        <p className="flex-1 truncate text-sm text-white/70">“{t.quote || "Sans texte"}” — <span className="text-rouge">{t.name}</span></p>
        <MoveBtns onUp={() => moveTestimonial(t.id, -1)} onDown={() => moveTestimonial(t.id, 1)} />
        <DeleteBtn label="Supprimer" onDelete={() => { removeTestimonial(t.id); notify("Témoignage supprimé."); }} />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          data-cursor="link"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/60 hover:border-white/50 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
          <TextField label="Citation" textarea value={t.quote} onChange={(v) => updateTestimonial(t.id, { quote: v })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Nom" value={t.name} onChange={(v) => updateTestimonial(t.id, { name: v })} />
            <TextField label="Fonction / Entreprise" value={t.role} onChange={(v) => updateTestimonial(t.id, { role: v })} />
          </div>
        </div>
      )}
    </div>
  );
}

function MethodeTab({ notify }: { notify: (m: string) => void }) {
  const c = useContent();
  return (
    <div className="space-y-6">
      <Group title="Titres de la section">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Ligne 1" value={c.sections.processTitle1} onChange={(v) => setSections({ processTitle1: v })} />
          <TextField label="Ligne 2 (rouge)" value={c.sections.processTitle2} onChange={(v) => setSections({ processTitle2: v })} />
        </div>
      </Group>
      <Group title={`Étapes de la méthode (${c.process.length})`} desc="Ajoutées en fin de liste, réordonnez avec les flèches.">
        <AddBtn
          label="Ajouter une étape"
          onClick={() => {
            addStep({
              id: Date.now(),
              step: String(c.process.length + 1).padStart(2, "0"),
              title: "Nouvelle étape",
              text: "Décrivez cette étape en une phrase.",
            });
            notify("Étape ajoutée.");
          }}
        />
        <div className="space-y-3">
          {c.process.map((s) => (
            <StepEditor key={s.id} s={s} notify={notify} />
          ))}
        </div>
      </Group>
      <Group title="Encadré délai">
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="Libellé" value={c.delayBox.label} onChange={(v) => setDelayBox({ label: v })} />
          <TextField label="Valeur (ex. 10–21)" value={c.delayBox.value} onChange={(v) => setDelayBox({ value: v })} />
          <TextField label="Suffixe (ex. jours)" value={c.delayBox.suffix} onChange={(v) => setDelayBox({ suffix: v })} />
        </div>
        <TextField label="Texte" textarea value={c.delayBox.text} onChange={(v) => setDelayBox({ text: v })} />
      </Group>
      <Group title={`Témoignages clients (${c.testimonials.length})`}>
        <AddBtn
          label="Ajouter un témoignage"
          onClick={() => {
            addTestimonial({ id: Date.now(), quote: "Nouveau témoignage client.", name: "Nom", role: "Fonction — Entreprise" });
            notify("Témoignage ajouté.");
          }}
        />
        <div className="space-y-3">
          {c.testimonials.map((t) => (
            <TestimonialEditor key={t.id} t={t} notify={notify} />
          ))}
        </div>
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Identité & Logo                                             */
/* ------------------------------------------------------------------ */
function IdentiteTab({ notify }: { notify: (m: string) => void }) {
  const c = useContent();
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const onFile = async (f?: File | null) => {
    if (!f) return;
    setBusy(true);
    try {
      setLogo(await fileToImageUrl(f, 640));
      notify("Logo mis à jour sur l'ensemble du site.");
    } catch {
      notify("Impossible de charger cette image.");
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Group
      title="Logo du site"
      desc="Apparaît dans la navigation, le pied de page, l'écran de connexion, l'espace studio et l'administration."
    >
      <div className="relative flex h-52 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-ink">
        <div className="grid-lines absolute inset-0 opacity-50" />
        <BrandMark className="relative h-24 w-24 object-contain" />
      </div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
        {c.logo ? (
          <span className="text-rouge">Logo personnalisé actif</span>
        ) : (
          "Logo par défaut (œil Doxa)"
        )}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          data-cursor="link"
          className="group relative overflow-hidden rounded-full bg-rouge px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white"
        >
          <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
          <span className="relative z-10 flex items-center justify-center gap-2.5 transition-colors duration-300 group-hover:text-ink">
            {busy ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
              </svg>
            )}
            {busy ? "Traitement…" : "Téléverser un logo"}
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setLogo(null);
            notify("Logo par défaut (œil Doxa) restauré.");
          }}
          data-cursor="link"
          className="rounded-full border border-white/20 px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/70 transition-colors duration-300 hover:border-rouge hover:text-white"
        >
          Restaurer l'œil Doxa
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>

      <div className="flex gap-3">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="…ou collez l'URL d'une image (https://…)"
          className={inputCls}
        />
        <button
          type="button"
          data-cursor="link"
          onClick={() => {
            if (!/^https?:\/\/.+/.test(url.trim())) {
              notify("URL d'image invalide.");
              return;
            }
            setLogo(url.trim());
            setUrl("");
            notify("Logo appliqué depuis l'URL.");
          }}
          className="shrink-0 rounded-xl border border-white/20 px-5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/70 transition-colors duration-300 hover:border-rouge hover:text-rouge"
        >
          Appliquer
        </button>
      </div>
    </Group>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Textes (titres sections + contact + footer)                 */
/* ------------------------------------------------------------------ */
function TextesTab() {
  const c = useContent();
  return (
    <div className="space-y-6">
      <Group title="Titres des sections">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Expertises — ligne 1" value={c.sections.servicesTitle1} onChange={(v) => setSections({ servicesTitle1: v })} />
          <TextField label="Expertises — ligne 2" value={c.sections.servicesTitle2} onChange={(v) => setSections({ servicesTitle2: v })} />
        </div>
        <TextField label="Expertises — introduction" textarea value={c.sections.servicesIntro} onChange={(v) => setSections({ servicesIntro: v })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Réalisations — ligne 1" value={c.sections.portfolioTitle1} onChange={(v) => setSections({ portfolioTitle1: v })} />
          <TextField label="Réalisations — ligne 2 (rouge)" value={c.sections.portfolioTitle2} onChange={(v) => setSections({ portfolioTitle2: v })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Contact — ligne 1" value={c.sections.contactTitle1} onChange={(v) => setSections({ contactTitle1: v })} />
          <TextField label="Contact — ligne 2 (rouge)" value={c.sections.contactTitle2} onChange={(v) => setSections({ contactTitle2: v })} />
        </div>
      </Group>
      <Group title="Section Contact — introduction">
        <TextField label="Texte d'intro" textarea value={c.contact.intro} onChange={(v) => setContact({ intro: v })} />
      </Group>
      <Group title="Pied de page">
        <TextField label="Description du studio" textarea value={c.footer.desc} onChange={(v) => setFooter({ desc: v })} />
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Coordonnées                                                 */
/* ------------------------------------------------------------------ */
function CoordonneesTab() {
  const { contact: ct } = useContent();

  const setPhone = (i: number, patch: { display?: string; tel?: string }) =>
    setContact({
      phones: ct.phones.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
    });

  return (
    <div className="space-y-6">
      <Group
        title="Contact direct"
        desc="Utilisés dans la section Contact, le pied de page, le menu mobile et le bouton flottant."
      >
        <TextField label="Email" value={ct.email} onChange={(v) => setContact({ email: v })} />
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-3 rounded-xl border border-white/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-rouge">Ligne {i + 1}</p>
              <TextField label="Affichage" value={ct.phones[i]?.display ?? ""} onChange={(v) => setPhone(i, { display: v })} />
              <TextField label="Numéro (lien d'appel)" value={ct.phones[i]?.tel ?? ""} onChange={(v) => setPhone(i, { tel: v })} />
            </div>
          ))}
        </div>
        <TextField label="Lien WhatsApp (https://wa.me/…)" value={ct.whatsapp} onChange={(v) => setContact({ whatsapp: v })} />
      </Group>

      <Group title="Localisation & horaires">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Ville" value={ct.city} onChange={(v) => setContact({ city: v })} />
          <TextField label="Pays" value={ct.country} onChange={(v) => setContact({ country: v })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Adresse / position complète" value={ct.location} onChange={(v) => setContact({ location: v })} />
          <TextField label="Horaires" value={ct.hours} onChange={(v) => setContact({ hours: v })} />
        </div>
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Bannières & Vidéos                                          */
/* ------------------------------------------------------------------ */
type BannerDraft = {
  kind: "image" | "video";
  media: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  position: Banner["position"];
};

const EMPTY_BANNER: BannerDraft = {
  kind: "image",
  media: "",
  title: "",
  subtitle: "",
  cta: "Démarrer un projet",
  ctaLink: "#contact",
  position: "top",
};

const POSITIONS: { value: Banner["position"]; label: string }[] = [
  { value: "top", label: "Après l'accueil" },
  { value: "middle", label: "Après les réalisations" },
  { value: "bottom", label: "Après l'agence" },
];

function BannieresTab({ notify }: { notify: (m: string) => void }) {
  const c = useContent();
  const [f, setF] = useState({ ...EMPTY_BANNER });
  const [err, setErr] = useState("");

  const add = () => {
    if (!/^https?:\/\/.+/.test(f.media.trim()) || f.title.trim().length < 2) {
      setErr("L'URL du média (image ou vidéo) et le titre sont requis.");
      return;
    }
    addBanner({
      kind: f.kind,
      media: f.media.trim(),
      title: f.title.trim(),
      subtitle: f.subtitle.trim(),
      cta: f.cta.trim(),
      ctaLink: f.ctaLink.trim() || "#contact",
      position: f.position,
    });
    setF({ ...EMPTY_BANNER });
    setErr("");
    notify("Bannière publiée sur le site public.");
  };

  return (
    <div className="space-y-6">
      <Group title="Nouvelle bannière" desc="Publiée immédiatement sur le site public, à l'emplacement choisi.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">Emplacement</label>
            <select
              value={f.position}
              onChange={(e) => setF({ ...f, position: e.target.value as Banner["position"] })}
              className={inputCls}
            >
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value} className="bg-ink-2">{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">Type de média</label>
            <div className="grid grid-cols-2 gap-2">
              {(["image", "video"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setF({ ...f, kind: k })}
                  data-cursor="link"
                  className={cn(
                    "rounded-xl border px-3 py-3 text-[10.5px] uppercase tracking-[0.14em] transition-all duration-300",
                    f.kind === k
                      ? "border-rouge bg-rouge/15 text-white"
                      : "border-white/12 text-white/50 hover:border-white/35",
                  )}
                >
                  {k === "image" ? "Image" : "Vidéo"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <MediaField
          label={f.kind === "video" ? "Vidéo (mp4)" : "Image (haute définition)"}
          kind={f.kind}
          value={f.media}
          notify={notify}
          onChange={(v) => {
            setF({ ...f, media: v });
            setErr("");
          }}
        />
        <TextField
          label="Titre"
          value={f.title}
          onChange={(v) => {
            setF({ ...f, title: v });
            setErr("");
          }}
        />
        <TextField label="Sous-titre" textarea value={f.subtitle} onChange={(v) => setF({ ...f, subtitle: v })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Libellé du bouton (vide = aucun bouton)" value={f.cta} onChange={(v) => setF({ ...f, cta: v })} />
          <TextField label="Lien du bouton" value={f.ctaLink} onChange={(v) => setF({ ...f, ctaLink: v })} placeholder="#contact, #realisations, https://…" />
        </div>

        {err && <p className="text-[11px] text-rouge">{err}</p>}

        <button
          type="button"
          onClick={add}
          data-cursor="link"
          className="group relative w-full overflow-hidden rounded-full bg-rouge px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white"
        >
          <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
          <span className="relative z-10 flex items-center justify-center gap-3 transition-colors duration-300 group-hover:text-ink">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Ajouter la bannière
          </span>
        </button>
      </Group>

      <section>
        <h3 className="mb-4 font-display text-xl uppercase">
          Bannières actives <span className="text-rouge">({c.banners.length})</span>
        </h3>
        {c.banners.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-sm text-white/40">
            Aucune bannière — le site est au format standard.
          </div>
        ) : (
          <div className="space-y-4">
            {c.banners.map((b) => (
              <div key={b.id} className="flex items-center gap-4 overflow-hidden rounded-xl border border-white/10 bg-ink-2/60 p-3">
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg">
                  {b.kind === "video" ? (
                    <>
                      <video src={b.media} muted preload="metadata" playsInline className="h-full w-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center bg-ink/40">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rouge">
                          <svg viewBox="0 0 24 24" className="ml-0.5 h-3.5 w-3.5 fill-white">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </span>
                    </>
                  ) : (
                    <img src={b.media} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base uppercase">{b.title}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/40">
                    {POSITIONS.find((p) => p.value === b.position)?.label} · {b.kind === "video" ? "Vidéo" : "Image"}
                  </p>
                </div>
                <DeleteBtn label="Supprimer la bannière" onDelete={() => { removeBanner(b.id); notify("Bannière retirée du site."); }} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Sauvegarde                                                  */
/* ------------------------------------------------------------------ */
function SauvegardeTab({ notify }: { notify: (m: string) => void }) {
  const [confirm, setConfirm] = useState(false);
  const [paste, setPaste] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const doImport = (json: string) => {
    if (importJSON(json)) {
      setPaste("");
      notify("Sauvegarde importée — site mis à jour.");
    } else {
      notify("Fichier invalide : import annulé.");
    }
  };

  return (
    <div className="space-y-6">
      <Group
        title="Exporter le site"
        desc="Téléchargez l'intégralité du contenu (textes, images, projets, bannières…) en un fichier JSON. Gardez-le précieusement."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              download(`doxa-studio-${new Date().toISOString().slice(0, 10)}.json`, exportJSON());
              notify("Sauvegarde téléchargée.");
            }}
            data-cursor="link"
            className="group relative overflow-hidden rounded-full bg-rouge px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white"
          >
            <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
            <span className="relative z-10 transition-colors duration-300 group-hover:text-ink">Télécharger la sauvegarde</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(exportJSON());
                notify("Contenu copié dans le presse-papiers.");
              } catch {
                notify("Copie impossible dans ce navigateur.");
              }
            }}
            data-cursor="link"
            className="rounded-full border border-white/20 px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/70 hover:border-white/50 hover:text-white"
          >
            Copier le JSON
          </button>
        </div>
      </Group>

      <Group
        title="Importer une sauvegarde"
        desc="Restaure un contenu précédemment exporté. Remplace tout le contenu actuel."
      >
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          data-cursor="link"
          className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 text-white/40 transition-colors hover:border-rouge hover:text-rouge"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />
          </svg>
          <span className="text-[10px] uppercase tracking-[0.18em]">Choisir un fichier .json</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = () => doImport(String(r.result ?? ""));
            r.readAsText(f);
            e.target.value = "";
          }}
        />
        <textarea
          rows={4}
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          placeholder="…ou collez ici un JSON précédemment copié"
          className={cn(inputCls, "resize-none font-mono text-xs")}
        />
        <button
          type="button"
          disabled={!paste.trim()}
          onClick={() => doImport(paste)}
          data-cursor="link"
          className="rounded-full border border-rouge/60 px-6 py-3 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-rouge transition-all duration-300 hover:bg-rouge hover:text-white disabled:opacity-40"
        >
          Importer ce contenu
        </button>
      </Group>

      <Group title="Zone dangereuse" desc="Réinitialise TOUT le site (textes, images, projets, logo, bannières) aux contenus d'origine. Irréversible — exportez d'abord !">
        <button
          type="button"
          onClick={() => {
            if (!confirm) {
              setConfirm(true);
              window.setTimeout(() => setConfirm(false), 4000);
              return;
            }
            resetContent();
            setConfirm(false);
            notify("Site entièrement réinitialisé.");
          }}
          className={cn(
            "rounded-full border px-6 py-3 text-[10.5px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300",
            confirm ? "border-rouge bg-rouge text-white" : "border-white/20 text-white/60 hover:border-rouge hover:text-rouge",
          )}
        >
          {confirm ? "Cliquez pour confirmer !" : "Tout réinitialiser"}
        </button>
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page Administration                                                  */
/* ------------------------------------------------------------------ */
type TabId =
  | "accueil"
  | "projets"
  | "services"
  | "showreel"
  | "agence"
  | "fondateur"
  | "methode"
  | "identite"
  | "textes"
  | "coordonnees"
  | "bannieres"
  | "sauvegarde";

const TABS: { id: TabId; label: string }[] = [
  { id: "accueil", label: "Accueil" },
  { id: "projets", label: "Réalisations" },
  { id: "services", label: "Expertises" },
  { id: "showreel", label: "Showreel" },
  { id: "agence", label: "Agence" },
  { id: "fondateur", label: "Fondateur" },
  { id: "methode", label: "Méthode & Avis" },
  { id: "identite", label: "Logo" },
  { id: "textes", label: "Textes" },
  { id: "coordonnees", label: "Coordonnées" },
  { id: "bannieres", label: "Bannières" },
  { id: "sauvegarde", label: "Sauvegarde" },
];

export default function Admin({
  user,
  onBack,
  onBackSite,
  onLogout,
}: {
  user: SessionUser;
  onBack: () => void;
  onBackSite: () => void;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<TabId>("accueil");
  const [toast, setToast] = useState<string | null>(null);

  const notify = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <button onClick={onBack} data-cursor="link" className="group flex items-center gap-3">
            <BrandMark className="h-9 w-9 object-contain" />
            <span className="font-display text-base uppercase tracking-[0.08em] text-white">
              Doxa<span className="text-rouge"> Studio</span>
            </span>
            <span className="hidden rounded-full border border-rouge/40 bg-rouge/10 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-rouge sm:inline">
              Administration
            </span>
          </button>

          <div className="flex items-center gap-2.5">
            <span className="hidden max-w-[200px] items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-[11px] text-white/60 md:flex">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-rouge" />
              <span className="truncate">{user.email}</span>
            </span>
            <button
              onClick={onBackSite}
              data-cursor="link"
              className="hidden rounded-full border border-white/15 px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/70 transition-colors hover:border-white/50 hover:text-white sm:inline-flex"
            >
              Voir le site
            </button>
            <button
              onClick={onLogout}
              data-cursor="link"
              className="rounded-full border border-rouge/50 px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-rouge transition-all duration-300 hover:bg-rouge hover:text-white"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1240px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[230px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-white/35">
            Tout le site, ici
          </p>
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:pb-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                data-cursor="link"
                className={cn(
                  "shrink-0 rounded-full border px-5 py-3 text-left text-[10.5px] font-semibold uppercase tracking-[0.14em] transition-all duration-300 lg:w-full",
                  tab === t.id
                    ? "border-rouge bg-rouge text-white"
                    : "border-white/12 text-white/55 hover:border-white/40 hover:text-white",
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="mt-8 hidden rounded-2xl border border-white/10 bg-ink-2/50 p-5 lg:block">
            <p className="text-[10px] uppercase tracking-[0.24em] text-rouge">Pouvoir total</p>
            <p className="mt-2 text-xs leading-relaxed text-white/50">
              Chaque modification est enregistrée instantanément et visible sur
              le site public. Pensez à exporter une sauvegarde avant les gros
              changements.
            </p>
          </div>
        </div>

        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {tab === "accueil" && <AccueilTab notify={notify} />}
              {tab === "projets" && <ProjetsTab notify={notify} />}
              {tab === "services" && <ServicesTab notify={notify} />}
              {tab === "showreel" && <ShowreelTab notify={notify} />}
              {tab === "agence" && <AgenceTab notify={notify} />}
              {tab === "fondateur" && <FondateurTab notify={notify} />}
              {tab === "methode" && <MethodeTab notify={notify} />}
              {tab === "identite" && <IdentiteTab notify={notify} />}
              {tab === "textes" && <TextesTab />}
              {tab === "coordonnees" && <CoordonneesTab />}
              {tab === "bannieres" && <BannieresTab notify={notify} />}
              {tab === "sauvegarde" && <SauvegardeTab notify={notify} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 30, x: "-50%" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-1/2 z-[150] flex items-center gap-3 rounded-full border border-rouge/40 bg-ink-2/95 py-3 pl-4 pr-6 shadow-2xl shadow-rouge/20 backdrop-blur-xl"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rouge">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12.5l5 5L20 6.5" />
              </svg>
            </span>
            <p className="text-[12.5px] font-medium">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
