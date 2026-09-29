import { useEffect, useState } from "react";
import About from "./components/About";
import Admin from "./components/Admin";
import Contact from "./components/Contact";
import CustomCursor from "./components/CustomCursor";
import DynamicBanners from "./components/DynamicBanners";
import FloatingContact from "./components/FloatingContact";
import Footer from "./components/Footer";
import Founder from "./components/Founder";
import Hero from "./components/Hero";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Portfolio from "./components/Portfolio";
import Preloader from "./components/Preloader";
import Process from "./components/Process";
import Services from "./components/Services";
import Showreel from "./components/Showreel";
import Studio from "./components/Studio";
import ThemeToggle from "./components/ThemeToggle";
import { ScrollProgress } from "./components/ui";
import {
  clearSession,
  getSession,
  setSession,
  type SessionUser,
} from "./data/store";

type View = "site" | "login" | "studio" | "admin";

export default function App() {
  const [view, setView] = useState<View>("site");
  const [user, setUser] = useState<SessionUser | null>(() => getSession());

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const handleLogin = (email: string) => {
    const s: SessionUser = { email, name: "Équipe Doxa", at: Date.now() };
    setSession(s);
    setUser(s);
    setView("studio");
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setView("site");
  };

  return (
    <div className="relative min-h-screen bg-ink text-white">
      <Preloader />
      <CustomCursor />
      <ScrollProgress />
      <ThemeToggle />

      {view === "site" && (
        <>
          <Navbar onStudio={() => setView(user ? "studio" : "login")} />
          <main>
            <Hero />
            <DynamicBanners position="top" />
            <Services />
            <Portfolio />
            <DynamicBanners position="middle" />
            <Showreel />
            <About />
            <Founder />
            <DynamicBanners position="bottom" />
            <Process />
            <Contact />
          </main>
          <Footer />
          <FloatingContact />
        </>
      )}

      {(view === "login" ||
        ((view === "studio" || view === "admin") && !user)) && (
        <Login onLogin={handleLogin} onBack={() => setView("site")} />
      )}

      {view === "studio" && user && (
        <Studio
          user={user}
          onLogout={handleLogout}
          onBackSite={() => setView("site")}
          onAdmin={() => setView("admin")}
        />
      )}

      {view === "admin" && user && (
        <Admin
          user={user}
          onBack={() => setView("studio")}
          onBackSite={() => setView("site")}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
