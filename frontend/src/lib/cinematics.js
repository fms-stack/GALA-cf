import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Cinematic scroll animations — call once per page mount.
 * - Hero parallax background
 * - Staggered text reveal on intersection
 * - Marquee-style discipline scroller acceleration on scroll-in
 */
export function useCinematics(rootRef) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero image parallax (slower than scroll)
      gsap.utils.toArray("[data-parallax]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 0, scale: 1.06 },
          {
            y: 120,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });

      // Reveal-on-scroll for any [data-reveal]
      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          }
        );
      });

      // Stagger reveal on lists
      gsap.utils.toArray("[data-stagger]").forEach((container) => {
        const items = container.querySelectorAll("[data-stagger-item]");
        gsap.fromTo(
          items,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.1,
            scrollTrigger: { trigger: container, start: "top 80%", once: true },
          }
        );
      });

      // Hero headline character split + reveal
      const headline = document.querySelector("[data-hero-title]");
      if (headline && !headline.dataset.split) {
        headline.dataset.split = "1";
        const words = headline.textContent.split(" ");
        headline.innerHTML = words
          .map((w) => `<span class="inline-block overflow-hidden"><span class="inline-block" data-hero-word>${w}</span></span>`)
          .join(" ");
        gsap.fromTo(
          "[data-hero-word]",
          { y: "110%", opacity: 0 },
          { y: "0%", opacity: 1, duration: 1.2, ease: "expo.out", stagger: 0.08, delay: 0.2 }
        );
      }
    }, rootRef);

    return () => ctx.revert();
  }, [rootRef]);
}
