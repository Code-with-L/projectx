import { useInView } from "../../hooks/useInView";
import { projects } from "../../lib/portfolio-data";

export default function WorkSection() {
  const { ref, inView } = useInView(0.15);

  return (
    <section id="work" ref={ref} className="relative min-h-[150vh] px-6 py-32 md:px-12 lg:px-24">
      <div className="flex justify-end">
        <div className="w-full max-w-xl">
          <p className={`reveal ${inView ? "is-in" : ""} mb-4 text-[11px] uppercase tracking-[0.4em] text-[#d9c3a0]/80`}>
            02 — Selected Work
          </p>
          <h2 className={`reveal reveal-delay-1 ${inView ? "is-in" : ""} font-serif text-4xl leading-tight text-[#f6efe4] sm:text-5xl`}>
            A few things worth showing.
          </h2>

          <div className="mt-16 flex flex-col">
            {projects.map((p, i) => (
              <a
                key={p.id}
                href={p.link}
                className={`reveal ${inView ? "is-in" : ""} group border-t border-white/10 py-8 transition-colors duration-500 last:border-b hover:bg-white/[0.02]`}
                style={{ transitionDelay: `${0.1 + i * 0.08}s` }}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-serif text-2xl text-white/40">{p.id}</span>
                  <span className="text-[11px] uppercase tracking-[0.25em] text-white/35">{p.year}</span>
                </div>
                <h3 className="mt-3 font-serif text-2xl text-[#f0e9dc] transition-transform duration-500 group-hover:translate-x-1 sm:text-3xl">
                  {p.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/50">{p.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-white/45"
                    >
                      {t}
                    </span>
                  ))}
                  <span className="ml-2 text-[11px] uppercase tracking-[0.2em] text-[#d9c3a0] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    View project &rarr;
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
