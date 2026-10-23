import { useEffect, useRef, useState } from "react";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Turning, zooming and panning the room with a mouse, a trackpad or fingers.
// One finger or the mouse turns the room, or pans it once zoomed in. Two fingers pinch to zoom.
export function useRoomView() {
  const [yaw, setYaw] = useState(-45);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const sceneRef = useRef(null);
  const pointers = useRef(new Map());
  const drag = useRef(null);
  const pinch = useRef(null);
  const moved = useRef(false);

  const clampPan = (p, z) => {
    const limit = ((z - 1) * (sceneRef.current?.clientWidth ?? 600)) / 2;
    return { x: clamp(p.x, -limit, limit), y: clamp(p.y, -limit, limit) };
  };

  // Keep the room in view when zooming out, and recentre it at normal size.
  useEffect(() => {
    setPan((p) => clampPan(p, zoom));
  }, [zoom]);

  // Ctrl or Cmd with the wheel zooms, which is also what a trackpad pinch sends.
  useEffect(() => {
    const el = sceneRef.current;
    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => clamp(z * Math.exp(-e.deltaY * 0.01), MIN_ZOOM, MAX_ZOOM));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      drag.current = { x: e.clientX, y: e.clientY, yaw, pan };
      moved.current = false;
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: distance(a, b), zoom };
      drag.current = null;
      moved.current = true;
    }
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      setZoom(clamp(pinch.current.zoom * (distance(a, b) / pinch.current.dist), MIN_ZOOM, MAX_ZOOM));
      return;
    }

    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
    if (zoom > 1) setPan(clampPan({ x: drag.current.pan.x + dx, y: drag.current.pan.y + dy }, zoom));
    else setYaw(drag.current.yaw + dx * 0.4);
  };

  const endDrag = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    drag.current = null;
  };

  return {
    yaw,
    zoom,
    pan,
    sceneRef,
    moved,
    sceneProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerLeave: endDrag,
      onPointerCancel: endDrag,
      // Zoomed in, the scene takes over touch so panning doesn't scroll the page.
      style: { touchAction: zoom > 1 ? "none" : "pan-y", overflow: zoom > 1 ? "hidden" : "visible" },
    },
    turn: (degrees) => setYaw((y) => y + degrees),
    zoomBy: (amount) => setZoom((z) => clamp(z + amount, MIN_ZOOM, MAX_ZOOM)),
    reset: () => {
      setZoom(MIN_ZOOM);
      setYaw(-45);
    },
  };
}

const css = `
  .view-controls { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
  .view-controls button { min-width: 44px; min-height: 44px; padding: 0 14px; border: none; border-radius: 10px; background: #5a3a4a; color: #fff; font-size: 1.2rem; font-family: inherit; cursor: pointer; }
  .view-controls button:disabled { opacity: .4; cursor: default; }
`;

export function RoomControls({ view }) {
  return (
    <>
      <style>{css}</style>
      <div className="view-controls" role="group" aria-label="Room view">
        <button onClick={() => view.turn(-30)} aria-label="Turn the room left">⟲</button>
        <button onClick={() => view.zoomBy(-0.5)} aria-label="Zoom out" disabled={view.zoom <= MIN_ZOOM}>−</button>
        <button onClick={view.reset} aria-label="Reset the view">Reset</button>
        <button onClick={() => view.zoomBy(0.5)} aria-label="Zoom in" disabled={view.zoom >= MAX_ZOOM}>+</button>
        <button onClick={() => view.turn(30)} aria-label="Turn the room right">⟳</button>
      </div>
    </>
  );
}
