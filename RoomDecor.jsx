import { Box, Plane, hotProps, BACK, FLOOR, LEFT } from "./Parts.jsx";

// The small details around the room: curtains, frames, a teddy, a cat, a candle, and the nightstand.
// The nightstand drawer faces into the room and slides out when it is tapped, with a note inside to open.
export default function RoomDecor({ openPanel, toggleDrawer, drawerOpen, petCat }) {
  const bed = openPanel("bed");
  const slide = drawerOpen ? 4 : 0;
  const wish = openPanel("nightstand");

  return (
    <>
      {/* Curtains and a rod around the window */}
      <Box x={22} y={-19.8} z={BACK + 1.3} w={17} h={0.6} d={0.6} color="#7d5f6e" />
      <Box x={16.4} y={-12} z={BACK + 1.3} w={2.4} h={15.5} d={1.2} color="#c4a3b0" />
      <Box x={27.6} y={-12} z={BACK + 1.3} w={2.4} h={15.5} d={1.2} color="#c4a3b0" />

      {/* Picture frames on the left wall above the bed, and a sound bar under the TV */}
      <Plane w={5} h={6} transform={`translate3d(${LEFT + 0.4}cqw, -7cqw, 1cqw) rotateY(90deg)`} style={{ background: "linear-gradient(#f3d7c9, #c4a3b0)", border: "0.5cqw solid #7d5f6e" }} />
      <Plane w={6.5} h={4.5} transform={`translate3d(${LEFT + 0.4}cqw, -4cqw, 9cqw) rotateY(90deg)`} style={{ background: "linear-gradient(#bfd7e8, #f3e1c0)", border: "0.5cqw solid #7d5f6e" }} />
      <Box x={-2} y={8.4} z={BACK + 2.2} w={14} h={1} d={2.2} color="#2d2d33" />

      {/* Stripes on the blanket and a teddy bear on the bed */}
      {[-19, -15, -11].map((x) => (
        <Box key={x} x={x} y={FLOOR - 11.25} z={9.5} w={1} h={1.5} d={14.2} color="#e8d3dc" label="Bed" onOpen={bed} />
      ))}
      <Box x={-25} y={FLOOR - 12.3} z={11} w={2.8} h={2.6} d={2.4} color="#b98a64" label="Bed" onOpen={bed} />
      <Box x={-25} y={FLOOR - 14.6} z={11} w={2.4} h={2} d={2.2} color="#c99f78" label="Bed" onOpen={bed} />
      <Box x={-25.9} y={FLOOR - 15.9} z={11} w={0.8} h={0.8} d={0.8} color="#b98a64" label="Bed" onOpen={bed} />
      <Box x={-24.1} y={FLOOR - 15.9} z={11} w={0.8} h={0.8} d={0.8} color="#b98a64" label="Bed" onOpen={bed} />
      <Box x={-25} y={FLOOR - 14.3} z={12.2} w={1} h={0.8} d={0.4} color="#f3dcc4" label="Bed" onOpen={bed} />
      <Box x={-25} y={FLOOR - 14.7} z={12.45} w={0.4} h={0.3} d={0.2} color="#3d2b22" label="Bed" onOpen={bed} />

      {/* Nightstand with a clock and books on top, and a drawer on the side facing the room that slides open */}
      <Box x={-30} y={FLOOR - 5} z={-8} w={7} h={10} d={7} color="#8a8a92" label="Nightstand" onOpen={toggleDrawer} />
      <Box x={-31.5} y={FLOOR - 10.9} z={-8} w={1.4} h={1.8} d={2.6} color="#f3eee6" label="Nightstand" onOpen={toggleDrawer} />
      <Box x={-28.2} y={FLOOR - 10.4} z={-8} w={2.2} h={0.8} d={3} color="#c4a3b0" label="Nightstand" onOpen={toggleDrawer} />
      <Box x={-28.2} y={FLOOR - 11.2} z={-8} w={2} h={0.7} d={2.6} color="#6f8f6a" label="Nightstand" onOpen={toggleDrawer} />
      <Box x={-26.3} y={FLOOR - 3} z={-8} w={0.4} h={3.4} d={5.6} color="#9a9aa3" label="Nightstand" onOpen={toggleDrawer} />
      <Box x={-25.95} y={FLOOR - 3} z={-8} w={0.4} h={0.5} d={1.4} color="#f7d58b" label="Nightstand" onOpen={toggleDrawer} />
      <Box x={-26.1 + slide} y={FLOOR - 7} z={-8} w={0.8} h={3.4} d={5.6} color="#9a9aa3" label="Nightstand drawer" onOpen={drawerOpen ? wish : toggleDrawer} />
      <Box x={-25.45 + slide} y={FLOOR - 7} z={-8} w={0.5} h={0.5} d={1.4} color="#f7d58b" label="Nightstand drawer" onOpen={drawerOpen ? wish : toggleDrawer} />
      {drawerOpen && (
        <>
          <Box x={-24.5} y={FLOOR - 5.7} z={-8} w={4} h={0.6} d={5.2} color="#7a7a82" label="Goodnight note" onOpen={wish} />
          <Box x={-24.5} y={FLOOR - 6.3} z={-8} w={2.8} h={0.5} d={4} color="#fffaf0" label="Goodnight note" onOpen={wish} />
          <Box x={-24.5} y={FLOOR - 6.75} z={-8} w={0.9} h={0.3} d={0.9} color="#e8a7b8" label="Goodnight note" onOpen={wish} />
        </>
      )}

      {/* A cat asleep on the couch: tap it for hearts */}
      <Box x={2} y={FLOOR - 9.1} z={BACK + 10} w={5} h={2.2} d={3} color="#d9a066" label="Cat" onOpen={petCat} />
      <Box x={4.9} y={FLOOR - 9.7} z={BACK + 10.4} w={2.2} h={2} d={2.2} color="#e0ad74" label="Cat" onOpen={petCat} />
      <Box x={4.3} y={FLOOR - 11} z={BACK + 10.4} w={0.6} h={0.7} d={0.5} color="#c4864a" label="Cat" onOpen={petCat} />
      <Box x={5.5} y={FLOOR - 11} z={BACK + 10.4} w={0.6} h={0.7} d={0.5} color="#c4864a" label="Cat" onOpen={petCat} />
      <Box x={-1} y={FLOOR - 9} z={BACK + 10} w={1.8} h={0.7} d={0.7} color="#c4864a" label="Cat" onOpen={petCat} />

      {/* A rim on the plant pot */}
      <Box x={24} y={FLOOR - 5.2} z={14} w={5.6} h={0.8} d={5.6} color="#c99f8a" />

      {/* A lace runner, a candle and a book on the side table */}
      <Plane w={10} h={7} transform={`translate3d(-14cqw, ${FLOOR - 12.05}cqw, 24cqw) rotateX(90deg)`} style={{ background: "repeating-linear-gradient(90deg, #f5ece0 0 1cqw, #e6d9c6 1cqw 1.4cqw)" }} />
      <Box x={-9.6} y={FLOOR - 13.5} z={25} w={1.6} h={3} d={1.6} color="#f7ecd6" />
      <Box x={-9.6} y={FLOOR - 15.5} z={25} w={0.7} h={1} d={0.7} color="#ffd27a" />
      <Box x={-18.5} y={FLOOR - 12.45} z={24.5} w={2.6} h={0.9} d={3.6} color="#6f8f6a" />
    </>
  );
}
