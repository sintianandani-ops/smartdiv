/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Mode AR Kamera (Berbasis Penanda/Marker AR):
 * Berdasarkan Temuan Validasi Ahli Media No. 3:
 * - Bingkai pemandu dan teks "Arahkan kamera ke penanda Level [n]"
 * - Timer 8 detik: jika penanda belum terdeteksi setelah 8s, munculkan tips ramah
 *   ("Cari tempat lebih terang", "Dekatkan kamera", atau "Coba mode 3D")
 * - Transisi mulus ke Mode 3D Tanpa Kamera
 */

import React, { useEffect, useRef, useState } from 'react';
import { Camera, Printer, AlertTriangle, CheckCircle, ArrowLeft, Lightbulb, Box } from 'lucide-react';
import { audioService } from '../../services/audioService';

interface CameraArViewProps {
  levelNumber: 1 | 2 | 3;
  levelTitle: string;
  onFallbackTo3D: () => void;
  onOpenMarkerPrint: () => void;
  children: React.ReactNode;
}

export const CameraArView: React.FC<CameraArViewProps> = ({
  levelNumber,
  levelTitle,
  onFallbackTo3D,
  onOpenMarkerPrint,
  children,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraState, setCameraState] = useState<'requesting' | 'active' | 'error'>('requesting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showHelpTips, setShowHelpTips] = useState<boolean>(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    audioService.speak(
      `Arahkan kameramu ke kartu penanda Level ${levelNumber}. Letakkan kartu di tempat yang cukup terang ya!`
    );

    const initCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Kamera tidak didukung pada browser ini.');
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraState('active');
        }
      } catch (err: unknown) {
        console.warn('Gagal membuka kamera:', err);
        setCameraState('error');
        setErrorMessage(
          'Kamera belum dapat digunakan. Yuk kita lanjut bermain di Mode 3D Tanpa Kamera yang sangat seru!'
        );
        audioService.speak(
          'Kamera belum dapat digunakan. Jangan khawatir, kita beralih ke Mode 3D layar yang seru!'
        );
      }
    };

    initCamera();

    // Timer bantuan 8 detik (Temuan Validator 3)
    const helpTimer = window.setTimeout(() => {
      setShowHelpTips(true);
      audioService.speak('Jika penanda belum terdeteksi, coba cari tempat lebih terang, dekatkan kamera, atau beralih ke Mode 3D.');
    }, 8000);

    return () => {
      clearTimeout(helpTimer);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [levelNumber]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border-4 border-purple-400 bg-slate-900 min-h-[460px] flex flex-col justify-between shadow-2xl">
      {/* Video Background Feed */}
      <video
        ref={videoRef}
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover z-0 ${
          cameraState === 'active' ? 'opacity-85' : 'opacity-0'
        }`}
      />

      {/* Overlay status dan tombol aksi */}
      <div className="relative z-10 p-3 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-2 bg-purple-900/90 border border-purple-400 text-white px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-extrabold shadow-md">
          <Camera className="w-4 h-4 text-purple-300 animate-pulse" />
          <span>Mode AR Kamera • {levelTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Cetak Penanda */}
          <button
            onClick={() => {
              audioService.playTapSound();
              onOpenMarkerPrint();
            }}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold px-3 py-1.5 rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Penanda</span>
          </button>

          {/* Tombol kembali ke Mode 3D */}
          <button
            onClick={() => {
              audioService.playTapSound();
              onFallbackTo3D();
            }}
            className="flex items-center gap-1.5 bg-white/95 hover:bg-white text-slate-800 font-bold px-3 py-1.5 rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Mode 3D Layar</span>
          </button>
        </div>
      </div>

      {/* Target Reticle AR di tengah kamera */}
      {cameraState === 'active' && (
        <div className="relative z-10 flex flex-col items-center justify-center p-3">
          <div className="w-64 h-64 sm:w-80 sm:h-80 border-4 border-dashed border-amber-300 rounded-3xl flex flex-col items-center justify-center bg-black/25 backdrop-blur-[1px] relative shadow-lg">
            {/* Sudut-sudut bidik */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

            {/* Konten 3D di dalam bingkai */}
            <div className="w-full h-full p-2">{children}</div>
          </div>

          <div className="mt-2.5 flex items-center gap-2 bg-black/75 text-white font-extrabold text-xs sm:text-sm px-4 py-1.5 rounded-2xl border border-white/20 shadow-md">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Arahkan kamera ke penanda Level {levelNumber}</span>
          </div>

          {/* Bantuan Otomatis setelah 8 Detik (Temuan Validator 3) */}
          {showHelpTips && (
            <div className="mt-3 max-w-md w-full bg-amber-50/95 border-2 border-amber-400 text-amber-950 p-2.5 rounded-2xl shadow-xl flex items-center justify-between gap-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  Penanda belum terbaca? <strong>Cari tempat lebih terang</strong>, <strong>dekatkan kamera</strong>, atau beralih ke <strong>Mode 3D</strong>.
                </span>
              </div>
              <button
                onClick={onFallbackTo3D}
                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shrink-0 cursor-pointer shadow-xs active:scale-95"
              >
                Coba Mode 3D
              </button>
            </div>
          )}
        </div>
      )}

      {/* Fallback jika kamera error */}
      {cameraState === 'error' && (
        <div className="relative z-10 p-6 flex flex-col items-center justify-center text-center space-y-4 my-auto">
          <div className="w-16 h-16 bg-rose-500/20 border-2 border-rose-400 rounded-full flex items-center justify-center text-rose-300">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <p className="text-white font-bold text-sm sm:text-base max-w-md">{errorMessage}</p>
          <button
            onClick={onFallbackTo3D}
            className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-black px-6 py-3 rounded-2xl shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <Box className="w-5 h-5" />
            <span>Bermain di Mode 3D Layar (Lengkap & Lancar)</span>
          </button>
        </div>
      )}

      <div className="relative z-10 pb-2" />
    </div>
  );
};
