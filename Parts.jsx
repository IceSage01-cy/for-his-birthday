// Room sizes are percentages of the scene width (cqw), centred on the origin.
export const W = 70;
export const H = 50;
export const D = 56;
export const FLOOR = H / 2;
export const BACK = -D / 2;
export const LEFT = -W / 2;

export function hotProps(label, onOpen) {
  return {
    role: "button",
    tabIndex: 0,
    "aria-label": label,
    onClick: onOpen,
    onKeyDown: (e) => {
      if (e.key === "Enter") onOpen();
    },
  };
}

// A flat panel. w and h are its size, and transform places it in the room.
export function Plane({ w, h, transform, className = "", style, children, ...rest }) {
  return (
    <div
      className={`plane ${className}`}
      style={{
        width: `${w}cqw`,
        height: `${h}cqw`,
        marginLeft: `${-w / 2}cqw`,
        marginTop: `${-h / 2}cqw`,
        transform,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

// A solid block: w is its width (x), h its height (y), d its depth (z), centred on (x, y, z).
export function Box({ x = 0, y = 0, z = 0, w, h, d, color, label, onOpen }) {
  const faces = { background: color };
  return (
    <div
      className={`cuboid${onOpen ? " hot" : ""}`}
      style={{ transform: `translate3d(${x}cqw, ${y}cqw, ${z}cqw)` }}
      {...(onOpen ? hotProps(label, onOpen) : {})}
    >
      <Plane w={w} h={h} transform={`translateZ(${d / 2}cqw)`} style={faces} />
      <Plane w={w} h={h} className="side" transform={`rotateY(180deg) translateZ(${d / 2}cqw)`} style={faces} />
      <Plane w={d} h={h} className="side" transform={`rotateY(-90deg) translateZ(${w / 2}cqw)`} style={faces} />
      <Plane w={d} h={h} className="side" transform={`rotateY(90deg) translateZ(${w / 2}cqw)`} style={faces} />
      <Plane w={w} h={d} className="top" transform={`rotateX(90deg) translateZ(${h / 2}cqw)`} style={faces} />
    </div>
  );
}
