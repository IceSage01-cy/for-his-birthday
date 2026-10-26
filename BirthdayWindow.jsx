import { useEffect, useMemo, useState } from "react";

const DAY = 86400000;
const COLORS = ["#c4a3b0", "#f3d7c9", "#9c7b8a", "#f7d58b", "#6f8f6a"];

// "before" the birthday, on the birthday itself, or "after" it.
export function birthdayPhase(date, now = Date.now()) {
  const start = new Date(date).getTime();
  if (now < start) return "before";
  return now < start + DAY ? "today" : "after";
}

export function windowTitle(date, name) {
  const phase = birthdayPhase(date);
  if (phase === "today") return `Happy birthday, ${name}`;
  return phase === "after" ? "Thinking of you" : "Countdown";
}

// His birthday letter. Edit it freely so it sounds like you.
const letter = (name) => [
  `${name},`,
  "I don't know how to fit everything I feel onto one page, so I built you a whole little world to hold it instead.",
  "Thank you for being the person I get to come home to, in every sense of the word. Thank you for the way you listen, for the way you make ordinary days feel like they matter, and for every time you chose patience when I was hard to love.",
  "Thank you for the laughs that leave my stomach sore, for the quiet nights where we don't have to say a thing, and for letting me see the real you: the soft parts, the tired parts, the parts you thought no one would stay for. I'm staying. Every single time.",
  "I love you without conditions. Not because of what you do, or what you give, or how the day went. I love you on your best days and on your worst ones, when you're sure of everything and when you're sure of nothing. There is no version of you I would ever trade.",
  "You have made me braver, kinder, and more honest about what I want from this life. And what I want is more of this: more of you, more of us. More of the way you make me feel like I can be my whole self, and more of the way we make each other better.",
  "I am endlessly grateful for you. For your heart, for your humor, for the way you show up. If I could, I would thank you a thousand times a day, and it still wouldn't be enough.",
  "So today, I hope you feel as loved as you truly are: completely, quietly, and without a single doubt. Eat the cake. Be celebrated. You deserve every bit of it.",
  `Happy birthday, my love. Thank you for everything. I'm always yours.`,
];

const css = `
  .letter p { margin: 0 0 12px; }
  .confetti { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 20; }
  .confetti i { position: absolute; top: -20px; width: 8px; height: 14px; animation: fall linear infinite; }
  @keyframes fall { to { transform: translateY(110vh) rotate(720deg); } }
  @media (prefers-reduced-motion: reduce) { .confetti { display: none; } }
`;

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 4 + Math.random() * 4,
        color: COLORS[i % COLORS.length],
      })),
    [],
  );

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i key={i} style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }} />
      ))}
    </div>
  );
}

export default function WindowPanel({ date, name }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const phase = birthdayPhase(date, now);

  if (phase === "today") {
    return (
      <>
        <style>{css}</style>
        <Confetti />
        <div className="letter">
          {letter(name).map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>
      </>
    );
  }

  if (phase === "after") return <p>I hope your birthday was perfect, {name}. I love you more every day.</p>;

  const diff = new Date(date).getTime() - now;
  const days = Math.floor(diff / DAY);
  const hours = Math.floor((diff / 3600000) % 24);
  const mins = Math.floor((diff / 60000) % 60);
  return <p>{days} days, {hours} hours, {mins} minutes until your birthday.</p>;
}
