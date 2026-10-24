import { useEffect, useState } from "react";
import { BIRTHDAY, LOCK } from "./config.js";
import { birthdayPhase } from "./BirthdayWindow.jsx";

const DAY = 86400000;
const STORAGE_KEY = "birthday-unlocked";

// Shown in a pop-up each time he taps "Open it" before his birthday. Edit or add to these.
const TEASES = [
  "Someone's too excited! 😆 It's not time yet. Hang in there a little longer.",
  "Nice try! The surprise won't open for you until your birthday.",
  "Patience, my love. Good things come to those who wait.",
  "I can see you tapping. Still not your birthday yet!",
  "Okay, that's enough. Go do something else and come back on the day.",
];

// Run `npm run dev` and add ?preview to the address to skip the lock while you work on the site.
const PREVIEW = import.meta.env.DEV && new URLSearchParams(window.location.search).has("preview");

// The same text rules as hash-password.mjs: ignore capitals and spaces around it.
async function sha256(text) {
  const bytes = new TextEncoder().encode(text.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function wasUnlocked() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

const css = `
  html, body { margin: 0; background: #2b2226; }
  .lock { min-height: 100vh; min-height: 100dvh; box-sizing: border-box; padding: 24px 16px; display: flex; align-items: center; justify-content: center; font-family: Georgia, serif; }
  .lock-card { width: 100%; max-width: 380px; box-sizing: border-box; padding: 28px 24px; border-radius: 16px; background: #f7f7f8; color: #2c2c33; text-align: center; box-shadow: 0 12px 40px rgba(0,0,0,.4); }
  .lock-card h1 { margin: 8px 0 12px; font-size: 1.5rem; }
  .lock-card p { line-height: 1.5; margin: 0 0 12px; }
  .lock-icon { font-size: 2.6rem; }
  .lock-card input { width: 100%; box-sizing: border-box; padding: 12px; border: 2px solid #c4a3b0; border-radius: 10px; font-size: 1rem; font-family: inherit; }
  .lock-card button { width: 100%; margin-top: 12px; min-height: 44px; border: none; border-radius: 10px; background: #5a3a4a; color: #fff; font-size: 1rem; font-family: inherit; cursor: pointer; }
  .lock-card button:disabled { opacity: .6; cursor: default; }
  .lock-card button.secondary { background: none; color: #5a3a4a; box-shadow: inset 0 0 0 2px #c4a3b0; }
  .tease-bg { position: fixed; inset: 0; background: rgba(20,12,14,.7); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 10; font-family: Georgia, serif; }
  .tease { width: 100%; max-width: 340px; box-sizing: border-box; padding: 26px 22px; border-radius: 16px; background: #fff4e8; color: #2c2c33; text-align: center; box-shadow: 0 12px 40px rgba(0,0,0,.5); animation: tease-pop .3s ease; }
  .tease p { font-size: 1.15rem; line-height: 1.5; margin: 8px 0 16px; }
  .tease button { width: 100%; min-height: 44px; border: none; border-radius: 10px; background: #5a3a4a; color: #fff; font-size: 1rem; font-family: inherit; cursor: pointer; }
  @keyframes tease-pop { from { opacity: 0; transform: scale(.9); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .tease { animation: none; } }
  .lock-error { color: #a33b4d; }
  .lock-hint { font-size: 14px; color: #6b6b74; }
`;

function PasswordForm({ onUnlock }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setChecking(true);
    setError("");
    try {
      if ((await sha256(value)) === LOCK.passwordHash) onUnlock();
      else setError("That's not it. Try again.");
    } catch {
      setError("This page needs a secure (https) address to check the password.");
    }
    setChecking(false);
  };

  return (
    <form onSubmit={submit}>
      <p>Happy birthday, {BIRTHDAY.name}. Type your password to open it.</p>
      <input
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Password"
        autoComplete="current-password"
        autoFocus
        aria-label="Password"
      />
      {LOCK.hint && <p className="lock-hint">Hint: {LOCK.hint}</p>}
      {error && <p className="lock-error" role="alert">{error}</p>}
      <button type="submit" disabled={checking || !value.trim()}>Open</button>
    </form>
  );
}

function Countdown({ diff }) {
  const days = Math.floor(diff / DAY);
  const hours = Math.floor((diff / 3600000) % 24);
  const mins = Math.floor((diff / 60000) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return <p>Opens in {days} days, {hours} hours, {mins} minutes and {secs} seconds.</p>;
}

// Shows its children only once the birthday has arrived and, if a password is set, it has been typed.
export default function LockScreen({ children }) {
  const [now, setNow] = useState(Date.now());
  const [unlocked, setUnlocked] = useState(wasUnlocked);
  const [teasing, setTeasing] = useState(false);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const phase = birthdayPhase(BIRTHDAY.date, now);
  if (PREVIEW || (phase !== "before" && (unlocked || !LOCK.passwordHash))) return children;

  const unlock = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Private browsing can block storage, so he will just type it again next time.
    }
    setUnlocked(true);
  };

  return (
    <>
      <style>{css}</style>
      <div className="lock">
        <div className="lock-card">
          <div className="lock-icon" aria-hidden="true">{phase === "before" ? "🔒" : "🎁"}</div>
          {phase === "before" ? (
            <>
              <h1>Something special is waiting</h1>
              <p>It's not ready to open yet. Come back on your birthday, {BIRTHDAY.name}.</p>
              <Countdown diff={new Date(BIRTHDAY.date).getTime() - now} />
              <button
                className="secondary"
                onClick={() => {
                  setTries((t) => t + 1);
                  setTeasing(true);
                }}
              >
                Open it
              </button>
            </>
          ) : (
            <>
              <h1>It's time</h1>
              <PasswordForm onUnlock={unlock} />
            </>
          )}
        </div>
      </div>
      {phase === "before" && teasing && (
        <div className="tease-bg" onClick={() => setTeasing(false)}>
          <div className="tease" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="lock-icon" aria-hidden="true">🙈</div>
            <p>{TEASES[(tries - 1) % TEASES.length]}</p>
            <button autoFocus onClick={() => setTeasing(false)}>Okay, I'll wait</button>
          </div>
        </div>
      )}
    </>
  );
}
