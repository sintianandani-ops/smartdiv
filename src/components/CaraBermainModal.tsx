/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Petunjuk Penggunaan SMART-DIV Sesuai Saran Validasi Ahli Media:
 * - 4 Langkah Alur Belajar Nyata:
 *   1. Masuk & Dengarkan Narasi (Earphone & Audio Kak Bagi)
 *   2. 4 Tahap di Tiap Pulau (Tebak -> Coba 3D -> Amati Pola -> Simpulkan)
 *   3. Scaffolding Lampu Bertahap (3 Tingkat Bantuan jika Ragu/Salah)
 *   4. Kuis Kilat & Bintang Emas (9 Bintang untuk Membuka Misi Akhir & Piagam)
 * - Bebas elemen tidak jelas/tidak berguna (Tanpa mode AR palsu, tanpa teks berbelit)
 * - Tipografi ramah anak kelas 4 SD, ringkas & langsung terbaca dalam 15-20 detik
 */

import React from 'react';
import {
  X, Volume2, Sparkles, Mic, Box, Lightbulb, Star, ArrowRight, Target, Search, CheckCircle2
} from 'lucide-react';
import { MascotKakBagi } from './MascotKakBagi';
import { audioService } from '../services/audioService';

interface CaraBermainModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CaraBermainModal: React.FC<CaraBermainModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const quickVoiceGuide =
    'Halo sahabat pintar! Ikuti empat langkah mudah ini: Pertama, tuliskan namamu dan dengarkan suara Kak Bagi. Kedua, di setiap pulau ikuti empat tahap: tebak, coba benda tiga dimensi, amati pola, dan simpulkan. Ketiga, jika bingung tekan lampu petunjuk. Keempat, selesaikan kuis kilat, kumpulkan sembilan bintang emas, dan raih piagam sertifikatmu. Ayo kita mulai petualangan!';

  const handlePlayVoice = () => {
    audioService.playTapSound();
    audioService.speak(quickVoiceGuide);
  };

  const handleCloseModal = () => {
    audioService.stopSpeaking();
    audioService.playSuccessSound();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[94vh] animate-fadeIn">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 px-4 sm:px-6 py-3.5 flex items-center justify-between border-b-2 border-amber-500 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl">📖</span>
            <div>
              <h2 className="font-extrabold text-amber-950 text-base sm:text-lg font-heading leading-tight">
                Langkah Belajar SMART-DIV (Saran Ahli Media)
              </h2>
              <p className="text-[11px] sm:text-xs text-amber-950/80 font-bold">
                Alur jelas dan terstruktur untuk menjadi Ahli Pembagian Cilik
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-1.5 rounded-full bg-white/40 hover:bg-white/80 text-amber-950 transition-colors cursor-pointer"
            title="Tutup Petunjuk"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Isi 4 Langkah Berurutan */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3.5">
          {/* Tombol Dengarkan Ringkasan Suara */}
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 px-3 py-2 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Dengarkan petunjuk langsung dari Kak Bagi:</span>
            </div>
            <button
              onClick={handlePlayVoice}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Dengarkan Suara 🔊</span>
            </button>
          </div>

          {/* Grid 4 Langkah Terstruktur */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Langkah 1: Masuk & Dengarkan */}
            <div className="bg-sky-50/70 border-2 border-sky-200 rounded-2xl p-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-sky-500 text-white font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <span className="text-[10px] font-black uppercase text-sky-800 bg-sky-200/80 px-2 py-0.5 rounded-full">
                    Awal Petualangan
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-sky-950 font-heading">
                  Masuk & Dengarkan Kak Bagi
                </h3>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  Tuliskan nama lengkapmu, kenakan earphone/headset, dan dengarkan arahan ramah Kak Bagi di setiap layar.
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-sky-200/80 text-[11px] font-bold text-sky-800 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-sky-600" />
                <span>Bisa rekam suaramu saat jawab soal</span>
              </div>
            </div>

            {/* Langkah 2: 4 Tahap Aktivitas di Tiap Pulau */}
            <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl p-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                    4 Tahap di Tiap Pulau
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-emerald-950 font-heading">
                  Tebak → Coba 3D → Amati → Simpulkan
                </h3>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  Di setiap pulau, tebak dulu hasil pembagian, bagi benda 3D ke kotak, amati hubungannya, lalu simpulkan aturan emasnya.
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-emerald-200/80 text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sentuh & manipulasi benda 3D nyata</span>
              </div>
            </div>

            {/* Langkah 3: Bantuan Lampu Scaffolding */}
            <div className="bg-amber-50/70 border-2 border-amber-200 rounded-2xl p-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                    3 Tingkat Bantuan
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-amber-950 font-heading">
                  Klik Lampu 💡 Saat Butuh Bantuan
                </h3>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  Jangan takut salah! Ada 3 lampu bantuan dari Kak Bagi: pertanyaan pemandu, tanda warna visual, hingga demonstrasi solusi.
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-amber-200/80 text-[11px] font-bold text-amber-800 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 fill-amber-300" />
                <span>Bantuan bertahap tanpa takut salah</span>
              </div>
            </div>

            {/* Langkah 4: Kuis Kilat & Bintang Emas */}
            <div className="bg-purple-50/70 border-2 border-purple-200 rounded-2xl p-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                    4
                  </span>
                  <span className="text-[10px] font-black uppercase text-purple-900 bg-purple-200/80 px-2 py-0.5 rounded-full">
                    Apresiasi & Piagam
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-purple-950 font-heading">
                  Kuis Kilat & 9 Bintang Emas
                </h3>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  Selesaikan kuis 3 soal di tiap pulau untuk mengumpulkan 9 bintang emas, buka Misi Akhir, dan raih Piagam Sertifikat Petualang!
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-purple-200/80 text-[11px] font-bold text-purple-800 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>Cetak piagam resmi dengan namamu</span>
              </div>
            </div>
          </div>

          {/* Pesan Ramah Maskot Kak Bagi */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-2.5 rounded-2xl shrink-0">
            <MascotKakBagi size="sm" mood="explaining" />
            <div className="flex-1 text-xs font-bold text-emerald-950">
              <span className="text-emerald-700 block font-black">Pesan Kak Bagi:</span>
              <span>"Ikuti langkah-langkah di atas dengan santai ya. Belajar matematika pembagian itu seru dan mengasyikkan!"</span>
            </div>
          </div>
        </div>

        {/* Footer Tombol Mulai */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
            💡 Petunjuk ini bisa kamu buka kapan saja lewat tombol <strong>Bantuan</strong> di atas.
          </span>
          <button
            onClick={handleCloseModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm rounded-xl shadow-md border-b-2 border-emerald-700 transition-all active:scale-95 cursor-pointer"
          >
            <span>🚀 Siap, Ayo Mulai Petualangan!</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
