"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface ShieldCenterpieceProps {
  /**
   * Set ke true jika file video hasil generate Gemini/Argon Medium sudah ditaruh di:
   * public/assets/shield-intro.mp4
   */
  useCustomVideo?: boolean;
}

export default function ShieldCenterpiece({ useCustomVideo = false }: ShieldCenterpieceProps) {
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="relative w-full h-full flex items-end justify-center pointer-events-none select-none overflow-hidden">
      {/*Jika user sudah menaruh file video shield-intro.mp4 di public/assets/ */}
      {useCustomVideo && !videoError ? (
        <video
          src="/assets/shield-intro.mp4"
          autoPlay
          muted
          playsInline
          onError={() => setVideoError(true)}
          className="w-full h-full object-cover object-center scale-105"
        />
      ) : (
        /* Animasi Fallback Perisai Kaca 3D (Mirip koreografi referensi: meluncur dari kiri-atas dengan motion blur lalu berhenti di tengah-bawah) */
        <motion.div
          initial={{
            x: -360,
            y: -260,
            scale: 0.35,
            rotateY: -40,
            rotateZ: -18,
            opacity: 0,
            filter: "blur(24px)",
          }}
          animate={{
            x: 0,
            y: 25,
            scale: 1,
            rotateY: 0,
            rotateZ: 0,
            opacity: 1,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 1.55,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative z-10 flex items-center justify-center w-[340px] h-[420px] sm:w-[440px] sm:h-[520px] md:w-[500px] md:h-[580px]"
        >
          {/* Cahaya Refraksi di Belakang Perisai */}
          <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-blue-400/40 via-cyan-300/30 to-white/60 blur-3xl animate-pulse" />

          {/* Perisai Kaca Transparan 3D (SVG Hyper-Clean Glassmorphism + Efek Floating) */}
          <div className="relative w-full h-full flex items-center justify-center animate-float-slow">
            <svg
              viewBox="0 0 400 480"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-[0_35px_60px_rgba(37,117,252,0.28)]"
            >
              <defs>
                <linearGradient id="shieldGlassBody" x1="40" y1="20" x2="360" y2="440" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                  <stop offset="35%" stopColor="#93C5FD" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#3B82F6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.65" />
                </linearGradient>

                <linearGradient id="shieldRimBorder" x1="0" y1="0" x2="400" y2="480" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#EFF6FF" stopOpacity="0.9" />
                </linearGradient>

                <linearGradient id="shieldInnerFacet" x1="200" y1="45" x2="200" y2="430" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#EFF6FF" stopOpacity="0.7" />
                  <stop offset="55%" stopColor="#2575FC" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.45" />
                </linearGradient>

                <linearGradient id="specularHighlight" x1="80" y1="60" x2="210" y2="260" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Outer 3D Bevel Extrusion */}
              <path
                d="M200 22L356 82V218C356 332 288 416 200 458C112 416 44 332 44 218V82L200 22Z"
                fill="url(#shieldGlassBody)"
                stroke="url(#shieldRimBorder)"
                strokeWidth="6"
              />

              {/* Inner Bevel Glass Layer */}
              <path
                d="M200 48L330 98V214C330 310 273 383 200 422C127 383 70 310 70 214V98L200 48Z"
                fill="url(#shieldInnerFacet)"
                stroke="#FFFFFF"
                strokeOpacity="0.65"
                strokeWidth="2.5"
              />

              {/* Left Crystal Refraction Facet */}
              <path
                d="M200 48L70 98V214C70 310 127 383 200 422V48Z"
                fill="url(#specularHighlight)"
              />

              {/* Center Vertical Prism Line */}
              <line
                x1="200"
                y1="26"
                x2="200"
                y2="454"
                stroke="#FFFFFF"
                strokeOpacity="0.75"
                strokeWidth="2"
              />

              {/* Glowing Check / Crest Emblem Inside Shield */}
              <g opacity="0.92">
                <circle cx="200" cy="225" r="56" fill="#FFFFFF" fillOpacity="0.28" stroke="#FFFFFF" strokeWidth="2" />
                <path
                  d="M174 226L192 244L230 206"
                  stroke="#FFFFFF"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Top Left Glossy Shine */}
              <ellipse
                cx="132"
                cy="115"
                rx="46"
                ry="16"
                transform="rotate(-22 132 115)"
                fill="#FFFFFF"
                fillOpacity="0.65"
              />
            </svg>
          </div>
        </motion.div>
      )}
    </div>
  );
}
