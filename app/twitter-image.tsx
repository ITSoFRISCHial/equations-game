import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Equations - A fun math game for kids";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const TITLE_LETTERS = [
  { char: "E", color: "#FF0000" },
  { char: "q", color: "#FF7F00" },
  { char: "u", color: "#FFFF00" },
  { char: "a", color: "#00FF00" },
  { char: "+", color: "#0000FF" },
  { char: "i", color: "#4B0082" },
  { char: "o", color: "#9400D3" },
  { char: "n", color: "#FF0000" },
  { char: "s", color: "#FF7F00" },
];

const floatingSymbols = [
  { x: 10, y: 15, symbol: "+", size: 60, opacity: 0.15, rotation: 15 },
  { x: 85, y: 20, symbol: "-", size: 50, opacity: 0.12, rotation: -20 },
  { x: 25, y: 75, symbol: "+", size: 45, opacity: 0.1, rotation: 30 },
  { x: 70, y: 80, symbol: "-", size: 55, opacity: 0.15, rotation: -10 },
  { x: 5, y: 50, symbol: "-", size: 40, opacity: 0.08, rotation: 45 },
  { x: 90, y: 55, symbol: "+", size: 65, opacity: 0.12, rotation: -35 },
  { x: 40, y: 10, symbol: "-", size: 35, opacity: 0.1, rotation: 20 },
  { x: 55, y: 85, symbol: "+", size: 50, opacity: 0.15, rotation: -25 },
  { x: 15, y: 35, symbol: "+", size: 42, opacity: 0.1, rotation: 10 },
  { x: 80, y: 40, symbol: "-", size: 48, opacity: 0.12, rotation: -15 },
];

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #ef4444 100%)",
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
            {s.symbol}
          </div>
        ))}

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

        <div
          style={{
            fontSize: 36,
            color: "white",
            marginTop: 20,
            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          A fun math game for kids!
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
