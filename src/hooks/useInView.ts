import { useEffect, useRef, useState } from "react";

/**
 * Observes an element and reports whether it is sufficiently within the
 * viewport. Used to drive CSS-based fade/translate transitions for the
 * editorial text overlays without re-rendering the 3D scene.
 */
export function useInView<T extends HTMLElement>(threshold = 0.35) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold, rootMargin: "-10% 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
