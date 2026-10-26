import { useState } from "react";
import { BIRTHDAY } from "./config.js";
import { RoomControls, useRoomView } from "./RoomView.jsx";
import FilmStripPage from "./FilmStrip.jsx";
import WindowPanel, { birthdayPhase, windowTitle } from "./BirthdayWindow.jsx";
import BedNotes from "./BedNotes.jsx";
import TvPlayer from "./TvPlayer.jsx";
import CouchPicks from "./CouchPicks.jsx";
import LilyBouquet from "./LilyBouquet.jsx";
import NightstandWish from "./NightstandWish.jsx";
import RoomDecor from "./RoomDecor.jsx";
import { HeartLayer, useHeartBurst } from "./HeartBurst.jsx";
import { BACK, Box, D, FLOOR, H, LEFT, Plane, W, hotProps } from "./Parts.jsx";

const PAST_SITES = [
  { title: "My Light Shower", href: "https://website-for-him.pages.dev" },
  { title: "A bouquet of flowers", href: "https://for-jhay.pages.dev" },
  { title: "Heart full of I love you's", href: "https://for-him.pages.dev" },
  { title: "But Who knows??", href: "https://my-love-jhay.pages.dev" },
];

// Paste a photo URL into src to replace the placeholder portrait on the table.
const PORTRAIT = {
  src: "https://pub-790262e0aebb4a07bab23513f2058a1b.r2.dev/1.13.JPEG",
};

// Tapping the vase shows the animated blue lily bouquet. Paste an image URL or file path into src
// to show a photo under it too. Leave src empty for the lilies alone.
const BOUQUET = {
  src: "",
  caption: "Flowers for you, because you deserve them every day.",
};

const GLOW = "radial-gradient(circle, rgba(255, 214, 140, 0.55), rgba(255, 214, 140, 0) 70%)";

const css = `
  body { margin: 0; background: #2b2226; font-family: Georgia, serif; color: #3d2b22; }
  .wrap { min-height: 100vh; min-height: 100dvh; padding: 16px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
  .title { color: #f7e6d6; text-align: center; font-size: clamp(1.4rem, 4vw, 2.2rem); margin: 0; }
  .hint { color: #d9bfae; font-size: 14px; margin: 0; text-align: center; max-width: 520px; }
  .scene { position: relative; width: min(100%, 640px, max(280px, calc(100vh - 260px))); aspect-ratio: 1 / 1; container-type: inline-size; user-select: none; cursor: grab; touch-action: pan-y; -webkit-tap-highlight-color: transparent; }
  .scene:active { cursor: grabbing; }
  .room { position: absolute; left: 50%; top: 50%; width: 0; height: 0; transform-style: preserve-3d; }
  .cuboid { position: absolute; left: 50%; top: 50%; width: 0; height: 0; transform-style: preserve-3d; transition: transform 0.35s ease; }
  .plane { position: absolute; left: 50%; top: 50%; box-sizing: border-box; }
  .side { box-shadow: inset 0 0 0 9999px rgba(0,0,0,.18); }
  .top { box-shadow: inset 0 0 0 9999px rgba(255,255,255,.12); }
  .cuboid.hot, .plane.hot { cursor: pointer; }
  .cuboid.hot:hover .plane, .cuboid.hot:focus-visible .plane, .plane.hot:hover { filter: brightness(1.12); }
  .cuboid:focus-visible, .plane:focus-visible { outline: none; }
  .glow { pointer-events: none; }
  .note-button { min-height: 44px; padding: 0 18px; border: none; border-radius: 10px; background: #f7d9e3; color: #5a3a4a; font-size: 1rem; font-family: inherit; cursor: pointer; animation: note-pulse 1.6s ease-in-out infinite; }
  @keyframes note-pulse { 50% { box-shadow: 0 0 0 6px rgba(247, 217, 227, 0.35); } }
  @media (prefers-reduced-motion: reduce) { .note-button { animation: none; } }
  .modal-bg { position: fixed; inset: 0; background: rgba(20,12,14,.6); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 10; }
  .modal { background: #f7f7f8; border-radius: 14px; padding: 24px; max-height: 85vh; max-height: 85dvh; overflow-y: auto; max-width: 420px; width: 100%; box-sizing: border-box; box-shadow: 0 12px 40px rgba(0,0,0,.4); color: #2c2c33; }
  .modal.wide { max-width: 720px; }
  .modal h2 { margin: 0 0 12px; font-size: 1.3rem; }
  .bouquet { width: 100%; display: block; border-radius: 10px; margin: 12px 0; }
  .modal p { line-height: 1.5; }
  .modal a { display: block; padding: 10px 12px; margin: 8px 0; background: #e4d6dd; border-radius: 8px; color: #5a3a4a; text-decoration: none; }
  .modal button.close { margin-top: 12px; padding: 10px 18px; min-height: 44px; border: none; border-radius: 8px; background: #5a3a4a; color: #fff; cursor: pointer; font-family: inherit; }
  @media (max-width: 480px) {
    .modal { padding: 18px; }
  }
`;

function Panel({ kind, onClose }) {
  const content = {
    bed: {
      title: "Sweet dreams",
      body: <BedNotes intro={BIRTHDAY.note} />,
    },
    window: {
      title: windowTitle(BIRTHDAY.date, BIRTHDAY.name),
      body: <WindowPanel date={BIRTHDAY.date} name={BIRTHDAY.name} />,
    },
    cabinet: {
      title: "Our memories",
      body: (
        <>
          <p>All the websites I've made for you, kept safe in here:</p>
          {PAST_SITES.map((site) => (
            <a key={site.title} href={site.href} target="_blank" rel="noreferrer">
              {site.title}
            </a>
          ))}
        </>
      ),
    },
    couch: {
      title: "Our spot",
      body: <CouchPicks />,
    },
    tv: {
      title: "Movie night",
      body: <TvPlayer />,
    },
    vase: {
      title: "For you",
      body: (
        <>
          <LilyBouquet />
          {BOUQUET.src && <img className="bouquet" src={BOUQUET.src} alt="A bouquet of flowers" />}
          <p>{BOUQUET.caption}</p>
        </>
      ),
    },
    nightstand: {
      title: "A goodnight wish",
      body: <NightstandWish />,
    },
  }[kind];

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className={`modal${kind === "tv" || kind === "vase" ? " wide" : ""}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>{content.title}</h2>
        {content.body}
        <button className="close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default function BirthdayRoom() {
  // On his birthday the page opens straight to the letter.
  const [open, setOpen] = useState(() => (birthdayPhase(BIRTHDAY.date) === "today" ? "window" : null));
  const [page, setPage] = useState("room");
  const [lampOn, setLampOn] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { hearts, burst } = useHeartBurst();
  const view = useRoomView();
  const moved = view.moved;

  // Ignore the click that ends a drag, so turning the room never opens something.
  const openPanel = (kind) => () => {
    if (!moved.current) setOpen(kind);
  };

  const openPortrait = () => {
    if (!moved.current) setPage("filmstrip");
  };

  const toggleLamp = () => {
    if (!moved.current) setLampOn((on) => !on);
  };

  const toggleDrawer = () => {
    if (!moved.current) setDrawerOpen((open) => !open);
  };

  // Hearts rise from the tap, or from the middle of the screen when it is a keyboard press.
  const heartsAt = (e) => {
    if (moved.current) return;
    burst(e?.clientX ?? window.innerWidth / 2, e?.clientY ?? window.innerHeight / 2);
  };

  if (page === "filmstrip") {
    return (
      <>
        <style>{css}</style>
        <FilmStripPage onBack={() => setPage("room")} />
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="wrap">
        <h1 className="title">Happy birthday, {BIRTHDAY.name} 🎂</h1>
        <p className="hint">Drag to turn the room, pinch or use the buttons to zoom, and tap anything to open it.</p>
        <div className="scene" ref={view.sceneRef} {...view.sceneProps}>
          <div
            className="room"
            style={{
              transform: `translate(${view.pan.x}px, ${view.pan.y}px) scale(${0.9 * view.zoom}) rotateX(-35deg) rotateY(${view.yaw}deg)`,
            }}
          >
            {/* Walls, floor and wall caps */}
            <Plane w={W} h={H} transform={`translateZ(${BACK}cqw)`} style={{ background: "#dedee2" }} />
            <Plane w={D} h={H} transform={`translateX(${LEFT}cqw) rotateY(90deg)`} style={{ background: "#c9c9cf" }} />
            <Plane
              w={W}
              h={D}
              transform={`translateY(${FLOOR}cqw) rotateX(90deg)`}
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,.12) 0.3cqw, transparent 0.3cqw) 0 0 / 7cqw 7cqw, linear-gradient(rgba(255,255,255,.12) 0.3cqw, transparent 0.3cqw) 0 0 / 7cqw 7cqw, #7d7f87",
              }}
            />
            <Box x={0} y={-FLOOR - 0.5} z={BACK + 1} w={W} h={1} d={2} color="#f2f2f4" />
            <Box x={LEFT + 1} y={-FLOOR - 0.5} z={0} w={2} h={1} d={D} color="#f2f2f4" />

            {/* Rug */}
            <Plane
              w={24}
              h={16}
              className="hot"
              transform={`translate3d(6cqw, ${FLOOR - 0.3}cqw, 14cqw) rotateX(90deg)`}
              {...hotProps("Rug", heartsAt)}
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, #f1dfe7 0 13%, #b98a9f 14% 17%, transparent 18%), repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.22) 0 1.2cqw, transparent 1.2cqw 2.4cqw), #c9b8c3",
                boxShadow: "inset 0 0 0 0.7cqw #8f6f82, inset 0 0 0 1.4cqw #e6d3dc, inset 0 0 0 1.9cqw #8f6f82",
              }}
            />
            <Plane w={22} h={1.2} transform={`translate3d(6cqw, ${FLOOR - 0.3}cqw, 5.4cqw) rotateX(90deg)`} style={{ background: "repeating-linear-gradient(90deg, #efe3d6 0 0.5cqw, transparent 0.5cqw 1cqw)" }} />
            <Plane w={22} h={1.2} transform={`translate3d(6cqw, ${FLOOR - 0.3}cqw, 22.6cqw) rotateX(90deg)`} style={{ background: "repeating-linear-gradient(90deg, #efe3d6 0 0.5cqw, transparent 0.5cqw 1cqw)" }} />

            {/* Air conditioner, TV and clock on the walls */}
            <Box x={-10} y={-19} z={BACK + 2} w={16} h={5} d={4} color="#f4f4f6" />
            <Box x={-2} y={2} z={BACK + 1.5} w={20} h={11} d={1.5} color="#222228" label="TV" onOpen={openPanel("tv")} />
            <Plane
              w={18}
              h={9}
              className="hot"
              transform={`translate3d(-2cqw, 2cqw, ${BACK + 2.35}cqw)`}
              style={{ background: "linear-gradient(135deg, #3a4f7a, #141a2b)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.75)", fontSize: "3cqw" }}
              {...hotProps("TV", openPanel("tv"))}
            >
              ▶
            </Plane>
            <Plane
              w={8}
              h={8}
              transform={`translate3d(${LEFT + 0.6}cqw, -6cqw, -12cqw) rotateY(90deg)`}
              style={{ background: "#f5f5f7", border: "0.8cqw solid #3d3d44", borderRadius: "50%" }}
            />

            {/* Window with a cabinet below it */}
            <Plane
              w={12}
              h={14}
              className="hot"
              transform={`translate3d(22cqw, -12cqw, ${BACK + 0.6}cqw)`}
              style={{ background: "linear-gradient(#e8edf2, #c9d2da)", border: "1.2cqw solid #5a5a62" }}
              {...hotProps("Window", openPanel("window"))}
            />
            <Box x={26} y={FLOOR - 15} z={BACK + 6} w={14} h={30} d={12} color="#9c7b8a" label="Cabinet" onOpen={openPanel("cabinet")} />

            {/* Cabinet doors, handles, a heart, and things on top */}
            {[22.8, 29.2].map((x) => (
              <Plane
                key={x}
                w={6}
                h={26}
                className="hot"
                transform={`translate3d(${x}cqw, ${FLOOR - 15}cqw, ${BACK + 12.1}cqw)`}
                style={{ background: "#a98897", boxShadow: "inset 0 0 0 0.5cqw #7d5f6e, inset 0 0 0 1cqw #b99aa8" }}
                {...hotProps("Cabinet", openPanel("cabinet"))}
              />
            ))}
            <Plane
              w={3}
              h={3}
              className="hot"
              transform={`translate3d(26cqw, ${FLOOR - 24}cqw, ${BACK + 12.2}cqw)`}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#f7d9e3", fontSize: "2.6cqw" }}
              {...hotProps("Cabinet", openPanel("cabinet"))}
            >
              ♥
            </Plane>
            <Box x={25} y={FLOOR - 14} z={BACK + 12.5} w={0.6} h={4} d={0.8} color="#f7d58b" label="Cabinet" onOpen={openPanel("cabinet")} />
            <Box x={27} y={FLOOR - 14} z={BACK + 12.5} w={0.6} h={4} d={0.8} color="#f7d58b" label="Cabinet" onOpen={openPanel("cabinet")} />
            <Box x={26} y={FLOOR - 30.4} z={BACK + 6} w={15} h={0.8} d={13} color="#7d5f6e" label="Cabinet" onOpen={openPanel("cabinet")} />
            <Box x={22.5} y={FLOOR - 31.6} z={BACK + 6} w={4} h={1.6} d={3} color="#6f8f6a" label="Cabinet" onOpen={openPanel("cabinet")} />
            <Box x={22.6} y={FLOOR - 33} z={BACK + 6} w={3.6} h={1.4} d={3} color="#c4a3b0" label="Cabinet" onOpen={openPanel("cabinet")} />
            <Box x={22.5} y={FLOOR - 34.2} z={BACK + 6} w={3.2} h={1.2} d={2.8} color="#f3d58b" label="Cabinet" onOpen={openPanel("cabinet")} />
            <Box x={29.5} y={FLOOR - 32.05} z={BACK + 6} w={2.5} h={2.5} d={2.5} color="#d9b8a6" label="Cabinet" onOpen={openPanel("cabinet")} />
            <Box x={29.5} y={FLOOR - 34.5} z={BACK + 6} w={3.2} h={2.4} d={3.2} color="#6f8f6a" label="Cabinet" onOpen={openPanel("cabinet")} />

            {/* Sofa under the TV */}
            <Box x={-2} y={FLOOR - 3} z={BACK + 8} w={30} h={6} d={12} color="#3f3f46" label="Couch" onOpen={openPanel("couch")} />
            <Box x={-2} y={FLOOR - 10} z={BACK + 3} w={30} h={8} d={4} color="#3f3f46" label="Couch" onOpen={openPanel("couch")} />
            <Box x={-18.5} y={FLOOR - 4.5} z={BACK + 8} w={3} h={9} d={12} color="#36363c" label="Couch" onOpen={openPanel("couch")} />
            <Box x={14.5} y={FLOOR - 4.5} z={BACK + 8} w={3} h={9} d={12} color="#36363c" label="Couch" onOpen={openPanel("couch")} />
            <Box x={-9} y={FLOOR - 7} z={BACK + 10} w={13} h={2} d={9} color="#52525a" label="Couch" onOpen={openPanel("couch")} />
            <Box x={5} y={FLOOR - 7} z={BACK + 10} w={13} h={2} d={9} color="#52525a" label="Couch" onOpen={openPanel("couch")} />
            <Box x={-13.5} y={FLOOR - 9} z={BACK + 6} w={5} h={5} d={2} color="#c4a3b0" label="Couch" onOpen={openPanel("couch")} />
            <Box x={-9.5} y={FLOOR - 8.5} z={BACK + 6.6} w={4.5} h={4.5} d={2} color="#8f9a6a" label="Couch" onOpen={openPanel("couch")} />
            <Box x={9.5} y={FLOOR - 9} z={BACK + 6} w={5} h={5} d={2} color="#f3eee6" label="Couch" onOpen={openPanel("couch")} />
            <Box x={14.5} y={FLOOR - 9.6} z={BACK + 8} w={3.4} h={1.2} d={12.4} color="#b9a7c4" label="Couch" onOpen={openPanel("couch")} />

            {/* Bed against the left wall */}
            <Box x={-19} y={FLOOR - 4} z={8} w={26} h={8} d={16} color="#8e8e97" label="Bed" onOpen={openPanel("bed")} />
            <Box x={-31.5} y={FLOOR - 7} z={8} w={3} h={14} d={17} color="#6f6f78" label="Bed" onOpen={openPanel("bed")} />
            <Box x={-18} y={FLOOR - 9.5} z={8} w={23} h={3} d={15} color="#ececf0" label="Bed" onOpen={openPanel("bed")} />
            <Box x={-29} y={FLOOR - 11.5} z={5} w={6} h={3} d={7} color="#fafafa" label="Bed" onOpen={openPanel("bed")} />
            <Box x={-15} y={FLOOR - 11.1} z={9.5} w={15} h={1.4} d={14} color="#c4a3b0" label="Bed" onOpen={openPanel("bed")} />

            {/* Nightstand and floor lamp */}
            <Box x={-26} y={FLOOR - 16} z={-18} w={1} h={32} d={1} color="#4d4d55" label="Lamp" onOpen={toggleLamp} />
            <Box x={-26} y={FLOOR - 0.5} z={-18} w={6} h={1} d={6} color="#4d4d55" label="Lamp" onOpen={toggleLamp} />
            <Box x={-26} y={FLOOR - 32.5} z={-18} w={7.5} h={3} d={7.5} color={lampOn ? "#ffe9b0" : "#d8d4cd"} label="Lamp" onOpen={toggleLamp} />
            <Box x={-26} y={FLOOR - 35} z={-18} w={5.5} h={2} d={5.5} color={lampOn ? "#ffe9b0" : "#d8d4cd"} label="Lamp" onOpen={toggleLamp} />
            {lampOn && (
              <>
                <Plane w={18} h={18} className="glow" transform={`translate3d(-24cqw, -8cqw, ${BACK + 0.2}cqw)`} style={{ background: GLOW }} />
                <Plane w={20} h={20} className="glow" transform={`translate3d(${LEFT + 0.2}cqw, -8cqw, -17cqw) rotateY(90deg)`} style={{ background: GLOW }} />
                <Plane w={18} h={18} className="glow" transform={`translate3d(-26cqw, ${FLOOR - 0.2}cqw, -17cqw) rotateX(90deg)`} style={{ background: GLOW }} />
              </>
            )}

            {/* Plant in the front corner */}
            <Box x={24} y={FLOOR - 2.5} z={14} w={5} h={5} d={5} color="#d9b8a6" />
            <Box x={24} y={FLOOR - 8} z={14} w={7} h={6} d={7} color="#6f8f6a" />

            {/* Flower vase on top of the green plant that opens the bouquet */}
            <Box x={24} y={FLOOR - 13.5} z={14} w={3} h={5} d={3} color="#dfe8ef" label="Flower vase" onOpen={openPanel("vase")} />
            <Box x={24} y={FLOOR - 18} z={14} w={0.5} h={4} d={0.5} color="#5f8a5a" label="Flower vase" onOpen={openPanel("vase")} />
            <Box x={22.7} y={FLOOR - 20} z={14} w={2.2} h={2.2} d={2.2} color="#e8a7b8" label="Flower vase" onOpen={openPanel("vase")} />
            <Box x={25.3} y={FLOOR - 20.4} z={14.3} w={2.2} h={2.2} d={2.2} color="#f7d58b" label="Flower vase" onOpen={openPanel("vase")} />
            <Box x={24} y={FLOOR - 21.6} z={13.7} w={2.2} h={2.2} d={2.2} color="#c4a3b0" label="Flower vase" onOpen={openPanel("vase")} />

            {/* Side table with a portrait that opens the portrait page */}
            <Box x={-14} y={FLOOR - 11.25} z={24} w={12} h={1.5} d={10} color="#8f8f98" />
            <Box x={-19} y={FLOOR - 5.25} z={20} w={1} h={10.5} d={1} color="#6a6a72" />
            <Box x={-9} y={FLOOR - 5.25} z={20} w={1} h={10.5} d={1} color="#6a6a72" />
            <Box x={-19} y={FLOOR - 5.25} z={28} w={1} h={10.5} d={1} color="#6a6a72" />
            <Box x={-9} y={FLOOR - 5.25} z={28} w={1} h={10.5} d={1} color="#6a6a72" />
            <Box x={-14} y={FLOOR - 16.25} z={24} w={6} h={8.5} d={0.8} color="#c9a27e" label="Portrait" onOpen={openPortrait} />
            <Plane
              w={4.8}
              h={7.3}
              className="hot"
              transform={`translate3d(-14cqw, ${FLOOR - 16.25}cqw, 24.5cqw)`}
              style={{ background: PORTRAIT.src ? `url(${PORTRAIT.src}) center / cover` : "linear-gradient(#f3d7c9, #c9a27e)" }}
              {...hotProps("Portrait", openPortrait)}
            />

            <RoomDecor openPanel={openPanel} toggleDrawer={toggleDrawer} drawerOpen={drawerOpen} petCat={heartsAt} />
          </div>
        </div>
        <RoomControls view={view} />
        {drawerOpen && (
          <button className="note-button" onClick={() => setOpen("nightstand")}>
            💌 Read the note in the drawer
          </button>
        )}
      </div>
      <HeartLayer hearts={hearts} />

      {open && <Panel kind={open} onClose={() => setOpen(null)} />}
    </>
  );
}
