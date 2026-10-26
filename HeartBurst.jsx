import { useRef, useState } from "react";

const EMOJIS = ["💗", "💖", "💕", "❤️"];
const rand = (low, high) => low + Math.random() * (high - low);

const css = `
  .heart-layer { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 5; }
  .heart { position: absolute; font-size: 22px; animation: heart-rise 1.6s ease-out forwards; }
  @keyframes heart-rise {
    from { opacity: 1; transform: translate(0, 0) scale(0.6); }
    to { opacity: 0; transform: translate(var(--dx), -150px) scale(1.2); }
  }
  @media (prefers-reduced-motion: reduce) { .heart { animation-duration: 0.4s; } }
`;

// Hearts that float up from wherever he taps. burst(x, y) takes screen coordinates.
export function useHeartBurst() {
  const [hearts, setHearts] = useState([]);
  const nextId = useRef(0);

  const burst = (x, y) => {
    const batch = Array.from({ length: 7 }, () => ({
      id: nextId.current++,
      x: x + rand(-30, 30),
      y: y + rand(-10, 10),
      dx: rand(-45, 45),
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    }));
    setHearts((current) => [...current, ...batch]);
    setTimeout(() => setHearts((current) => current.filter((h) => !batch.includes(h))), 1700);
  };

  return { hearts, burst };
}

export function HeartLayer({ hearts }) {
  return (
    <>
      <style>{css}</style>
      <div className="heart-layer" aria-hidden="true">
        {hearts.map((h) => (
          <span key={h.id} className="heart" style={{ left: h.x, top: h.y, "--dx": `${h.dx}px` }}>
            {h.emoji}
          </span>
        ))}
      </div>
    </>
  );
}
