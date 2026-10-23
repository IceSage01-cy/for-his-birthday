import { useState } from "react";

// Add, remove or rewrite these. Every pull picks one from each list and mixes them,
// so a few lists make hundreds of different date nights.
const ACTIVITIES = [
  "A movie marathon under one blanket",
  "Cooking dinner together",
  "Building a pillow fort",
  "Stargazing from the balcony",
  "A slow dance in the living room",
  "A board game showdown",
  "A silly photo shoot",
  "A lazy morning on the couch",
  "Watching our favorite childhood cartoons",
  "Making a playlist for each other",
  "Baking something we've never tried",
  "A picnic on the living room floor",
  "Writing love notes to read out loud",
  "Planning our dream trip together",
  "Playing a video game together",
  "Giving each other mini massages",
];

const TREATS = [
  "hot chocolate and marshmallows",
  "popcorn with way too much butter",
  "our favorite takeout",
  "a big bowl of ice cream",
  "pancakes for dinner",
  "chips and every dip we own",
  "fresh fruit and chocolate",
  "cookies straight from the oven",
  "milk tea",
  "pizza with the weirdest toppings",
  "a plate of random snacks",
  "warm drinks and a pile of candy",
];

const TWISTS = [
  "No phones until it's over.",
  "Loser does the dishes.",
  "Lights off, candles on.",
  "Each of us picks one song to play.",
  "Compliment each other every ten minutes.",
  "Wear the coziest outfit you own.",
  "Take one photo to remember it.",
  "Start with a hug that lasts a full minute.",
  "Narrate everything in a movie-trailer voice.",
  "Let the other person choose everything.",
  "End the night with one thing you're grateful for.",
  "Swap seats halfway through.",
];

const css = `
  .couch-jar { text-align: center; font-size: 3rem; margin: 0 0 8px; }
  .couch-idea { display: flex; flex-direction: column; gap: 6px; min-height: 84px; justify-content: center; text-align: center; padding: 12px 16px; border-radius: 10px; background: #fff4e8; box-shadow: inset 0 0 0 2px #c4a3b0; line-height: 1.5; animation: couch-fade .35s ease; }
  .couch-idea em { color: #6b6b74; }
  .couch-shuffle { display: block; margin: 12px auto 0; padding: 8px 14px; border: none; border-radius: 8px; background: #5a3a4a; color: #fff; cursor: pointer; font-family: inherit; }
  @keyframes couch-fade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .couch-idea { animation: none; } }
`;

// A random item from the list that is not the one we just showed.
function draw(list, last) {
  let next;
  do next = list[Math.floor(Math.random() * list.length)];
  while (next === last && list.length > 1);
  return next;
}

export default function CouchPicks() {
  const [pick, setPick] = useState(null);

  const shuffle = () =>
    setPick({
      activity: draw(ACTIVITIES, pick?.activity),
      treat: draw(TREATS, pick?.treat),
      twist: draw(TWISTS, pick?.twist),
    });

  return (
    <>
      <style>{css}</style>
      <div className="couch-jar" aria-hidden="true">🫙</div>
      <p>This is our spot. Pull a plan out of the date jar for tonight:</p>
      {pick && (
        <div key={`${pick.activity}${pick.treat}${pick.twist}`} className="couch-idea">
          <strong>{pick.activity}</strong>
          <span>with {pick.treat}.</span>
          <em>{pick.twist}</em>
        </div>
      )}
      <button className="couch-shuffle" onClick={shuffle}>{pick ? "Pull another" : "Pull a plan"}</button>
    </>
  );
}
