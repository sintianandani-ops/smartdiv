/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Maskot Kak Bagi:
 * Karakter pemandu berbentuk bulat imut bertopi petualang dengan simbol pembagian (÷).
 * Mulut bergerak sinkron saat narasi bersuara aktif, mata berkedip ceria,
 * tangan melambai ramah, dan animasi tubuh mengangguk / melompat.
 */

import React, { useEffect, useState } from 'react';

interface MascotProps {
  isSpeaking?: boolean;
  mood?: 'happy' | 'thinking' | 'explaining' | 'celebrating';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  speechBubbleText?: string;
  onBubbleClick?: () => void;
}

export const MascotKakBagi: React.FC<MascotProps> = ({
  isSpeaking = false,
  mood = 'happy',
  size = 'md',
  className = '',
  speechBubbleText,
  onBubbleClick,
}) => {
  const [blink, setBlink] = useState(false);

  // Efek kedip alami setiap beberapa detik
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  const sizeDimensions = {
    xs: 'w-10 h-10',
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-26 h-26',
  }[size];

  return (
    <div className={`relative flex items-center gap-3 select-none ${className}`}>
      {/* Speech bubble jika ada teks singkat */}
      {speechBubbleText && (
        <div
          onClick={onBubbleClick}
          className={`cursor-pointer max-w-xs bg-white text-slate-800 text-sm font-semibold rounded-2xl px-3.5 py-2 shadow-md border-2 border-amber-300 relative transition-transform hover:scale-105 active:scale-95 ${
            isSpeaking ? 'ring-2 ring-amber-400 bg-amber-50' : ''
          }`}
        >
          <span>{speechBubbleText}</span>
          {/* Segitiga panah balon */}
          <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-amber-300" />
        </div>
      )}

      {/* Wadah Karakter Kak Bagi */}
      <div
        className={`relative ${sizeDimensions} transition-transform duration-300 ${
          mood === 'celebrating' ? 'animate-bounce' : 'animate-bounce-slow'
        }`}
      >
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-lg overflow-visible"
        >
          <defs>
            {/* Gradasi warna tubuh oranye-kuning lembut */}
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* Gradasi topi petualang safari */}
            <linearGradient id="hatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Bayangan halus */}
            <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.25)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>

          {/* Bayangan di lantai */}
          <ellipse cx="60" cy="114" rx="34" ry="6" fill="url(#shadowGrad)" />

          {/* Kaki bulat kecil */}
          <circle cx="46" cy="104" r="7" fill="#D97706" />
          <circle cx="74" cy="104" r="7" fill="#D97706" />

          {/* Tangan kiri & kanan */}
          <circle
            cx="24"
            cy="72"
            r="8"
            fill="#FBBF24"
            stroke="#D97706"
            strokeWidth="2"
            className={mood === 'celebrating' || isSpeaking ? 'animate-wave origin-center' : ''}
          />
          <circle
            cx="96"
            cy="72"
            r="8"
            fill="#FBBF24"
            stroke="#D97706"
            strokeWidth="2"
          />

          {/* Tubuh utama (lingkaran bulat gembul) */}
          <circle
            cx="60"
            cy="68"
            r="40"
            fill="url(#bodyGrad)"
            stroke="#D97706"
            strokeWidth="3.5"
          />

          {/* Rona pipi merah muda (blush) */}
          <ellipse cx="38" cy="74" rx="6" ry="4" fill="#FDA4AF" opacity="0.8" />
          <ellipse cx="82" cy="74" rx="6" ry="4" fill="#FDA4AF" opacity="0.8" />

          {/* Mata */}
          {blink ? (
            // Garis saat berkedip
            <>
              <line x1="42" y1="64" x2="52" y2="64" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
              <line x1="68" y1="64" x2="78" y2="64" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : (
            // Mata terbuka ramah berbinar
            <>
              <circle cx="47" cy="62" r="5.5" fill="#78350F" />
              <circle cx="49" cy="60" r="2" fill="#FFFFFF" />
              <circle cx="73" cy="62" r="5.5" fill="#78350F" />
              <circle cx="75" cy="60" r="2" fill="#FFFFFF" />
            </>
          )}

          {/* Alis ekspresif */}
          {mood === 'thinking' ? (
            <>
              <path d="M 43 53 Q 48 49 53 53" fill="none" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 67 55 Q 72 57 77 53" fill="none" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M 42 54 Q 47 50 52 54" fill="none" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 68 54 Q 73 50 78 54" fill="none" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
            </>
          )}

          {/* Mulut yang bergerak saat bersuara (isSpeaking) */}
          {isSpeaking ? (
            <ellipse
              cx="60"
              cy="76"
              rx="6"
              ry="7"
              fill="#991B1B"
              stroke="#78350F"
              strokeWidth="1.5"
              className="animate-mouth origin-center"
            >
              <ellipse cx="60" cy="78" rx="4" ry="3" fill="#F43F5E" />
            </ellipse>
          ) : (
            // Senyum manis saat tenang
            <path
              d="M 52 74 Q 60 82 68 74"
              fill="none"
              stroke="#78350F"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}

          {/* Topi Petualang Safari Kak Bagi */}
          {/* Daun tepi topi */}
          <ellipse cx="60" cy="38" rx="38" ry="8" fill="#047857" />
          <ellipse cx="60" cy="36" rx="36" ry="7" fill="url(#hatGrad)" />

          {/* Kubah topi */}
          <path
            d="M 38 36 C 38 18, 82 18, 82 36 Z"
            fill="url(#hatGrad)"
            stroke="#047857"
            strokeWidth="2"
          />

          {/* Pita Topi Cokelat / Emas */}
          <path
            d="M 39 34 Q 60 37 81 34"
            fill="none"
            stroke="#FDE047"
            strokeWidth="4"
          />

          {/* Lambang Pembagian Emas (÷) di Pita Topi */}
          <circle cx="60" cy="25" r="2.2" fill="#FEF08A" />
          <line x1="53" y1="29" x2="67" y2="29" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="60" cy="33" r="2.2" fill="#FEF08A" />
        </svg>
      </div>
    </div>
  );
};
