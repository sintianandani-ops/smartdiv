/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Komponen Balon Dialog Langkah Bertahap bersama Maskot Kak Bagi:
 * - Menampilkan petunjuk pengerjaan langkah demi langkah pada setiap aktivitas.
 * - Dilengkapi penanda langkah (Langkah X/Y), teks instruksi yang jelas,
 *   arahan aksi (pointer visual), dan tombol dengarkan suara Kak Bagi.
 */

import React from 'react';
import { Volume2 } from 'lucide-react';
import { MascotKakBagi } from './MascotKakBagi';
import { audioService } from '../services/audioService';

export interface MascotStepInstructionProps {
  stepNumber?: number;
  totalSteps?: number;
  stepTitle?: string;
  instructionText: string;
  actionHint?: string;
  isSpeaking?: boolean;
  onReplayVoice?: () => void;
  mascotMood?: 'happy' | 'thinking' | 'celebrating' | 'explaining';
  className?: string;
}

export const MascotStepInstruction: React.FC<MascotStepInstructionProps> = ({
  stepNumber,
  totalSteps,
  stepTitle,
  instructionText,
  actionHint,
  isSpeaking = false,
  onReplayVoice,
  mascotMood = 'explaining',
  className = '',
}) => {
  const handlePlayVoice = () => {
    if (onReplayVoice) {
      onReplayVoice();
    } else {
      audioService.playTapSound();
      audioService.speak(instructionText);
    }
  };

  return (
    <div className={`flex items-start gap-2.5 sm:gap-3 bg-white/95 border-2 border-amber-300 rounded-2xl p-2.5 sm:p-3 shadow-sm ${className}`}>
      {/* Maskot Kak Bagi */}
      <div className="shrink-0 flex flex-col items-center">
        <MascotKakBagi
          mood={mascotMood}
          isSpeaking={isSpeaking}
          size="sm"
        />
        <span className="text-[10px] font-black font-heading text-amber-800 mt-0.5">
          Kak Bagi
        </span>
      </div>

      {/* Balon Dialog Langkah */}
      <div className="flex-1 relative bg-amber-50/80 border border-amber-200 rounded-xl p-2 sm:p-2.5 space-y-1">
        {/* Panah Balon mengarah ke Kak Bagi */}
        <div className="absolute top-3 -left-1.5 w-3 h-3 bg-amber-50 border-l border-b border-amber-200 rotate-45 transform" />

        {/* Header Langkah & Tombol Suara */}
        <div className="flex items-center justify-between gap-2 border-b border-amber-200/60 pb-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {stepNumber !== undefined && (
              <span className="px-2 py-0.5 bg-amber-400 text-amber-950 font-black rounded-md text-[10px] uppercase tracking-wide">
                Langkah {stepNumber}{totalSteps ? `/${totalSteps}` : ''}
              </span>
            )}
            {stepTitle && (
              <span className="font-extrabold text-slate-800 text-xs font-heading">
                {stepTitle}
              </span>
            )}
          </div>

          <button
            onClick={handlePlayVoice}
            title="Dengarkan suara Kak Bagi"
            className={`p-1 rounded-lg transition-all shrink-0 active:scale-95 flex items-center gap-1 text-[11px] font-bold ${
              isSpeaking
                ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            <Volume2 className={`w-3.5 h-3.5 text-amber-700 ${isSpeaking ? 'animate-bounce text-white' : ''}`} />
            <span className="hidden sm:inline">Dengar</span>
          </button>
        </div>

        {/* Teks Instruksi */}
        <p className="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug">
          {instructionText}
        </p>

        {/* Arahan Aksi Langsung (Pointer) jika ada */}
        {actionHint && (
          <div className="text-[11px] font-extrabold text-amber-800 flex items-center gap-1 pt-0.5">
            <span className="text-amber-600">👉</span>
            <span>{actionHint}</span>
          </div>
        )}
      </div>
    </div>
  );
};
