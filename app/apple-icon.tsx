import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0B132B 0%, #1C2541 60%, #0F172A 100%)",
          borderRadius: "40px",
          border: "6px solid #C59B27",
          boxSizing: "border-box",
        }}
      >
        <svg
          width="144"
          height="144"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Medallion Rings */}
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="#0B132B"
            stroke="#E5C158"
            strokeWidth="3.5"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            stroke="#C59B27"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          {/* Crossed Talwar Swords */}
          <path
            d="M24 94 C44 74, 68 46, 102 16 C94 30, 70 58, 30 98 Z"
            fill="#E5C158"
            stroke="#C59B27"
            strokeWidth="1.5"
          />
          <path
            d="M96 94 C76 74, 52 46, 18 16 C26 30, 50 58, 90 98 Z"
            fill="#E5C158"
            stroke="#C59B27"
            strokeWidth="1.5"
          />
          {/* Central Dhaal Shield */}
          <circle
            cx="60"
            cy="60"
            r="32"
            fill="#1C2541"
            stroke="#F59E0B"
            strokeWidth="3.5"
          />
          <circle
            cx="60"
            cy="60"
            r="26"
            stroke="#E5C158"
            strokeWidth="1.2"
          />
          {/* 4 Shield Bosses */}
          <circle cx="46" cy="47" r="3.5" fill="#E5C158" />
          <circle cx="74" cy="47" r="3.5" fill="#E5C158" />
          <circle cx="46" cy="73" r="3.5" fill="#E5C158" />
          <circle cx="74" cy="73" r="3.5" fill="#E5C158" />
          {/* Central Kataar / Khanda Blade */}
          <path
            d="M60 12 L68 58 H52 Z"
            fill="#FAF7F0"
            stroke="#C59B27"
            strokeWidth="2"
          />
          <rect x="50" y="57" width="20" height="4" rx="2" fill="#F59E0B" />
          <rect x="52" y="61" width="3.5" height="28" rx="1.5" fill="#E5C158" />
          <rect x="64.5" y="61" width="3.5" height="28" rx="1.5" fill="#E5C158" />
          <rect x="54" y="71" width="12" height="3" rx="1.5" fill="#F59E0B" />
          <rect x="54" y="76" width="12" height="3" rx="1.5" fill="#F59E0B" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
