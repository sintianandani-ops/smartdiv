/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Level 3: "Pulau Kotak Kosong" (Mengatasi Miskonsepsi M1: Pembagian dengan Nol)
 * Berdasarkan Temuan Validasi Ahli Media No. 5, 6, 7:
 * - 4 Tahap Aktivitas di Atas: 1 Atur Kotak -> 2 Coba Bukti -> 3 Amati Kebalikan -> 4 Simpulkan
 * - Scaffolding Bertahap 3 Tingkat (3 Lampu Menyala)
 * - Tanda "Penguatan" untuk materi tingkat lanjut
 * - Tipografi ramah anak SD kelas 4 (teks isi >= 18px, tombol >= 48px)
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Lightbulb, Star, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { ThreeZeroBoxScene } from '../components/3d/ThreeZeroBoxScene';
import { MascotStepInstruction } from '../components/MascotStepInstruction';
import { DynamicEquationBadge } from '../components/DynamicEquationBadge';
import { audioService } from '../services/audioService';
import { storageService } from '../services/storageService';

interface Level3Props {
  studentCode: string;
  onFinishLevel: () => void;
  onGoBack?: () => void;
}

export const Level3KotakKosongScreen: React.FC<Level3Props> = ({
  studentCode,
  onFinishLevel,
  onGoBack,
}) => {
  const [phase, setPhase] = useState<'atur_kotak' | 'bilangan_ajaib' | 'kebalikannya' | 'simpulkan' | 'kuis'>('atur_kotak');
  const [boxCount, setBoxCount] = useState(3); // Awal 3 kotak

  const [hintsUsed, setHintsUsed] = useState(0);
  const [scaffoldLevel, setScaffoldLevel] = useState<0 | 1 | 2 | 3>(0);
  const [wrongTries, setWrongTries] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // State Bilangan Ajaib: 0 x ? = 9
  const [testedMultiplier, setTestedMultiplier] = useState<number | null>(null);

  // State Simpulkan:
  const [wordA, setWordA] = useState<string | null>(null); // tidak bisa / 0
  const [wordB, setWordB] = useState<string | null>(null); // 0 / tidak bisa

  // State Kuis Kilat Level 3
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
      q: 'Berapakah hasil dari 14 : 0?',
      equation: '14 : 0 = TIDAK BISA DILAKUKAN ❌',
      options: ['Tidak bisa dilakukan', '0', '14'],
      correct: 0,
      reason: 'Bilangan dibagi nol tidak bisa dilakukan karena tidak ada penerima, dan 0 dikali bilangan apapun tidak pernah menghasilkan 14!',
    },
    {
      q: 'Berapakah hasil dari 0 : 5?',
      equation: '0 : 5 = 0 ✅  (Cek: 5 × 0 = 0)',
      options: ['0', '5', 'Tidak bisa dilakukan'],
      correct: 0,
      reason: 'Nol dibagi bilangan hasilnya adalah 0, karena tidak ada benda yang dibagikan (Cek: 5 × 0 = 0).',
    },
    {
      q: 'Mengapa pembagian dengan nol tidak bisa diperiksa dengan perkalian?',
      equation: '0 × ... = Bilangan Semula? (Mustahil!)',
      options: [
        'Karena nol dikali bilangan apa pun selalu menghasilkan nol',
        'Karena angka nol itu terlalu kecil',
        'Karena pembagian tidak berhubungan dengan perkalian',
      ],
      correct: 0,
      reason: '0 dikali bilangan apapun selalu menghasilkan 0, jadi tidak pernah bisa menghasilkan bilangan semula!',
    },
  ];

  useEffect(() => {
    setIsSpeaking(true);
    audioService.speak(
      'Selamat datang di Pulau Kotak Kosong! Ada 9 permen. Coba atur jumlah kotak menjadi 3, 1, lalu coba buat kotaknya menjadi 0!',
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
      const msg = 'Petunjuk tingkat satu: Jika tidak ada kotak sama sekali, ke mana permen akan diletakkan? Tentu tidak bisa dibagikan!';
      setIsSpeaking(true);
      audioService.speak(msg, { onEnd: () => setIsSpeaking(false) });
    } else if (nextScaffold === 2) {
      const msg = 'Petunjuk tingkat dua: Ingat perkalian! Nol dikali bilangan apa pun hasilnya selalu nol, tidak pernah bisa menghasilkan sembilan!';
      setIsSpeaking(true);
      audioService.speak(msg, { onEnd: () => setIsSpeaking(false) });
    } else {
      const msg = 'Petunjuk tingkat tiga: Kak Bagi simpulkan ya! Bilangan dibagi nol itu TIDAK BISA dilakukan. Sedangkan nol dibagi bilangan hasilnya selalu NOL.';
      setIsSpeaking(true);
      audioService.speak(msg, { onEnd: () => setIsSpeaking(false) });
    }
  };

  const handleAdjustBox = (delta: number) => {
    const nextVal = Math.max(0, Math.min(4, boxCount + delta));
    setBoxCount(nextVal);
    audioService.playTapSound();

    if (nextVal === 0) {
      audioService.playGentleRetrySound();
      setIsSpeaking(true);
      audioService.speak(
        'Lihat panggung 3D! Tidak ada kotak penerima sama sekali. Maka sembilan permen tidak bisa dibagikan!',
        { onEnd: () => setIsSpeaking(false) }
      );
    } else {
      audioService.speak(`Kotak sekarang ada ${nextVal}. Permen terbagi rata ke dalam ${nextVal} kotak.`);
    }
  };

  const handleTestMultiplier = (val: number) => {
    setTestedMultiplier(val);
    audioService.playTapSound();
    audioService.playGentleRetrySound();
    setExplanationFeedback(`💡 Penjelasan: 0 × ${val} = 0 (bukan 9!). Berapa pun angka pengalinya, hasilnya selalu 0. Maka 9 : 0 mustahil dan tidak bisa dilakukan!`);
    setIsSpeaking(true);
    audioService.speak(`Nol dikali ${val} sama dengan nol, bukan sembilan! Coba angka lain.`);
  };

  const handleCheckConclusion = () => {
    if (wordA === 'tidak bisa' && wordB === '0') {
      audioService.playAppreciation('Hebat sekali sahabat pintar! Bilangan dibagi nol tidak bisa dilakukan, sedangkan nol dibagi bilangan hasilnya selalu nol.');
      confetti({ particleCount: 70, spread: 80 });
      setExplanationFeedback('✅ Sempurna! Aturan Emas: Bilangan : 0 = Tidak Bisa (Mustahil), 0 : Bilangan = 0.');
      setIsSpeaking(true);
      const text = 'Hebat sekali sahabat pintar! Bilangan dibagi nol tidak bisa dilakukan, sedangkan nol dibagi bilangan hasilnya selalu nol.';
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
      setExplanationFeedback('💡 Penjelasan: Jangan tertukar ya! Kalau dibagi 0 (tanpa wadah), tidak bisa dihitung. Kalau 0 dibagi bilangan (benda kosong tapi ada wadah), hasilnya adalah 0!');
      audioService.speak('Periksa lagi yuk! Jangan sampai tertukar antara membagi dengan nol dan membagi angka nol.');
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
          prog.stars.level3 = Math.max(prog.stars.level3, starsEarned);
          prog.quizScores.level3 = finalScore;
          prog.unlockedLevel = Math.max(prog.unlockedLevel, 4); // 4 = semua pulau selesai!
          prog.phaseDurations.level3Seconds = (prog.phaseDurations.level3Seconds || 0) + elapsed;
          prog.scaffoldingStats.level3 = { hintsUsed, wrongTries };
          storageService.saveStudentProgress(prog);

          audioService.playSuccessSound();
          audioService.speak('Luar biasa! Seluruh tiga pulau petualangan telah selesai kamu jelajahi!');
          onFinishLevel();
        }
      }, 400);
    };

    audioService.speak(speechText, { onEnd: transitionNext });
    setTimeout(transitionNext, 6000);
  };

  // 4 Tahap Aktivitas
  const activityStages = [
    { id: 'atur_kotak', label: '1. Atur Kotak' },
    { id: 'bilangan_ajaib', label: '2. Coba Bukti' },
    { id: 'kebalikannya', label: '3. Amati' },
    { id: 'simpulkan', label: '4. Simpulkan' },
  ];

  const getStageStatus = (stageId: string) => {
    const order = ['atur_kotak', 'bilangan_ajaib', 'kebalikannya', 'simpulkan', 'kuis'];
    const curIdx = order.indexOf(phase);
    const targetIdx = order.indexOf(stageId);
    if (curIdx > targetIdx) return 'done';
    if (curIdx === targetIdx) return 'current';
    return 'upcoming';
  };

  const activeBoxCount =
    phase === 'bilangan_ajaib'
      ? 0
      : phase === 'kebalikannya'
      ? 6
      : phase === 'simpulkan'
      ? 0
      : phase === 'kuis'
      ? 0
      : boxCount;

  const activeCandiesCount =
    phase === 'kebalikannya'
      ? 0
      : phase === 'kuis' && quizIndex === 1
      ? 0
      : 9;

  return (
    <div className="w-full max-w-6xl mx-auto min-h-full flex flex-col justify-between py-1 px-2 sm:px-4 space-y-2">
      {/* Header Level 3: 4 Tahap Aktivitas & 3 Lampu Scaffolding */}
      <div className="bg-white border-2 border-rose-300 rounded-2xl px-3 py-1.5 shadow-xs flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span>Level 3: Kotak Kosong (M1)</span>
            <span className="bg-amber-200 text-amber-950 text-[10px] px-1.5 rounded">Penguatan</span>
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

        {/* Tombol Scaffolding 3 Lampu */}
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

      {/* Persamaan Matematika (Dynamic Equation) Level 3 */}
      <div className="shrink-0 flex justify-center">
        {phase === 'atur_kotak' && (
          <DynamicEquationBadge
            dividend={9}
            divisor={boxCount}
            quotient={boxCount === 0 ? undefined : Math.floor(9 / boxCount)}
            remainder={boxCount === 0 ? undefined : 9 % boxCount}
            variant={boxCount === 0 ? 'zero-division' : 'standard'}
            subtitle={
              boxCount === 0
                ? '🚫 Tidak ada kotak penerima sama sekali!'
                : `Ada ${boxCount} kotak: tiap kotak dapat ${Math.floor(9 / boxCount)} permen, sisa ${9 % boxCount}`
            }
            className="w-full sm:w-auto"
          />
        )}
        {phase === 'bilangan_ajaib' && (
          <DynamicEquationBadge
            customEquation={
              testedMultiplier !== null
                ? `0 × ${testedMultiplier} = 0  (Mustahil menghasilkan 9!)`
                : '9 : 0 = ?  ⇄  0 × ... = 9 ?'
            }
            subtitle="Adakah bilangan yang jika dikali 0 bisa menghasilkan 9?"
            variant="custom"
            className="w-full sm:w-auto"
          />
        )}
        {phase === 'kebalikannya' && (
          <DynamicEquationBadge
            customEquation="9 : 0 = TIDAK BISA ❌   vs   0 : 6 = 0 ✅"
            subtitle="Perbedaan: Bilangan dibagi nol (tidak bisa) vs Nol dibagi bilangan (hasilnya 0)"
            variant="custom"
            className="w-full sm:w-auto"
          />
        )}
        {phase === 'simpulkan' && (
          <DynamicEquationBadge
            customEquation="Bilangan : 0 = Tidak Bisa  |  0 : Bilangan = 0"
            subtitle="Aturan Emas Pembagian dengan Nol yang Harus Kamu Ingat"
            variant="custom"
            className="w-full sm:w-auto"
          />
        )}
        {phase === 'kuis' && (
          <DynamicEquationBadge
            customEquation={quizQuestions[quizIndex].equation}
            subtitle="Perhatikan sifat pembagian nol di atas untuk menjawab kuis!"
            variant="custom"
            className="w-full sm:w-auto"
          />
        )}
      </div>

      {/* Konten Utama 2 Zona */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 overflow-y-auto lg:overflow-visible items-stretch">
        {/* Kolom Kiri: 3D Scene Kotak & Nol Bebas Halangan */}
        <div className="lg:col-span-7 flex flex-col justify-between overflow-hidden bg-white/80 border-2 border-rose-200 rounded-2xl p-2 shadow-xs">
          <ThreeZeroBoxScene
            candyCount={activeCandiesCount}
            boxCount={activeBoxCount}
            className="w-full flex-1 min-h-[220px]"
          />
        </div>

        {/* Kolom Kanan: Balon Instruksi Kak Bagi & Aksi Interaksi */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white border-2 border-rose-200 rounded-2xl p-3 sm:p-4 shadow-xs overflow-y-auto space-y-3">
          {/* Banner Penjelasan Interaktif Saat Jawaban Salah/Benar (Saran Ahli Media) */}
          {explanationFeedback && (
            <div className={`p-2.5 rounded-xl border-2 text-xs sm:text-sm font-bold flex items-start gap-2 shadow-xs transition-all ${
              explanationFeedback.startsWith('✅')
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : 'bg-rose-50 border-rose-400 text-rose-950'
            }`}>
              <span className="text-base shrink-0">{explanationFeedback.startsWith('✅') ? '🎉' : '💡'}</span>
              <span className="leading-snug">{explanationFeedback}</span>
            </div>
          )}

          {phase === 'atur_kotak' && (
            <div className="space-y-3">
              <MascotStepInstruction
                stepNumber={1}
                totalSteps={4}
                stepTitle="Eksperimen Jumlah Kotak"
                instructionText="Tekan tombol (-) untuk mengurangi kotak sampai menjadi 0 kotak. Amati apa yang terjadi pada 9 permen di panggung 3D!"
                actionHint="Kurangi kotak sampai bernilai 0!"
                isSpeaking={isSpeaking}
                onReplayVoice={() => {
                  setIsSpeaking(true);
                  audioService.speak(
                    'Kurangi kotak dengan tombol minus sampai kotaknya nol. Amati ke mana permen akan diletakkan!',
                    { onEnd: () => setIsSpeaking(false) }
                  );
                }}
                mascotMood={boxCount === 0 ? 'explaining' : 'thinking'}
              />

              <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl flex items-center justify-between">
                <span className="font-black text-sm text-rose-950">Jumlah Kotak Penerima:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAdjustBox(-1)}
                    disabled={boxCount === 0}
                    className="w-10 h-10 bg-white hover:bg-rose-100 border border-rose-300 rounded-xl font-black text-xl text-rose-900 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-black text-xl text-rose-950 w-6 text-center">
                    {boxCount}
                  </span>
                  <button
                    onClick={() => handleAdjustBox(1)}
                    disabled={boxCount === 4}
                    className="w-10 h-10 bg-white hover:bg-rose-100 border border-rose-300 rounded-xl font-black text-xl text-rose-900 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {boxCount === 0 && (
                <button
                  onClick={() => {
                    audioService.playSuccessSound();
                    setPhase('bilangan_ajaib');
                    setIsSpeaking(true);
                    audioService.speak(
                      'Tepat sekali! Karena tidak ada kotak, permen tidak bisa dibagikan. Sekarang mari buktikan lewat perkalian!',
                      { onEnd: () => setIsSpeaking(false) }
                    );
                  }}
                  className="w-full min-h-[48px] py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-sm sm:text-base rounded-xl shadow-xs border-b-2 border-rose-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Buktikan dengan Perkalian! 🔮</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {phase === 'bilangan_ajaib' && (
            <div className="space-y-3">
              <MascotStepInstruction
                stepNumber={2}
                totalSteps={4}
                stepTitle="Bukti Perkalian Angka Nol"
                instructionText="Jika 9 : 0 ada hasilnya, maka 0 × (hasil itu) harus sama dengan 9. Coba uji angka berapa pun di bawah ini: apakah ada yang menghasilkan 9?"
                actionHint="Klik salah satu angka pengali di bawah!"
                isSpeaking={isSpeaking}
                onReplayVoice={() => {
                  setIsSpeaking(true);
                  audioService.speak(
                    'Uji angka pengali di bawah. Adakah bilangan yang jika dikali nol bisa menghasilkan sembilan?',
                    { onEnd: () => setIsSpeaking(false) }
                  );
                }}
                mascotMood="thinking"
              />

              <div className="grid grid-cols-4 gap-2 pt-1">
                {[1, 5, 9, 100].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleTestMultiplier(val)}
                    className="min-h-[46px] p-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 font-black text-base text-rose-950 active:scale-95 transition-all text-center cursor-pointer"
                  >
                    0 × {val}
                  </button>
                ))}
              </div>

              {testedMultiplier !== null && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs sm:text-sm font-black text-rose-950 text-center bg-rose-100/70 p-2 rounded-xl">
                    0 × {testedMultiplier} = 0 ❌ (Mustahil menghasilkan 9!)
                  </p>
                  <button
                    onClick={() => {
                      audioService.playSuccessSound();
                      setPhase('kebalikannya');
                      setIsSpeaking(true);
                      audioService.speak(
                        'Sekarang bandingkan dengan kebalikannya: bagaimana jika nol permen dibagi ke enam kotak?',
                        { onEnd: () => setIsSpeaking(false) }
                      );
                    }}
                    className="w-full min-h-[48px] py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm sm:text-base rounded-xl shadow-xs border-b-2 border-amber-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Lanjut: Kebalikannya ⚖️</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {phase === 'kebalikannya' && (
            <div className="space-y-3">
              <MascotStepInstruction
                stepNumber={3}
                totalSteps={4}
                stepTitle="Bandingkan Kebalikannya"
                instructionText="Sekarang lihat kebalikannya: 0 permen dibagi ke dalam 6 kotak. Permennya tidak ada sama sekali! Maka tiap kotak mendapat 0 permen. 0 : 6 = 0 (dan 6 × 0 = 0 ✅)."
                actionHint="Klik tombol Lanjut untuk menyimpulkan!"
                isSpeaking={isSpeaking}
                onReplayVoice={() => {
                  setIsSpeaking(true);
                  audioService.speak(
                    'Nol permen dibagi ke enam kotak hasilnya adalah nol permen per kotak.',
                    { onEnd: () => setIsSpeaking(false) }
                  );
                }}
                mascotMood="celebrating"
              />

              <div className="bg-emerald-50 border-2 border-emerald-300 p-3 rounded-xl text-center space-y-1">
                <span className="text-sm font-black text-emerald-950 block">0 : 6 = 0 ✅</span>
                <span className="text-xs font-bold text-emerald-800">Cek: 6 kotak × 0 permen = 0 permen semula!</span>
              </div>

              <button
                onClick={() => {
                  audioService.playSuccessSound();
                  setPhase('simpulkan');
                  setIsSpeaking(true);
                  audioService.speak(
                    'Yuk simpulkan aturan emas angka nol dalam pembagian!',
                    { onEnd: () => setIsSpeaking(false) }
                  );
                }}
                className="w-full min-h-[48px] py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-sm sm:text-base rounded-xl shadow-xs border-b-2 border-rose-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Simpulkan Aturan Emas Nol 💡</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {phase === 'simpulkan' && (
            <div className="space-y-3">
              <MascotStepInstruction
                stepNumber={4}
                totalSteps={4}
                stepTitle="Simpulkan Aturan Emas Nol"
                instructionText="Lengkapi kalimat aturan emas ini agar kamu tidak pernah tertukar lagi!"
                actionHint="Pilih dua kata yang tepat di bawah lalu klik 'Periksa Kesimpulanku'."
                isSpeaking={isSpeaking}
                onReplayVoice={() => {
                  setIsSpeaking(true);
                  audioService.speak(
                    'Lengkapi kalimat aturan emas pembagian dengan nol!',
                    { onEnd: () => setIsSpeaking(false) }
                  );
                }}
                mascotMood="explaining"
              />

              <div className="space-y-2 pt-1 text-xs sm:text-sm font-bold text-slate-800">
                <p>
                  "Bilangan dibagi nol adalah{' '}
                  <span className="text-rose-700 font-black underline">
                    {wordA || '[Pilih Kata 1]'}
                  </span>
                  , sedangkan nol dibagi bilangan hasilnya adalah{' '}
                  <span className="text-emerald-700 font-black underline">
                    {wordB || '[Pilih Kata 2]'}
                  </span>
                  ."
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setWordA('tidak bisa')}
                    className={`min-h-[42px] py-1.5 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      wordA === 'tidak bisa'
                        ? 'bg-rose-500 text-white border-rose-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    Kata 1: Tidak Bisa
                  </button>
                  <button
                    onClick={() => setWordA('0')}
                    className={`min-h-[42px] py-1.5 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      wordA === '0'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    Kata 1: 0
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setWordB('0')}
                    className={`min-h-[42px] py-1.5 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      wordB === '0'
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    Kata 2: 0
                  </button>
                  <button
                    onClick={() => setWordB('tidak bisa')}
                    className={`min-h-[42px] py-1.5 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      wordB === 'tidak bisa'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    Kata 2: Tidak Bisa
                  </button>
                </div>

                <button
                  onClick={handleCheckConclusion}
                  disabled={!wordA || !wordB}
                  className={`w-full min-h-[48px] py-2.5 px-4 rounded-xl font-black text-sm border-b-2 transition-all cursor-pointer ${
                    wordA && wordB
                      ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-700 active:scale-95'
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
                        : 'bg-slate-50 hover:bg-rose-50 border-slate-200 text-slate-800'
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
