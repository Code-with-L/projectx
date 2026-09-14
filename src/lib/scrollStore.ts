// Lightweight scroll-progress store shared between the DOM and the R3F canvas.
// Avoids React re-renders on every scroll frame — the 3D rig reads this
// mutable object directly inside useFrame.

export const scrollState = {
  progress: 0, // 0..1 across the entire scrollable page
  velocity: 0,
  // start-progress (0..1) of each of the SCENE_COUNT scenes, measured from
  // actual section offsets so camera choreography lines up with content
  // regardless of how tall each section is.
  boundaries: [0, 0.2, 0.4, 0.6, 0.8, 1] as number[],
};

export function setSceneBoundaries(boundaries: number[]) {
  scrollState.boundaries = boundaries;
}

type Listener = (p: number) => void;
const listeners = new Set<Listener>();

export function subscribeScroll(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

let ticking = false;
let lastProgress = 0;

export function initScrollTracking() {
  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    scrollState.velocity = progress - lastProgress;
    lastProgress = progress;
    scrollState.progress = progress;
    listeners.forEach((fn) => fn(progress));
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}

// Number of cinematic scenes used to segment the scroll timeline.
export const SCENE_COUNT = 6;
