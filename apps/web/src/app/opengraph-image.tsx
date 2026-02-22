import { siteConfig } from "@/config/site";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = siteConfig.name;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(124, 58, 237, 0.12) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.12) 0%, transparent 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              background: "linear-gradient(90deg, #7c3aed 0%, #3b82f6 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            BetaVersion.IO
          </span>
          <div
            style={{
              fontSize: "36px",
              color: "#e4e4e7",
              textAlign: "center",
              maxWidth: "800px",
              lineHeight: 1.5,
              marginTop: "16px",
            }}
          >
            The Developer Identity Platform
          </div>
          <div
            style={{
              fontSize: "22px",
              color: "#a1a1aa",
              textAlign: "center",
              maxWidth: "700px",
              marginTop: "16px",
            }}
          >
            Portfolio, resume, projects, feed, and ideas — unified under one
            subdomain.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "48px",
          }}
        >
          {["Portfolio", "Resume", "Projects", "Feed", "Ideas"].map((item) => (
            <div
              key={item}
              style={{
                padding: "8px 20px",
                borderRadius: "9999px",
                border: "1px solid rgba(124, 58, 237, 0.4)",
                background: "rgba(124, 58, 237, 0.15)",
                color: "#a78bfa",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
