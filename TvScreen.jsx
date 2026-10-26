import { useEffect, useRef } from "react";
import { TV } from "./TvPlayer.jsx";

// The reel plays silently on the TV screen in the room. It pauses while the full player is open,
// and it stays still when someone prefers less motion or has data saver on.
export default function TvScreen({ paused }) {
  const video = useRef(null);
  const src = TV.preview || TV.video;
  const saveData = typeof navigator !== "undefined" && navigator.connection?.saveData === true;
  const still = saveData || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (paused || still) el.pause();
    else el.play().catch(() => {});
  }, [paused, still]);

  if (!src) return null;
  return <video ref={video} className="tv-screen-video" src={src} muted loop playsInline autoPlay={!still} preload={still ? "metadata" : "auto"} />;
}
