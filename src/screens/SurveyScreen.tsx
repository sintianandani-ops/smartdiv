/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Layar Angket "Pendapatmu" (10 Pernyataan):
 * - Jawaban 3 pilihan ikon ramah anak: Iya = 3, Kadang-kadang = 2, Tidak = 1
 * - Bersuara otomatis membacakan setiap pernyataan dengan tombol ulangi suara
 * - Hasil disimpan ke profil siswa untuk analisis kepraktisan penelitian
 */

import React, { useState, useEffect } from 'react';
import { Volume2, Smile, Meh, Frown, CheckCircle, ArrowRight } from 'lucide-react';
import { MascotKakBagi } from '../components/MascotKakBagi';
import { audioService } from '../services/audioService';
import { storageService } from '../services/storageService';

interface SurveyScreenProps {
  studentCode: string;
  onFinishSurvey: () => void;
}

export const SurveyScreen: React.FC<SurveyScreenProps> = ({
  studentCode,
  onFinishSurvey,
}) => {
  const statements = [
    'Aku senang belajar pembagian dengan AR.',
    'Petunjuk di aplikasi mudah kumengerti.',
    'Gambar dan benda 3D membuatku lebih mengerti pembagian.',
    'Aku bisa menggeser benda sendiri dengan mudah.',
    'Petunjuk bantuan membantuku saat aku bingung.',
    'Aku jadi tahu bagian jawabanku yang tadi keliru.',
    'Aku mengerti hubungan pembagian dan perkalian.',
    'Aku mengerti kenapa sisa pembagian harus lebih kecil dari pembagi.',
    'Aku ingin belajar matematika lagi dengan AR.',
    'Aku tidak takut salah saat memakai AR.',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const prog = storageService.getStudentProgress(studentCode);
    if (prog.surveyAnswers && prog.surveyAnswers.length > 0) {
      setAnswers(prog.surveyAnswers);
    }
  }, [studentCode]);

  useEffect(() => {
    const text = `Pernyataan nomor ${currentIndex + 1}. ${statements[currentIndex]}`;
    setIsSpeaking(true);
    audioService.speak(text, {
      onEnd: () => setIsSpeaking(false),
    });
  }, [currentIndex]);

  const handleChoose = (score: number) => {
    audioService.playTapSound();
    const newAnswers = [...answers];
    newAnswers[currentIndex] = score;
    setAnswers(newAnswers);

    const prog = storageService.getStudentProgress(studentCode);
    prog.surveyAnswers = newAnswers;
    storageService.saveStudentProgress(prog);

    if (currentIndex < statements.length - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 350);
    } else {
      audioService.playSuccessSound();
      audioService.speak(
        'Terima kasih banyak atas pendapatmu! Sekarang mari kita lihat Sertifikat Petualangmu!'
      );
      prog.currentStep = 'certificate';
      storageService.saveStudentProgress(prog);
      setTimeout(() => {
        onFinishSurvey();
      }, 1000);
    }
  };

  const currentSelection = answers[currentIndex];

  return (
    <div className="w-full max-w-3xl mx-auto h-full flex flex-col justify-between py-1 px-2 sm:px-3 space-y-2">
      {/* Header Angket Ringkas */}
      <div className="bg-white border-2 border-amber-300 rounded-2xl px-3 py-1.5 shadow-xs flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <MascotKakBagi size="xs" mood="happy" isSpeaking={isSpeaking} />
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              Langkah 5: Pendapatmu
            </span>
            <h2 className="text-xs sm:text-sm font-black text-slate-900 font-heading">
              Bagaimana Pengalaman Belajarmu? 😊
            </h2>
          </div>
        </div>

        {/* Progress Dots 1..10 */}
        <div className="flex items-center gap-1">
          {statements.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex
                  ? 'bg-amber-500 scale-125'
                  : answers[i] !== undefined
                  ? 'bg-emerald-400'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Kartu Pernyataan Utama Ringkas */}
      <div className="bg-white border-2 border-amber-200 rounded-2xl p-3 sm:p-4 shadow-sm space-y-3 text-center flex-1 flex flex-col justify-center">
        <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest block">
          Pernyataan {currentIndex + 1} dari {statements.length}
        </span>

        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between gap-2.5">
          <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug font-heading flex-1 text-center">
            "{statements[currentIndex]}"
          </p>
          <button
            onClick={() => {
              setIsSpeaking(true);
              audioService.speak(statements[currentIndex], {
                onEnd: () => setIsSpeaking(false),
              });
            }}
            className="p-1.5 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-lg shadow-xs shrink-0 active:scale-95"
            title="Dengarkan suara"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Tiga Pilihan Emotikon Proporsional */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {/* Iya = 3 */}
          <button
            onClick={() => handleChoose(3)}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 active:scale-95 shadow-xs ${
              currentSelection === 3
                ? 'bg-emerald-100 border-emerald-500 text-emerald-950 ring-2 ring-emerald-200 scale-102'
                : 'bg-emerald-50/70 hover:bg-emerald-100 border-emerald-300 text-emerald-950'
            }`}
          >
            <Smile className="w-7 h-7 text-emerald-600" />
            <span className="text-sm font-black font-heading">Iya</span>
            <span className="text-[10px] font-bold text-emerald-700">(Setuju Sekali)</span>
          </button>

          {/* Kadang-kadang = 2 */}
          <button
            onClick={() => handleChoose(2)}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 active:scale-95 shadow-xs ${
              currentSelection === 2
                ? 'bg-amber-100 border-amber-500 text-amber-950 ring-2 ring-amber-200 scale-102'
                : 'bg-amber-50/70 hover:bg-amber-100 border-amber-300 text-amber-950'
            }`}
          >
            <Meh className="w-7 h-7 text-amber-600" />
            <span className="text-sm font-black font-heading">Kadang-kadang</span>
            <span className="text-[10px] font-bold text-amber-700">(Cukup Setuju)</span>
          </button>

          {/* Tidak = 1 */}
          <button
            onClick={() => handleChoose(1)}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 active:scale-95 shadow-xs ${
              currentSelection === 1
                ? 'bg-slate-100 border-slate-500 text-slate-950 ring-2 ring-slate-300 scale-102'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
            }`}
          >
            <Frown className="w-7 h-7 text-slate-500" />
            <span className="text-sm font-black font-heading">Tidak</span>
            <span className="text-[10px] font-bold text-slate-500">(Kurang Setuju)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
