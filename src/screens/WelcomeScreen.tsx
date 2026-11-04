/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Layar Sambutan & Masuk SMART-DIV:
 * - Tombol besar "Mulai Petualangan" untuk membuka izin audio browser
 * - Input Nama Lengkap Siswa (tanpa kode anak) agar tercantum di Sertifikat
 * - Pilihan cepat nama tersimpan untuk melanjutkan sesi
 * - Tombol Masuk Guru/Peneliti dengan input PIN
 * - Pengingat earphone/headset untuk kelas
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Headphones, KeyRound, ArrowRight, User, Check, RefreshCw } from 'lucide-react';
import { MascotKakBagi } from '../components/MascotKakBagi';
import { audioService } from '../services/audioService';
import { storageService } from '../services/storageService';

interface WelcomeScreenProps {
  studentCodes?: string[];
  onSelectStudent: (name: string) => void;
  onOpenResearcherLogin: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectStudent,
  onOpenResearcherLogin,
}) => {
  const [hasStartedAudio, setHasStartedAudio] = useState(false);
  const [inputName, setInputName] = useState('');
  const [savedNames, setSavedNames] = useState<string[]>([]);

  useEffect(() => {
    const names = storageService.getStudentNames();
    setSavedNames(names);
    if (names.length > 0) {
      setInputName(names[0]);
    }
  }, []);

  const formatName = (raw: string): string => {
    return raw
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
      .join(' ');
  };

  const handleStartApp = () => {
    audioService.initAudioContext();
    audioService.startGentleBgm();
    audioService.playSuccessSound();
    setHasStartedAudio(true);
    audioService.speak(
      'Halo sahabat pintar! Selamat datang di Petualangan Pembagian. Tuliskan nama lengkapmu, lalu yuk kita mulai petualangan seru ini!'
    );
  };

  const handleConfirmStudent = (nameToConfirm: string) => {
    const formatted = formatName(nameToConfirm);
    if (!formatted || formatted.length < 2) return;

    storageService.addStudentName(formatted);
    audioService.stopSpeaking();
    audioService.playSuccessSound();
    onSelectStudent(formatted);
  };

  return (
    <div className="h-screen w-full bg-gradient-to-b from-amber-100 via-orange-50 to-amber-100 flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden">
      {/* Elemen Latar Belakang Ceria */}
      <div className="absolute top-6 left-8 text-5xl opacity-20 select-none">🏝️</div>
      <div className="absolute bottom-6 right-8 text-5xl opacity-20 select-none">🍬</div>
      <div className="absolute top-10 right-12 text-4xl opacity-20 select-none">⭐</div>
      <div className="absolute bottom-10 left-12 text-4xl opacity-20 select-none">📦</div>

      <div className="max-w-3xl w-full bg-white/95 backdrop-blur-md rounded-3xl border-4 border-amber-300 shadow-xl p-5 sm:p-6 text-center relative z-10">
        {!hasStartedAudio ? (
          /* Tampilan Sambutan Awal (Sebelum Audio Dibuka) */
          <div className="space-y-4">
            <div className="flex justify-center">
              <MascotKakBagi
                size="md"
                mood="happy"
                speechBubbleText="Halo Sahabat Pintar! Yuk Berpetualang!"
                onBubbleClick={() =>
                  audioService.speak(
                    'Halo sahabat pintar! Aku Kak Bagi, teman petualanganmu belajar pembagian!'
                  )
                }
              />
            </div>

            <div className="space-y-1">
              <span className="inline-block bg-amber-400 text-amber-950 font-black text-xs px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                Media Belajar SMART-DIV Kelas 4 SD
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-amber-950 font-heading">
                Petualangan Pembagian AR
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold max-w-lg mx-auto">
                Belajar pembagian mudah, seru, dan menyenangkan bersama benda 3D interaktif!
              </p>
            </div>

            {/* 4 Langkah Petualangan Menuju Piagam */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-lg mx-auto py-1">
              <span className="text-[11px] font-black bg-white/90 border border-amber-300 px-2.5 py-1 rounded-xl text-amber-950 shadow-2xs">
                1. 🧭 Misi Awal
              </span>
              <span className="text-amber-400 font-bold">›</span>
              <span className="text-[11px] font-black bg-white/90 border border-amber-300 px-2.5 py-1 rounded-xl text-amber-950 shadow-2xs">
                2. 💡 Ingat & Konsep 3D
              </span>
              <span className="text-amber-400 font-bold">›</span>
              <span className="text-[11px] font-black bg-white/90 border border-amber-300 px-2.5 py-1 rounded-xl text-amber-950 shadow-2xs">
                3. 🏝️ 3 Pulau Seru
              </span>
              <span className="text-amber-400 font-bold">›</span>
              <span className="text-[11px] font-black bg-white/90 border border-amber-300 px-2.5 py-1 rounded-xl text-amber-950 shadow-2xs">
                4. 🏆 Piagam Juara
              </span>
            </div>

            <div className="pt-2 max-w-md mx-auto space-y-2">
              <button
                onClick={handleStartApp}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-lg sm:text-xl rounded-2xl shadow-lg border-b-4 border-orange-700 active:scale-95 transition-all flex items-center justify-center gap-2 animate-pulse cursor-pointer"
              >
                <span>🚀 Mulai Petualangan!</span>
              </button>
              <p className="text-[11px] text-slate-500 font-bold">
                (Ketuk tombol di atas untuk membuka suara audio narasi Kak Bagi)
              </p>
            </div>
          </div>
        ) : (
          /* Tampilan Input Nama Siswa (2 Kolom di Layar Lebar) */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center text-left">
            {/* Kolom Kiri: Maskot & Sambutan */}
            <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-3">
              <div className="flex items-center gap-3">
                <MascotKakBagi size="md" mood="celebrating" />
                <div>
                  <span className="bg-amber-400 text-amber-950 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full uppercase">
                    SMART-DIV
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-amber-950 font-heading leading-tight">
                    Petualangan Pembagian
                  </h2>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-semibold">
                Tuliskan namamu di sebelah kanan agar tercantum dengan indah di piagam sertifikat petualangmu!
              </p>

              {/* 4 Langkah Alur Belajar Nyata */}
              <div className="w-full bg-amber-100/80 border border-amber-300 rounded-2xl p-2.5 space-y-1.5 text-left">
                <span className="text-[11px] font-black uppercase text-amber-950 flex items-center gap-1">
                  <span>🗺️ 4 Langkah Menuju Piagam:</span>
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-extrabold text-slate-800">
                  <div className="bg-white/90 px-2 py-1 rounded-xl border border-amber-200 shadow-2xs">
                    <span className="text-amber-700">1.</span> 🧭 Misi Awal
                  </div>
                  <div className="bg-white/90 px-2 py-1 rounded-xl border border-amber-200 shadow-2xs">
                    <span className="text-amber-700">2.</span> 💡 Konsep 3D
                  </div>
                  <div className="bg-white/90 px-2 py-1 rounded-xl border border-amber-200 shadow-2xs">
                    <span className="text-amber-700">3.</span> 🏝️ 3 Pulau Seru
                  </div>
                  <div className="bg-white/90 px-2 py-1 rounded-xl border border-amber-200 shadow-2xs">
                    <span className="text-amber-700">4.</span> 🏆 Misi Akhir
                  </div>
                </div>
              </div>

              {/* Pengingat Headset */}
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-xs text-emerald-900 font-bold w-full">
                <Headphones className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px]">
                  <strong>Pengingat:</strong> Gunakan earphone agar suaramu jelas di kelas!
                </span>
              </div>
            </div>

            {/* Kolom Kanan: Input Nama Siswa & Pilihan Cepat */}
            <div className="md:col-span-7 space-y-3 bg-amber-50/70 border border-amber-200 p-4 rounded-2xl">
              <div>
                <label className="text-xs sm:text-sm font-extrabold text-amber-950 flex items-center gap-1.5 mb-1.5">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>Tuliskan Nama Lengkapmu:</span>
                </label>
                
                <div className="relative">
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="Contoh: Budi Pratama..."
                    autoFocus
                    maxLength={35}
                    className="w-full py-2.5 px-3.5 pl-10 bg-white border-2 border-amber-300 focus:border-amber-500 rounded-xl text-slate-800 font-bold text-sm sm:text-base shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all placeholder:text-slate-400 placeholder:font-normal"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && inputName.trim().length >= 2) {
                        handleConfirmStudent(inputName);
                      }
                    }}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600 text-sm">
                    ✏️
                  </div>
                  {inputName && (
                    <button
                      type="button"
                      onClick={() => setInputName('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs bg-slate-100 hover:bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] text-amber-800 font-medium mt-1">
                  ⭐ Nama ini akan tertulis di Piagam Sertifikat Petualangmu!
                </p>
              </div>

              {/* Pilihan Cepat Nama Siswa yang Sudah Tersimpan */}
              {savedNames.length > 0 && (
                <div className="pt-2 border-t border-amber-200/80">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 text-amber-600" />
                    <span>Sudah pernah bermain? Klik namamu di sini:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {savedNames.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setInputName(name);
                          audioService.playTapSound();
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                          inputName.trim().toLowerCase() === name.toLowerCase()
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-white hover:bg-amber-100 text-slate-700 border-amber-200'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tombol Lanjut Masuk */}
              <button
                onClick={() => handleConfirmStudent(inputName)}
                disabled={inputName.trim().length < 2}
                className={`w-full min-h-[50px] py-3 px-4 font-black text-base sm:text-lg rounded-xl shadow-md border-b-4 active:scale-95 transition-all flex items-center justify-center gap-2 ${
                  inputName.trim().length >= 2
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-700 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                }`}
              >
                <span>Masuk Petualangan: {inputName.trim() || '...'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Akses Guru / Peneliti */}
        <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-semibold">Guru & Peneliti Kelas SD</span>
          <button
            onClick={() => {
              audioService.playTapSound();
              onOpenResearcherLogin();
            }}
            className="flex items-center gap-1 font-bold text-amber-800 hover:text-amber-950 hover:underline bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 transition-colors cursor-pointer"
          >
            <KeyRound className="w-3 h-3" />
            <span>Masuk Panel Peneliti (PIN)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
