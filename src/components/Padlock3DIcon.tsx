"use client";

import React, { useState } from "react";

/**
 * Komponen Ikon Gembok 3D Transparan.
 * Jika Anda menaruh file gembok transparan Anda di `public/assets/padlock-3d.png`,
 * komponen ini otomatis memakainya. Jika belum ada, akan menampilkan SVG Gembok 3D Kaca.
 */
export default function Padlock3DIcon() {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img
        src="/assets/padlock-3d.png"
        alt="Gembok Transparan 3D"
        onError={() => setImgError(true)}
        className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_12px_20px_rgba(15,23,42,0.25)] select-none"
      />
    );
  }

  return (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0">
      <svg
        viewBox="0 0 120 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_12px_24px_rgba(30,58,138,0.32)]"
      >
        <defs>
          <linearGradient id="shackleGrad" x1="30" y1="10" x2="90" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#93C5FD" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="bodyGrad" x1="15" y1="55" x2="105" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="45%" stopColor="#BFDBFE" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Gagang Gembok (Shackle) */}
        <path
          d="M36 60V38C36 24.7452 46.7452 14 60 14C73.2548 14 84 24.7452 84 38V60"
          stroke="url(#shackleGrad)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M36 60V38C36 24.7452 46.7452 14 60 14"
          stroke="#FFFFFF"
          strokeOpacity="0.85"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Bodi Gembok Kaca Transparan */}
        <rect
          x="18"
          y="54"
          width="84"
          height="74"
          rx="22"
          fill="url(#bodyGrad)"
          stroke="#FFFFFF"
          strokeOpacity="0.8"
          strokeWidth="3"
        />

        {/* Kilau Kaca Kiri Atas */}
        <path
          d="M26 72C26 65.3726 31.3726 60 38 60H64"
          stroke="#FFFFFF"
          strokeOpacity="0.9"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Lubang Kunci Menyala */}
        <circle cx="60" cy="86" r="8" fill="#FFFFFF" fillOpacity="0.9" />
        <path
          d="M56 90L54 106H66L64 90H56Z"
          fill="#FFFFFF"
          fillOpacity="0.9"
        />
      </svg>
    </div>
  );
}
