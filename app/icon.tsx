import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0B132B 0%, #1C2541 100%)",
          borderRadius: "8px",
          border: "2px solid #C59B27",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Royal Gold Medallion Ring */}
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="#E5C158"
            strokeWidth="2.2"
            fill="#0B132B"
          />
          <circle
            cx="32"
            cy="32"
            r="23"
            stroke="#C59B27"
            strokeWidth="1.2"
            strokeDasharray="3 2"
          />
          {/* Crossed Talwar Arcs */}
          <path
            d="M15 49 C24 39, 38 24, 50 13"
            stroke="#C59B27"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M49 49 C40 39, 26 24, 14 13"
            stroke="#C59B27"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Central Dhaal Shield & Sovereign Gold Chakkar */}
          <circle
            cx="32"
            cy="33"
            r="12.5"
            fill="#1C2541"
            stroke="#F59E0B"
            strokeWidth="2.4"
          />
          {/* Central Double-Edged Khanda / Kataar Spire */}
          <path
            d="M32 9 L36.5 34 L32 53 L27.5 34 Z"
            fill="#E5C158"
          />
          {/* 4 Dhaal Shield Bosses */}
          <circle cx="26" cy="28" r="1.6" fill="#FAF7F0" />
          <circle cx="38" cy="28" r="1.6" fill="#FAF7F0" />
          <circle cx="26" cy="38" r="1.6" fill="#FAF7F0" />
          <circle cx="38" cy="38" r="1.6" fill="#FAF7F0" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
