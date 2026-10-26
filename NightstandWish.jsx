import { useState } from "react";

// Add, remove or rewrite these. Each tap of the button picks a new wish.
const WISHES = [
  "May tonight be quiet, and tomorrow be kind to you.",
  "I wish you the softest pillow and the sweetest dream.",
  "I wish every worry would wait until morning.",
  "May you wake up knowing exactly how loved you are.",
  "I wish you a year full of laughing until it hurts.",
  "May the best day of your year be the one that's coming.",
  "I wish I could be there to say goodnight in person.",
  "May all the things you hope for find their way to you.",
  "I wish you rest, and then I wish you joy.",
  "May you always have someone to come home to. I hope it's me.",
  "I wish you a thousand more birthdays, and me at every one.",
  "Close your eyes. I'm thinking of you, always.",
];

const css = `
  .wish-envelope { text-align: center; font-size: 3rem; margin: 0 0 8px; }
  .wish-card { min-height: 84px; display: flex; align-items: center; justify-content: center; text-align: center; padding: 12px 16px; border-radius: 10px; background: #fff4e8; box-shadow: inset 0 0 0 2px #c4a3b0; line-height: 1.5; animation: wish-fade .35s ease; }
  .wish-button { display: block; margin: 12px auto 0; padding: 8px 14px; min-height: 44px; border: none; border-radius: 8px; background: #5a3a4a; color: #fff; cursor: pointer; font-family: inherit; }
  @keyframes wish-fade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .wish-card { animation: none; } }
`;

export default function NightstandWish() {
  const [index, setIndex] = useState(null);

  // Never show the same wish twice in a row.
  const wish = () => {
    let next;
    do next = Math.floor(Math.random() * WISHES.length);
    while (next === index);
    setIndex(next);
  };

  return (
    <>
      <style>{css}</style>
      <div className="wish-envelope" aria-hidden="true">💌</div>
      <p>A note was waiting in the drawer. Make a wish for tonight:</p>
      {index !== null && <div key={index} className="wish-card">{WISHES[index]}</div>}
      <button className="wish-button" onClick={wish}>{index === null ? "Make a wish" : "Another wish"}</button>
    </>
  );
}
