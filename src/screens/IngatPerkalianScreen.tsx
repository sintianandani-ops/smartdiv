/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Modul: "Ingat Perkalian" (Fondasi Belajar & Apersepsi Pembagian)
 * Berdasarkan Temuan Validasi Ahli Media No. 10:
 * Menjembatani Misi Awal ke Konsep 1 dengan 5 Langkah Terstruktur:
 * 1. Konsep Kelompok Sama (3 piring × 2 kue = 6 kue)
 * 2. Susunan Baris dan Kolom (4 baris × 3 kolom = 12 bintang)
 * 3. Perkalian dengan Angka Nol (n × 0 = 0)
 * 4. Perkalian dengan Angka Satu (n × 1 = n)
 * 5. Coba Bersama Interaktif: Membangun susunan 3 × 5 = 15
 * 
 * Tampilan Responsif 2 Kolom Bebas Terpotong (Zero-Clipping Responsive Layout):
 * - Kolom Kiri: Balon Panduan Kak Bagi, Persamaan Matematika, & Catatan Emas
 * - Kolom Kanan: Panggung Visual Lapang & Interaktif (Piring Kue, Bintang Kisi, Apel, dll.)
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, RotateCcw, Sparkles, BookOpen, Star, Plus, Minus } from 'lucide-react';
import { MascotStepInstruction } from '../components/MascotStepInstruction';
import { DynamicEquationBadge } from '../components/DynamicEquationBadge';
import { audioService } from '../services/audioService';
import { storageService } from '../services/storageService';

interface IngatPerkalianScreenProps {
  studentCode: string;
  onFinish: () => void;
  onGoBack?: () => void;
}

interface StepData {
  id: number;
  title: string;
  subtitle: string;
  narration: string;
  hint: string;
  equation: string;
  equationSub: string;
  visualType: 'plates' | 'array_grid' | 'zero' | 'one' | 'interactive_grid';
}

export const IngatPerkalianScreen: React.FC<IngatPerkalianScreenProps> = ({
  studentCode,
  onFinish,
  onGoBack,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // State untuk Coba Bersama (Langkah 5): 3 x 5 = 15
  const [customRows, setCustomRows] = useState(3);
  const [customCols, setCustomCols] = useState(5);

  const startTimeRef = useRef<number>(Date.now());

  const steps: StepData[] = [
    {
      id: 1,
      title: '1. Kelompok yang Sama Banyak',
      subtitle: 'Perkalian adalah Penjumlahan Berulang',
      narration:
        'Sahabat pintar, sebelum belajar pembagian, yuk kita ingat kembali perkalian! Perkalian artinya menggabungkan beberapa kelompok yang isinya sama banyak. Misalnya ada 3 piring, tiap piring berisi 2 kue. Maka 3 kali 2 sama dengan 6 kue!',
      hint: 'Lihat 3 piring di sebelah kanan. Masing-masing ada 2 kue (2 + 2 + 2 = 6 kue).',
      equation: '3 Piring × 2 Kue = 6 Kue',
      equationSub: 'Banyak kelompok (3) × Isi tiap kelompok (2) = Jumlah seluruhnya (6)',
      visualType: 'plates',
    },
    {
      id: 2,
      title: '2. Baris dan Kolom yang Rapi',
      subtitle: 'Menghitung Cepat Benda yang Tersusun Rapi',
      narration:
        'Perkalian juga bisa kita bayangkan seperti barisan kotak atau bintang yang rapi. Ada 4 baris mendatar, dan tiap baris berisi 3 kolom tegak. Empat dikali tiga sama dengan dua belas bintang!',
      hint: 'Hitung baris mendatar (4 baris) dan kolom tegak (3 kolom). 4 × 3 = 12 bintang.',
      equation: '4 Baris × 3 Kolom = 12 Bintang',
      equationSub: 'Baris mendatar × Kolom tegak = Total seluruh bintang',
      visualType: 'array_grid',
    },
    {
      id: 3,
      title: '3. Perkalian dengan Angka Nol',
      subtitle: 'Aturan Emas: Bilangan Apa Pun Dikali 0 adalah 0',
      narration:
        'Bagaimana jika kita punya 5 piring, tetapi di atas tiap piring tidak ada benda sama sekali (nol kue)? Lima dikali nol sama dengan nol! Berapa pun bilangannya, jika dikali nol hasilnya selalu nol.',
      hint: '5 piring kosong = 0 kue di tiap piring. Maka 5 × 0 = 0.',
      equation: '5 Piring × 0 Kue = 0',
      equationSub: 'Semua bilangan jika dikalikan angka nol hasilnya selalu NOL',
      visualType: 'zero',
    },
    {
      id: 4,
      title: '4. Perkalian dengan Angka Satu',
      subtitle: 'Mengalikan 1 Selalu Menghasilkan Bilangan Itu Sendiri',
      narration:
        'Jika ada 6 piring dan tiap piring berisi 1 apel segar, maka ada 6 apel! Enam dikali satu sama dengan enam. Mengalikan dengan angka 1 tidak mengubah jumlah bilangan tersebut.',
      hint: '6 piring masing-masing berisi 1 apel = total 6 apel.',
      equation: '6 Piring × 1 Apel = 6 Apel',
      equationSub: 'Mengalikan bilangan dengan angka 1 selalu menghasilkan bilangan itu sendiri',
      visualType: 'one',
    },
    {
      id: 5,
      title: '5. Coba Bersama: Susun Baris dan Kolom',
      subtitle: 'Sentuh dan Buktikan Perkalian 3 × 5 = 15',
      narration:
        'Sekarang giliranmu mencoba! Amati susunan 3 baris dan 5 kolom. Tiga dikali lima sama dengan lima belas. Fondasi perkalian ini adalah kunci rahasiamu untuk menaklukkan pembagian nanti!',
      hint: 'Kamu bisa menekan tombol tambah (+) atau kurang (-) untuk mengubah baris dan kolom.',
      equation: `${customRows} Baris × ${customCols} Kolom = ${customRows * customCols} Benda`,
      equationSub: 'Hebat! Perkalian ini akan kita balik menjadi pembagian di Konsep 1 dan 2!',
      visualType: 'interactive_grid',
    },
  ];

  const current = steps[currentStepIndex];

  useEffect(() => {
    setIsSpeaking(true);
    audioService.speak(current.narration, {
      onEnd: () => setIsSpeaking(false),
    });
  }, [currentStepIndex]);

  const handleNext = () => {
    audioService.playTapSound();
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Selesai modul Ingat Perkalian, catat durasi
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      const prog = storageService.getStudentProgress(studentCode);
      prog.phaseDurations.ingatPerkalianSeconds = (prog.phaseDurations.ingatPerkalianSeconds || 0) + elapsed;
      prog.currentStep = 'concepts';
      storageService.saveStudentProgress(prog);

      audioService.playSuccessSound();
      audioService.speak('Keren sekali! Kamu sudah mengingat perkalian dengan baik. Sekarang, yuk kita masuk ke Konsep Pembagian!');
      onFinish();
    }
  };

  const handlePrev = () => {
    audioService.playTapSound();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    } else if (onGoBack) {
      onGoBack();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto h-full max-h-full flex flex-col justify-between p-1 sm:p-2 space-y-1.5 overflow-hidden">
      {/* Banner Atas: Indikator Modul & Stepper 5 Langkah */}
      <div className="bg-white border-2 border-amber-300 rounded-2xl px-3 py-1.5 shadow-xs flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-800" />
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              Fondasi Apersepsi • Kelas 4 SD
            </span>
            <h2 className="text-xs sm:text-sm font-black text-amber-950 font-heading leading-tight">
              Ingat Kembali Perkalian
            </h2>
          </div>
        </div>

        {/* Stepper 5 Langkah Interaktif */}
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-xl overflow-x-auto">
          {steps.map((st, idx) => (
            <button
              key={st.id}
              onClick={() => {
                audioService.playTapSound();
                setCurrentStepIndex(idx);
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-xs sm:text-sm transition-all cursor-pointer ${
                idx === currentStepIndex
                  ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300 scale-105'
                  : idx < currentStepIndex
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-white text-slate-400 border border-slate-200 hover:bg-amber-100'
              }`}
              title={st.title}
            >
              {st.id}
            </button>
          ))}
        </div>
      </div>

      {/* Konten Utama: 2 Kolom Responsif Tanpa Perlu Scroll */}
      <div className="bg-white border-2 border-amber-200 rounded-2xl p-2.5 sm:p-3 shadow-xs flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch flex-1 min-h-0 overflow-hidden">
          {/* Kolom Kiri: Balon Panduan Kak Bagi & Persamaan Matematika */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 sm:p-3 space-y-2 overflow-y-auto">
            {/* Balon Dialog Langkah Bertahap bersama Maskot Kak Bagi */}
            <MascotStepInstruction
              stepNumber={currentStepIndex + 1}
              totalSteps={steps.length}
              stepTitle={current.title}
              instructionText={current.narration}
              actionHint={current.hint}
              isSpeaking={isSpeaking}
              onReplayVoice={() => {
                setIsSpeaking(true);
                audioService.speak(current.narration, { onEnd: () => setIsSpeaking(false) });
              }}
              mascotMood="explaining"
            />

            {/* Persamaan Matematika (Dynamic Equation Badge) */}
            <div className="flex justify-center w-full">
              <DynamicEquationBadge
                customEquation={current.equation}
                subtitle={current.equationSub}
                variant="custom"
                className="w-full"
              />
            </div>

            {/* Catatan Kunci Memori untuk Siswa */}
            <div className="bg-white/90 border border-amber-300 rounded-xl p-2 text-xs text-slate-700 font-bold space-y-0.5 shadow-2xs shrink-0">
              <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Kunci Ingat Perkalian:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                {currentStepIndex === 0 && 'Perkalian 3 × 2 artinya ada 3 piring yang masing-masing berisi 2 kue (2 + 2 + 2 = 6).'}
                {currentStepIndex === 1 && 'Barisan rapi mempermudah hitungan: 4 baris mendatar × 3 kolom tegak = 12 bintang.'}
                {currentStepIndex === 2 && 'Aturan Nol: Bilangan apa pun dikalikan 0 hasilnya selalu NOL (piring kosong = 0 kue).'}
                {currentStepIndex === 3 && 'Aturan Satu: Bilangan apa pun dikalikan 1 hasilnya tetap bilangan itu sendiri.'}
                {currentStepIndex === 4 && 'Fondasi perkalian baris dan kolom ini akan kita ubah menjadi pembagian di petualangan berikutnya!'}
              </p>
            </div>
          </div>

          {/* Kolom Kanan: Panggung Visual Lapang, Jelas, & Utuh */}
          <div className="lg:col-span-7 bg-amber-50/40 border-2 border-amber-200 rounded-xl p-2.5 sm:p-4 flex flex-col justify-center items-center flex-1 min-h-0 overflow-hidden">
            {/* 1. Visual 3 Piring x 2 Kue */}
            {current.visualType === 'plates' && (
              <div className="w-full flex flex-col items-center justify-center space-y-2 py-1">
                <div className="text-center">
                  <span className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wide bg-amber-200/80 px-3 py-0.5 rounded-full border border-amber-300">
                    🍽️ 3 Piring dengan Masing-Masing 2 Kue
                  </span>
                </div>

                {/* 3 Piring Proporsional Tanpa Terpotong */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-md px-1">
                  {[1, 2, 3].map((plateNum) => (
                    <div
                      key={plateNum}
                      className="aspect-square rounded-full bg-gradient-to-tr from-amber-100 via-orange-50 to-white border-4 border-amber-400 shadow-md flex flex-col items-center justify-center p-1.5 transition-transform hover:scale-105"
                    >
                      <span className="text-[10px] sm:text-xs font-black text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-full mb-1">
                        Piring {plateNum}
                      </span>
                      <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl my-0.5">
                        <span role="img" aria-label="kue">🧁</span>
                        <span role="img" aria-label="kue">🧁</span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-black text-amber-800">
                        2 Kue
                      </span>
                    </div>
                  ))}
                </div>

                {/* Penjelasan Penjumlahan Berulang */}
                <div className="w-full max-w-md bg-white border-2 border-emerald-300 text-slate-800 p-2.5 rounded-2xl text-center shadow-xs space-y-0.5">
                  <div className="text-xs sm:text-sm font-extrabold text-slate-700">
                    Penjumlahan Berulang: <span className="text-amber-800 font-black">2 + 2 + 2</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-emerald-700">
                    Total Kue = 3 × 2 = <span className="text-lg sm:text-xl text-emerald-600 font-extrabold">6 Kue</span> ✅
                  </div>
                </div>
              </div>
            )}

            {/* 2. Visual Kisi 4 Baris x 3 Kolom */}
            {current.visualType === 'array_grid' && (
              <div className="w-full flex flex-col items-center justify-center space-y-3 py-1">
                <div className="text-center">
                  <span className="text-xs sm:text-sm font-black text-indigo-950 uppercase tracking-wide bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
                    ⭐ Kisi 4 Baris Mendatar × 3 Kolom Tegak
                  </span>
                </div>

                <div className="bg-white border-2 border-indigo-200 p-3 sm:p-4 rounded-2xl shadow-sm w-full max-w-sm">
                  {/* Label Kolom Tegak di Atas */}
                  <div className="flex items-center justify-end gap-2 mb-2 pr-1">
                    {[1, 2, 3].map((col) => (
                      <span key={col} className="w-8 sm:w-10 text-center text-[10px] font-black text-indigo-700">
                        Kolom {col}
                      </span>
                    ))}
                  </div>

                  {/* Baris dan Kotak Bintang */}
                  <div className="grid grid-rows-4 gap-2">
                    {[1, 2, 3, 4].map((row) => (
                      <div key={row} className="flex items-center justify-between gap-2">
                        <span className="text-[10px] sm:text-xs font-black text-indigo-900 w-14 text-left">
                          Baris {row}:
                        </span>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3].map((col) => (
                            <div
                              key={col}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 text-white flex items-center justify-center font-black text-base shadow-xs border border-indigo-300"
                            >
                              ⭐
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full max-w-sm bg-indigo-50 border border-indigo-200 text-indigo-950 p-2 rounded-xl text-center text-xs sm:text-sm font-extrabold">
                  4 Baris × 3 Bintang Tiap Baris = <span className="text-emerald-600 font-black text-base">12 Bintang</span>
                </div>
              </div>
            )}

            {/* 3. Visual 5 Piring Kosong (Perkalian Nol) */}
            {current.visualType === 'zero' && (
              <div className="w-full flex flex-col items-center justify-center space-y-3 py-1">
                <div className="text-center">
                  <span className="text-xs sm:text-sm font-black text-rose-950 uppercase tracking-wide bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
                    🍽️ 5 Piring Kosong (Masing-Masing 0 Kue)
                  </span>
                </div>

                {/* 5 Piring Kosong Terbuka Rapi */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap max-w-md px-1">
                  {[1, 2, 3, 4, 5].map((p) => (
                    <div
                      key={p}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-50 border-2 border-dashed border-rose-300 flex flex-col items-center justify-center text-rose-800 shadow-2xs"
                    >
                      <span className="text-[10px] font-bold text-slate-500">Piring {p}</span>
                      <span className="text-base sm:text-lg font-black text-rose-600">0</span>
                      <span className="text-[9px] font-extrabold text-slate-400">Kosong</span>
                    </div>
                  ))}
                </div>

                <div className="w-full max-w-md bg-white border-2 border-rose-300 text-rose-950 p-2.5 rounded-2xl text-center shadow-xs space-y-0.5">
                  <div className="text-xs sm:text-sm font-extrabold text-slate-700">
                    Tidak ada kue di piring mana pun!
                  </div>
                  <div className="text-sm sm:text-base font-black text-rose-700">
                    5 Piring × 0 Kue = <span className="text-lg sm:text-xl font-extrabold text-rose-600">0 Kue</span> ✅
                  </div>
                </div>
              </div>
            )}

            {/* 4. Visual 6 Piring x 1 Apel (Perkalian Satu) */}
            {current.visualType === 'one' && (
              <div className="w-full flex flex-col items-center justify-center space-y-3 py-1">
                <div className="text-center">
                  <span className="text-xs sm:text-sm font-black text-emerald-950 uppercase tracking-wide bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                    🍎 6 Piring Masing-Masing Berisi 1 Apel
                  </span>
                </div>

                {/* 6 Piring Apel Rapi */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5 w-full max-w-md px-1">
                  {[1, 2, 3, 4, 5, 6].map((p) => (
                    <div
                      key={p}
                      className="aspect-square rounded-full bg-gradient-to-tr from-emerald-50 to-white border-2 border-emerald-400 flex flex-col items-center justify-center shadow-xs p-1"
                    >
                      <span className="text-[9px] font-black text-emerald-900">Piring {p}</span>
                      <span className="text-xl sm:text-2xl my-0.5" role="img" aria-label="apel">🍎</span>
                      <span className="text-[9px] font-extrabold text-emerald-700">1 Apel</span>
                    </div>
                  ))}
                </div>

                <div className="w-full max-w-md bg-white border-2 border-emerald-300 text-emerald-950 p-2.5 rounded-2xl text-center shadow-xs space-y-0.5">
                  <div className="text-xs sm:text-sm font-extrabold text-slate-700">
                    Mengalikan 1 tidak mengubah jumlah benda:
                  </div>
                  <div className="text-sm sm:text-base font-black text-emerald-700">
                    6 Piring × 1 Apel = <span className="text-lg sm:text-xl font-extrabold text-emerald-600">6 Apel</span> ✅
                  </div>
                </div>
              </div>
            )}

            {/* 5. Coba Bersama Interaktif (Susun Baris x Kolom) */}
            {current.visualType === 'interactive_grid' && (
              <div className="w-full flex flex-col items-center justify-center space-y-3 py-1">
                <div className="text-center">
                  <span className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wide bg-amber-200 px-3 py-1 rounded-full border border-amber-300">
                    🎮 Coba Sentuh & Atur Baris × Kolom
                  </span>
                </div>

                {/* Kontrol Jumlah Baris & Kolom */}
                <div className="flex flex-wrap items-center justify-center gap-3 bg-white p-2 rounded-2xl border border-amber-300 shadow-xs">
                  {/* Baris */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-700">Baris:</span>
                    <button
                      onClick={() => {
                        audioService.playTapSound();
                        setCustomRows((r) => Math.max(2, r - 1));
                      }}
                      className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-black text-sm flex items-center justify-center cursor-pointer active:scale-95 border border-slate-300"
                      title="Kurang baris"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-black text-xs sm:text-sm text-indigo-900 w-8 text-center bg-indigo-50 py-0.5 rounded-md border border-indigo-200">
                      {customRows}
                    </span>
                    <button
                      onClick={() => {
                        audioService.playTapSound();
                        setCustomRows((r) => Math.min(4, r + 1));
                      }}
                      className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-black text-sm flex items-center justify-center cursor-pointer active:scale-95 border border-slate-300"
                      title="Tambah baris"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="font-black text-amber-700 text-sm">×</span>

                  {/* Kolom */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-700">Kolom:</span>
                    <button
                      onClick={() => {
                        audioService.playTapSound();
                        setCustomCols((c) => Math.max(2, c - 1));
                      }}
                      className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-black text-sm flex items-center justify-center cursor-pointer active:scale-95 border border-slate-300"
                      title="Kurang kolom"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-black text-xs sm:text-sm text-indigo-900 w-8 text-center bg-indigo-50 py-0.5 rounded-md border border-indigo-200">
                      {customCols}
                    </span>
                    <button
                      onClick={() => {
                        audioService.playTapSound();
                        setCustomCols((c) => Math.min(6, c + 1));
                      }}
                      className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-black text-sm flex items-center justify-center cursor-pointer active:scale-95 border border-slate-300"
                      title="Tambah kolom"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Grid Kotak Interaktif */}
                <div className="p-3 bg-white border-2 border-amber-300 rounded-2xl shadow-inner max-w-md overflow-x-auto">
                  <div className="grid gap-1.5" style={{ gridTemplateRows: `repeat(${customRows}, minmax(0, 1fr))` }}>
                    {Array.from({ length: customRows }).map((_, r) => (
                      <div key={r} className="flex items-center gap-1.5 justify-center">
                        {Array.from({ length: customCols }).map((_, c) => (
                          <div
                            key={c}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-400 text-amber-950 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs border border-amber-300 transition-transform hover:scale-110"
                          >
                            {r * customCols + c + 1}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-100 border border-amber-300 text-amber-950 px-4 py-1.5 rounded-xl text-center text-xs sm:text-sm font-extrabold">
                  Total Kotak = {customRows} × {customCols} ={' '}
                  <span className="text-emerald-700 font-black text-base">{customRows * customCols} Kotak</span> ✅
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigasi Bawah */}
      <div className="flex items-center justify-between gap-2 pt-1 shrink-0">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm border border-slate-300 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentStepIndex === 0 ? 'Kembali ke Misi Awal' : 'Langkah Sebelumnya'}</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs sm:text-sm shadow-md border-b-4 border-emerald-700 active:scale-95 transition-all cursor-pointer"
        >
          <span>
            {currentStepIndex < steps.length - 1 ? 'Lanjut Langkah Berikutnya' : 'Masuk ke Konsep Pembagian 🚀'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
