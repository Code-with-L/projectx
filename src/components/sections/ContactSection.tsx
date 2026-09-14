import { useInView } from "../../hooks/useInView";
import { profile, socials } from "../../lib/portfolio-data";

export default function ContactSection() {
  const { ref, inView } = useInView(0.3);

  return (
    <section id="contact" ref={ref} className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center md:px-12">
      <p className={`reveal ${inView ? "is-in" : ""} mb-6 text-[11px] uppercase tracking-[0.4em] text-[#d9c3a0]/80`}>
        05 — Contact
      </p>
      <h2 className={`reveal reveal-delay-1 ${inView ? "is-in" : ""} font-serif text-[10vw] leading-[0.95] text-[#f6efe4] sm:text-6xl lg:text-7xl`}>
        Let&rsquo;s create
        <br />
        <span className="italic text-[#d9c3a0]">something.</span>
      </h2>

      <a
        href={`mailto:${profile.email}`}
        className={`reveal reveal-delay-2 ${inView ? "is-in" : ""} mt-12 border-b border-white/25 pb-1 text-lg text-white/80 transition-colors duration-300 hover:border-[#d9c3a0] hover:text-[#d9c3a0] sm:text-xl`}
      >
        {profile.email}
      </a>

      <div className={`reveal reveal-delay-3 ${inView ? "is-in" : ""} mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3`}>
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] uppercase tracking-[0.25em] text-white/45 transition-colors duration-300 hover:text-white"
          >
            {s.label}
          </a>
        ))}
      </div>

      <p className={`reveal reveal-delay-4 ${inView ? "is-in" : ""} mt-24 text-[10px] uppercase tracking-[0.3em] text-white/25`}>
        &copy; {new Date().getFullYear()} {profile.name} — Designed &amp; built with intention.
      </p>
    </section>
  );
}
