/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Level 1: "Pulau Kelereng" (Mengatasi Miskonsepsi M3: Habis Dibagi & Bersisa)
 * Berdasarkan Temuan Validasi Ahli Media No. 5, 6, 7:
 * - 4 Tahap Aktivitas di Atas: 1 Tebak -> 2 Coba -> 3 Amati -> 4 Simpulkan
 * - Scaffolding Bertahap 3 Tingkat (3 Lampu Menyala)
 * - Mode "Tonton Prosesnya" dengan animasi distribusi otomatis & suara hitungan
 * - Umpan balik real-time ramah (cahaya hijau, confetti bintang, nada lembut untuk coba lagi)
 * - Tipografi ramah anak SD kelas 4 (teks isi >= 18px, tombol >= 48px)
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Lightbulb, CheckCircle2, Star, Play, Pause, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';
import { ThreeKelerengScene } from '../components/3d/ThreeKelerengScene';
import { MascotStepInstruction } from '../components/MascotStepInstruction';
import { DynamicEquationBadge } from '../components/DynamicEquationBadge';
import { audioService } from '../services/audioService';
import { storageService } from '../services/storageService';

interface Level1Props {
  studentCode: string;
  onFinishLevel: () => void;
  onGoBack?: () => void;
}

export const Level1KelerengScreen: React.FC<Level1Props> = ({
  studentCode,
  onFinishLevel,
  onGoBack,
}) => {
  const totalMarbles = 14;
  const boxCount = 4;

  const [phase, setPhase] = useState<'tebak' | 'coba' | 'amati' | 'sisa_nakal' | 'simpulkan' | 'kuis'>('tebak');
  const [userGuess, setUserGuess] = useState<string | null>(null);

  // State Coba Kelereng
  const [distributed, setDistributed] = useState<number[]>([0, 0, 0, 0]);
  const [remaining, setRemaining] = useState<number>(totalMarbles);
  const [wrongTries, setWrongTries] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [scaffoldLevel, setScaffoldLevel] = useState<0 | 1 | 2 | 3>(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // State Tonton Prosesnya (Simulasi Otomatis)
  const [isWatchingProcess, setIsWatchingProcess] = useState(false);
  const autoDemoTimerRef = useRef<number | null>(null);

  // State Sisa Nakal (20 : 6 = 2 sisa 8 yang keliru)
  const [sisaNakalBoxes, setSisaNakalBoxes] = useState<number[]>([2, 2, 2, 2, 2, 2]); // total 12
  const [sisaNakalRemaining, setSisaNakalRemaining] = useState(8); // total 20

  // State Simpulkan
  const [conclusionWord, setConclusionWord] = useState<string | null>(null);

  // State Kuis Kilat (3 soal)
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [explanationFeedback, setExplanationFeedback] = useState<string | null>(null);

  useEffect(() => {
    setExplanationFeedback(null);
  }, [phase, quizIndex]);

  const startTimeRef = useRef<number>(Date.now());

  const quizQuestions = [
    {
      q: 'Ada 15 kelereng dibagikan ke 4 kotak sama banyak. Berapa kelereng di setiap kotak dan berapa kelereng yang tersisa?',
      equation: '15 : 4 = 3 sisa 3  (Sisa 3 < 4 kotak ✅)',
      options: ['3 kelereng, sisa 3', '4 kelereng, sisa 0', '2 kelereng, sisa 7'],
      correct: 0,
      reason: '15 = (4 × 3) + 3, dan sisa 3 kelereng lebih kecil dari 4 kotak!',
    },
    {
      q: 'Jika membagi kelereng ke dalam 5 kotak, angka sisa kelereng mana yang TIDAK BISA terjadi?',
      equation: 'Kelereng : 5 = ?  (Aturan Emas: Sisa < 5)',
      options: ['Sisa 2', 'Sisa 4', 'Sisa 6'],
      correct: 2,
      reason: 'Sisa pembagian harus selalu lebih kecil dari 5 kotak. Sisa 6 tidak boleh karena 6 kelereng masih cukup dibagikan lagi!',
    },
    {
      q: 'Budi menulis: 18 kelereng dibagi ke 5 kotak = 2 kelereng sisa 8 (18 : 5 = 2 sisa 8). Mengapa tulisan Budi belum tepat?',
      equation: '18 : 5 = 2 sisa 8  (Sisa 8 > 5 ❌)',
      options: [
        'Karena sisa 8 masih lebih banyak dari 5 kotak, jadi masih bisa dibagi lagi',
        'Karena kelereng 18 tidak bisa dibagi',
        'Karena perkaliannya salah',
      ],
      correct: 0,
      reason: 'Sisa 8 kelereng masih lebih besar dari 5 kotak. Seharusnya 18 : 5 = 3 sisa 3.',
    },
  ];

  // Efek suara pembuka
  useEffect(() => {
    setIsSpeaking(true);
    audioService.speak(
      'Selamat datang di Pulau Kelereng! Ada 14 kelereng yang akan dibagikan ke dalam 4 kotak sama banyak. Menurutmu, tiap kotak dapat berapa dan sisanya berapa?',
      { onEnd: () => setIsSpeaking(false) }
    );
  }, []);

  // Bersihkan timer saat unmount
  useEffect(() => {
    return () => {
      if (autoDemoTimerRef.current) clearTimeout(autoDemoTimerRef.current);
    };
  }, []);

  // Minta Bantuan Scaffolding 3 Tingkat
  const requestHint = () => {
    audioService.playHintSound();
    const nextScaffold = Math.min(3, scaffoldLevel + 1) as 1 | 2 | 3;
    setScaffoldLevel(nextScaffold);
    setHintsUsed((prev) => prev + 1);

    if (nextScaffold === 1) {
      const msg = 'Petunjuk tingkat satu: Coba amati kelereng di baki tengah. Apakah masih ada 4 kelereng atau lebih? Jika iya, bagikan lagi!';
      setIsSpeaking(true);
      audioService.speak(msg, { onEnd: () => setIsSpeaking(false) });
    } else if (nextScaffold === 2) {
      const msg = 'Petunjuk tingkat dua: Ingat Aturan Emas! Kelereng yang tersisa di baki harus selalu lebih kecil dari 4 kotak pembagi.';
      setIsSpeaking(true);
      audioService.speak(msg, { onEnd: () => setIsSpeaking(false) });
    } else {
      const msg = 'Petunjuk tingkat tiga: Kak Bagi demonstrasikan langsung ya! Empat belas kelereng dibagikan tiga putaran ke empat kotak, sampai tersisa dua kelereng di baki.';
      setIsSpeaking(true);
      audioService.speak(msg, { onEnd: () => setIsSpeaking(false) });
      setDistributed([3, 3, 3, 3]);
      setRemaining(2);
    }
  };

  // Mode "Tonton Prosesnya" (Simulasi Otomatis Pembagian)
  const handleWatchProcess = () => {
    if (isWatchingProcess) {
      // Jeda
      if (autoDemoTimerRef.current) clearTimeout(autoDemoTimerRef.current);
      setIsWatchingProcess(false);
      audioService.speak('Simulasi dijeda.');
      return;
    }

    setIsWatchingProcess(true);
    // Reset ke awal
    setDistributed([0, 0, 0, 0]);
    setRemaining(14);

    audioService.speak('Yuk tonton prosesnya! Putaran pertama: kita bagikan satu kelereng ke setiap kotak.');

    // Langkah 1 (setelah 2s)
    autoDemoTimerRef.current = window.setTimeout(() => {
      audioService.playDropSound();
      setDistributed([1, 1, 1, 1]);
      setRemaining(10);
      audioService.speak('Satu untuk kotak satu, dua, tiga, dan empat. Tersisa sepuluh kelereng di baki.');

      // Langkah 2 (setelah 3.5s)
      autoDemoTimerRef.current = window.setTimeout(() => {
        audioService.playDropSound();
        setDistributed([2, 2, 2, 2]);
        setRemaining(6);
        audioService.speak('Putaran kedua: bagikan lagi satu kelereng ke tiap kotak. Sekarang tiap kotak berisi dua kelereng.');

        // Langkah 3 (setelah 3.5s)
        autoDemoTimerRef.current = window.setTimeout(() => {
          audioService.playDropSound();
          setDistributed([3, 3, 3, 3]);
          setRemaining(2);
          audioService.playSuccessSound();
          confetti({ particleCount: 50, spread: 60 });
          audioService.speak('Putaran ketiga: tiap kotak mendapat tiga kelereng. Tersisa dua kelereng di baki, dan dua lebih kecil dari empat kotak!');
          setIsWatchingProcess(false);
        }, 3600);
      }, 3600);
    }, 2200);
  };

  // Coba membagikan 1 kelereng ke setiap kotak
  const handleDistributeOne = () => {
    if (remaining >= boxCount) {
      audioService.playDropSound();
      setRemaining((prev) => prev - boxCount);
      setDistributed((prev) => prev.map((count) => count + 1));
    } else {
      audioService.playGentleRetrySound();
      audioService.speak(`Kelereng tersisa ${remaining}, sudah tidak cukup dibagi rata ke ${boxCount} kotak!`);
    }
  };

  // Cek apakah pembagian sudah tuntas
  const handleCheckDistribution = () => {
    if (remaining >= boxCount) {
      setWrongTries((prev) => prev + 1);
      audioService.playGentleRetrySound();
      const msg = 'Masih bisa dibagi! Kelereng di tengah masih cukup untuk dibagikan lagi ke tiap kotak.';
      setExplanationFeedback(`💡 Penjelasan: Kelereng di baki (${remaining}) masih lebih banyak dari 4 kotak! Bagikan lagi sampai sisanya kurang dari 4.`);
      setIsSpeaking(true);
      audioService.speak(msg, { onEnd: () => setIsSpeaking(false) });
      if (wrongTries >= 1 && scaffoldLevel < 1) requestHint();
    } else {
      audioService.playAppreciation('Tepat sekali! Tiap kotak dapat 3 kelereng, dan sisanya 2 kelereng. Sisa 2 lebih kecil dari 4 kotak!');
      confetti({ particleCount: 60, spread: 70 });
      setExplanationFeedback('✅ Sempurna! Tiap kotak terisi 3 kelereng, sisa 2 di baki. Sisa 2 < 4 kotak, pembagian sudah tuntas!');
      setIsSpeaking(true);
      audioService.speak('Tepat sekali! Tiap kotak dapat 3 kelereng, dan sisanya 2 kelereng. Sisa 2 lebih kecil dari 4 kotak!', { onEnd: () => setIsSpeaking(false) });
      setTimeout(() => {
        setPhase('amati');
      }, 1800);
    }
  };

  // Selesaikan Sisa Nakal
  const handleDistributeSisaNakal = () => {
    if (sisaNakalRemaining >= 6) {
      audioService.playDropSound();
      setSisaNakalRemaining((prev) => prev - 6);
      setSisaNakalBoxes((prev) => prev.map((v) => v + 1));
    }
  };

  const handleFinishSisaNakal = () => {
    if (sisaNakalRemaining === 2) {
      audioService.playAppreciation('Keren sekali! Sekarang sisa kelereng adalah dua, dan dua lebih kecil dari enam kotak!');
      confetti({ particleCount: 60, spread: 70 });
      setExplanationFeedback('✅ Hebat! 20 : 6 = 3 sisa 2. Sisa 2 sudah lebih kecil dari 6 kotak!');
      setIsSpeaking(true);
      audioService.speak(
        'Keren sekali! Sekarang sisa kelereng adalah dua, dan dua lebih kecil dari enam kotak!',
        { onEnd: () => setIsSpeaking(false) }
      );
      setTimeout(() => setPhase('simpulkan'), 1600);
    } else {
      audioService.playGentleRetrySound();
      setExplanationFeedback(`💡 Penjelasan: Sisa ${sisaNakalRemaining} masih lebih besar dari 6 kotak. Masih bisa dibagi lagi!`);
      audioService.speak('Hmm, kelereng sisa delapan masih bisa dibagi ke enam kotak! Bagikan lagi yuk.');
    }
  };

  // Simpulkan
  const handleSelectConclusion = (word: string) => {
    setConclusionWord(word);
    audioService.playTapSound();
    if (word === 'lebih kecil') {
      audioService.playAppreciation('Luar biasa! Sisa pembagian harus selalu lebih kecil dari pembagi.');
      confetti({ particleCount: 70, spread: 80 });
      setExplanationFeedback('✅ Aturan Emas Benar: Sisa pembagian harus selalu LEBIH KECIL daripada kotak pembagi!');
      setIsSpeaking(true);
      const text = 'Luar biasa! Sisa pembagian harus selalu lebih kecil dari pembagi.';
      let hasAdvanced = false;
      const advanceToQuiz = () => {
        if (hasAdvanced) return;
        hasAdvanced = true;
        setIsSpeaking(false);
        setTimeout(() => setPhase('kuis'), 400);
      };
      audioService.speak(text, { onEnd: advanceToQuiz });
      setTimeout(advanceToQuiz, 5000);
    } else {
      audioService.playGentleRetrySound();
      setExplanationFeedback('💡 Penjelasan: Jika sisa lebih besar, benda itu masih cukup dimasukkan ke kotak! Jadi sisa harus LEBIH KECIL.');
      audioService.speak('Hmm, coba lagi yuk! Kalau sisanya sama atau lebih besar, kan masih bisa dibagi lagi!');
    }
  };

  // Jawab Kuis Kilat
  const handleAnswerQuiz = (optionIdx: number) => {
    if (quizSelected !== null) return;
    setQuizSelected(optionIdx);
    const q = quizQuestions[quizIndex];
    const isCorrect = optionIdx === q.correct;
    const finalScore = quizScore + (isCorrect ? 1 : 0);

    if (isCorrect) {
      audioService.playAppreciation();
      confetti({ particleCount: 60, spread: 70 });
      setQuizScore(finalScore);
      setExplanationFeedback(`✅ Benar Sekali! ${q.reason}`);
    } else {
      audioService.playGentleRetrySound();
      setExplanationFeedback(`💡 Penjelasan: ${q.reason}`);
    }

    const speechText = isCorrect
      ? `Benar sekali! ${q.reason}`
      : `Kurang tepat, tapi tidak apa-apa! Penjelasannya: ${q.reason}`;

    setIsSpeaking(true);
    let hasTransitioned = false;
    const transitionNext = () => {
      if (hasTransitioned) return;
      hasTransitioned = true;
      setIsSpeaking(false);
      setTimeout(() => {
        setQuizSelected(null);
        if (quizIndex < quizQuestions.length - 1) {
          setQuizIndex((prev) => prev + 1);
          setIsSpeaking(true);
          audioService.speak(quizQuestions[quizIndex + 1].q, { onEnd: () => setIsSpeaking(false) });
        } else {
          const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
          const prog = storageService.getStudentProgress(studentCode);
          const starsEarned = finalScore >= 2 ? 3 : 2;
          prog.stars.level1 = Math.max(prog.stars.level1, starsEarned);
          prog.quizScores.level1 = finalScore;
          prog.unlockedLevel = Math.max(prog.unlockedLevel, 2);
          prog.phaseDurations.level1Seconds = (prog.phaseDurations.level1Seconds || 0) + elapsed;
          prog.scaffoldingStats.level1 = { hintsUsed, wrongTries };
          storageService.saveStudentProgress(prog);

          audioService.playSuccessSound();
          audioService.speak('Selamat! Kamu telah menyelesaikan Level 1 dan meraih bintang emas!');
          onFinishLevel();
        }
      }, 400);
    };

    audioService.speak(speechText, { onEnd: transitionNext });
    setTimeout(transitionNext, 6000);
  };

  // Indikator 4 Tahap Aktivitas (Validator 6)
  const activityStages = [
    { id: 'tebak', label: '1. Tebak' },
    { id: 'coba', label: '2. Coba' },
    { id: 'amati', label: '3. Amati' },
    { id: 'simpulkan', label: '4. Simpulkan' },
  ];

  const getStageStatus = (stageId: string) => {
    const order = ['tebak', 'coba', 'amati', 'sisa_nakal', 'simpulkan', 'kuis'];
    const curIdx = order.indexOf(phase);
    const targetIdx = order.indexOf(stageId);
    if (curIdx > targetIdx) return 'done';
    if (curIdx === targetIdx) return 'current';
    return 'upcoming';
  };

  const currentDistributedMarbles =
    phase === 'sisa_nakal'
      ? sisaNakalBoxes
      : phase === 'simpulkan'
      ? [3, 3, 3, 3]
      : phase === 'kuis'
      ? [3, 3, 3, 3]
      : distributed;

  const currentRemainingMarbles =
    phase === 'sisa_nakal'
      ? sisaNakalRemaining
      : phase === 'simpulkan'
      ? 2
      : phase === 'kuis'
      ? 2
      : remaining;

  return (
    <div className="w-full max-w-6xl mx-auto h-full max-h-full flex flex-col justify-between p-1 sm:p-2 space-y-1.5 overflow-hidden">
      {/* Header Level 1: 4 Tahap Aktivitas & Scaffolding 3 Lampu (Validator 6) */}
      <div className="bg-white border-2 border-amber-300 rounded-2xl px-3 py-1.5 shadow-xs flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            Level 1: Pulau Kelereng (M3)
          </span>

          {/* Stepper 4 Tahap: 1 Tebak -> 2 Coba -> 3 Amati -> 4 Simpulkan */}
          <div className="flex items-center gap-1">
            {activityStages.map((st, i) => {
              const status = getStageStatus(st.id);
              return (
                <div key={st.id} className="flex items-center gap-1">
                  <span
                    className={`px-2 py-0.5 rounded-lg text-xs font-extrabold ${
                      status === 'current'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : status === 'done'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {st.label}
                  </span>
                  {i < activityStages.length - 1 && (
                    <span className="text-slate-300 text-xs">›</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tombol Minta Petunjuk dengan 3 Lampu Menyala (Validator 6) */}
        {phase === 'coba' && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={requestHint}
              className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-amber-400 px-3 py-1 rounded-xl font-black text-xs active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-400" />
              <span>Minta Petunjuk</span>
              {/* 3 Indikator Lampu */}
              <div className="flex items-center gap-0.5 ml-1">
                {[1, 2, 3].map((num) => (
                  <span
                    key={num}
                    className={`w-2.5 h-2.5 rounded-full border border-amber-600 ${
                      num <= scaffoldLevel ? 'bg-amber-500 animate-pulse' : 'bg-white'
                    }`}
                  />
                ))}
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Persamaan Matematika (Dynamic Equation) Level 1 */}
      <div className="shrink-0 flex justify-center">
        {phase === 'tebak' && (
          <DynamicEquationBadge
            dividend={14}
            divisor={4}
            quotient="?"
            remainder="?"
            subtitle="Tebak: Berapa isi tiap kotak dan berapa sisa kelerengnya?"
            className="w-full sm:w-auto"
          />
        )}
        {phase === 'coba' && (
          <DynamicEquationBadge
            dividend={14}
            divisor={4}
            quotient={distributed[0]}
            remainder={remaining}
            showCheck={true}
            subtitle={
              remaining >= 4
                ? `Kelereng di baki (${remaining}) masih bisa dibagikan lagi ke 4 kotak!`
                : `Sisa ${remaining} kelereng < 4 kotak (Sudah tidak cukup dibagikan lagi)`
            }
            className="w-full sm:w-auto"
          />
        )}
        {phase === 'amati' && (
          <DynamicEquationBadge
            dividend={14}
            divisor={4}
            quotient={3}
            remainder={2}
            showCheck={true}
            subtitle="✨ Sempurna! 14 = (4 × 3) + 2 sisa. Sisa 2 selalu lebih kecil dari 4 kotak."
            className="w-full sm:w-auto"
          />
        )}
        {phase === 'sisa_nakal' && (
          <DynamicEquationBadge
            dividend={20}
            divisor={6}
            quotient={sisaNakalBoxes[0]}
            remainder={sisaNakalRemaining}
            showCheck={true}
            subtitle={
              sisaNakalRemaining >= 6
                ? `⚠️ Sisa ${sisaNakalRemaining} masih lebih besar dari 6 kotak! Masih bisa dibagi lagi.`
                : `✅ Hebat! 20 : 6 = 3 sisa 2. Sisa 2 sudah lebih kecil dari 6 kotak!`
            }
            className="w-full sm:w-auto"
          />
        )}
        {phase === 'simpulkan' && (
          <DynamicEquationBadge
            customEquation="20 : 6 = 3 sisa 2  (Sisa 2 < 6 Kotak ✅)"
            subtitle="Aturan Emas: Sisa pembagian (2) harus selalu lebih kecil dari kotak pembagi (6)!"
            variant="custom"
            className="w-full sm:w-auto"
          />
        )}
        {phase === 'kuis' && (
          <DynamicEquationBadge
            customEquation={quizQuestions[quizIndex].equation}
            subtitle="Perhatikan persamaan di atas untuk menjawab soal kuis!"
            variant="custom"
            className="w-full sm:w-auto"
          />
        )}
      </div>

      {/* Grid 2 Kolom Responsif: 3D di Kiri, Panel Kendali di Kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 items-stretch min-h-0 overflow-hidden">
        {/* Kolom Kiri: Three.js 3D Scene Murni Bebas Teks Mengambang */}
        <div className="lg:col-span-7 flex flex-col justify-between overflow-hidden">
          <ThreeKelerengScene
            totalMarbles={
              phase === 'sisa_nakal'
                ? 20
                : phase === 'simpulkan'
                ? 14
                : phase === 'kuis'
                ? 14
                : totalMarbles
            }
            boxCount={phase === 'sisa_nakal' ? 6 : boxCount}
            distributedMarbles={currentDistributedMarbles}
            remainingMarbles={currentRemainingMarbles}
            onDistributeOne={phase === 'coba' ? handleDistributeOne : undefined}
            onResetDistribution={
              phase === 'coba'
                ? () => {
                    setDistributed([0, 0, 0, 0]);
                    setRemaining(14);
                  }
                : undefined
            }
            onWatchProcess={phase === 'coba' ? handleWatchProcess : undefined}
            isWatchingProcess={isWatchingProcess}
            isInteractive={phase === 'coba'}
            className="h-64 sm:h-72 lg:h-full"
          />
        </div>

        {/* Kolom Kanan: Panel Kendali & Balon Kak Bagi */}
        <div className="lg:col-span-5 bg-white border-2 border-amber-200 rounded-2xl p-3.5 flex flex-col justify-between overflow-y-auto space-y-3 shadow-xs">
          {/* Banner Penjelasan Interaktif Saat Jawaban Salah/Benar (Saran Ahli Media) */}
          {explanationFeedback && (
            <div className={`p-2.5 rounded-xl border-2 text-xs sm:text-sm font-bold flex items-start gap-2 shadow-xs transition-all ${
              explanationFeedback.startsWith('✅')
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : 'bg-amber-50 border-amber-400 text-amber-950'
            }`}>
              <span className="text-base shrink-0">{explanationFeedback.startsWith('✅') ? '🎉' : '💡'}</span>
              <span className="leading-snug">{explanationFeedback}</span>
            </div>
          )}

          {/* 1. TAHAP TEBAK */}
          {phase === 'tebak' && (
            <div className="space-y-3">
              <MascotStepInstruction
                stepNumber={1}
                totalSteps={4}
                stepTitle="Tebak Dulu Yuk!"
                instructionText="Ada 14 kelereng yang ingin kita bagikan sama rata ke dalam 4 kotak. Menurut tebakanmu, setiap kotak akan dapat berapa kelereng dan sisanya berapa ya?"
                actionHint="Pilih salah satu tebakanmu di bawah ini!"
                isSpeaking={isSpeaking}
                onReplayVoice={() => {
                  setIsSpeaking(true);
                  audioService.speak(
                    'Ada 14 kelereng yang dibagikan ke 4 kotak. Tebak yuk tiap kotak dapat berapa!',
                    { onEnd: () => setIsSpeaking(false) }
                  );
                }}
                mascotMood="thinking"
              />

              <div className="grid grid-cols-1 gap-2 pt-1">
                {[
                  { label: '3 kelereng, sisa 2 kelereng', val: 'tepat' },
                  { label: '4 kelereng, sisa 0 (habis)', val: 'kurang' },
                  { label: '2 kelereng, sisa 6 kelereng', val: 'sisa_banyak' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setUserGuess(item.label);
                      audioService.playTapSound();
                    }}
                    className={`py-2.5 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm text-left transition-all cursor-pointer ${
                      userGuess === item.label
                        ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-300'
                        : 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  if (userGuess) {
                    audioService.playTapSound();
                    setPhase('coba');
                    setIsSpeaking(true);
                    audioService.speak(
                      'Pilihan tebakanmu menarik! Sekarang klik tombol Bagikan di bawah simulasi 3D untuk membuktikannya!',
                      { onEnd: () => setIsSpeaking(false) }
                    );
                  }
                }}
                disabled={!userGuess}
                className={`w-full min-h-[48px] py-2.5 px-4 rounded-xl font-black text-sm sm:text-base shadow-sm border-b-2 transition-all flex items-center justify-center gap-2 ${
                  userGuess
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-700 cursor-pointer active:scale-95'
                    : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                }`}
              >
                <span>Yuk Buktikan di Tahap Coba! 🚀</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 2. TAHAP COBA */}
          {phase === 'coba' && (
            <div className="space-y-3">
              <MascotStepInstruction
                stepNumber={2}
                totalSteps={4}
                stepTitle="Coba Bagikan Kelereng"
                instructionText="Geser tuas kelereng langsung ke 4 kotak atau gunakan tombol 'Bagi 1 ke Tiap Kotak'. Setelah kelereng di baki tidak cukup lagi dibagi, klik tombol 'Selesai Membagi'!"
                actionHint="Bagikan sampai kelereng di baki kurang dari 4 kotak!"
                isSpeaking={isSpeaking}
                onReplayVoice={() => {
                  setIsSpeaking(true);
                  audioService.speak(
                    'Bagikan kelereng ke empat kotak sampai sisanya tidak cukup lagi dibagi!',
                    { onEnd: () => setIsSpeaking(false) }
                  );
                }}
                mascotMood={scaffoldLevel > 0 ? 'explaining' : 'happy'}
              />

              {/* Kontrol Geser Kelereng Interaktif Langsung (Saran Ahli Media) */}
              <div className="bg-amber-100/70 border-2 border-amber-300 p-2.5 rounded-2xl space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between text-xs font-black text-amber-950">
                  <span>✋ Geser Kelereng Langsung:</span>
                  <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-black text-[11px]">
                    {distributed[0]} kelereng / kotak
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">Baki</span>
                  <input
                    type="range"
                    min={0}
                    max={3}
                    step={1}
                    value={distributed[0]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      audioService.playDropSound();
                      setDistributed([val, val, val, val]);
                      setRemaining(14 - val * 4);
                    }}
                    className="w-full h-3 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <span className="text-[11px] font-bold text-amber-900 font-extrabold">4 Kotak</span>
                </div>
                <p className="text-[10px] font-semibold text-slate-600 text-center">
                  💡 Geser tuas untuk membagikan kelereng langsung ke 4 kotak!
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs sm:text-sm font-bold text-amber-950 space-y-1">
                <div>Isi Kotak: <strong>{distributed[0]} kelereng / kotak</strong></div>
                <div>Sisa di Baki: <strong>{remaining} kelereng</strong></div>
              </div>

              <button
                onClick={handleCheckDistribution}
                className="w-full min-h-[48px] py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm sm:text-base rounded-xl shadow-md border-b-2 border-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Selesai Membagi! Cek Hasil</span>
              </button>
            </div>
          )}

          {/* 3. TAHAP AMATI */}
          {phase === 'amati' && (
            <div className="space-y-3">
              <MascotStepInstruction
                stepNumber={3}
                totalSteps={4}
                stepTitle="Amati Hasil Pembagian"
                instructionText="Lihat kotak dan baki! Tiap kotak terisi 3 kelereng. Sisa kelereng di baki adalah 2. Angka 2 lebih kecil dari 4 kotak. Jadi pembagian sudah tuntas dan tidak bisa dibagi lagi!"
                actionHint="Klik tombol Lanjut untuk menjinakkan Sisa Nakal!"
                isSpeaking={isSpeaking}
                onReplayVoice={() => {
                  setIsSpeaking(true);
                  audioService.speak(
                    'Tiap kotak dapat tiga kelereng, dan sisanya dua. Sisa dua lebih kecil dari empat kotak!',
                    { onEnd: () => setIsSpeaking(false) }
                  );
                }}
                mascotMood="celebrating"
              />

              <div className="bg-emerald-50 border-2 border-emerald-300 p-3 rounded-xl text-emerald-950 font-black text-sm text-center">
                14 : 4 = 3 sisa 2 ✅ (Sisa 2 &lt; 4 kotak)
              </div>

              <button
                onClick={() => {
                  audioService.playTapSound();
                  setPhase('sisa_nakal');
                  setIsSpeaking(true);
                  audioService.speak(
                    'Sekarang tantangan seru: ada yang membagi 20 dibagi 6 tapi menyisakan 8! Yuk kita perbaiki!',
                    { onEnd: () => setIsSpeaking(false) }
                  );
                }}
                className="w-full min-h-[48px] py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm sm:text-base rounded-xl shadow-md border-b-2 border-amber-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Tantangan Sisa Nakal! 🦊</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 4. TAHAP SISA NAKAL */}
          {phase === 'sisa_nakal' && (
            <div className="space-y-3">
              <MascotStepInstruction
                stepNumber={3}
                totalSteps={4}
                stepTitle="Menjinakkan Sisa Nakal!"
                instructionText="Budi menulis: 20 kelereng dibagi ke 6 kotak hasilnya 2 sisa 8. Padahal ada 6 kotak, kenapa sisanya 8? Sisa 8 masih lebih besar dari 6 kotak! Yuk bagikan sisa 8 itu ke 6 kotak!"
                actionHint="Klik tombol 'Bagikan 1 ke Tiap Kotak' untuk menghabiskan sisa yang berlebih!"
                isSpeaking={isSpeaking}
                onReplayVoice={() => {
                  setIsSpeaking(true);
                  audioService.speak(
                    'Sisa delapan masih lebih banyak dari enam kotak, jadi masih bisa dibagikan lagi!',
                    { onEnd: () => setIsSpeaking(false) }
                  );
                }}
                mascotMood="explaining"
              />

              <div className="space-y-2">
                <button
                  onClick={handleDistributeSisaNakal}
                  disabled={sisaNakalRemaining < 6}
                  className={`w-full min-h-[46px] py-2 px-3 rounded-xl font-black text-xs sm:text-sm border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                    sisaNakalRemaining >= 6
                      ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-700 cursor-pointer active:scale-95'
                      : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                  }`}
                >
                  <span>📦 Bagikan Sisa ke 6 Kotak</span>
                </button>

                <button
                  onClick={handleFinishSisaNakal}
                  className="w-full min-h-[46px] py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm rounded-xl border-b-2 border-emerald-700 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selesai Jinakkan Sisa!</span>
                </button>
              </div>
            </div>
          )}

          {/* 5. TAHAP SIMPULKAN */}
          {phase === 'simpulkan' && (
            <div className="space-y-3">
              <MascotStepInstruction
                stepNumber={4}
                totalSteps={4}
                stepTitle="Simpulkan Aturan Emas Sisa"
                instructionText="Lengkapilah kalimat rahasia pembagian ini: 'Dalam pembagian, sisa pembagian harus selalu ... daripada jumlah kotak pembagi!'"
                actionHint="Pilih kata yang tepat di bawah!"
                isSpeaking={isSpeaking}
                onReplayVoice={() => {
                  setIsSpeaking(true);
                  audioService.speak(
                    'Sisa pembagian harus selalu lebih kecil daripada kotak pembagi!',
                    { onEnd: () => setIsSpeaking(false) }
                  );
                }}
                mascotMood="explaining"
              />

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleSelectConclusion('lebih kecil')}
                  className="min-h-[48px] p-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm sm:text-base border-b-2 border-emerald-700 active:scale-95 transition-all cursor-pointer"
                >
                  Lebih Kecil (&lt;) ✅
                </button>
                <button
                  onClick={() => handleSelectConclusion('lebih besar')}
                  className="min-h-[48px] p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm sm:text-base border-b-2 border-slate-300 active:scale-95 transition-all cursor-pointer"
                >
                  Lebih Besar (&gt;)
                </button>
              </div>
            </div>
          )}

          {/* 6. TAHAP KUIS KILAT */}
          {phase === 'kuis' && (
            <div className="space-y-3">
              <MascotStepInstruction
                stepNumber={quizIndex + 1}
                totalSteps={quizQuestions.length}
                stepTitle={`Kuis Kilat Soal ${quizIndex + 1}/3`}
                instructionText={quizQuestions[quizIndex].q}
                actionHint="Pilih satu jawaban yang benar untuk meraih bintang emas!"
                isSpeaking={isSpeaking}
                onReplayVoice={() => {
                  setIsSpeaking(true);
                  audioService.speak(quizQuestions[quizIndex].q, { onEnd: () => setIsSpeaking(false) });
                }}
                mascotMood="thinking"
              />

              <div className="space-y-1.5 pt-1">
                {quizQuestions[quizIndex].options.map((opt, oIdx) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswerQuiz(oIdx)}
                    disabled={quizSelected !== null}
                    className={`w-full py-2 px-3 text-left rounded-xl font-bold text-xs sm:text-sm border-2 transition-all cursor-pointer ${
                      quizSelected === oIdx
                        ? oIdx === quizQuestions[quizIndex].correct
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-black'
                          : 'bg-rose-100 border-rose-400 text-rose-950'
                        : 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
