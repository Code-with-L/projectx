import { useInView } from "../../hooks/useInView";
import { profile } from "../../lib/portfolio-data";

export default function IntroSection() {
  const { ref, inView } = useInView(0.4);

  return (
    <section
      id="intro"
      ref={ref}
      className="relative flex min-h-screen items-center px-6 md:px-12 lg:px-24"
    >
      <div className="max-w-3xl">
        <p className={`reveal ${inView ? "is-in" : ""} mb-6 text-[11px] uppercase tracking-[0.4em] text-[#d9c3a0]/80`}>
          Portfolio &mdash; Creative Development
        </p>
        <h1
          className={`reveal reveal-delay-1 ${inView ? "is-in" : ""} font-serif text-[13vw] leading-[0.92] text-[#f6efe4] sm:text-[9vw] lg:text-[7.2rem]`}
        >
          {profile.name.split(" ")[0]}
          <br />
          <span className="italic text-[#d9c3a0]">{profile.name.split(" ")[1]}</span>
        </h1>
        <p className={`reveal reveal-delay-2 ${inView ? "is-in" : ""} mt-8 max-w-md text-sm leading-relaxed text-white/55 md:text-base`}>
          {profile.role} &mdash; based in {profile.location}, working with studios and
          founders who care about how things feel.
        </p>
      </div>

      <div
        className={`reveal reveal-delay-4 ${inView ? "is-in" : ""} absolute bottom-10 left-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/40 md:left-12 lg:left-24`}
      >
        <span className="relative h-10 w-px overflow-hidden bg-white/15">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_ease-in-out_infinite] bg-[#d9c3a0]" />
        </span>
        Scroll to begin
      </div>

      <style>{`
        @keyframes scrollcue {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>
    </section>
  );
}
