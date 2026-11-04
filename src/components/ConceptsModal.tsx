/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Modal Ringkasan Buku Konsep Pembagian:
 * - Menyajikan ringkasan 3 konsep utama secara ringkas, ramah anak, dan bersuara.
 * - Dilengkapi persamaan matematika visual berstandar tinggi.
 * - Bersih dari matriks rumus bertumpuk yang membingungkan.
 */

import React, { useState } from 'react';
import { X, Volume2 } from 'lucide-react';
import { DynamicEquationBadge } from './DynamicEquationBadge';
import { audioService } from '../services/audioService';

interface ConceptsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConceptsModal: React.FC<ConceptsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'k1' | 'k2' | 'k3'>('k1');

  if (!isOpen) return null;

  const playVoice = (text: string) => {
    audioService.playTapSound();
    audioService.speak(text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-4 border-sky-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-sky-400 px-6 py-3.5 flex items-center justify-between border-b-2 border-sky-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <div>
              <h3 className="font-extrabold text-sky-950 text-base sm:text-lg font-heading">
                Buku Rahasia Konsep Pembagian
              </h3>
              <p className="text-xs text-sky-900 font-semibold">
                Dengarkan penjelasan Kak Bagi kapan saja kamu perlu!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audioService.stopSpeaking();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-sky-500 text-sky-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigasi Konsep */}
        <div className="flex border-b border-sky-200 bg-sky-50/50 p-2 gap-1.5 shrink-0">
          <button
            onClick={() => {
              setActiveTab('k1');
              audioService.playTapSound();
            }}
            className={`flex-1 py-2 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'k1'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-white text-sky-900 hover:bg-sky-100'
            }`}
          >
            1. Habis & Bersisa
          </button>
          <button
            onClick={() => {
              setActiveTab('k2');
              audioService.playTapSound();
            }}
            className={`flex-1 py-2 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'k2'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-white text-sky-900 hover:bg-sky-100'
            }`}
          >
            2. Kebalikan Perkalian
          </button>
          <button
            onClick={() => {
              setActiveTab('k3');
              audioService.playTapSound();
            }}
            className={`flex-1 py-2 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'k3'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-white text-sky-900 hover:bg-sky-100'
            }`}
          >
            3. Pembagian Nol
          </button>
        </div>

        {/* Isi Tab */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {activeTab === 'k1' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-3.5 rounded-2xl">
                <div>
                  <h4 className="font-extrabold text-amber-950 text-sm sm:text-base">
                    Konsep 1: Habis Dibagi & Bersisa
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-900 mt-0.5">
                    Membagi artinya membagikan sama banyak ke beberapa tempat.
                  </p>
                </div>
                <button
                  onClick={() =>
                    playVoice(
                      'Membagi artinya membagikan sama banyak. Jika tidak ada sisa, disebut habis dibagi. Sisa pembagian harus selalu lebih kecil dari pembagi!'
                    )
                  }
                  className="p-2.5 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-xl shadow-xs shrink-0"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col items-center gap-2">
                <DynamicEquationBadge
                  dividend={12}
                  divisor={4}
                  quotient={3}
                  remainder={0}
                  subtitle="Habis dibagi (sisa 0)"
                  className="w-full"
                />
                <DynamicEquationBadge
                  dividend={13}
                  divisor={4}
                  quotient={3}
                  remainder={1}
                  showCheck={true}
                  subtitle="Pembagian bersisa: 13 = (4 × 3) + 1"
                  className="w-full"
                />
              </div>

              <div className="bg-sky-50 p-3 rounded-2xl border border-sky-200 text-xs sm:text-sm text-sky-950 space-y-1">
                <p className="font-bold">✨ Aturan Emas Sisa:</p>
                <p>
                  Sisa pembagian <strong>harus selalu lebih kecil</strong> dari pembagi, karena jika masih sama atau lebih besar, artinya masih bisa dibagikan lagi!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'k2' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
                <div>
                  <h4 className="font-extrabold text-emerald-950 text-sm sm:text-base">
                    Konsep 2: Pembagian Kebalikan Perkalian
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-900 mt-0.5">
                    Perkalian menyusun rapi, pembagian membongkar kembali!
                  </p>
                </div>
                <button
                  onClick={() =>
                    playVoice(
                      'Pembagian adalah kebalikan dari perkalian. Untuk mengecek hasil bagimu, kalikan hasil bagi dengan pembagi, hasilnya harus sama dengan bilangan semula.'
                    )
                  }
                  className="p-2.5 bg-emerald-400 hover:bg-emerald-500 text-emerald-950 rounded-xl shadow-xs shrink-0"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col items-center gap-2">
                <DynamicEquationBadge
                  dividend={15}
                  divisor={3}
                  quotient={5}
                  variant="inverse"
                  subtitle="Jika 3 × 5 = 15, maka 15 : 3 = 5"
                  className="w-full"
                />
              </div>

              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 space-y-1">
                <p className="font-bold">✨ Cara Cepat Mengecek Pembagian:</p>
                <p>
                  Hasil Bagi × Pembagi = Bilangan yang Dibagi.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'k3' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-rose-50 border border-rose-200 p-3.5 rounded-2xl">
                <div>
                  <h4 className="font-extrabold text-rose-950 text-sm sm:text-base">
                    Konsep 3: Pembagian dengan Nol
                  </h4>
                  <p className="text-xs sm:text-sm text-rose-900 mt-0.5">
                    Jangan pernah membagi bilangan dengan nol!
                  </p>
                </div>
                <button
                  onClick={() =>
                    playVoice(
                      'Bilangan dibagi nol tidak bisa dilakukan karena tidak ada tempat menerima. Sedangkan nol dibagi bilangan lain hasilnya selalu nol.'
                    )
                  }
                  className="p-2.5 bg-rose-400 hover:bg-rose-500 text-rose-950 rounded-xl shadow-xs shrink-0"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <DynamicEquationBadge
                  dividend={10}
                  divisor={0}
                  variant="zero-division"
                  subtitle="Tidak ada kotak penerima, dan 0 × berapapun hasilnya tetap 0"
                  className="w-full"
                />
                <DynamicEquationBadge
                  dividend={0}
                  divisor={5}
                  quotient={0}
                  variant="zero-division"
                  subtitle="Tidak ada benda yang dibagikan, semua tempat tetap kosong"
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-sky-50 px-6 py-3 border-t border-sky-200 flex justify-end shrink-0">
          <button
            onClick={() => {
              audioService.stopSpeaking();
              onClose();
            }}
            className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-xl shadow-xs transition-all active:scale-95 text-xs sm:text-sm"
          >
            Aku Mengerti! 👍
          </button>
        </div>
      </div>
    </div>
  );
};
