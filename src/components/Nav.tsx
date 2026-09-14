const LINKS = [
  { label: "Work", href: "#work" },
  { label: "Expertise", href: "#skills" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
      <a
        href="#intro"
        className="font-serif text-[13px] uppercase tracking-[0.28em] text-white/90"
      >
        M. Muema
      </a>
      <nav className="hidden items-center gap-9 md:flex">
        {LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="text-[11px] uppercase tracking-[0.22em] text-white/55 transition-colors duration-300 hover:text-white"
          >
            {l.label}
          </a>
        ))}
      </nav>
      <a
        href="mailto:hello@milicentmuema.com"
        className="text-[11px] uppercase tracking-[0.22em] text-white/70 transition-colors duration-300 hover:text-white"
      >
        Say Hello
      </a>
    </header>
  );
}
