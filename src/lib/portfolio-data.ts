export const profile = {
  name: "Milicent Muema",
  role: "Creative Developer & Digital Designer",
  tagline: "Creating digital experiences with intention.",
  location: "Nairobi, Kenya",
  email: "hello@milicentmuema.com",
};

export const about = {
  heading: "About",
  paragraphs: [
    "I'm Milicent — a creative developer who works at the intersection of design and code. My practice is about restraint: finding the smallest, most considered solution to a problem, and giving it room to breathe.",
    "I care about craft. Typography, motion, spacing, and the way an interface responds to a hand — these details are never an afterthought, they're the work itself.",
    "Every project starts as a question about experience before it becomes a question about technology. I build things that feel inevitable, not decorated.",
  ],
};

export type Project = {
  id: string;
  title: string;
  year: string;
  description: string;
  tech: string[];
  link: string;
};

export const projects: Project[] = [
  {
    id: "01",
    title: "Atelier Noir",
    year: "2024",
    description:
      "A quiet, editorial commerce experience for an independent fashion house — built around type rhythm and slow, deliberate motion.",
    tech: ["React", "WebGL", "GSAP"],
    link: "#",
  },
  {
    id: "02",
    title: "Vantage Studio",
    year: "2023",
    description:
      "An interactive case-study platform for a design studio, using scroll-driven 3D staging to present work as a spatial narrative.",
    tech: ["Three.js", "R3F", "Next.js"],
    link: "#",
  },
  {
    id: "03",
    title: "Meridian",
    year: "2023",
    description:
      "A data visualization system for a fintech product — reducing dense information into calm, legible, human interfaces.",
    tech: ["TypeScript", "D3", "Framer Motion"],
    link: "#",
  },
  {
    id: "04",
    title: "Glasswing",
    year: "2022",
    description:
      "Brand and product design for a boutique audio hardware company, spanning packaging, motion identity, and a WebGL product configurator.",
    tech: ["Blender", "WebGL", "Figma"],
    link: "#",
  },
];

export const skills = {
  Development: ["React & TypeScript", "WebGL / Three.js", "Motion & Interaction", "Design Systems"],
  Design: ["Interface Design", "Typography", "Art Direction", "Prototyping"],
  Tools: ["Figma", "Blender", "After Effects", "Framer"],
  "Creative Technology": ["Shaders", "Generative Design", "3D for Web", "Sound-reactive UI"],
};

export const socials = [
  { label: "GitHub", href: "https://github.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "Dribbble", href: "https://dribbble.com/" },
  { label: "Twitter / X", href: "https://twitter.com/" },
];
