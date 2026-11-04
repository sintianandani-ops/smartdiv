/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Halaman Cetak Penanda AR (Printable AR Markers):
 * Berisi 3 pola penanda hitam-putih kontras tinggi untuk Level 1, Level 2, dan Level 3.
 * Siap dicetak langsung ke printer kelas atau disimpan sebagai PDF.
 */

import React from 'react';
import { X, Printer, Download, Sparkles } from 'lucide-react';

interface MarkerPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MarkerPrintModal: React.FC<MarkerPrintModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="bg-amber-400 px-6 py-4 flex items-center justify-between border-b-2 border-amber-500">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🖨️</span>
            <div>
              <h3 className="font-extrabold text-amber-950 text-lg sm:text-xl font-heading">
                Lembar Kartu Penanda AR (SMART-DIV)
              </h3>
              <p className="text-xs text-amber-900 font-semibold">
                Cetak di kertas HVS A4 untuk dipakai di depan kamera
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-amber-500 text-amber-950 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Konten 3 Penanda */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-amber-950 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-600 shrink-0" />
            <p>
              <strong>Petunjuk Guru/Peneliti:</strong> Cetak lembar ini dan potong menjadi 3 kartu. Letakkan kartu di atas meja siswa, lalu buka <strong>Mode AR Kamera</strong> pada aplikasi untuk memunculkan objek 3D di atas kartu!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Marker Level 1: Pulau Kelereng */}
            <div className="border-4 border-black p-4 rounded-2xl flex flex-col items-center bg-white shadow-sm">
              <span className="font-extrabold text-sm mb-2 text-slate-800">
                LEVEL 1: PULAU KELERENG
              </span>
              <div className="w-48 h-48 bg-black p-4 flex items-center justify-center">
                <div className="w-full h-full bg-white p-3 flex flex-col items-center justify-center border-4 border-black">
                  <div className="w-16 h-16 rounded-full border-8 border-black flex items-center justify-center font-black text-3xl">
                    ●
                  </div>
                  <span className="font-black text-xl mt-2 tracking-widest">K-01</span>
                </div>
              </div>
              <span className="text-xs text-slate-500 mt-2 font-bold">
                (Habis Dibagi & Bersisa)
              </span>
            </div>

            {/* Marker Level 2: Pulau Pasangan Ajaib */}
            <div className="border-4 border-black p-4 rounded-2xl flex flex-col items-center bg-white shadow-sm">
              <span className="font-extrabold text-sm mb-2 text-slate-800">
                LEVEL 2: PASANGAN AJAIB
              </span>
              <div className="w-48 h-48 bg-black p-4 flex items-center justify-center">
                <div className="w-full h-full bg-white p-3 flex flex-col items-center justify-center border-4 border-black">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="w-6 h-6 bg-black" />
                    <div className="w-6 h-6 border-4 border-black" />
                    <div className="w-6 h-6 border-4 border-black" />
                    <div className="w-6 h-6 bg-black" />
                  </div>
                  <span className="font-black text-xl mt-2 tracking-widest">P-02</span>
                </div>
              </div>
              <span className="text-xs text-slate-500 mt-2 font-bold">
                (Kebalikan Perkalian)
              </span>
            </div>

            {/* Marker Level 3: Pulau Kotak Kosong */}
            <div className="border-4 border-black p-4 rounded-2xl flex flex-col items-center bg-white shadow-sm">
              <span className="font-extrabold text-sm mb-2 text-slate-800">
                LEVEL 3: KOTAK KOSONG
              </span>
              <div className="w-48 h-48 bg-black p-4 flex items-center justify-center">
                <div className="w-full h-full bg-white p-3 flex flex-col items-center justify-center border-4 border-black">
                  <div className="w-14 h-14 border-8 border-black flex items-center justify-center font-black text-2xl">
                    Ø
                  </div>
                  <span className="font-black text-xl mt-2 tracking-widest">Z-03</span>
                </div>
              </div>
              <span className="text-xs text-slate-500 mt-2 font-bold">
                (Pembagian dengan Nol)
              </span>
            </div>
          </div>
        </div>

        {/* Footer Tombol Cetak */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-6 py-2.5 rounded-2xl shadow-md active:scale-95 transition-all"
          >
            <Printer className="w-5 h-5" />
            <span>Cetak Halaman Ini (Print)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
