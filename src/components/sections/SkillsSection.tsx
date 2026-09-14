import { useInView } from "../../hooks/useInView";
import { skills } from "../../lib/portfolio-data";

const CATEGORIES = Object.entries(skills);

export default function SkillsSection() {
  const { ref, inView } = useInView(0.2);

  return (
    <section id="skills" ref={ref} className="relative min-h-[130vh] px-6 py-32 md:px-12 lg:px-24">
      <div className="max-w-2xl">
        <p className={`reveal ${inView ? "is-in" : ""} mb-4 text-[11px] uppercase tracking-[0.4em] text-[#d9c3a0]/80`}>
          03 — Expertise
        </p>
        <h2 className={`reveal reveal-delay-1 ${inView ? "is-in" : ""} font-serif text-4xl leading-tight text-[#f6efe4] sm:text-5xl`}>
          Where design meets engineering.
        </h2>
      </div>

      <div className="mt-20 grid max-w-3xl grid-cols-1 gap-x-16 gap-y-14 sm:grid-cols-2">
        {CATEGORIES.map(([category, items], i) => (
          <div
            key={category}
            className={`reveal ${inView ? "is-in" : ""} border-l border-white/10 pl-6`}
            style={{ transitionDelay: `${0.15 + i * 0.1}s` }}
          >
            <span className="text-[11px] uppercase tracking-[0.3em] text-white/35">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 font-serif text-xl text-[#f0e9dc]">{category}</h3>
            <ul className="mt-4 space-y-2">
              {items.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-white/50">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
