import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export const alt = "Times - A fun multiplication game for kids";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const TITLE_LETTERS = [
  { char: "T", color: "#FF3B3B" },
  { char: "i", color: "#FF9500" },
  { char: "m", color: "#FFD60A" },
  { char: "e", color: "#34C759" },
  { char: "s", color: "#00C2FF" },
  { char: "×", color: "#BF5AF2" },
];

// Pre-generated floating symbols positions
const floatingSymbols = [
  { x: 10, y: 15, size: 60, opacity: 0.15, rotation: 15 },
  { x: 85, y: 20, size: 50, opacity: 0.12, rotation: -20 },
  { x: 25, y: 75, size: 45, opacity: 0.1, rotation: 30 },
  { x: 70, y: 80, size: 55, opacity: 0.15, rotation: -10 },
  { x: 5, y: 50, size: 40, opacity: 0.08, rotation: 45 },
  { x: 90, y: 55, size: 65, opacity: 0.12, rotation: -35 },
  { x: 40, y: 10, size: 35, opacity: 0.1, rotation: 20 },
  { x: 55, y: 85, size: 50, opacity: 0.15, rotation: -25 },
  { x: 15, y: 35, size: 42, opacity: 0.1, rotation: 10 },
  { x: 80, y: 40, size: 48, opacity: 0.12, rotation: -15 },
];

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Floating symbols background */}
        {floatingSymbols.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              fontSize: s.size,
              color: "white",
              opacity: s.opacity,
              transform: `rotate(${s.rotation}deg)`,
              fontWeight: "bold",
            }}
          >
            ×
          </div>
        ))}

        {/* Rainbow title */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {TITLE_LETTERS.map((letter, index) => (
            <span
              key={index}
              style={{
                fontSize: 120,
                fontWeight: "bold",
                color: letter.color,
                textShadow: `0 0 30px ${letter.color}, 0 0 60px ${letter.color}`,
                marginLeft: index === 0 ? 0 : -5,
              }}
            >
              {letter.char}
            </span>
          ))}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 36,
            color: "white",
            marginTop: 20,
            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          A fun multiplication game for kids!
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
