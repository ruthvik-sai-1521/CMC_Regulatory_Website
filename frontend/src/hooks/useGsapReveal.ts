import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface RevealOptions {
  /** Stagger children matching this selector instead of animating the container as one block. */
  childSelector?: string;
  /** Pixels to travel on the way in. */
  y?: number;
  duration?: number;
  stagger?: number;
  /** 0-1, how far into the viewport the element must be before animating. */
  start?: string;
}

/**
 * Fades + slides an element (or its staggered children) in once, the first
 * time it scrolls into view. Respects prefers-reduced-motion by setting the
 * final state immediately with no animation, matching the convention
 * established by useCountUp for the rest of this codebase.
 */
export function useGsapReveal<T extends HTMLElement>(options: RevealOptions = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const { childSelector, y = 28, duration = 0.7, stagger = 0.08, start = "top 85%" } = options;
    const targets = childSelector ? node.querySelectorAll(childSelector) : node;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease: "power3.out",
          scrollTrigger: {
            trigger: node,
            start,
            once: true,
          },
        }
      );
    }, node);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
