/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Modal Rencana Belajar (Study Plan & Session Breakdown):
 * - Membantu guru mendampingi 4 sesi pembelajaran matematika SD
 * - Estimasi durasi per fase (Total ~85 menit)
 * - Tombol "Istirahat dan Simpan Sesi" untuk jeda belajar tanpa kehilangan progres
 */

import React from 'react';
import { X, Clock, Calendar, CheckCircle2, Bookmark, Coffee, Shield } from 'lucide-react';
import { audioService } from '../services/audioService';

interface RencanaBelajarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPauseAndSave?: () => void;
}

export const RencanaBelajarModal: React.FC<RencanaBelajarModalProps> = ({
  isOpen,
  onClose,
  onPauseAndSave,
}) => {
  if (!isOpen) return null;

  const sessions = [
    {
      session: 'Sesi 1: Pengenalan & Diagnostik',
      duration: '± 20 Menit',
      items: [
        'Misi Awal (Pretest Diagnostik): 6 soal pilihan ganda (15 m)',
        'Ingat Perkalian (Apersepsi Konsep Dasar): 5 langkah interaktif (5 m)',
      ],
      cpGoal: 'Mengidentifikasi miskonsepsi awal dan mengaitkan konsep kelompok sama.',
      color: 'border-amber-400 bg-amber-50/60',
    },
    {
      session: 'Sesi 2: Konstruksi Tiga Konsep',
      duration: '± 15 Menit',
      items: [
        'Konsep 1: Habis Dibagi dan Bersisa (M3) (5 m)',
        'Konsep 2: Pembagian Kebalikan Perkalian (M2) (5 m)',
        'Konsep 3: Pembagian dengan Angka Nol (M1) (5 m)',
      ],
      cpGoal: 'Mengonstruksi 3 konsep pembagian menggunakan manipulasi benda 3D nyata.',
      color: 'border-sky-400 bg-sky-50/60',
    },
    {
      session: 'Sesi 3: Eksplorasi Tiga Pulau',
      duration: '± 30 Menit',
      items: [
        'Level 1: Pulau Kelereng (M3 Habis & Sisa) (10 m)',
        'Level 2: Pulau Pasangan Ajaib (M2 Kebalikan Perkalian) (10 m)',
        'Level 3: Pulau Kotak Kosong (M1 Pembagian Nol) (10 m)',
      ],
      cpGoal: 'Mengatasi miskonsepsi melalui scaffolding bertahap 3 tingkat dan simulasi 3D/AR.',
      color: 'border-emerald-400 bg-emerald-50/60',
    },
    {
      session: 'Sesi 4: Evaluasi & Apresiasi',
      duration: '± 20 Menit',
      items: [
        'Misi Akhir (Posttest): 6 soal setara untuk mengukur N-Gain (15 m)',
        'Pendapatmu (Angket Respon Siswa): 10 pernyataan emotikon (5 m)',
        'Piagam Sertifikat Petualang Pembagian (Apresiasi Kelas)',
      ],
      cpGoal: 'Mengukur peningkatan pemahaman konsep dan tingkat kepraktisan media bagi siswa.',
      color: 'border-purple-400 bg-purple-50/60',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-4 sm:px-6 py-3.5 flex items-center justify-between border-b-2 border-amber-500 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl">🗓️</span>
            <div>
              <h2 className="font-extrabold text-amber-950 text-base sm:text-xl font-heading leading-tight">
                Rencana Belajar & Estimasi Waktu (Guru/Peneliti)
              </h2>
              <p className="text-xs text-amber-950/80 font-bold">
                Alur 4 Sesi Pembelajaran Berbasis Kurikulum Merdeka Fase B
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/40 hover:bg-white/80 text-amber-950 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ringkasan Durasi Total */}
        <div className="bg-amber-100/70 px-4 py-2 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-amber-950 shrink-0">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-700" />
            <span>Total Waktu Belajar: <strong>± 85 Menit</strong> (Fleksibel dalam 1–4 Pertemuan)</span>
          </div>
          <span className="bg-white text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
            Kelas 4 SD (Fase B)
          </span>
        </div>

        {/* Daftar 4 Sesi */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {sessions.map((sess, idx) => (
            <div key={idx} className={`border-2 rounded-2xl p-3.5 space-y-2 ${sess.color}`}>
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-sm sm:text-base font-heading">
                  {sess.session}
                </span>
                <span className="bg-white/90 text-slate-800 font-extrabold text-xs px-2.5 py-1 rounded-full shadow-xs">
                  {sess.duration}
                </span>
              </div>

              <ul className="space-y-1">
                {sess.items.map((it, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>

              <div className="text-[11px] text-slate-600 font-medium pt-1 border-t border-black/5">
                <strong>Tujuan Pembelajaran:</strong> {sess.cpGoal}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Tombol Istirahat & Simpan */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => {
              audioService.playTapSound();
              onClose();
            }}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>

          {onPauseAndSave && (
            <button
              onClick={() => {
                audioService.playSuccessSound();
                onPauseAndSave();
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs border-b-2 border-amber-700 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Coffee className="w-4 h-4" />
              <span>Istirahat dan Simpan Sesi ☕</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
