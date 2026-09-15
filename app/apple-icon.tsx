import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const iconPath = path.join(process.cwd(), "public", "icon.png");
  const iconBuffer = fs.readFileSync(iconPath);
  const base64 = iconBuffer.toString("base64");
  const dataUrl = `data:image/png;base64,${base64}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: "36px",
          padding: "16px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl}
          alt="Loreno Logo"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: "24px",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
