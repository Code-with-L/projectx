import { useInView } from "../../hooks/useInView";
import { profile } from "../../lib/portfolio-data";

export default function IdentitySection() {
  const { ref, inView } = useInView(0.4);

  return (
    <section id="identity" ref={ref} className="relative flex min-h-screen items-center justify-end px-6 md:px-12 lg:px-24">
      <div className="max-w-xl text-right">
        <p className={`reveal ${inView ? "is-in" : ""} mb-6 text-[11px] uppercase tracking-[0.4em] text-[#d9c3a0]/80`}>
          01 — Identity
        </p>
        <h2 className={`reveal reveal-delay-1 ${inView ? "is-in" : ""} font-serif text-4xl italic leading-tight text-[#f6efe4] sm:text-5xl lg:text-6xl`}>
          {profile.tagline}
        </h2>
        <div className={`reveal reveal-delay-3 ${inView ? "is-in" : ""} mt-8 ml-auto h-px w-24 hairline`} />
        <p className={`reveal reveal-delay-3 ${inView ? "is-in" : ""} mt-8 text-sm leading-relaxed text-white/50 md:text-base`}>
          Every interface is a small negotiation between clarity and character.
          I design and build the kind of work that earns a second look.
        </p>
      </div>
    </section>
  );
}
