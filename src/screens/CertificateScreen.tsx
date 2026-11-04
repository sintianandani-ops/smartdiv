/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Layar Selesai: "Sertifikat Petualang Pembagian"
 * - Berisi Nama Lengkap Siswa resmi di piagam penghargaan
 * - Koleksi bintang dan 3 medali pulau
 * - TIDAK MENAMPILKAN nilai pretest maupun posttest kepada anak
 * - Efek konfeti perayaan dan suara selamat
 * - Tombol cetak piagam sertifikat
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Star, Printer, Sparkles, Heart, Home, User } from 'lucide-react';
import { MascotKakBagi } from '../components/MascotKakBagi';
import { audioService } from '../services/audioService';
import { storageService } from '../services/storageService';

interface CertificateScreenProps {
  studentCode: string;
  studentName?: string;
  onBackToHome: () => void;
}

export const CertificateScreen: React.FC<CertificateScreenProps> = ({
  studentCode,
  studentName,
  onBackToHome,
}) => {
  const displayName = studentName || studentCode || 'Petualang Cilik';
  const prog = storageService.getStudentProgress(studentCode);
  const totalStars = (prog.stars.level1 || 0) + (prog.stars.level2 || 0) + (prog.stars.level3 || 0);

  useEffect(() => {
    // Ledakan konfeti perayaan
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
    });
    audioService.playSuccessSound();
    audioService.speak(
      `Selamat kepada petualang hebat, ${displayName}! Kamu telah berhasil menyelesaikan seluruh petualangan pembagian dengan sangat baik!`
    );
  }, [displayName]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-3xl mx-auto h-full flex flex-col justify-between py-1 px-2 sm:px-3 space-y-2">
      {/* Kartu Piagam Sertifikat Resmi & Ceria */}
      <div className="bg-gradient-to-b from-amber-50 to-orange-50 border-4 border-amber-400 rounded-2xl p-3 sm:p-4 shadow-md relative overflow-hidden text-center flex-1 flex flex-col justify-between space-y-2">
        {/* Hiasan Pita Sudut */}
        <div className="absolute -top-8 -right-8 w-20 h-20 bg-amber-400 rotate-45 flex items-end justify-center pb-1 text-amber-950 font-black text-[9px] shadow-xs">
          JUARA
        </div>

        {/* Maskot Kak Bagi & Judul Piagam */}
        <div className="flex items-center justify-center gap-2">
          <MascotKakBagi size="sm" mood="celebrating" />
          <div>
            <span className="text-amber-800 font-extrabold text-[10px] tracking-wider uppercase bg-amber-200/80 px-2.5 py-0.5 rounded-full inline-block">
              Piagam Penghargaan SMART-DIV
            </span>
            <h1 className="text-lg sm:text-2xl font-black text-amber-950 font-heading">
              SERTIFIKAT PETUALANG PEMBAGIAN
            </h1>
          </div>
        </div>

        {/* Nama Lengkap Siswa Resmi */}
        <div className="py-2 px-4 sm:px-6 bg-gradient-to-r from-amber-100/90 via-white to-amber-100/90 border-2 border-amber-300 rounded-2xl shadow-inner max-w-xl mx-auto w-full my-1">
          <p className="text-[10px] sm:text-xs font-bold text-amber-900 uppercase tracking-widest flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Diberikan dengan Bangga Kepada Petualang Hebat:</span>
          </p>
          <div className="text-xl sm:text-3xl font-black text-indigo-900 font-heading tracking-wide my-1 py-0.5 border-b-2 border-amber-400 inline-block px-4 sm:px-8">
            {displayName}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
            Telah berhasil menyelesaikan seluruh petualangan dan memahami konsep pembagian dengan gemilang!
          </p>
        </div>

        {/* Koleksi Bintang */}
        <div className="flex items-center justify-center gap-3">
          <div className="bg-white border-2 border-amber-300 rounded-xl px-4 py-1 shadow-xs flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Total Koleksi:</span>
            <div className="flex items-center gap-1 text-amber-500 font-black text-sm sm:text-base">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span className="text-amber-950 font-black">{totalStars} / 9 Bintang</span>
            </div>
          </div>
        </div>

        {/* Tiga Medali Pulau Tuntas */}
        <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto w-full">
          <div className="p-1.5 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col items-center">
            <span className="text-xl">🔮</span>
            <span className="text-[11px] font-black text-emerald-900">Pulau Kelereng</span>
            <span className="text-[9px] text-emerald-700 font-bold">Lulus Tuntas</span>
          </div>

          <div className="p-1.5 bg-sky-50 rounded-xl border border-sky-200 flex flex-col items-center">
            <span className="text-xl">✨</span>
            <span className="text-[11px] font-black text-sky-900">Pasangan Ajaib</span>
            <span className="text-[9px] text-sky-700 font-bold">Lulus Tuntas</span>
          </div>

          <div className="p-1.5 bg-rose-50 rounded-xl border border-rose-200 flex flex-col items-center">
            <span className="text-xl">📦</span>
            <span className="text-[11px] font-black text-rose-900">Kotak Kosong</span>
            <span className="text-[9px] text-rose-700 font-bold">Lulus Tuntas</span>
          </div>
        </div>

        {/* Tanda Tangan Simbolis Ringkas */}
        <div className="flex items-center justify-around text-[10px] text-slate-500 font-semibold border-t border-amber-200/80 pt-1">
          <div>
            <div className="font-cursive text-sm text-amber-800 font-black">
              Kak Bagi 🎩
            </div>
            <span>Pemandu SMART-DIV</span>
          </div>

          <div>
            <div className="font-bold text-slate-700">
              {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <span>Tanggal Kelulusan</span>
          </div>
        </div>
      </div>

      {/* Tombol Aksi Bawah */}
      <div className="flex items-center justify-center gap-2.5 shrink-0">
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-black px-4 py-2 rounded-xl shadow-xs text-xs sm:text-sm active:scale-95 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Piagam Sertifikat</span>
        </button>

        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-xl border border-slate-300 shadow-xs text-xs sm:text-sm active:scale-95 transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Halaman Utama</span>
        </button>
      </div>
    </div>
  );
};
