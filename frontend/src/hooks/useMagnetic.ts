import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function useMagnetic<T extends HTMLElement>(strength = 0.18) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    const xTo = gsap.quickTo(node, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(node, "y", { duration: 0.35, ease: "power3.out" });

    const onMove = (event: MouseEvent) => {
      const bounds = node.getBoundingClientRect();
      xTo((event.clientX - (bounds.left + bounds.width / 2)) * strength);
      yTo((event.clientY - (bounds.top + bounds.height / 2)) * strength);
    };
    const reset = () => {
      xTo(0);
      yTo(0);
    };

    node.addEventListener("mousemove", onMove);
    node.addEventListener("mouseleave", reset);
    return () => {
      node.removeEventListener("mousemove", onMove);
      node.removeEventListener("mouseleave", reset);
      gsap.killTweensOf(node);
    };
  }, [strength]);

  return ref;
}