import { useState } from "react";

// Add, remove or rewrite these. Each one is a note he can open from under the pillow.
const NOTES = [
  { title: "Open when you miss me", text: "Close your eyes and picture my hand in yours. I'm closer than the distance says, and I'm counting the minutes until I see you." },
  { title: "Open when you're sad", text: "It's okay to have a heavy day. You don't have to carry it alone, because I'm on your side, always. Breathe. This will pass, and I'll be right here after." },
  { title: "Open when you can't sleep", text: "Let your shoulders drop. Whatever is spinning in your head can wait until morning. You're safe, you're loved, and tomorrow is already on your side. Sweet dreams." },
  { title: "Open when you need a laugh", text: "Remember the time we couldn't stop laughing over nothing at all? Hold on to that. Nobody makes me laugh the way you do." },
  { title: "Open when you doubt yourself", text: "You are more capable, more kind and more loved than you know. I'm proud of you every single day." },
  { title: "Open on a good day", text: "Look at you, glowing. I wish I were there to celebrate with you. Eat something delicious, and save me a slice." },
];

const css = `
  .bed-sky { text-align: center; letter-spacing: 8px; color: #f7e6d6; background: linear-gradient(#2b2a45, #4b3f62); border-radius: 10px; padding: 12px 0; margin-bottom: 12px; }
  .bed-hint { font-size: 13px; color: #6b6b74; margin: -4px 0 10px; }
  .bed-notes { display: flex; flex-direction: column; gap: 8px; }
  .bed-note { width: 100%; text-align: left; padding: 10px 12px; border: none; border-radius: 8px; background: #e4d6dd; color: #5a3a4a; font-family: inherit; font-size: 1rem; cursor: pointer; }
  .bed-note.open { background: #fff4e8; box-shadow: inset 0 0 0 2px #c4a3b0; }
  .bed-note-text { display: block; margin-top: 8px; line-height: 1.5; color: #2c2c33; animation: bed-fade .35s ease; }
  @keyframes bed-fade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .bed-note-text { animation: none; } }
`;

export default function BedNotes({ intro }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <>
      <style>{css}</style>
      <div className="bed-sky" aria-hidden="true">☾ ✦ ✧ ✦ ✧</div>
      <p>{intro}</p>
      <p className="bed-hint">There are some notes tucked under the pillow. Tap one to open it.</p>
      <div className="bed-notes">
        {NOTES.map((note, i) => (
          <button
            key={note.title}
            className={`bed-note${openIndex === i ? " open" : ""}`}
            aria-expanded={openIndex === i}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            ✉ {note.title}
            {openIndex === i && <span className="bed-note-text">{note.text}</span>}
          </button>
        ))}
      </div>
    </>
  );
}
