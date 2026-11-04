/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Layar Misi Awal (Pretest) dan Misi Akhir (Posttest) - Format Pilihan Ganda:
 * Desain Bebas Scroll (Single-Viewport Zero-Scroll Design):
 * - Seluruh elemen pas dalam 1 layar tanpa perlu scroll bar
 * - Menghilangkan elemen ilustrasi netral kotak di bawah soal yang membingungkan/terpotong
 * - Menyematkan badge persamaan matematika (equation) dinamis yang jelas dan kontras
 * - Navigasi soal interaktif (bisa klik nomor soal 1-6 atau tombol Sebelumnya/Lanjut)
 * - Apresiasi ceria bersuara saat jawaban disimpan
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowRight, ArrowLeft, CheckCircle2, Mic, Play, Pause, Square, Home, Volume2
} from 'lucide-react';
import { TestQuestion, PRETEST_QUESTIONS, POSTTEST_QUESTIONS, TestOption } from '../data/testQuestions';
import { MascotKakBagi } from '../components/MascotKakBagi';
import { audioService } from '../services/audioService';
import { storageService, StudentAnswer } from '../services/storageService';

interface TestScreenProps {
  testType: 'pre' | 'post';
  studentCode: string;
  onFinishTest: () => void;
  onGoHome?: () => void;
  isModalOpen?: boolean;
}

// Persamaan matematika ringkas per nomor soal agar konsep soal langsung terbaca jelas
const QUESTION_EQUATIONS: Record<'pre' | 'post', Record<number, { eq: string; label: string }>> = {
  pre: {
    1: { eq: '6 : 0 = ?', label: 'Pembagian dengan Nol' },
    2: { eq: '0 : 4 = ?', label: 'Nol Dibagi Bilangan' },
    3: { eq: '15 : 3 = 5 ⇄ ? × ? = ?', label: 'Kebalikan Perkalian' },
    4: { eq: '8 : 0 = ?', label: 'Pembagian dengan Nol' },
    5: { eq: '17 : 4 = 4 (sisa 1)', label: 'Aturan Sisa Pembagian' },
    6: { eq: '20 : 4 = 3 sisa 8 ?', label: 'Pemeriksaan Sisa Pembagian' },
  },
  post: {
    1: { eq: '8 : 0 = ?', label: 'Pembagian dengan Nol' },
    2: { eq: '0 : 7 = ?', label: 'Nol Dibagi Bilangan' },
    3: { eq: '7 × 3 = 21 ⇄ 21 : 3 = ?', label: 'Kebalikan Perkalian' },
    4: { eq: '12 : 0 = ?', label: 'Pembagian dengan Nol' },
    5: { eq: '23 : 5 = 4 (sisa 3)', label: 'Aturan Sisa Pembagian' },
    6: { eq: '19 : 4 = 3 sisa 7 ?', label: 'Pemeriksaan Sisa Pembagian' },
  },
};

export const TestScreen: React.FC<TestScreenProps> = ({
  testType,
  studentCode,
  onFinishTest,
  onGoHome,
  isModalOpen = false,
}) => {
  const questions: TestQuestion[] = testType === 'pre' ? PRETEST_QUESTIONS : POSTTEST_QUESTIONS;
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isSpeakingPrompt, setIsSpeakingPrompt] = useState(false);
  const [answersState, setAnswersState] = useState<Record<number, StudentAnswer>>({});
  const [savedNotification, setSavedNotification] = useState(false);
  const [showOptionalVoice, setShowOptionalVoice] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [celebrationPraise, setCelebrationPraise] = useState<string | null>(null);

  // Rekaman suara opsional
  const [isRecording, setIsRecording] = useState(false);
  const [hasVoice, setHasVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const currentQ = questions[currentQIndex];
  const eqData = QUESTION_EQUATIONS[testType][currentQ.number];

  // Muat jawaban tersimpan siswa
  useEffect(() => {
    const prog = storageService.getStudentProgress(studentCode);
    const existing = testType === 'pre' ? prog.pretestAnswers : prog.posttestAnswers;
    if (existing) {
      setAnswersState(existing);
    }
  }, [studentCode, testType]);

  // Muat status audio tersimpan per soal
  useEffect(() => {
    setAudioUrl(null);
    setHasVoice(false);
    setIsRecording(false);
    let active = true;

    storageService
      .getVoiceAudio(studentCode, testType, 'alasan', currentQ.number)
      .then((blob) => {
        if (blob && active) {
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          setHasVoice(true);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [studentCode, testType, currentQ.number]);

  // Bacakan otomatis soal saat nomor soal berganti atau saat modal ditutup
  useEffect(() => {
    setSavedNotification(false);
    setShowOptionalVoice(false);

    if (isModalOpen || isTransitioning) {
      return;
    }

    const speakQuestion = () => {
      const isFirstPretest = currentQIndex === 0 && testType === 'pre';
      const intro = isFirstPretest
        ? `Halo ${studentCode}! Selamat datang di Misi Awal. Soal nomor ${currentQ.number}. ${currentQ.promptText}`
        : `Soal nomor ${currentQ.number}. ${currentQ.promptText}`;
      setIsSpeakingPrompt(true);
      audioService.speak(intro, {
        onEnd: () => setIsSpeakingPrompt(false),
      });
    };

    const timer = setTimeout(speakQuestion, 600);
    return () => {
      clearTimeout(timer);
      if (!isTransitioning) {
        audioService.stopSpeaking();
      }
    };
  }, [currentQIndex, currentQ, isModalOpen, isTransitioning]);

  // Pilih Opsi Pilihan Ganda
  const handleSelectOption = (option: TestOption, index: number) => {
    audioService.playTapSound();
    const updatedAns: StudentAnswer = {
      selectedOptionLabel: option.label,
      selectedOptionIndex: index,
      selectedOptionText: option.text,
      textAnswer: `${option.label}. ${option.text}`,
      hasVoiceRecording: hasVoice,
      timestamp: Date.now(),
    };

    const newAnswers = { ...answersState, [currentQ.number]: updatedAns };
    setAnswersState(newAnswers);

    const prog = storageService.getStudentProgress(studentCode);
    if (testType === 'pre') {
      prog.pretestAnswers = newAnswers;
      prog.pretestCurrentQ = currentQIndex;
    } else {
      prog.posttestAnswers = newAnswers;
      prog.posttestCurrentQ = currentQIndex;
    }
    storageService.saveStudentProgress(prog);
  };

  // Rekam Suara Alasan
  const handleToggleRecord = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      audioService.playSuccessSound();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await storageService.saveVoiceAudio(studentCode, testType, 'alasan', currentQ.number, blob);
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          setHasVoice(true);
          stream.getTracks().forEach((t) => t.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Izin mikrofon gagal:', err);
      }
    }
  };

  const handlePlayVoice = () => {
    if (!audioUrl) return;
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setIsPlayingAudio(false);
    }
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Kembali ke Soal Sebelumnya
  const handlePrevQuestion = () => {
    audioService.playTapSound();
    if (currentQIndex > 0) {
      setCurrentQIndex((prev) => prev - 1);
    }
  };

  // Lompat ke nomor soal tertentu jika sudah dijawab atau aktif
  const handleJumpToQuestion = (targetIndex: number) => {
    if (targetIndex === currentQIndex || isTransitioning) return;
    audioService.playTapSound();
    setCurrentQIndex(targetIndex);
  };

  // Lanjut ke Soal Berikutnya (Dengan Apresiasi Ceria & Suara Tidak Terpotong)
  const handleNextQuestion = () => {
    const curAns = answersState[currentQ.number];
    if (!curAns || !curAns.selectedOptionLabel) {
      audioService.playGentleRetrySound();
      audioService.speak('Pilih salah satu jawaban dulu ya sebelum lanjut!');
      return;
    }

    if (isTransitioning) return;
    setIsTransitioning(true);

    audioService.playSuccessSound();
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    const isLastQuestion = currentQIndex >= questions.length - 1;
    const praises = [
      'Hebat! Jawabanmu tersimpan dengan baik!',
      'Keren sekali! Jawabanmu sudah tercatat rapi!',
      'Bagus! Jawabanmu berhasil disimpan!',
      'Luar biasa! Tersimpan dengan sempurna!',
    ];
    const praiseText = isLastQuestion
      ? 'Selamat! Seluruh jawaban misimu sudah tersimpan lengkap!'
      : praises[currentQIndex % praises.length];

    setCelebrationPraise(praiseText);
    setSavedNotification(true);

    let hasAdvanced = false;
    const advanceToNext = () => {
      if (hasAdvanced) return;
      hasAdvanced = true;
      setSavedNotification(false);
      setCelebrationPraise(null);
      setIsTransitioning(false);

      if (!isLastQuestion) {
        setCurrentQIndex((prev) => prev + 1);
      } else {
        const elapsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
        const prog = storageService.getStudentProgress(studentCode);
        if (testType === 'pre') {
          prog.phaseDurations.pretestSeconds = (prog.phaseDurations.pretestSeconds || 0) + elapsedSeconds;
          prog.currentStep = 'ingat_perkalian';
        } else {
          prog.phaseDurations.posttestSeconds = (prog.phaseDurations.posttestSeconds || 0) + elapsedSeconds;
          prog.currentStep = storageService.isSurveyEnabled() ? 'survey' : 'certificate';
        }
        storageService.saveStudentProgress(prog);
        onFinishTest();
      }
    };

    audioService.speak(praiseText, {
      onEnd: () => {
        setTimeout(advanceToNext, 250);
      },
    });

    setTimeout(() => {
      advanceToNext();
    }, 2800);
  };

  const handlePromptExitHome = () => {
    setShowExitConfirm(true);
    audioService.speak('Mau berhenti dulu? Jawabanmu tersimpan, kamu bisa lanjut nanti.');
  };

  const currentAnswer = answersState[currentQ.number];

  return (
    <div className="w-full max-w-5xl mx-auto h-full min-h-0 flex flex-col justify-between p-1 sm:p-2 gap-1.5 sm:gap-2 overflow-hidden">
      {/* 1. Header Tunggal Ramping: Label Misi, Indikator Soal 1-6, & Tombol Berhenti */}
      <div className="bg-white border-2 border-amber-300 rounded-xl px-2.5 py-1.5 shadow-xs flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base sm:text-lg shrink-0">
            {testType === 'pre' ? '🧭' : '🏆'}
          </span>
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
              {testType === 'pre' ? 'Misi Awal' : 'Misi Akhir'}
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-950 font-heading truncate hidden sm:inline">
              {testType === 'pre' ? 'Penjelajah Cilik Matematika' : 'Pembuktian Petualang Sejati'}
            </span>
          </div>
        </div>

        {/* Indikator Nomor Soal Interaktif 1..6 */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-xl">
          {questions.map((q, idx) => {
            const hasAns = !!answersState[q.number]?.selectedOptionLabel;
            const isCurrent = idx === currentQIndex;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => handleJumpToQuestion(idx)}
                title={`Buka Soal ${q.number}${hasAns ? ' (Sudah Dijawab)' : ''}`}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-black text-xs transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300 scale-105'
                    : hasAns
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-400 hover:bg-emerald-200'
                    : 'bg-white text-slate-400 border border-slate-200 hover:border-amber-300'
                }`}
              >
                {hasAns && !isCurrent ? '✓' : q.number}
              </button>
            );
          })}
        </div>

        {/* Tombol Berhenti Dulu */}
        <button
          onClick={handlePromptExitHome}
          className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-xl border border-slate-300 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
          title="Berhenti sejenak dan simpan jawaban"
        >
          <Home className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden sm:inline">Berhenti Dulu</span>
        </button>
      </div>

      {/* 2. Kartu Soal Utama: 2 Kolom Responsif Tanpa Scroll (Zero Scroll) */}
      <div className="flex-1 min-h-0 bg-white border-2 border-amber-200 rounded-2xl p-2.5 sm:p-3 shadow-xs flex flex-col justify-between overflow-hidden relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 flex-1 min-h-0 items-stretch overflow-hidden">
          {/* Kolom Kiri: Kak Bagi, Soal & Persamaan Matematika yang Jelas */}
          <div className="md:col-span-5 flex flex-col justify-between bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 sm:p-3 overflow-hidden min-h-0 space-y-2">
            {/* Bagian Atas: Kak Bagi & Pertanyaan */}
            <div className="space-y-2 flex-1 min-h-0 flex flex-col justify-start">
              {/* Balon Dialog Maskot Kak Bagi */}
              <div className="flex items-start gap-2 bg-white/95 border-2 border-amber-300 rounded-xl p-2 sm:p-2.5 shadow-2xs">
                <div className="shrink-0 flex flex-col items-center">
                  <MascotKakBagi
                    mood={isSpeakingPrompt ? 'explaining' : 'happy'}
                    isSpeaking={isSpeakingPrompt}
                    size="sm"
                  />
                  <span className="text-[9px] font-black font-heading text-amber-800 mt-0.5">
                    Kak Bagi
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 pb-1 border-b border-amber-200">
                    <span className="px-2 py-0.5 bg-amber-400 text-amber-950 font-black rounded-md text-[10px] uppercase tracking-wide">
                      Soal {currentQ.number} dari {questions.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSpeakingPrompt(true);
                        audioService.speak(`Soal nomor ${currentQ.number}. ${currentQ.promptText}`, {
                          onEnd: () => setIsSpeakingPrompt(false),
                        });
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isSpeakingPrompt
                          ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                          : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                      }`}
                      title="Dengarkan soal"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Dengar</span>
                    </button>
                  </div>

                  {/* Teks Pertanyaan Utama */}
                  <p className="text-xs sm:text-[13px] lg:text-[14px] font-extrabold text-slate-800 leading-snug pt-1">
                    {currentQ.promptText}
                  </p>
                </div>
              </div>

              {/* Badge Persamaan Matematika yang Jelas (Menggantikan Kotak Ilustrasi yang Membingungkan) */}
              {eqData && (
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 rounded-xl p-2 shadow-2xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg">🔢</span>
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 block uppercase tracking-wider">
                        {eqData.label}
                      </span>
                      <span className="text-sm sm:text-base font-black text-amber-950 font-heading tracking-wide">
                        {eqData.eq}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 bg-white/70 px-2 py-0.5 rounded-lg border border-amber-200">
                    Pikirkan Hubungannya 💡
                  </span>
                </div>
              )}
            </div>

            {/* Rekam Suara Alasan Opsional (Ramping di Bagian Bawah Kolom Kiri) */}
            <div className="pt-1.5 border-t border-amber-200 shrink-0">
              {!showOptionalVoice ? (
                <button
                  type="button"
                  onClick={() => setShowOptionalVoice(true)}
                  className="w-full py-1 px-2.5 bg-amber-100/90 hover:bg-amber-200 text-amber-950 font-bold text-xs rounded-xl border border-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5 text-amber-700" />
                  <span>{hasVoice ? '🎤 Suara Alasanmu Tersimpan ✓' : '🎤 Rekam Alasan (Opsional)'}</span>
                </button>
              ) : (
                <div className="p-1.5 bg-white border border-amber-300 rounded-xl flex items-center justify-between gap-1.5">
                  <span className="font-bold text-amber-950 text-[11px]">
                    Alasanmu:
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleToggleRecord}
                      className={`px-2 py-0.5 rounded-lg font-bold text-[11px] flex items-center gap-1 text-white transition-all cursor-pointer ${
                        isRecording ? 'bg-red-600 animate-pulse' : 'bg-rose-500 hover:bg-rose-600'
                      }`}
                    >
                      {isRecording ? <Square className="w-2.5 h-2.5 fill-white" /> : <Mic className="w-2.5 h-2.5" />}
                      <span>{isRecording ? 'Stop' : 'Rekam'}</span>
                    </button>

                    {hasVoice && (
                      <button
                        type="button"
                        onClick={handlePlayVoice}
                        className="px-2 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        {isPlayingAudio ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5 fill-emerald-800" />}
                        <span>Dengar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowOptionalVoice(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer ml-1"
                      title="Tutup"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Pilihan Jawaban A, B, C, D & Tombol Lanjut */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-2 min-h-0 overflow-hidden">
            {/* Banner Apresiasi Ceria saat Jawaban Disimpan */}
            {isTransitioning && (
              <div className="p-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white rounded-xl flex items-center justify-between gap-2 shadow-xs border border-emerald-300 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌟</span>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm leading-tight">
                      {celebrationPraise || 'Hebat! Jawabanmu Tersimpan!'}
                    </h4>
                    <p className="text-emerald-100 text-[10px] font-bold">
                      {currentQIndex < questions.length - 1 ? 'Menyiapkan soal berikutnya...' : 'Menghitung hasil petualanganmu...'}
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
              </div>
            )}

            {/* Petunjuk Pilih Jawaban */}
            <div className="flex items-center justify-between px-1 shrink-0">
              <span className="text-xs font-black text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                <span>👉 Pilih Salah Satu Jawaban:</span>
              </span>
              <span className="text-[11px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                {currentAnswer?.selectedOptionLabel ? `Pilihan: ${currentAnswer.selectedOptionLabel} ✅` : 'Wajib Dipilih'}
              </span>
            </div>

            {/* 4 Opsi Jawaban (Proporsional, Rapi, & Jelas) */}
            <div className="grid grid-cols-1 gap-1.5 sm:gap-2 flex-1 min-h-0 overflow-y-auto pr-0.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = currentAnswer?.selectedOptionLabel === opt.label;

                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleSelectOption(opt, idx)}
                    className={`w-full py-2 px-2.5 sm:py-2.5 sm:px-3 rounded-xl border-2 transition-all flex items-center justify-between gap-2.5 text-left cursor-pointer active:scale-[0.99] shrink-0 ${
                      isSelected
                        ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-300 shadow-xs'
                        : 'bg-white hover:bg-amber-50/70 border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-xs sm:text-sm shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-amber-500 text-white shadow-xs scale-105'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span className="text-xs sm:text-sm lg:text-[14px] font-bold text-slate-800 leading-snug">
                        {opt.text}
                      </span>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Baris Tombol Aksi Bawah */}
            <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePrevQuestion}
                disabled={currentQIndex === 0 || isTransitioning}
                className={`min-h-[40px] px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
                  currentQIndex > 0 && !isTransitioning
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 cursor-pointer active:scale-95'
                    : 'text-slate-300 border border-slate-200 cursor-not-allowed opacity-40'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Soal Sebelumnya</span>
              </button>

              <div className="flex items-center gap-2">
                {savedNotification && !isTransitioning && (
                  <div className="text-emerald-800 text-xs font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Tersimpan!</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={!currentAnswer?.selectedOptionLabel || isTransitioning}
                  className={`min-h-[42px] px-5 sm:px-6 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm border-b-2 transition-all active:scale-95 ${
                    currentAnswer?.selectedOptionLabel && !isTransitioning
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-emerald-700 cursor-pointer shadow-emerald-200'
                      : isTransitioning
                      ? 'bg-emerald-600 text-white border-emerald-800 cursor-wait'
                      : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                  }`}
                >
                  <span>
                    {isTransitioning
                      ? 'Tersimpan! ⭐'
                      : currentQIndex < questions.length - 1
                      ? 'Simpan & Lanjut Soal 🚀'
                      : 'Selesai Misi 🎉'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Dialog Konfirmasi Berhenti Dulu */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border-4 border-amber-300 p-5 space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-700 flex items-center justify-center mx-auto text-2xl">
              ⏸️
            </div>
            <div>
              <h3 className="font-extrabold text-amber-950 text-base sm:text-lg font-heading">
                Mau Berhenti Dulu?
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                Seluruh jawaban yang sudah kamu pilih tersimpan aman. Kamu bisa melanjutkannya kapan saja!
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  audioService.playTapSound();
                  setShowExitConfirm(false);
                }}
                className="min-h-[42px] py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 cursor-pointer"
              >
                Lanjut Misi
              </button>
              <button
                type="button"
                onClick={() => {
                  audioService.playTapSound();
                  setShowExitConfirm(false);
                  if (onGoHome) onGoHome();
                }}
                className="min-h-[42px] py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm rounded-xl border-b-2 border-amber-700 cursor-pointer shadow-xs"
              >
                Keluar ke Beranda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
