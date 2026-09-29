import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import BrandMark from "./BrandLogo";
import { Marquee } from "./ui";
import { cn } from "../utils/cn";

const DEMO = { email: "equipe@doxastudio.com", password: "doxa2026" };

export default function Login({
  onLogin,
  onBack,
}: {
  onLogin: (email: string) => void;
  onBack: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);

  const fail = (msg: string) => {
    setError(msg);
    setShake((s) => s + 1);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      fail("Veuillez saisir une adresse email valide.");
      return;
    }
    if (password.length < 6) {
      fail("Mot de passe invalide (6 caractères minimum).");
      return;
    }
    setError("");
    setLoading(true);
    window.setTimeout(() => {
      if (
        email.trim().toLowerCase() === DEMO.email &&
        password === DEMO.password
      ) {
        onLogin(DEMO.email);
      } else {
        setLoading(false);
        fail("Identifiants incorrects. Utilisez le compte équipe ci-dessous.");
      }
    }, 900);
  };

  const fill = () => {
    setEmail(DEMO.email);
    setPassword(DEMO.password);
    setError("");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panneau marque */}
      <div className="grain relative hidden flex-col justify-between overflow-hidden border-r border-white/10 p-12 lg:flex">
        <div className="grid-lines absolute inset-0 opacity-60" />
        <div className="absolute -left-32 top-1/3 h-[440px] w-[440px] rounded-full bg-rouge/20 blur-[150px]" />

        <motion.div
          initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="group relative"
        >
          <BrandMark className="h-16 w-16 text-white object-contain" />
        </motion.div>

        <div className="relative">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[8.5vw] uppercase leading-[0.88]"
          >
            Espace
            <br />
            <span className="text-rouge">Studio</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-6 max-w-sm text-sm leading-relaxed text-white/55"
          >
            L'interface réservée à l'équipe Doxa Studio. Connectez-vous pour
            publier vos réalisations et suivre vos mises en ligne.
          </motion.p>
        </div>

        <div className="relative border-t border-white/10 pt-5">
          <Marquee
            items={["Accès équipe", "Doxa Studio", "Abidjan — Côte d'Ivoire"]}
            duration={30}
            separator="✳"
            className="text-[10px] uppercase tracking-[0.3em] text-white/35"
          />
        </div>
      </div>

      {/* Formulaire */}
      <div className="relative flex items-center justify-center px-6 py-16">
        <div className="absolute -right-24 top-1/4 h-[300px] w-[300px] rounded-full bg-rouge/10 blur-[130px]" />

        <div className="relative w-full max-w-md">
          <button
            onClick={onBack}
            data-cursor="link"
            className="mb-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/50 transition-colors hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            Retour au site
          </button>

          <motion.div
            key={`shake-${shake}`}
            initial={false}
            animate={shake > 0 ? { x: [0, -12, 12, -7, 7, 0] } : { x: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="rounded-3xl border border-white/12 bg-ink-2/80 p-7 backdrop-blur-xl sm:p-9">
              <div className="mb-7 flex items-center justify-between lg:hidden">
                <BrandMark className="h-11 w-11 text-white object-contain" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                  Accès équipe
                </span>
              </div>

              <h2 className="font-display text-4xl uppercase leading-none">
                Connexion
              </h2>
              <p className="mt-2 text-sm text-white/50">
                Accès réservé à l'équipe Doxa Studio.
              </p>

              <form onSubmit={submit} className="mt-7 space-y-5">
                <div>
                  <label
                    htmlFor="login-email"
                    className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/45"
                  >
                    Email professionnel
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="prenom@doxastudio.com"
                    className={cn(
                      "w-full rounded-xl border bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-rouge focus:bg-white/[0.06]",
                      error && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
                        ? "border-rouge"
                        : "border-white/12",
                    )}
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/45"
                  >
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={show ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3.5 pr-12 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-rouge focus:bg-white/[0.06]"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((v) => !v)}
                      aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-rouge"
                    >
                      {show ? (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4.5 w-4.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.9 17.9A10 10 0 0112 20C5 20 2 12 2 12a19.8 19.8 0 015.1-6M9.9 4.2A9.9 9.9 0 0112 4c7 0 10 8 10 8a19.6 19.6 0 01-2.2 3.4M1 1l22 22" />
                          <path d="M9.5 9.6a3.4 3.4 0 004.8 4.8" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4.5 w-4.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-2 rounded-xl border border-rouge/40 bg-rouge/10 px-4 py-3 text-[12px] leading-relaxed text-rouge"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="mt-0.5 h-4 w-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4M12 16h.01" />
                      </svg>
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  data-cursor="link"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-full bg-rouge px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white disabled:opacity-70"
                >
                  <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
                  <span className="relative z-10 flex items-center justify-center gap-3 transition-colors duration-300 group-hover:text-ink">
                    {loading ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Vérification…
                      </>
                    ) : (
                      "Se connecter"
                    )}
                  </span>
                </button>
              </form>

              <div className="mt-7 rounded-2xl border border-rouge/30 bg-rouge/[0.07] p-5">
                <p className="text-[10px] uppercase tracking-[0.24em] text-rouge">
                  Compte de démonstration
                </p>
                <div className="mt-3 space-y-1 text-[13px]">
                  <p className="text-white/80">{DEMO.email}</p>
                  <p className="text-white/80">{DEMO.password}</p>
                </div>
                <button
                  type="button"
                  onClick={fill}
                  data-cursor="link"
                  className="link-underline mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-rouge"
                >
                  Remplir le formulaire
                </button>
              </div>
            </div>
          </motion.div>

          <p className="mt-6 text-center text-[11px] text-white/30">
            Accès protégé — toute tentative non autorisée est tracée.
          </p>
        </div>
      </div>
    </div>
  );
}
