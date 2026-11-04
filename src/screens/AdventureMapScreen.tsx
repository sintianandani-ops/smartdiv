/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Layar Peta Petualangan Tiga Pulau (SMART-DIV):
 * Berdasarkan Temuan Validasi Ahli Media No. 3 & 8:
 * - Dua Kartu Pilihan Mode Jelas: "Main 3D (tanpa kamera)" vs "Main dengan Kamera (AR)"
 * - Deteksi otomatis kamera dengan fallback ramah
 * - Akses tombol "Penanda Kamera" (Cetak & Uji Kamera) dan "Rencana Belajar"
 * - Estimasi durasi per pulau (10 menit tiap level)
 * - Tampilan ramah anak, kontras tinggi, bebas overflow
 */

import React, { useEffect, useState } from 'react';
import { Star, Lock, Play, Sparkles, Calendar, Clock } from 'lucide-react';
import { MascotStepInstruction } from '../components/MascotStepInstruction';
import { RencanaBelajarModal } from '../components/RencanaBelajarModal';
import { audioService } from '../services/audioService';
import { storageService, StudentProgress } from '../services/storageService';

interface AdventureMapScreenProps {
  studentCode: string;
  onSelectLevel: (level: 1 | 2 | 3) => void;
  onStartPosttest: () => void;
  onPauseAndSave?: () => void;
}

export const AdventureMapScreen: React.FC<AdventureMapScreenProps> = ({
  studentCode,
  onSelectLevel,
  onStartPosttest,
  onPauseAndSave,
}) => {
  const prog: StudentProgress = storageService.getStudentProgress(studentCode);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRencanaModalOpen, setIsRencanaModalOpen] = useState(false);

  useEffect(() => {
    setIsSpeaking(true);
    audioService.speak(
      'Selamat datang di Peta Petualangan! Pilih pulau petualangan yang sudah terbuka untuk memulai tantangan dan kumpulkan semua bintang emas!',
      { onEnd: () => setIsSpeaking(false) }
    );
  }, []);

  const totalStars = (prog.stars.level1 || 0) + (prog.stars.level2 || 0) + (prog.stars.level3 || 0);
  const allLevelsDone = prog.unlockedLevel > 3;

  const islands = [
    {
      id: 1 as const,
      name: 'Pulau Kelereng',
      levelText: 'Level 1',
      conceptText: 'Habis Dibagi & Bersisa (M3)',
      duration: '± 10 Menit',
      icon: '🔮',
      sticker: 'Kelereng Zamrud',
      stars: prog.stars.level1 || 0,
      isUnlocked: true,
      color: 'from-amber-400 to-emerald-500',
    },
    {
      id: 2 as const,
      name: 'Pulau Pasangan Ajaib',
      levelText: 'Level 2',
      conceptText: 'Kebalikan Perkalian (M2)',
      duration: '± 10 Menit',
      icon: '🍬',
      sticker: 'Permen Pasangan',
      stars: prog.stars.level2 || 0,
      isUnlocked: prog.unlockedLevel >= 2,
      color: 'from-sky-400 to-indigo-500',
    },
    {
      id: 3 as const,
      name: 'Pulau Kotak Kosong',
      levelText: 'Level 3',
      conceptText: 'Pembagian dengan Nol (M1) [Penguatan]',
      duration: '± 10 Menit',
      icon: '📦',
      sticker: 'Kotak Emas',
      stars: prog.stars.level3 || 0,
      isUnlocked: prog.unlockedLevel >= 3,
      color: 'from-rose-400 to-amber-500',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto h-full flex flex-col justify-between py-1 px-2 sm:px-3 space-y-2">
      {/* Baris Atas: Balon Petunjuk Kak Bagi & Koleksi Bintang */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
        <MascotStepInstruction
          stepTitle="Peta Tiga Pulau Petualangan"
          instructionText="Pilih salah satu pulau yang sudah terbuka untuk memulai petualangan matematika 3D!"
          actionHint="Klik 'Jelajahi Pulau Ini!' untuk mengumpulkan bintang emas."
          isSpeaking={isSpeaking}
          onReplayVoice={() => {
            setIsSpeaking(true);
            audioService.speak(
              'Pilih pulau petualangan yang sudah terbuka untuk memulai tantangan dan kumpulkan semua bintang emas!',
              { onEnd: () => setIsSpeaking(false) }
            );
          }}
          mascotMood={allLevelsDone ? 'celebrating' : 'happy'}
          className="flex-1"
        />

        <div className="flex sm:flex-col items-center justify-between gap-2 shrink-0">
          <div className="bg-amber-100 border-2 border-amber-300 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-amber-950 font-black text-xs sm:text-sm shadow-xs">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{totalStars} / 9 Bintang</span>
          </div>

          <button
            onClick={() => {
              audioService.playTapSound();
              setIsRencanaModalOpen(true);
            }}
            className="bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>Rencana Belajar</span>
          </button>
        </div>
      </div>

      {/* Grid 3 Pulau */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 flex-1 items-stretch overflow-hidden">
        {islands.map((island) => (
          <div
            key={island.id}
            className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-200 flex flex-col justify-between ${
              island.isUnlocked
                ? 'border-amber-300 bg-white shadow-xs hover:shadow-md'
                : 'border-slate-200 bg-slate-50 opacity-75 shadow-xs'
            }`}
          >
            {/* Latar Header Pulau */}
            <div className={`h-20 sm:h-24 bg-gradient-to-tr ${island.color} p-2.5 relative flex flex-col justify-between shrink-0`}>
              <div className="flex items-center justify-between">
                <span className="bg-white/90 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  {island.levelText}
                </span>

                {/* Bintang */}
                <div className="flex items-center gap-0.5 bg-black/20 backdrop-blur-xs px-2 py-0.5 rounded-full">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= island.stars ? 'text-amber-300 fill-amber-300' : 'text-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Ikon Pulau */}
              <div className="text-3xl text-center select-none drop-shadow-xs">
                {island.icon}
              </div>

              {/* Durasi & Stiker */}
              <div className="flex items-center justify-between">
                <span className="bg-black/30 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{island.duration}</span>
                </span>
                {island.stars > 0 && (
                  <span className="bg-white/95 text-[10px] font-extrabold text-slate-800 px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                    <span>{island.sticker}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Info Pulau & Tombol */}
            <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 font-heading">
                  {island.name}
                </h3>
                <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                  Misi: {island.conceptText}
                </p>
              </div>

              {island.isUnlocked ? (
                <button
                  onClick={() => {
                    audioService.playTapSound();
                    onSelectLevel(island.id);
                  }}
                  className="w-full min-h-[44px] py-2 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs border-b-2 border-orange-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Jelajahi Pulau Ini!</span>
                </button>
              ) : (
                <div className="bg-slate-100 border border-slate-200 text-slate-400 min-h-[44px] py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Terkunci (Selesaikan Level {island.id - 1})</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Banner Misi Akhir Terbuka */}
      {allLevelsDone && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-2.5 text-white flex items-center justify-between gap-3 shadow-md border border-emerald-300 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div>
              <span className="font-black text-xs sm:text-sm block">
                Semua Pulau Berhasil Dijelajahi!
              </span>
              <p className="text-emerald-100 text-[10px] sm:text-xs">
                Waktunya membuktikan kemampuanmu di Misi Akhir untuk meraih Sertifikat!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioService.playSuccessSound();
              onStartPosttest();
            }}
            className="py-2 px-4 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs sm:text-sm rounded-xl shadow-xs border-b-2 border-amber-600 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            Mulai Misi Akhir 🎯
          </button>
        </div>
      )}

      {/* Modal Rencana Belajar Guru */}
      <RencanaBelajarModal
        isOpen={isRencanaModalOpen}
        onClose={() => setIsRencanaModalOpen(false)}
        onPauseAndSave={onPauseAndSave}
      />
    </div>
  );
};
