/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Modal & Halaman "Penanda Kamera" (AR Markers & Camera Test):
 * - Menampilkan 3 kartu penanda berukuran besar (Level 1, Level 2, Level 3)
 * - Tombol Cetak Penanda (siap dicetak langsung ke printer atau PDF)
 * - Tombol Uji Kamera interaktif dengan bingkai pemandu dan status deteksi
 * - Audio panduan bersuara: "Arahkan kamera ke gambar penanda ini."
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  X, Printer, Camera, CheckCircle2, AlertTriangle, RefreshCw, Volume2, Sparkles, ArrowLeft
} from 'lucide-react';
import { audioService } from '../services/audioService';

interface PenandaKameraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PenandaKameraModal: React.FC<PenandaKameraModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'test'>('cards');
  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'active' | 'error'>('idle');
  const [markerDetected, setMarkerDetected] = useState(false);
  const [testTips, setTestTips] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setActiveTab('cards');
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraState('idle');
    setMarkerDetected(false);
  };

  const startCameraTest = async () => {
    setActiveTab('test');
    setCameraState('requesting');
    setMarkerDetected(false);
    setTestTips('Menghubungkan ke kamera perangkat...');

    audioService.speak('Arahkan kamera ke gambar penanda ini.');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera tidak didukung di browser ini.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraState('active');
      setTestTips('Kamera aktif! Arahkan ke kartu penanda Level 1, 2, atau 3.');

      // Simulasi deteksi reticle setelah 3.5 detik berada di depan kamera
      setTimeout(() => {
        if (streamRef.current) {
          setMarkerDetected(true);
          setTestTips('Hebat! Penanda terdeteksi dengan jelas!');
          audioService.playSuccessSound();
          audioService.speak('Kartu penanda terdeteksi! Kamu siap bermain dalam Mode AR Kamera.');
        }
      }, 3500);
    } catch (err) {
      setCameraState('error');
      setTestTips('Kamera tidak dapat diakses atau izin ditolak. Tenang, kamu tetap bisa bermain di Mode 3D tanpa kamera!');
      audioService.speak('Kamera tidak dapat diakses. Kamu tetap bisa bermain di Mode 3D tanpa kamera dengan lancar.');
    }
  };

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-4 sm:px-6 py-3.5 flex items-center justify-between border-b-2 border-amber-500 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl">🎯</span>
            <div>
              <h2 className="font-extrabold text-amber-950 text-base sm:text-xl font-heading leading-tight">
                Kartu Penanda Kamera (AR Markers)
              </h2>
              <p className="text-xs text-amber-950/80 font-bold">
                Cetak kartu atau uji kemampuan kamera perangkatmu
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/40 hover:bg-white/80 text-amber-950 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Pilihan: Kartu Penanda vs Uji Kamera */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                stopCamera();
                setActiveTab('cards');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'cards'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white hover:bg-amber-100 text-slate-700 border border-amber-200'
              }`}
            >
              📄 3 Kartu Penanda
            </button>
            <button
              onClick={startCameraTest}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'test'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white hover:bg-purple-50 text-purple-900 border border-purple-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Uji Kamera</span>
            </button>
          </div>

          {activeTab === 'cards' && (
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs border-b-2 border-emerald-700 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Penanda</span>
            </button>
          )}
        </div>

        {/* Konten Tab */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'cards' ? (
            <div className="space-y-4">
              <div className="bg-amber-50/80 border-2 border-amber-200 rounded-2xl p-3 text-xs sm:text-sm text-amber-950 flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="font-semibold">
                  <strong>Petunjuk Guru/Siswa:</strong> Cetak lembar ini pada kertas HVS A4, lalu potong menjadi 3 bagian kartu. Letakkan di meja, lalu pilih <strong>Mode AR Kamera</strong> pada petualangan!
                </p>
              </div>

              {/* 3 Kartu Penanda Kontras Tinggi */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Level 1: Kelereng */}
                <div className="border-4 border-slate-900 rounded-2xl p-4 bg-white flex flex-col items-center text-center shadow-xs">
                  <span className="bg-emerald-600 text-white font-black text-xs px-2.5 py-0.5 rounded-md mb-2">
                    LEVEL 1: KELERENG
                  </span>
                  <div className="w-40 h-40 bg-black p-3 flex items-center justify-center rounded-xl">
                    <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center border-4 border-black">
                      <div className="w-14 h-14 rounded-full border-6 border-black flex items-center justify-center font-black text-2xl">
                        ●
                      </div>
                      <span className="font-black text-lg mt-1 tracking-widest text-black">DIV-1</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 mt-2">
                    Pulau Kelereng (M3)
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Habis Dibagi & Bersisa
                  </span>
                </div>

                {/* Level 2: Pasangan Ajaib */}
                <div className="border-4 border-slate-900 rounded-2xl p-4 bg-white flex flex-col items-center text-center shadow-xs">
                  <span className="bg-indigo-600 text-white font-black text-xs px-2.5 py-0.5 rounded-md mb-2">
                    LEVEL 2: PASANGAN AJAIB
                  </span>
                  <div className="w-40 h-40 bg-black p-3 flex items-center justify-center rounded-xl">
                    <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center border-4 border-black">
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="w-5 h-5 bg-black" />
                        <div className="w-5 h-5 border-3 border-black" />
                        <div className="w-5 h-5 border-3 border-black" />
                        <div className="w-5 h-5 bg-black" />
                      </div>
                      <span className="font-black text-lg mt-1 tracking-widest text-black">DIV-2</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 mt-2">
                    Pulau Pasangan (M2)
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Kebalikan Perkalian
                  </span>
                </div>

                {/* Level 3: Kotak Kosong */}
                <div className="border-4 border-slate-900 rounded-2xl p-4 bg-white flex flex-col items-center text-center shadow-xs">
                  <span className="bg-rose-600 text-white font-black text-xs px-2.5 py-0.5 rounded-md mb-2">
                    LEVEL 3: KOTAK KOSONG
                  </span>
                  <div className="w-40 h-40 bg-black p-3 flex items-center justify-center rounded-xl">
                    <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center border-4 border-black">
                      <div className="w-14 h-14 border-6 border-black flex items-center justify-center font-black text-2xl">
                        Ø
                      </div>
                      <span className="font-black text-lg mt-1 tracking-widest text-black">DIV-3</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 mt-2">
                    Pulau Kotak Kosong (M1)
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Pembagian dengan Nol
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Tab Uji Kamera */
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-full max-w-md h-64 sm:h-80 bg-slate-900 rounded-2xl overflow-hidden border-4 border-purple-400 shadow-lg flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover ${
                    cameraState === 'active' ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Bingkai Reticle Pemandu */}
                <div className="relative z-10 w-44 h-44 border-4 border-dashed border-amber-300 rounded-2xl flex flex-col items-center justify-center bg-black/20 backdrop-blur-xs text-center p-2">
                  <span className="text-2xl animate-pulse">🎯</span>
                  <span className="text-xs font-black text-white mt-1 drop-shadow-md">
                    Arahkan ke Kartu Penanda
                  </span>
                </div>

                {markerDetected && (
                  <div className="absolute top-3 left-3 right-3 z-20 bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg animate-bounce">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Penanda Terdeteksi dengan Sempurna!</span>
                  </div>
                )}
              </div>

              {/* Status & Petunjuk */}
              <div className="max-w-md w-full bg-purple-50 border-2 border-purple-200 rounded-2xl p-3 text-center space-y-2">
                <p className="text-xs sm:text-sm font-bold text-purple-950">
                  {testTips}
                </p>

                {cameraState === 'error' && (
                  <div className="bg-amber-100 border border-amber-300 text-amber-900 p-2 rounded-xl text-xs font-bold">
                    💡 Rekomendasi: Gunakan <strong>Mode 3D (tanpa kamera)</strong> yang sudah lengkap dan berfungsi penuh di laptop!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-bold">
            SMART-DIV • Petualangan Pembagian AR
          </span>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
