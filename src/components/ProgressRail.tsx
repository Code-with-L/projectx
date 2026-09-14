import { useEffect, useRef } from "react";
import { subscribeScroll } from "../lib/scrollStore";

const SCENES = ["Intro", "Identity", "Work", "Expertise", "About", "Contact"];

export default function ProgressRail() {
  const barRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const unsub = subscribeScroll((p) => {
      if (barRef.current) {
        barRef.current.style.transform = `scaleY(${p})`;
      }
      const active = Math.min(SCENES.length - 1, Math.round(p * (SCENES.length - 1)));
      dotsRef.current.forEach((el, i) => {
        if (!el) return;
        el.style.opacity = i === active ? "1" : "0.28";
        el.style.transform = i === active ? "scale(1.6)" : "scale(1)";
      });
    });
    return unsub;
  }, []);

  return (
    <div className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 md:flex lg:right-10">
      <div className="relative h-40 w-px bg-white/10">
        <div
          ref={barRef}
          className="absolute left-0 top-0 h-full w-px origin-top bg-[#d9c3a0]"
          style={{ transform: "scaleY(0)" }}
        />
      </div>
      <div className="flex flex-col items-center gap-5">
        {SCENES.map((s, i) => (
          <div key={s} className="group relative">
            <div
              ref={(el) => {
                dotsRef.current[i] = el;
              }}
              className="h-1.5 w-1.5 rounded-full bg-[#d9c3a0] transition-transform duration-300"
              style={{ opacity: 0.28 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
