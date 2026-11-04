/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Komponen Persamaan Matematika (Equation) Dinamis & Visual:
 * - Menampilkan kalimat matematika pembagian dengan kode warna semantik:
 *   Dividen (Biru), Pembagi (Ungu), Hasil Bagi (Hijau), Sisa (Oranye).
 * - Mendukung format standar (A : B = C sisa D), format kebalikan (C × B = A),
 *   serta format khusus pembagian nol.
 * - Sangat mudah dibaca oleh siswa kelas 4 SD.
 */

import React from 'react';

export interface DynamicEquationProps {
  dividend?: number | string;
  divisor?: number | string;
  quotient?: number | string;
  remainder?: number | string;
  showCheck?: boolean; // Tampilkan juga bentuk perkalian pengecekan
  customEquation?: string;
  variant?: 'standard' | 'zero-division' | 'inverse' | 'comparison' | 'custom';
  className?: string;
  subtitle?: string;
}

export const DynamicEquationBadge: React.FC<DynamicEquationProps> = ({
  dividend,
  divisor,
  quotient,
  remainder,
  showCheck = false,
  customEquation,
  variant = 'standard',
  className = '',
  subtitle,
}) => {
  // Jika varian custom string
  if (variant === 'custom' || customEquation) {
    return (
      <div className={`inline-flex flex-col items-center justify-center bg-white/95 border-2 border-indigo-200 rounded-2xl px-4 py-2 shadow-xs ${className}`}>
        <div className="text-base sm:text-lg font-black font-heading text-indigo-950 tracking-wide flex items-center gap-1.5 flex-wrap justify-center">
          {customEquation}
        </div>
        {subtitle && (
          <span className="text-[11px] font-bold text-slate-500 mt-0.5">{subtitle}</span>
        )}
      </div>
    );
  }

  // Jika varian pembagian dengan nol
  if (variant === 'zero-division') {
    const isDividedByZero = divisor === 0 || divisor === '0';
    return (
      <div className={`inline-flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 transition-all shadow-xs ${
        isDividedByZero
          ? 'bg-rose-50/90 border-rose-300 text-rose-950'
          : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
      } ${className}`}>
        <div className="flex items-center gap-2 font-heading font-black text-base sm:text-xl flex-wrap justify-center">
          <span className="px-2.5 py-0.5 bg-white rounded-lg border border-slate-300 shadow-xs text-indigo-700">
            {dividend}
          </span>
          <span className="text-amber-600 font-extrabold">:</span>
          <span className={`px-2.5 py-0.5 bg-white rounded-lg border shadow-xs ${
            isDividedByZero ? 'border-rose-400 text-rose-600 font-extrabold' : 'border-purple-300 text-purple-700'
          }`}>
            {divisor}
          </span>
          <span className="text-slate-500 font-extrabold">=</span>
          {isDividedByZero ? (
            <span className="px-3 py-0.5 bg-rose-600 text-white rounded-lg shadow-xs text-xs sm:text-sm font-black tracking-wide animate-pulse">
              TIDAK BISA DILAKUKAN ❌
            </span>
          ) : (
            <span className="px-3 py-0.5 bg-emerald-600 text-white rounded-lg shadow-xs text-sm sm:text-base font-black">
              {quotient ?? '0'} ✅
            </span>
          )}
        </div>
        {subtitle && (
          <span className={`text-[11px] font-bold mt-1 ${isDividedByZero ? 'text-rose-700' : 'text-emerald-700'}`}>
            {subtitle}
          </span>
        )}
      </div>
    );
  }

  // Jika varian kebalikan perkalian (Level 2)
  if (variant === 'inverse') {
    return (
      <div className={`inline-flex flex-col items-center justify-center bg-white/95 border-2 border-emerald-200 rounded-2xl p-2.5 shadow-xs ${className}`}>
        <div className="flex items-center gap-2 text-sm sm:text-base font-black font-heading flex-wrap justify-center">
          {/* Sisi Pembagian */}
          <div className="flex items-center gap-1.5 bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
            <span className="text-sky-800">{dividend}</span>
            <span className="text-amber-600 font-bold">:</span>
            <span className="text-purple-700">{divisor}</span>
            <span className="text-slate-500">=</span>
            <span className="text-emerald-700 font-black">{quotient}</span>
          </div>

          <span className="text-emerald-600 font-extrabold text-lg">⇄</span>

          {/* Sisi Perkalian Kebalikan */}
          <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
            <span className="text-purple-700">{divisor}</span>
            <span className="text-amber-600 font-bold">×</span>
            <span className="text-emerald-700 font-black">{quotient}</span>
            <span className="text-slate-500">=</span>
            <span className="text-sky-800">{dividend}</span>
          </div>
        </div>
        {subtitle && (
          <span className="text-[11px] font-bold text-slate-500 mt-1">{subtitle}</span>
        )}
      </div>
    );
  }

  // Format Standar Pembagian (Level 1, Konsep, Tes)
  const hasRemainder = remainder !== undefined && remainder !== null && Number(remainder) > 0;

  return (
    <div className={`inline-flex flex-col items-center justify-center bg-white/95 border-2 border-amber-200 rounded-2xl px-3.5 py-2 shadow-xs transition-all ${className}`}>
      <div className="flex items-center gap-1.5 sm:gap-2 font-heading font-black text-base sm:text-lg text-slate-800 flex-wrap justify-center">
        {/* Bilangan yang dibagi (Dividen) */}
        <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg shadow-xs" title="Bilangan yang dibagi">
          {dividend ?? '?'}
        </span>

        {/* Tanda Bagi */}
        <span className="text-amber-600 font-extrabold text-lg">:</span>

        {/* Pembagi (Divisor) */}
        <span className="px-2.5 py-0.5 bg-purple-50 border border-purple-200 text-purple-800 rounded-lg shadow-xs" title="Pembagi / Jumlah Tempat">
          {divisor ?? '?'}
        </span>

        {/* Tanda Sama Dengan */}
        <span className="text-slate-400 font-bold">=</span>

        {/* Hasil Bagi (Quotient) */}
        <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg shadow-xs font-black" title="Hasil Bagi">
          {quotient ?? '?'}
        </span>

        {/* Sisa (Remainder) jika ada */}
        {hasRemainder && (
          <div className="flex items-center gap-1 ml-1 px-2.5 py-0.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs sm:text-sm font-extrabold" title="Sisa Pembagian">
            <span>sisa</span>
            <span className="font-black text-amber-950 underline">{remainder}</span>
          </div>
        )}

        {remainder !== undefined && remainder !== null && Number(remainder) === 0 && (
          <span className="text-xs font-bold text-emerald-600 ml-1">
            (Habis)
          </span>
        )}
      </div>

      {/* Bentuk Pengecekan: Dividen = (Pembagi × Hasil) + Sisa */}
      {showCheck && dividend && divisor && quotient !== undefined && (
        <div className="text-[11px] font-bold text-slate-600 mt-1 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
          <span className="text-slate-400">Cek:</span>
          <span>{dividend} = ({divisor} × {quotient})</span>
          {hasRemainder && <span>+ {remainder}</span>}
        </div>
      )}

      {subtitle && (
        <span className="text-[11px] font-bold text-slate-500 mt-0.5">{subtitle}</span>
      )}
    </div>
  );
};
