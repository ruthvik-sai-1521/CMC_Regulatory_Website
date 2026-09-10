import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";

/**
 * Wraps <main>'s content and plays a short fade/rise whenever the route
 * changes. Skips the animation entirely under prefers-reduced-motion --
 * the content is simply present, no motion at all.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    window.scrollTo({ top: 0, behavior: "auto" });
    const context = gsap.context(() => {
      gsap.fromTo(
        node,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", clearProps: "transform" }
      );
    }, node);

    return () => context.revert();
  }, [pathname]);

  return (
    <div key={pathname} ref={ref}>
      {children}
    </div>
  );
}
