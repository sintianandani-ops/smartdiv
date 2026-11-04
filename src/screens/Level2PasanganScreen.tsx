/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Level 2: "Pulau Pasangan Ajaib" (Mengatasi Miskonsepsi M2: Pembagian Kebalikan Perkalian)
 * Berdasarkan Temuan Validasi Ahli Media No. 5, 6, 7:
 * - 4 Tahap Aktivitas di Atas: 1 Tebak -> 2 Coba -> 3 Amati (Detektif) -> 4 Simpulkan
 * - Scaffolding Bertahap 3 Tingkat (3 Lampu Menyala)
 * - Objek 3D Permen Berbungkus & Rotasi 90 Derajat Presisi dengan Tombol Reset ke 0°
 * - Tipografi ramah anak SD kelas 4 (teks isi >= 18px, tombol >= 48px)
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Lightbulb, Star, Search, CheckCircle2, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';
import { ThreeArrayScene } from '../components/3d/ThreeArrayScene';
import { MascotStepInstruction } from '../components/MascotStepInstruction';
import { DynamicEquationBadge } from '../components/DynamicEquationBadge';
import { audioService } from '../services/audioService';
import { storageService } from '../services/storageService';

interface Level2Props {
  studentCode: string;
  onFinishLevel: () => void;
  onGoBack?: () => void;
}

export const Level2PasanganScreen: React.FC<Level2Props> = ({
  studentCode,
  onFinishLevel,
  onGoBack,
}) => {
  const [phase, setPhase] = useState<'tebak' | 'coba' | 'detektif' | 'simpulkan' | 'kuis'>('tebak');
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(5);
  const [isRotated, setIsRotated] = useState(false);
  const [highlightStatus, setHighlightStatus] = useState<'normal' | 'correct' | 'wrong'>('normal');

  const [hintsUsed, setHintsUsed] = useState(0);
  const [scaffoldLevel, setScaffoldLevel] = useState<0 | 1 | 2 | 3>(0);
  const [wrongTries, setWrongTries] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // State Detektif Cek: Klaim 30 : 5 = 7? (Cek perkalian 5 x 7 = 35 != 30)
  const [detektifStep, setDetektifStep] = useState<'checking' | 'correcting'>('checking');

  // State Simpulkan (dua pilihan kata)
  const [wordA, setWordA] = useState<string | null>(null); // mengalikan / membagi
  const [wordB, setWordB] = useState<string | null>(null); // dibagi / dikali

  // State Kuis Kilat Level 2 (3 soal di luar daftar terlarang)
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [explanationFeedback, setExplanationFeedback] = useState<string | null>(null);

  useEffect(() => {
    setExplanationFeedback(null);
  }, [phase, detektifStep, quizIndex]);

  const startTimeRef = useRef<number>(Date.now());

  const quizQuestions = [
    {
      q: 'Jika 8 × 4 = 32, tanpa menghitung dari awal, berapakah 32 : 8?',
      equation: '8 × 4 = 32  ⇄  32 : 8 = ?',
      options: ['4', '6', '8'],
      correct: 0,
      reason: 'Karena pembagian adalah kebalikan dari perkalian! 8 × 4 = 32 berarti 32 : 8 = 4.',
    },
    {
      q: 'Budi menghitung 28 : 4 = 7. Bagaimana cara Budi memeriksa jawabannya menggunakan perkalian?',
      equation: '28 : 4 = 7  (Cek: 7 × 4 = 28)',
      options: ['Menghitung 7 × 4 = 28', 'Menghitung 28 + 4 = 32', 'Menghitung 28 - 7 = 21'],
      correct: 0,
      reason: 'Hasil bagi (7) dikali pembagi (4) harus sama dengan bilangan yang dibagi (28).',
    },
    {
      q: 'Diketahui 5 × 6 = 30. Kalimat pembagian mana yang TIDAK termasuk dalam keluarga bilangannya?',
      equation: 'Keluarga 5, 6, 30: 30 : 5 = 6 & 30 : 6 = 5',
      options: ['30 : 5 = 6', '30 : 6 = 5', '30 : 4 = 7'],
      correct: 2,
      reason: 'Keluarga bilangan 5, 6, 30 hanya memiliki 30 : 5 = 6 dan 30 : 6 = 5.',
    },
  ];

  useEffect(() => {
    setIsSpeaking(true);
    audioService.speak(
      'Selamat datang di Pulau Pasangan Ajaib! Kalau 4 kali 5 sama dengan 20, berapa 20 dibagi 4?',
      { onEnd: () => setIsSpeaking(false) }
    );
  }, []);

  // Minta Petunjuk Scaffolding 3 Tingkat
  const requestHint = () => {
    audioService.playHintSound();
    const nextScaffold = Math.min(3, scaffoldLevel + 1) as 1 | 2 | 3;
    setScaffoldLevel(nextScaffold);
    setHintsUsed((prev) => prev + 1);

    if (nextScaffold === 1) {
      const msg = 'Petunjuk tingkat satu: Ingat keluarga bilangan! Pasangan angka 4, 5, dan 20 saling berhubungan terbalik.';
      setIsSpeaking(true);
      audioService.speak(msg, { onEnd: () => setIsSpeaking(false) });
    } else if (nextScaffold === 2) {
      const msg = 'Petunjuk tingkat dua: Coba klik tombol Putar 90°. Perhatikan baris dan kolom yang bertukar tempat!';
      setIsSpeaking(true);
      audioService.speak(msg, { onEnd: () => setIsSpeaking(false) });
    } else {
      const msg = 'Petunjuk tingkat tiga: Kak Bagi peragakan ya! Empat baris dikali lima kolom sama dengan dua puluh permen. Jadi dua puluh dibagi empat baris pasti menghasilkan lima permen!';
      setIsSpeaking(true);
      audioService.speak(msg, { onEnd: () => setIsSpeaking(false) });
    }
  };

  const handleDetektifCheck = (isClaimCorrect: boolean) => {
    if (!isClaimCorrect) {
      audioService.playAppreciation('Hebat detektif cilik! Jawabanmu tepat!');
      confetti({ particleCount: 50, spread: 60 });
      setHighlightStatus('wrong');
      setExplanationFeedback('✅ Tepat Sekali! 5 × 7 = 35 (bukan 30). Jadi klaim 30 : 5 = 7 itu SALAH.');
      setIsSpeaking(true);
      audioService.speak(
        'Hebat detektif cilik! 5 dikali 7 sama dengan 35, bukan 30. Jadi klaim itu salah! Sekarang, berapa hasil 30 dibagi 5 yang benar?',
        { onEnd: () => setIsSpeaking(false) }
      );
      setDetektifStep('correcting');
    } else {
      setWrongTries((prev) => prev + 1);
      audioService.playGentleRetrySound();
      setExplanationFeedback('💡 Penjelasan: Coba cek perkalian 5 × 7 = 35 (bukan 30!). Berarti pernyataan 30 : 5 = 7 itu SALAH. Pilih tombol Salah yuk!');
      audioService.speak('Penjelasan: 5 dikali 7 hasilnya 35, bukan 30! Jadi pernyataan 30 dibagi 5 sama dengan 7 itu salah.');
      if (wrongTries >= 1 && scaffoldLevel < 1) requestHint();
    }
  };

  const handleDetektifCorrection = (answer: number) => {
    if (answer === 6) {
      audioService.playAppreciation('Luar biasa! 5 dikali 6 sama dengan 30. Jadi 30 dibagi 5 sama dengan 6!');
      confetti({ particleCount: 50, spread: 60 });
      setHighlightStatus('correct');
      setExplanationFeedback('✅ Tepat Sekali! 5 × 6 = 30, sehingga 30 : 5 = 6.');
      setIsSpeaking(true);
      const text = 'Tepat sekali! 5 dikali 6 sama dengan 30. Jadi 30 dibagi 5 sama dengan 6!';
      let hasAdvanced = false;
      const advance = () => {
        if (hasAdvanced) return;
        hasAdvanced = true;
        setIsSpeaking(false);
        setTimeout(() => setPhase('simpulkan'), 400);
      };
      audioService.speak(text, { onEnd: advance });
      setTimeout(advance, 5000);
    } else {
      audioService.playGentleRetrySound();
      const reason = answer === 5
        ? '💡 Penjelasan: 5 × 5 = 25 (kurang dari 30). Cari angka yang jika dikali 5 pas 30!'
        : '💡 Penjelasan: 5 × 8 = 40 (kelebihan dari 30). Cari angka yang jika dikali 5 pas 30!';
      setExplanationFeedback(reason);
      audioService.speak(reason);
    }
  };

  const handleCheckConclusion = () => {
    if (wordA === 'mengalikan' && wordB === 'pembagi') {
      audioService.playAppreciation('Hebat sekali! Cara mengecek pembagian adalah mengalikan hasil bagi dengan pembagi!');
      confetti({ particleCount: 70, spread: 80 });
      setExplanationFeedback('✅ Sempurna! Aturan Cek: Hasil Bagi × Pembagi = Bilangan Semula.');
      setIsSpeaking(true);
      const text = 'Luar biasa! Cara mengecek hasil pembagian adalah dengan mengalikan hasil bagi dengan pembagi.';
      let hasAdvanced = false;
      const advance = () => {
        if (hasAdvanced) return;
        hasAdvanced = true;
        setIsSpeaking(false);
        setTimeout(() => setPhase('kuis'), 400);
      };
      audioService.speak(text, { onEnd: advance });
      setTimeout(advance, 6000);
    } else {
      setWrongTries((prev) => prev + 1);
      audioService.playGentleRetrySound();
      setExplanationFeedback('💡 Penjelasan: Ingat, kebalikan dari pembagian adalah perkalian. Kita MENGALIKAN hasil bagi dengan PEMBAGI.');
      audioService.speak('Periksa lagi yuk! Untuk mengecek pembagian, kita mengalikan hasil bagi dengan pembagi!');
      if (wrongTries >= 1 && scaffoldLevel < 2) requestHint();
    }
  };

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
          prog.stars.level2 = Math.max(prog.stars.level2, starsEarned);
          prog.quizScores.level2 = finalScore;
          prog.unlockedLevel = Math.max(prog.unlockedLevel, 3);
          prog.phaseDurations.level2Seconds = (prog.phaseDurations.level2Seconds || 0) + elapsed;
          prog.scaffoldingStats.level2 = { hintsUsed, wrongTries };
          storageService.saveStudentProgress(prog);

          audioService.playSuccessSound();
          audioService.speak('Selamat! Kamu telah menyelesaikan Level 2 dan membuka Pulau Kotak Kosong!');
          onFinishLevel();
        }
      }, 400);
    };

    audioService.speak(speechText, { onEnd: transitionNext });
    setTimeout(transitionNext, 6000);
  };

  // 4 Tahap Aktivitas
  const activityStages = [
    { id: 'tebak', label: '1. Tebak' },
    { id: 'coba', label: '2. Coba' },
    { id: 'detektif', label: '3. Amati' },
    { id: 'simpulkan', label: '4. Simpulkan' },
  ];

  const getStageStatus = (stageId: string) => {
    const order = ['tebak', 'coba', 'detektif', 'simpulkan', 'kuis'];
    const curIdx = order.indexOf(phase);
    const targetIdx = order.indexOf(stageId);
    if (curIdx > targetIdx) return 'done';
    if (curIdx === targetIdx) return 'current';
    return 'upcoming';
  };

  const baseRows =
    phase === 'detektif' || phase === 'simpulkan'
      ? 5
      : phase === 'kuis'
      ? quizIndex === 0
        ? 4
        : quizIndex === 1
        ? 4
        : 5
      : rows; // 4

  const baseCols =
    phase === 'detektif' || phase === 'simpulkan'
      ? 6
      : phase === 'kuis'
      ? quizIndex === 0
        ? 8
        : quizIndex === 1
        ? 7
        : 6
      : cols; // 5

  const activeRows = isRotated ? baseCols : baseRows;
  const activeCols = isRotated ? baseRows : baseCols;

  return (
    <div className="w-full max-w-6xl mx-auto min-h-full flex flex-col justify-between py-1 px-2 sm:px-4 space-y-2">
      {/* Header Level 2: 4 Tahap Aktivitas & 3 Lampu Scaffolding */}
      <div className="bg-white border-2 border-emerald-300 rounded-2xl px-3 py-1.5 shadow-xs flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
            Level 2: Pulau Pasangan Ajaib (M2)
          </span>

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

        {/* Tombol Scaffolding 3 Tingkat Lampu */}
        <button
          onClick={requestHint}
          className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-amber-400 px-3 py-1 rounded-xl font-black text-xs active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-400" />
          <span>Minta Petunjuk</span>
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

      {/* Persamaan Matematika (Dynamic Equation) Level 2 */}
      <div className="shrink-0 flex justify-center">
        {phase === 'tebak' && (
          <DynamicEquationBadge
            customEquation="4 × 5 = 20  ⇄  20 : 4 = ?"
            subtitle="Tebak: Berapa hasil 20 dibagi 4 tanpa menghitung dari nol?"
            variant="custom"
            className="w-full sm:w-auto"
          />
        )}
        {phase === 'coba' && (
          <DynamicEquationBadge
            dividend={rows * cols}
            divisor={isRotated ? cols : rows}
            quotient={isRotated ? rows : cols}
            variant="inverse"
            subtitle={
              isRotated
                ? `Posisi diputar: ${cols} baris × ${rows} kolom = ${rows * cols}`
                : `Posisi awal: ${rows} baris × ${cols} kolom = ${rows * cols}`
            }
            className="w-full sm:w-auto"
          />
        )}
        {phase === 'detektif' && (
          <DynamicEquationBadge
            customEquation={
              detektifStep === 'checking'
                ? 'Klaim: 30 : 5 = 7 ?  (Cek: 5 × 7 = 35 ❌)'
                : 'Cari yang Benar: 30 : 5 = 6 ✅  (Cek: 5 × 6 = 30)'
            }
            subtitle={
              detektifStep === 'checking'
                ? 'Periksa perkaliannya: apakah 5 × 7 = 30?'
                : 'Bagus! Temukan bilangan yang jika dikali 5 hasilnya tepat 30.'
            }
            variant="custom"
            className="w-full sm:w-auto"
          />
        )}
        {phase === 'simpulkan' && (
          <DynamicEquationBadge
            customEquation="Hasil Bagi × Pembagi = Bilangan Semula"
            subtitle="Rumus Rahasia Detektif Matematika untuk Memeriksa Pembagian"
            variant="custom"
            className="w-full sm:w-auto"
          />
        )}
        {phase === 'kuis' && (
          <DynamicEquationBadge
            customEquation={quizQuestions[quizIndex].equation}
            subtitle="Perhatikan hubungan kebalikan di atas untuk menjawab kuis!"
            variant="custom"
            className="w-full sm:w-auto"
          />
        )}
      </div>

      {/* Konten Utama 2 Zona */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 overflow-y-auto lg:overflow-visible items-stretch">
        {/* Kolom Kiri: Larik Permen 3D & Rotasi Presisi 90 Derajat */}
        <div className="lg:col-span-7 flex flex-col justify-between overflow-hidden bg-white/80 border-2 border-emerald-200 rounded-2xl p-2 shadow-xs">
          <ThreeArrayScene
            className="w-full flex-1 min-h-[220px]"
            rows={activeRows}
            cols={activeCols}
            isRotated={isRotated}
            highlightStatus={highlightStatus}
            onToggleRotate={() => setIsRotated((prev) => !prev)}
            onResetRotate={() => setIsRotated(false)}
          />
        </div>

        {/* Kolom Kanan: Balon Instruksi Kak Bagi & Aksi Interaksi */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white border-2 border-emerald-200 rounded-2xl p-3 sm:p-4 shadow-xs overflow-y-auto space-y-3">
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

          {phase === 'tebak' && (
            <div className="space-y-3">
              <MascotStepInstruction
                stepNumber={1}
                totalSteps={4}
                stepTitle="Tebak Pasangan Ajaib"
                instructionText="Jika kita sudah tahu bahwa 4 × 5 = 20, berapa hasil dari 20 : 4? Kamu tidak perlu menghitung lama!"
                actionHint="Pilih angka yang tepat di bawah!"
                isSpeaking={isSpeaking}
                onReplayVoice={() => {
                  setIsSpeaking(true);
                  audioService.speak(
                    'Kalau empat kali lima sama dengan dua puluh, berapa dua puluh dibagi empat?',
                    { onEnd: () => setIsSpeaking(false) }
                  );
                }}
                mascotMood="thinking"
              />

              <div className="grid grid-cols-3 gap-2 pt-2">
                {[4, 5, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      audioService.playTapSound();
                      if (num === 5) {
                        audioService.playSuccessSound();
                        audioService.speak(
                          'Tepat sekali! Karena 4 kali 5 sama dengan 20, maka 20 dibagi 4 adalah 5!'
                        );
                      } else {
                        audioService.speak(`Kamu memilih ${num}. Yuk putar susunannya untuk membuktikannya!`);
                      }
                      setPhase('coba');
                    }}
                    className="min-h-[48px] p-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 font-black text-xl text-emerald-950 shadow-xs active:scale-95 transition-all text-center cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === 'coba' && (
            <div className="space-y-3">
              <MascotStepInstruction
                stepNumber={2}
                totalSteps={4}
                stepTitle="Putar & Amati Pasangan"
                instructionText="Klik tombol 'Putar 90°' di bawah panggung 3D. Perhatikan bagaimana baris dan kolom bertukar tempat, tetapi jumlah total permen tetap sama!"
                actionHint="Setelah mencoba memutar, klik 'Buka Misi Detektif Cek'."
                isSpeaking={isSpeaking}
                onReplayVoice={() => {
                  setIsSpeaking(true);
                  audioService.speak(
                    'Putar susunan permen dan amati bagaimana baris dan kolom saling berkebalikan.',
                    { onEnd: () => setIsSpeaking(false) }
                  );
                }}
                mascotMood="explaining"
              />

              <button
                onClick={() => {
                  audioService.playSuccessSound();
                  setPhase('detektif');
                  audioService.speak(
                    'Saatnya jadi Detektif Cek! Ada yang menyatakan 30 dibagi 5 sama dengan 7. Apakah benar? Cek dengan perkalian!'
                  );
                }}
                className="w-full min-h-[48px] py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm sm:text-base rounded-xl shadow-xs border-b-2 border-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Buka Misi Detektif Cek! 🔍</span>
              </button>
            </div>
          )}

          {phase === 'detektif' && (
            <div className="space-y-3">
              <MascotStepInstruction
                stepNumber={3}
                totalSteps={4}
                stepTitle="Misi Detektif Cek"
                instructionText={
                  detektifStep === 'checking'
                    ? 'Seseorang mengaku bahwa 30 : 5 = 7. Apakah benar? Cek dengan perkalian: apakah 5 × 7 = 30?'
                    : 'Bagus! Sekarang cari hasil yang benar: 30 : 5 = berapa? (Ingat: 5 × ... = 30)'
                }
                actionHint="Pilih jawaban di bawah!"
                isSpeaking={isSpeaking}
                onReplayVoice={() => {
                  setIsSpeaking(true);
                  audioService.speak(
                    detektifStep === 'checking'
                      ? 'Apakah benar 30 dibagi 5 sama dengan 7? Cek perkalian 5 kali 7!'
                      : 'Berapa hasil 30 dibagi 5 yang benar?',
                    { onEnd: () => setIsSpeaking(false) }
                  );
                }}
                mascotMood="thinking"
              />

              {detektifStep === 'checking' ? (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleDetektifCheck(true)}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm border-b-2 border-slate-300 cursor-pointer"
                  >
                    Benar (5 × 7 = 30)
                  </button>
                  <button
                    onClick={() => handleDetektifCheck(false)}
                    className="py-2.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm border-b-2 border-rose-700 cursor-pointer shadow-xs active:scale-95"
                  >
                    Salah! (5 × 7 = 35) ❌
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {[5, 6, 8].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleDetektifCorrection(opt)}
                      className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base border-b-2 border-emerald-700 cursor-pointer shadow-xs active:scale-95 text-center"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {phase === 'simpulkan' && (
            <div className="space-y-3">
              <MascotStepInstruction
                stepNumber={4}
                totalSteps={4}
                stepTitle="Simpulkan Rumus Cek"
                instructionText="Lengkapi rumus rahasia detektif: bagaimana cara memeriksa pembagian dengan bantuan perkalian?"
                actionHint="Pilih dua kata yang tepat di bawah lalu klik 'Periksa Kesimpulanku'."
                isSpeaking={isSpeaking}
                onReplayVoice={() => {
                  setIsSpeaking(true);
                  audioService.speak(
                    'Lengkapi kalimat rumus rahasia pengecekan pembagian menggunakan perkalian!',
                    { onEnd: () => setIsSpeaking(false) }
                  );
                }}
                mascotMood="explaining"
              />

              <div className="space-y-2 pt-1 text-xs sm:text-sm font-bold text-slate-800">
                <p>
                  "Untuk memeriksa pembagian, kita{' '}
                  <span className="text-emerald-700 font-black underline">
                    {wordA || '[Pilih Kata 1]'}
                  </span>{' '}
                  hasil bagi dengan{' '}
                  <span className="text-sky-700 font-black underline">
                    {wordB || '[Pilih Kata 2]'}
                  </span>
                  ."
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setWordA('mengalikan')}
                    className={`min-h-[42px] py-1.5 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      wordA === 'mengalikan'
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    Kata 1: Mengalikan
                  </button>
                  <button
                    onClick={() => setWordA('mengurang')}
                    className={`min-h-[42px] py-1.5 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      wordA === 'mengurang'
                        ? 'bg-rose-500 text-white border-rose-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    Kata 1: Mengurang
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setWordB('pembagi')}
                    className={`min-h-[42px] py-1.5 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      wordB === 'pembagi'
                        ? 'bg-sky-500 text-white border-sky-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    Kata 2: Pembagi
                  </button>
                  <button
                    onClick={() => setWordB('penambah')}
                    className={`min-h-[42px] py-1.5 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      wordB === 'penambah'
                        ? 'bg-rose-500 text-white border-rose-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    Kata 2: Penambah
                  </button>
                </div>

                <button
                  onClick={handleCheckConclusion}
                  disabled={!wordA || !wordB}
                  className={`w-full min-h-[48px] py-2.5 px-4 rounded-xl font-black text-sm border-b-2 transition-all cursor-pointer ${
                    wordA && wordB
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-700 active:scale-95'
                      : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                  }`}
                >
                  Periksa Kesimpulanku! ✅
                </button>
              </div>
            </div>
          )}

          {phase === 'kuis' && (
            <div className="space-y-3">
              <MascotStepInstruction
                stepNumber={quizIndex + 1}
                totalSteps={quizQuestions.length}
                stepTitle={`Kuis Kilat Soal ${quizIndex + 1}/3`}
                instructionText={quizQuestions[quizIndex].q}
                actionHint="Pilih satu jawaban yang paling tepat!"
                isSpeaking={isSpeaking}
                onReplayVoice={() => {
                  setIsSpeaking(true);
                  audioService.speak(quizQuestions[quizIndex].q, { onEnd: () => setIsSpeaking(false) });
                }}
                mascotMood="happy"
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
                        : 'bg-slate-50 hover:bg-emerald-50 border-slate-200 text-slate-800'
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
