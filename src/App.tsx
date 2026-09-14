import { useEffect } from "react";
import Scene3D from "./three/Scene3D";
import Nav from "./components/Nav";
import ProgressRail from "./components/ProgressRail";
import IntroSection from "./components/sections/IntroSection";
import IdentitySection from "./components/sections/IdentitySection";
import WorkSection from "./components/sections/WorkSection";
import SkillsSection from "./components/sections/SkillsSection";
import AboutSection from "./components/sections/AboutSection";
import ContactSection from "./components/sections/ContactSection";
import { initScrollTracking, setSceneBoundaries } from "./lib/scrollStore";

const SECTION_IDS = ["intro", "identity", "work", "skills", "about", "contact"];

export default function App() {
  useEffect(() => {
    const stop = initScrollTracking();

    const measure = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const boundaries = SECTION_IDS.map((id) => {
        const el = document.getElementById(id);
        if (!el) return 0;
        return Math.min(1, Math.max(0, el.offsetTop / max));
      });
      boundaries[0] = 0;
      setSceneBoundaries(boundaries);
    };

    measure();
    const t = setTimeout(measure, 250); // after fonts / layout settle
    window.addEventListener("resize", measure);
    return () => {
      stop();
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className="relative bg-[#0a0908]">
      {/* Fixed cinematic 3D backdrop */}
      <div className="fixed inset-0 z-0">
        <Scene3D />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(10,9,8,0.55)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0908] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0a0908]/80 to-transparent" />
      </div>

      <Nav />
      <ProgressRail />

      <main className="relative z-10">
        <IntroSection />
        <IdentitySection />
        <WorkSection />
        <SkillsSection />
        <AboutSection />
        <ContactSection />
      </main>
    </div>
  );
}
