import { useEffect, useRef, useState } from "react";

// Paste photo URLs into src. An empty src shows a numbered placeholder frame.
const PHOTOS = [
  { src: "", caption: "Where it started" },
  { src: "", caption: "Our first date" },
  { src: "", caption: "Just us" },
  { src: "", caption: "Silly faces" },
  { src: "", caption: "A good day" },
  { src: "", caption: "Adventures" },
  { src: "", caption: "Cozy nights" },
  { src: "", caption: "Still my favorite" },
  { src: "", caption: "Road trips" },
  { src: "", caption: "Birthday smiles" },
  { src: "", caption: "Lazy Sundays" },
  { src: "", caption: "Always you" },
];

// Point src at an audio file or URL to play a song on this page. Leave it empty for no song.
const SONG = {
  src: "",
};

const css = `
  .film { min-height: 100vh; box-sizing: border-box; padding: 24px 0; display: flex; flex-direction: column; align-items: center; gap: 24px; color: #f7e6d6; overflow: hidden; }
  .film h2 { margin: 0; font-size: clamp(1.4rem, 4vw, 2rem); text-align: center; padding: 0 16px; }
  .film .back, .film .music { padding: 8px 14px; border: none; border-radius: 8px; background: #5a3a4a; color: #fff; cursor: pointer; font-family: inherit; }
  .film .back { align-self: flex-start; margin-left: 16px; }  .strip { width: 100%; overflow: hidden; background: #141114; padding: 26px 0; position: relative; box-shadow: 0 8px 24px rgba(0,0,0,.45); }
  .reel { display: flex; width: max-content; position: relative; animation: slide 40s linear infinite; }
  .reel.reverse { animation-direction: reverse; }
  .strip:hover .reel { animation-play-state: paused; }
  .reel::before, .reel::after { content: ""; position: absolute; left: 0; width: 100%; height: 10px; background: repeating-linear-gradient(90deg, #f3ecdf 0 12px, transparent 12px 28px); opacity: .85; }
  .reel::before { top: -18px; }
  .reel::after { bottom: -18px; }
  .frame { flex: 0 0 auto; width: 190px; margin: 0 8px; }
  .frame .photo { height: 130px; background: linear-gradient(#f3d7c9, #c9a27e); display: flex; align-items: center; justify-content: center; color: #7a4e3a; font-size: 2.4rem; overflow: hidden; border-radius: 2px; }
  .frame img { width: 100%; height: 100%; object-fit: cover; }
  .frame figcaption { margin-top: 6px; font-size: 12px; text-align: center; color: #d9bfae; }
  .film .back, .film .music { min-height: 44px; }
  @media (max-width: 480px) {
    .frame { width: 150px; }
    .frame .photo { height: 105px; }
  }
  @keyframes slide { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @media (prefers-reduced-motion: reduce) {
    .reel { animation: none; }
    .strip { overflow-x: auto; }
  }
`;

// Two copies side by side so the loop is seamless at -50%.
function Strip({ offset, seconds, reverse }) {
  const photos = [...PHOTOS.slice(offset), ...PHOTOS.slice(0, offset)];
  const loop = [...photos, ...photos];
  return (
    <div className="strip">
      <div className={`reel${reverse ? " reverse" : ""}`} style={{ animationDuration: `${seconds}s` }}>
        {loop.map((photo, i) => (
          <figure className="frame" key={i} aria-hidden={i >= photos.length}>
            <div className="photo">
              {photo.src ? <img src={photo.src} alt={photo.caption} /> : PHOTOS.indexOf(photo) + 1}
            </div>
            <figcaption>{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function Music() {
  const audio = useRef(null);
  const [playing, setPlaying] = useState(false);

  // Opening the page followed a click, so most browsers allow this to start on its own.
  useEffect(() => {
    const el = audio.current;
    el.play().catch(() => {});
    return () => el.pause();
  }, []);

  const toggle = () => {
    if (audio.current.paused) audio.current.play();
    else audio.current.pause();
  };

  return (
    <>
      <audio ref={audio} src={SONG.src} loop onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <button className="music" onClick={toggle}>{playing ? "⏸ Pause our song" : "▶ Play our song"}</button>
    </>
  );
}

export default function FilmStripPage({ onBack }) {
  return (
    <>
      <style>{css}</style>
      <div className="film">
        <button className="back" onClick={onBack}>← Back to the room</button>
        <h2>Our little film roll</h2>
        {SONG.src && <Music />}
        <Strip offset={0} seconds={40} />
        <Strip offset={4} seconds={55} reverse />
        <Strip offset={8} seconds={46} />
      </div>
    </>
  );
}
