/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Modal Verifikasi PIN Guru & Peneliti:
 * Melindungi Panel Peneliti agar siswa tidak sengaja membuka rekapitulasi atau nilai tes.
 */

import React, { useState } from 'react';
import { X, Lock, KeyRound, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { audioService } from '../services/audioService';

interface ResearcherPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResearcherPinModal: React.FC<ResearcherPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const correctPin = storageService.getResearcherPin();

    if (pin === correctPin) {
      audioService.playSuccessSound();
      setPin('');
      setErrorMsg('');
      onSuccess();
    } else {
      audioService.playGentleRetrySound();
      setErrorMsg('PIN belum sesuai. Silakan periksa kembali ya!');
    }
  };

  const handleKeyClick = (val: string) => {
    audioService.playTapSound();
    if (pin.length < 6) {
      setPin((prev) => prev + val);
    }
  };

  const handleBackspace = () => {
    audioService.playTapSound();
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border-4 border-slate-700 overflow-hidden text-center p-6 space-y-5 animate-bounce-slow">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-800 font-extrabold text-base">
            <Lock className="w-5 h-5 text-amber-500" />
            <span>Akses Khusus Guru & Peneliti</span>
          </div>
          <button
            onClick={() => {
              setPin('');
              setErrorMsg('');
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          Masukkan PIN Guru/Peneliti (Bawaan: <strong>1234</strong>)
        </p>

        {/* Kotak Input PIN Bulat */}
        <div className="flex justify-center gap-2 py-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center font-black text-xl transition-all ${
                pin.length > i
                  ? 'border-amber-400 bg-amber-100 text-amber-950 scale-105'
                  : 'border-slate-300 bg-slate-50 text-slate-300'
              }`}
            >
              {pin.length > i ? '●' : ''}
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Numpad Tombol Ceria */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyClick(digit)}
              className="py-3 rounded-2xl bg-slate-100 hover:bg-amber-100 text-slate-800 font-black text-lg active:scale-95 transition-all"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3 rounded-2xl bg-slate-200 text-slate-700 font-bold text-xs active:scale-95 transition-all"
          >
            Hapus
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick('0')}
            className="py-3 rounded-2xl bg-slate-100 hover:bg-amber-100 text-slate-800 font-black text-lg active:scale-95 transition-all"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm active:scale-95 transition-all shadow-md"
          >
            Buka
          </button>
        </div>
      </div>
    </div>
  );
};
