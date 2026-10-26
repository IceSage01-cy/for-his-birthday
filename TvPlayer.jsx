import { useEffect, useRef } from "react";

// Point these at your files in the project folder, or at links.
// video: the video of the two of you. song: a background song that plays along with it.
// When a song is set the video is muted, so the song is what he hears.
// preview: an optional smaller copy of the video for the TV screen in the room, which plays on its own.
// Leave it empty to use the main video there too.
export const TV = {
  preview: "",
  video: "https://pub-790262e0aebb4a07bab23513f2058a1b.r2.dev/ascii_photos_reel_clean.mp4",
  song: "https://pub-790262e0aebb4a07bab23513f2058a1b.r2.dev/Lauv%20-%20I%20Like%20Me%20Better%20%5BOfficial%20Instrumental%5D%204.mp3",
};

const css = `
  .tv-video { width: 100%; max-height: 70vh; max-height: 70dvh; object-fit: contain; display: block; border-radius: 10px; background: #000; }
  .tv-empty { aspect-ratio: 16 / 9; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: linear-gradient(135deg, #3a4f7a, #141a2b); color: #dfe8ef; text-align: center; padding: 16px; }
`;

export default function TvPlayer() {
  const song = useRef(null);
  const video = useRef(null);

  // If the song cannot load, the video gets its own sound back so he is never left with silence.
  const songFailed = () => {
    if (video.current) video.current.muted = false;
  };

  // The song follows the video: it plays when the video plays and pauses when it pauses.
  const playSong = () => song.current?.play().catch(() => {});
  const pauseSong = () => song.current?.pause();

  useEffect(() => () => song.current?.pause(), []);

  return (
    <>
      <style>{css}</style>
      {TV.video ? (
        <video
          ref={video}
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
      {TV.song && <audio ref={song} src={TV.song} loop onError={songFailed} />}
    </>
  );
}
