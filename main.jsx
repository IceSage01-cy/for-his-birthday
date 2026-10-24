import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import LockScreen from "./LockScreen.jsx";

// The room is only loaded once the lock opens.
const BirthdayRoom = lazy(() => import("./index.jsx"));

createRoot(document.getElementById("root")).render(
  <LockScreen>
    <Suspense fallback={null}>
      <BirthdayRoom />
    </Suspense>
  </LockScreen>,
);
