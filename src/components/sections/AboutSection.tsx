import { useInView } from "../../hooks/useInView";
import { about } from "../../lib/portfolio-data";

export default function AboutSection() {
  const { ref, inView } = useInView(0.3);

  return (
    <section id="about" ref={ref} className="relative flex min-h-screen items-center px-6 md:px-12 lg:px-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className={`reveal ${inView ? "is-in" : ""} mb-6 text-[11px] uppercase tracking-[0.4em] text-[#d9c3a0]/80`}>
          04 — {about.heading}
        </p>
        <p className={`reveal reveal-delay-1 ${inView ? "is-in" : ""} font-serif text-2xl italic leading-relaxed text-[#f6efe4] sm:text-3xl`}>
          {about.paragraphs[0]}
        </p>
        <div className="mx-auto mt-10 flex max-w-lg flex-col gap-5 text-sm leading-relaxed text-white/50 md:text-base">
          {about.paragraphs.slice(1).map((p, i) => (
            <p key={i} className={`reveal reveal-delay-${i + 2} ${inView ? "is-in" : ""}`}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
