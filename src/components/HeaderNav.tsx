/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Bilah Atas Universal (Header Nav) SMART-DIV:
 * Berdasarkan Temuan Validasi Ahli Media No. 1:
 * - Tombol Beranda (Home)
 * - Tombol Kembali (Back)
 * - Judul bagian/modul yang sedang dibuka
 * - Tombol Bantuan (Help / Cara Bermain)
 * - Tombol Ulangi Suara Kak Bagi
 * - Kontrol Volume & Bisu Suara
 * - Tombol Materi Konsep (nonaktif saat tes untuk menjaga validitas)
 * - Stepper / Peta Mini Hierarki Lengkap:
 *   Misi Awal -> Ingat Perkalian -> Konsep 1 -> Konsep 2 -> Konsep 3 -> Level 1 -> Level 2 -> Level 3 -> Misi Akhir -> Pendapatmu
 */

import React, { useState } from 'react';
import {
  Home, ArrowLeft, HelpCircle, RotateCcw, BookOpen,
  Volume2, VolumeX, Shield, Check, ChevronDown, ChevronUp, Lock
} from 'lucide-react';
import { audioService } from '../services/audioService';
import { StudentProgress } from '../services/storageService';

export interface HeaderNavProps {
  studentCode: string | null;
  currentStep: string;
  stepTitle?: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onReplayVoice: () => void;
  onOpenConceptsModal: () => void;
  onOpenResearcherPanel: () => void;
  onOpenHelp: () => void;
  onGoHome: () => void;
  onGoBack: () => void;
  onJumpToStep?: (stepId: string) => void;
  progress?: StudentProgress | null;
  isSpeaking: boolean;
  canOpenConcepts: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  studentCode,
  currentStep,
  stepTitle,
  isMuted,
  onToggleMute,
  onReplayVoice,
  onOpenConceptsModal,
  onOpenResearcherPanel,
  onOpenHelp,
  onGoHome,
  onGoBack,
  onJumpToStep,
  progress,
  isSpeaking,
  canOpenConcepts,
}) => {
  const [isStepperExpanded, setIsStepperExpanded] = useState(false);
  const isTestPhase = currentStep === 'pretest' || currentStep === 'posttest';

  // Hierarki 10 Langkah Belajar SMART-DIV
  const hierarchySteps = [
    { id: 'pretest', label: 'Misi Awal', short: 'Awal' },
    { id: 'ingat_perkalian', label: 'Ingat Perkalian', short: 'Ingat' },
    { id: 'concept1', label: 'Konsep 1', short: 'K-1' },
    { id: 'concept2', label: 'Konsep 2', short: 'K-2' },
    { id: 'concept3', label: 'Konsep 3', short: 'K-3' },
    { id: 'level1', label: 'Level 1: Kelereng', short: 'L-1' },
    { id: 'level2', label: 'Level 2: Pasangan', short: 'L-2' },
    { id: 'level3', label: 'Level 3: Kotak Nol', short: 'L-3' },
    { id: 'posttest', label: 'Misi Akhir', short: 'Akhir' },
    { id: 'survey', label: 'Pendapatmu', short: 'Angket' },
  ];

  // Helper untuk menentukan status setiap langkah (selesai, sekarang, atau terkunci)
  const getStepStatus = (stepId: string): 'done' | 'current' | 'locked' => {
    if (!progress) return 'locked';

    // Pemetaan posisi
    const order = ['pretest', 'ingat_perkalian', 'concepts', 'map', 'level1', 'level2', 'level3', 'posttest', 'survey', 'certificate'];
    const currentOrderIdx = order.indexOf(currentStep);

    // Misi Awal
    if (stepId === 'pretest') {
      if (currentStep === 'pretest') return 'current';
      if (currentOrderIdx > order.indexOf('pretest')) return 'done';
      return 'current';
    }

    // Ingat Perkalian
    if (stepId === 'ingat_perkalian') {
      if (currentStep === 'ingat_perkalian') return 'current';
      if (currentOrderIdx > order.indexOf('ingat_perkalian')) return 'done';
      if (currentOrderIdx < order.indexOf('ingat_perkalian')) return 'locked';
      return 'locked';
    }

    // Konsep 1, 2, 3
    if (stepId === 'concept1') {
      if (currentStep === 'concepts') return 'current';
      if (progress.conceptsDone[0] || currentOrderIdx > order.indexOf('concepts')) return 'done';
      return currentOrderIdx >= order.indexOf('concepts') ? 'current' : 'locked';
    }
    if (stepId === 'concept2') {
      if (progress.conceptsDone[1] || currentOrderIdx > order.indexOf('concepts')) return 'done';
      return progress.conceptsDone[0] ? 'current' : 'locked';
    }
    if (stepId === 'concept3') {
      if (progress.conceptsDone[2] || currentOrderIdx > order.indexOf('concepts')) return 'done';
      return progress.conceptsDone[1] ? 'current' : 'locked';
    }

    // Level 1, 2, 3
    if (stepId === 'level1') {
      if (currentStep === 'level1') return 'current';
      if (progress.stars.level1 > 0 || progress.unlockedLevel > 1) return 'done';
      return currentOrderIdx >= order.indexOf('map') ? 'current' : 'locked';
    }
    if (stepId === 'level2') {
      if (currentStep === 'level2') return 'current';
      if (progress.stars.level2 > 0 || progress.unlockedLevel > 2) return 'done';
      return progress.unlockedLevel >= 2 ? 'current' : 'locked';
    }
    if (stepId === 'level3') {
      if (currentStep === 'level3') return 'current';
      if (progress.stars.level3 > 0 || progress.unlockedLevel > 3) return 'done';
      return progress.unlockedLevel >= 3 ? 'current' : 'locked';
    }

    // Posttest
    if (stepId === 'posttest') {
      if (currentStep === 'posttest') return 'current';
      if (currentOrderIdx > order.indexOf('posttest')) return 'done';
      return progress.unlockedLevel > 3 ? 'current' : 'locked';
    }

    // Pendapatmu
    if (stepId === 'survey') {
      if (currentStep === 'survey') return 'current';
      if (currentStep === 'certificate') return 'done';
      return 'locked';
    }

    return 'locked';
  };

  // Judul bawaan berdasarkan currentStep
  const getDefaultTitle = () => {
    switch (currentStep) {
      case 'pretest': return 'Misi Awal (Pretest Diagnostik)';
      case 'ingat_perkalian': return 'Ingat Perkalian (Fondasi Belajar)';
      case 'concepts': return 'Belajar Konsep Pembagian (3D)';
      case 'map': return 'Peta Tiga Pulau Petualangan';
      case 'level1': return 'Level 1: Pulau Kelereng (Habis & Bersisa)';
      case 'level2': return 'Level 2: Pulau Pasangan (Kebalikan Perkalian)';
      case 'level3': return 'Level 3: Pulau Kotak Kosong (Pembagian Nol)';
      case 'posttest': return 'Misi Akhir (Posttest N-Gain)';
      case 'survey': return 'Pendapatmu (Angket Respon Siswa)';
      case 'certificate': return 'Piagam Sertifikat Petualang';
      default: return 'Petualangan Pembagian';
    }
  };

  const activeTitle = stepTitle || getDefaultTitle();

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-amber-200 shadow-xs shrink-0">
      {/* Baris Utama Bilah Atas */}
      <div className="max-w-7xl mx-auto px-2.5 py-1.5 sm:px-4 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Sisi Kiri: Tombol Beranda, Tombol Kembali, & Judul Bagian */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {/* Tombol Beranda */}
          <button
            onClick={() => {
              audioService.playTapSound();
              onGoHome();
            }}
            title="Kembali ke Beranda"
            className="p-1.5 sm:p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold active:scale-95 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Home className="w-4 h-4 text-amber-900" />
            <span className="hidden md:inline text-xs font-black">Beranda</span>
          </button>

          {/* Tombol Kembali */}
          <button
            onClick={() => {
              audioService.playTapSound();
              onGoBack();
            }}
            title="Kembali ke langkah atau layar sebelumnya"
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold active:scale-95 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
            <span className="hidden md:inline text-xs font-black">Kembali</span>
          </button>

          {/* Judul Bagian yang Sedang Dibuka */}
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-black text-slate-900 font-heading truncate max-w-[140px] sm:max-w-xs md:max-w-md">
              {activeTitle}
            </span>
            {studentCode && (
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 truncate">
                Petualang: <strong className="text-amber-950 font-black">{studentCode}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Sisi Kanan: Bantuan, Ulangi Suara, Konsep, Volume, Panel Guru */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Tombol Bantuan (Cara Bermain) */}
          <button
            onClick={() => {
              audioService.playTapSound();
              onOpenHelp();
            }}
            title="Buka Petunjuk Penggunaan & Cara Bermain"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-950 border border-sky-300 font-extrabold text-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <HelpCircle className="w-4 h-4 text-sky-700" />
            <span className="hidden sm:inline">Bantuan</span>
          </button>

          {/* Tombol Ulangi Suara */}
          <button
            onClick={() => {
              audioService.playTapSound();
              onReplayVoice();
            }}
            title="Dengarkan kembali suara penjelasan Kak Bagi"
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1 active:scale-95 transition-all shadow-xs cursor-pointer ${
              isSpeaking
                ? 'bg-amber-500 text-white ring-2 ring-amber-300 animate-pulse'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Ulangi Suara</span>
          </button>

          {/* Tombol Materi Konsep (Nonaktif saat Tes) */}
          <button
            onClick={() => {
              if (canOpenConcepts) {
                audioService.playTapSound();
                onOpenConceptsModal();
              }
            }}
            disabled={!canOpenConcepts}
            title={
              isTestPhase
                ? 'Materi Konsep dinonaktifkan selama Misi Tes'
                : 'Buka Ringkasan Materi Pembagian'
            }
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
              canOpenConcepts
                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 active:scale-95 cursor-pointer shadow-xs'
                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden md:inline">Materi Konsep</span>
          </button>

          {/* Kontrol Bisu / Volume */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
            className={`p-1.5 sm:p-2 rounded-xl border font-bold text-xs flex items-center transition-all active:scale-95 cursor-pointer ${
              isMuted
                ? 'bg-rose-100 border-rose-300 text-rose-700'
                : 'bg-amber-100 border-amber-300 text-amber-900'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Toggle Stepper Mini */}
          <button
            onClick={() => setIsStepperExpanded(!isStepperExpanded)}
            title="Lihat Peta Hierarki Belajar"
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-black text-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <span className="hidden lg:inline text-[11px]">Peta Posisi</span>
            {isStepperExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Akses Panel Peneliti / Guru */}
          <button
            onClick={onOpenResearcherPanel}
            title="Masuk ke Panel Guru & Peneliti"
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 active:scale-95 transition-all cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Baris Stepper Hierarki (Bisa Dilihat atau Ditutup) */}
      {isStepperExpanded && (
        <div className="bg-amber-50/95 border-t border-amber-200 px-3 py-2 overflow-x-auto transition-all animate-fadeIn">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 min-w-[720px]">
            {hierarchySteps.map((hs, index) => {
              const status = getStepStatus(hs.id);
              const isClickable = (status === 'done' || status === 'current') && onJumpToStep && !isTestPhase;

              return (
                <div key={hs.id} className="flex items-center gap-1 flex-1">
                  <button
                    onClick={() => {
                      if (isClickable && onJumpToStep) {
                        audioService.playTapSound();
                        onJumpToStep(hs.id);
                      }
                    }}
                    disabled={!isClickable}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all w-full justify-center ${
                      status === 'current'
                        ? 'bg-amber-500 text-white ring-2 ring-amber-300 shadow-xs'
                        : status === 'done'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200 cursor-pointer'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {status === 'done' ? (
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    ) : status === 'locked' ? (
                      <Lock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-white shrink-0 animate-ping" />
                    )}
                    <span className="truncate">{hs.short}</span>
                  </button>
                  {index < hierarchySteps.length - 1 && (
                    <span className="text-amber-300 text-[10px] font-bold">›</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
