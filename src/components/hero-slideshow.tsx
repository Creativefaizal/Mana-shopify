"use client";

import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/hero/desk-setup.webp", alt: "A bright desk setup with a monitor, keyboard and speakers" },
  { src: "/hero/living-room.webp", alt: "A calm modern living room with soft daylight" },
  { src: "/hero/everyday-tech.webp", alt: "Headphones, a phone and a smartwatch laid out on a table" },
  { src: "/hero/media-room.webp", alt: "A living room with a wall-mounted TV and soundbar" },
  { src: "/hero/evening-desk.webp", alt: "A desk lit by a lamp in the evening" },
];

const INTERVAL_MS = 5000;

/**
 * Crossfading hero photos. Advances every few seconds, pauses while hovered or
 * focused, and the dots let shoppers jump to (and hold on) any slide.
 */
export function HeroSlideshow() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % SLIDES.length),
      INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {SLIDES.map((slide, index) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          aria-hidden={index !== active}
          fetchPriority={index === 0 ? "high" : "low"}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out motion-reduce:transition-none ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {/* Soft scrim so the white dots stay readable on bright photos. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />

      <div className="absolute bottom-12 right-5 flex gap-2 sm:bottom-16 sm:right-8">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Show slide ${index + 1} of ${SLIDES.length}`}
            aria-current={index === active}
            className={`h-2 rounded-full bg-white transition-all ${
              index === active ? "w-6 opacity-100" : "w-2 opacity-60 hover:opacity-90"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
