import { useEffect, useRef } from "react";

// Point these at your files in the project folder, or at links.
// video: the video of the two of you. song: a background song that plays along with it.
// When a song is set the video is muted, so the song is what he hears.
const TV = {
  video: "",
  song: "",
};

const css = `
  .tv-video { width: 100%; display: block; border-radius: 10px; background: #000; }
  .tv-empty { aspect-ratio: 16 / 9; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: linear-gradient(135deg, #3a4f7a, #141a2b); color: #dfe8ef; text-align: center; padding: 16px; }
`;

export default function TvPlayer() {
  const song = useRef(null);

  // The song follows the video: it plays when the video plays and pauses when it pauses.
  const playSong = () => song.current?.play().catch(() => {});
  const pauseSong = () => song.current?.pause();

  useEffect(() => () => song.current?.pause(), []);

  return (
    <>
      <style>{css}</style>
      {TV.video ? (
        <video
          className="tv-video"
          src={TV.video}
          controls
          autoPlay
          playsInline
          loop
          muted={!!TV.song}
          onPlay={playSong}
          onPause={pauseSong}
        />
      ) : (
        <div className="tv-empty">Our movie night is loading up. Come back soon.</div>
      )}
      {TV.song && <audio ref={song} src={TV.song} loop />}
    </>
  );
}
