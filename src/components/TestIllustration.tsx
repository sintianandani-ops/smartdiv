/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Ilustrasi Netral Soal Tes (Pretest & Posttest):
 * Memberi gambaran visual ramah anak tanpa membocorkan jawaban matematika.
 */

import React from 'react';

interface TestIllustrationProps {
  type: 'candy_zero' | 'zero_divided' | 'array_fact' | 'check_mult' | 'boxes_remainder' | 'wrong_remainder';
}

export const TestIllustration: React.FC<TestIllustrationProps> = ({ type }) => {
  switch (type) {
    case 'candy_zero':
      return (
        <div className="flex items-center justify-center p-3 bg-rose-50/60 rounded-3xl border border-rose-200">
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-xs">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 shadow-sm flex items-center justify-center text-white text-xs font-bold ring-2 ring-white"
              >
                🍬
              </div>
            ))}
          </div>
        </div>
      );

    case 'zero_divided':
      return (
        <div className="flex items-center justify-center p-3 bg-sky-50/60 rounded-3xl border border-sky-200">
          <div className="flex items-center gap-3 text-2xl font-black text-sky-800">
            <span className="w-12 h-12 rounded-2xl bg-white shadow-sm border-2 border-sky-300 flex items-center justify-center text-sky-600">
              0
            </span>
            <span className="text-3xl text-sky-400">:</span>
            <span className="w-12 h-12 rounded-2xl bg-white shadow-sm border-2 border-sky-300 flex items-center justify-center text-sky-600">
              ?
            </span>
          </div>
        </div>
      );

    case 'array_fact':
      return (
        <div className="flex items-center justify-center p-3 bg-emerald-50/60 rounded-3xl border border-emerald-200">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-white border-2 border-emerald-300 rounded-xl font-bold text-emerald-800 shadow-sm">
              Perkalian ✖️
            </div>
            <span className="text-xl font-bold text-emerald-600">⇄</span>
            <div className="px-3 py-1.5 bg-white border-2 border-emerald-300 rounded-xl font-bold text-emerald-800 shadow-sm">
              Pembagian ➗
            </div>
          </div>
        </div>
      );

    case 'check_mult':
      return (
        <div className="flex items-center justify-center p-3 bg-amber-50/60 rounded-3xl border border-amber-200">
          <div className="flex items-center gap-2 text-amber-900 font-bold bg-white px-4 py-2 rounded-2xl border-2 border-amber-300 shadow-sm">
            <span className="text-2xl">🔍</span>
            <span className="text-sm">Mari kita periksa dengan perkalian!</span>
          </div>
        </div>
      );

    case 'boxes_remainder':
      return (
        <div className="flex items-center justify-center p-3 bg-purple-50/60 rounded-3xl border border-purple-200">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((b) => (
              <div
                key={b}
                className="w-10 h-10 rounded-xl bg-purple-200 border-2 border-purple-400 flex items-center justify-center text-purple-900 font-black text-xs shadow-sm"
              >
                📦
              </div>
            ))}
          </div>
        </div>
      );

    case 'wrong_remainder':
    default:
      return (
        <div className="flex items-center justify-center p-3 bg-indigo-50/60 rounded-3xl border border-indigo-200">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-2 border-indigo-300 shadow-sm text-indigo-900 font-extrabold text-sm">
            <span>✏️ Catatan Pembagian Bersisa</span>
          </div>
        </div>
      );
  }
};
