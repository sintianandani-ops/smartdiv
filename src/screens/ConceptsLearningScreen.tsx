/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Layar Belajar Konsep SMART-DIV:
 * Urutan Wajib:
 * (1) Habis dibagi dan bersisa (M3)
 * (2) Kebalikan perkalian (M2)
 * (3) Pembagian dengan nol (M1)
 * 
 * Fitur Baru:
 * - Balon Dialog Petunjuk Langkah Bertahap bersama Kak Bagi
 * - Persamaan Matematika (DynamicEquationBadge) Real-time di setiap langkah
 * - Menghilangkan tampilan matriks/kotak perkalian<>pembagian rumit yang membingungkan
 */

import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { MascotStepInstruction } from '../components/MascotStepInstruction';
import { DynamicEquationBadge } from '../components/DynamicEquationBadge';
import { ThreeKelerengScene } from '../components/3d/ThreeKelerengScene';
import { ThreeArrayScene } from '../components/3d/ThreeArrayScene';
import { ThreeZeroBoxScene } from '../components/3d/ThreeZeroBoxScene';
import { audioService } from '../services/audioService';
import { storageService } from '../services/storageService';

interface ConceptsLearningScreenProps {
  studentCode: string;
  onFinishAllConcepts: () => void;
}

interface ConceptStep {
  heading: string;
  narration: string;
  hint: string;
  equationType: string;
  customEq?: string;
  dividend?: number;
  divisor?: number;
  quotient?: number | string;
  remainder?: number;
  showCheck?: boolean;
  subtitle?: string;
  view: string;
}

interface ConceptData {
  id: number;
  title: string;
  misconception: string;
  steps: ConceptStep[];
}

export const ConceptsLearningScreen: React.FC<ConceptsLearningScreenProps> = ({
  studentCode,
  onFinishAllConcepts,
}) => {
  const [conceptIndex, setConceptIndex] = useState(0); // 0 = Konsep 1, 1 = Konsep 2, 2 = Konsep 3
  const [stepIndex, setStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // State Coba Bersama Konsep 1 (11 permen dibagi ke 3 piring)
  const [coba1Candies, setCoba1Candies] = useState(11);
  const [coba1Plates, setCoba1Plates] = useState([0, 0, 0]);

  // State Coba Bersama Konsep 2 (2 x 6 = 12 rotatable)
  const [coba2Rotated, setCoba2Rotated] = useState(false);

  // State Coba Bersama Konsep 3 (10 permen, piring 3 -> 2 -> 1 -> 0)
  const [coba3PlatesCount, setCoba3PlatesCount] = useState(3);

  // Data Narasi & Langkah Tiap Konsep yang 100% Sinkron dengan Visual 3D
  const conceptsData: ConceptData[] = [
    {
      id: 1,
      title: 'Konsep 1: Habis Dibagi dan Bersisa',
      misconception: 'M3',
      steps: [
        {
          heading: 'Arti Pembagian',
          narration: 'Membagi artinya membagikan sejumlah benda sama banyak ke beberapa tempat. Misalnya 12 kelereng dibagikan rata ke dalam 4 kotak!',
          hint: 'Amati 12 kelereng yang terbagi rata masing-masing 3 ke dalam 4 kotak.',
          equationType: 'custom',
          customEq: '12 Kelereng : 4 Kotak = 3 Kelereng / Kotak',
          subtitle: 'Setiap kotak harus mendapatkan jumlah kelereng yang sama banyak!',
          view: 'intro1',
        },
        {
          heading: 'Habis Dibagi (Sisa 0)',
          narration: 'Contoh 12 kelereng dibagi ke dalam 4 kotak. Tiap kotak mendapat 3 kelereng, dan tidak ada sisa di baki tengah. Kita bilang habis dibagi! 12 dibagi 4 sama dengan 3, sisa 0.',
          hint: 'Perhatikan seluruh 12 kelereng habis terbagi rapi ke dalam 4 kotak.',
          equationType: 'standard',
          dividend: 12,
          divisor: 4,
          quotient: 3,
          remainder: 0,
          subtitle: 'Habis dibagi karena sisa kelereng di baki = 0',
          view: 'example_habis',
        },
        {
          heading: 'Pembagian Bersisa',
          narration: 'Sekarang contoh 13 kelereng dibagi ke dalam 4 kotak. Tiap kotak mendapat 3 kelereng, dan tersisa 1 kelereng di baki tengah. 13 dibagi 4 sama dengan 3 sisa 1!',
          hint: 'Perhatikan 1 kelereng tertinggal di baki tengah karena tidak cukup dibagi rata ke 4 kotak.',
          equationType: 'standard',
          dividend: 13,
          divisor: 4,
          quotient: 3,
          remainder: 1,
          showCheck: true,
          subtitle: '13 = (4 × 3) + 1 sisa di baki',
          view: 'example_sisa',
        },
        {
          heading: 'Aturan Emas Sisa',
          narration: 'Perhatikan 1 kelereng sisa di baki tengah! Sisa harus selalu lebih kecil dari 4 kotak pembagi (1 < 4). Jika sisa masih sama atau lebih banyak dari kotak, maka masih bisa dibagikan lagi!',
          hint: 'Sisa pembagian harus selalu lebih kecil dari jumlah kotak pembagi!',
          equationType: 'custom',
          customEq: 'Sisa < Pembagi  (1 Kelereng Sisa < 4 Kotak ✅)',
          subtitle: 'Aturan Emas: 0 ≤ Sisa < Jumlah Kotak',
          view: 'rule_sisa',
        },
        {
          heading: 'Coba Bersama Interaktif',
          narration: 'Yuk coba bersama! Bagikan 11 kelereng ke dalam 3 kotak secara bertahap sampai sisa kelereng di baki kurang dari 3 kotak.',
          hint: 'Klik tombol "Bagi 1 ke Tiap Kotak" sampai kelereng di baki tersisa kurang dari 3!',
          equationType: 'dynamic1',
          view: 'coba_bersama_1',
        },
      ],
    },
    {
      id: 2,
      title: 'Konsep 2: Pembagian Kebalikan Perkalian',
      misconception: 'M2',
      steps: [
        {
          heading: 'Mengenal Perkalian dengan Baris',
          narration: 'Perkalian adalah menyusun benda rapi dalam baris dan kolom. 3 baris dan tiap baris berisi 5 kristal, jadi 3 kali 5 sama dengan 15 kristal.',
          hint: 'Amati 3 baris mendatar yang masing-masing berisi 5 balok kristal (3 × 5 = 15).',
          equationType: 'custom',
          customEq: '3 Baris × 5 Kolom = 15 Kristal',
          subtitle: 'Perkalian menghitung total benda dalam susunan baris dan kolom',
          view: 'mult_rows',
        },
        {
          heading: 'Membongkar Menjadi Pembagian',
          narration: 'Dari 15 kristal itu, jika dibagi ke dalam 3 baris sama banyak, tiap baris mendapat 5 kristal. Jadi 15 dibagi 3 sama dengan 5!',
          hint: 'Perhatikan: membagi 15 kristal ke 3 baris menghasilkan 5 di setiap baris.',
          equationType: 'standard',
          dividend: 15,
          divisor: 3,
          quotient: 5,
          remainder: 0,
          showCheck: true,
          subtitle: '15 : 3 = 5  (karena 3 × 5 = 15)',
          view: 'div_rows',
        },
        {
          heading: 'Hubungan Pasangan Bilangan',
          narration: 'Jika kamu tahu bahwa 3 dikali 5 sama dengan 15, kamu langsung tahu bahwa 15 dibagi 3 sama dengan 5, dan 15 dibagi 5 sama dengan 3!',
          hint: 'Perkalian dan pembagian adalah pasangan keluarga bilangan yang saling berkebalikan.',
          equationType: 'inverse',
          dividend: 15,
          divisor: 3,
          quotient: 5,
          subtitle: 'Keluarga Bilangan: 3, 5, dan 15',
          view: 'family_facts',
        },
        {
          heading: 'Cara Memeriksa Pembagian',
          narration: 'Cara mengecek hasil pembagian: hasil bagi dikali pembagi harus sama dengan bilangan semula! 5 dikali 3 sama dengan 15.',
          hint: 'Gunakan perkalian untuk memastikan jawaban pembagianmu tepat.',
          equationType: 'custom',
          customEq: 'Hasil Bagi × Pembagi = Bilangan Semula  (5 × 3 = 15 ✅)',
          subtitle: 'Rumus Rahasia Memeriksa Pembagian Menggunakan Perkalian',
          view: 'check_rule',
        },
        {
          heading: 'Coba Bersama Interaktif',
          narration: 'Amati susunan 12 kristal! Klik tombol "Putar Susunan 90°" untuk melihat bagaimana baris dan kolom bertukar tempat secara berkebalikan.',
          hint: 'Gunakan tombol putar di bawah untuk mengubah susunan!',
          equationType: 'dynamic2',
          view: 'coba_bersama_2',
        },
      ],
    },
    {
      id: 3,
      title: 'Konsep 3: Pembagian dengan Nol',
      misconception: 'M1',
      steps: [
        {
          heading: 'Membagi dengan Nol: Tidak Ada Penerima',
          narration: 'Contoh 10 benda ingin dibagi ke dalam 0 kotak. Tidak ada kotak sama sekali untuk menerima benda! Maka pembagian 10 dibagi 0 tidak bisa dilakukan.',
          hint: 'Lihat di panggung 3D: ada 10 benda, tetapi kotaknya 0!',
          equationType: 'zero-division',
          dividend: 10,
          divisor: 0,
          subtitle: 'Tidak ada wadah penerima sama sekali!',
          view: 'zero_intro',
        },
        {
          heading: 'Mengecek dengan Perkalian',
          narration: 'Mari kita buktikan dengan perkalian! Nol dikali berapa pun selalu menghasilkan nol, tidak pernah menghasilkan sepuluh! Karena itu 10 dibagi 0 mustahil.',
          hint: '0 × 1 = 0, 0 × 5 = 0, 0 × 10 = 0. Tidak ada pengali yang menghasilkan 10!',
          equationType: 'custom',
          customEq: '0 × ... = 10 ?  (Mustahil, karena 0 × bilangan apa pun = 0)',
          subtitle: 'Bukti perkalian: pembagian dengan nol tidak memiliki jawaban',
          view: 'zero_mult_check',
        },
        {
          heading: 'Kebalikannya: 0 Dibagi Bilangan',
          narration: 'Sekarang kebalikannya: nol benda dibagi ke dalam lima kotak. Benda tidak ada sama sekali, jadi tiap kotak mendapat nol! Nol dibagi lima sama dengan nol.',
          hint: 'Lihat di panggung 3D: ada 5 kotak, tetapi bendanya 0 (semua kotak kosong).',
          equationType: 'zero-division',
          dividend: 0,
          divisor: 5,
          quotient: 0,
          subtitle: 'Cek perkalian: 5 × 0 = 0 (Tepat!)',
          view: 'zero_divided_by',
        },
        {
          heading: 'Ringkasan Rahasia Angka Nol',
          narration: 'Ingat baik-baik aturan emas angka nol: Bilangan dibagi nol TIDAK BISA dilakukan! Sedangkan nol dibagi bilangan lain hasilnya selalu NOL.',
          hint: 'Jangan tertukar antara Bilangan : 0 dengan 0 : Bilangan!',
          equationType: 'custom',
          customEq: 'Bilangan : 0 = TIDAK BISA ❌   |   0 : Bilangan = 0 ✅',
          subtitle: 'Aturan emas operasi angka nol dalam pembagian',
          view: 'zero_summary',
        },
        {
          heading: 'Coba Bersama Interaktif',
          narration: 'Ubah jumlah kotak menjadi tiga, dua, satu, lalu perhatikan apa yang terjadi saat kotak bernilai nol!',
          hint: 'Gunakan tombol (-) dan (+) untuk mengubah jumlah kotak.',
          equationType: 'dynamic3',
          view: 'coba_bersama_3',
        },
      ],
    },
  ];

  const currentConcept = conceptsData[conceptIndex];
  const currentStep = currentConcept.steps[stepIndex];

  // Bacakan petunjuk narasi otomatis saat langkah terbuka
  useEffect(() => {
    setIsSpeaking(true);
    audioService.speak(currentStep.narration, {
      onEnd: () => setIsSpeaking(false),
    });
  }, [conceptIndex, stepIndex]);

  // Coba Bersama Konsep 1: Bagikan permen
  const handleDistributeCoba1 = () => {
    if (coba1Candies >= 3) {
      audioService.playTapSound();
      setCoba1Candies((prev) => prev - 3);
      setCoba1Plates((prev) => [prev[0] + 1, prev[1] + 1, prev[2] + 1]);
    } else {
      audioService.playGentleRetrySound();
      audioService.speak(
        `Permen sisa ${coba1Candies}, sudah tidak cukup dibagi rata ke 3 piring. Jadi sisa pembagiannya adalah ${coba1Candies}!`
      );
    }
  };

  const handleResetCoba1 = () => {
    audioService.playTapSound();
    setCoba1Candies(11);
    setCoba1Plates([0, 0, 0]);
  };

  // Navigasi langkah
  const handleNextStep = () => {
    audioService.playSuccessSound();
    if (stepIndex < currentConcept.steps.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      // Selesaikan konsep ini
      const prog = storageService.getStudentProgress(studentCode);
      prog.conceptsDone[conceptIndex] = true;
      storageService.saveStudentProgress(prog);

      if (conceptIndex < conceptsData.length - 1) {
        setConceptIndex((prev) => prev + 1);
        setStepIndex(0);
        audioService.speak(
          `Hebat! Kamu telah memahami ${currentConcept.title}. Sekarang yuk kita pelajari konsep berikutnya!`
        );
      } else {
        // Semua 3 konsep selesai, siap ke Peta Petualangan!
        prog.currentStep = 'map';
        storageService.saveStudentProgress(prog);
        audioService.speak(
          'Luar biasa! Ketiga konsep pembagian sudah kamu kuasai. Selamat datang di Peta Petualangan Tiga Pulau!'
        );
        onFinishAllConcepts();
      }
    }
  };

  const handlePrevStep = () => {
    if (stepIndex > 0) {
      audioService.playTapSound();
      setStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-full max-h-full flex flex-col justify-between p-1 sm:p-2 space-y-1.5 overflow-hidden">
      {/* Header Tahap Belajar Konsep */}
      <div className="bg-white border-2 border-amber-300 rounded-2xl px-3 py-1.5 shadow-xs flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">📚</span>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
                Konsep {conceptIndex + 1}/3
              </span>
              {conceptIndex === 2 && (
                <span className="bg-amber-200 text-amber-950 text-[10px] font-black px-1.5 py-0.2 rounded-md">
                  Penguatan
                </span>
              )}
              <h2 className="text-xs sm:text-sm font-black text-slate-900 font-heading">
                {currentConcept.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Tab Indikator 3 Konsep */}
        <div className="flex items-center gap-1 sm:gap-2">
          {conceptsData.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => {
                audioService.playTapSound();
                setConceptIndex(idx);
                setStepIndex(0);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                conceptIndex === idx
                  ? 'bg-amber-400 text-amber-950 font-black shadow-xs ring-2 ring-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Konsep {idx + 1} {idx === 2 ? '⭐' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Prasyarat di Awal Konsep (Temuan Validator 10) */}
      {stepIndex === 0 && (
        <div className="bg-amber-100/80 border border-amber-300 px-3 py-1 rounded-xl text-xs font-bold text-amber-950 flex items-center justify-between gap-2 shrink-0">
          <span>
            💡 <strong>Prasyarat Belajar:</strong>{' '}
            {conceptIndex === 0 && 'Kita butuh ingat perkalian sebagai kelompok yang sama banyak.'}
            {conceptIndex === 1 && 'Kita butuh ingat susunan baris dan kolom perkalian yang rapi.'}
            {conceptIndex === 2 && 'Kita butuh ingat bahwa semua bilangan jika dikali nol hasilnya selalu nol!'}
          </span>
          <span className="text-[11px] font-extrabold text-amber-800 hidden sm:inline">Kurikulum Merdeka Kelas 4 SD</span>
        </div>
      )}

      {/* Rangkuman 1 Kalimat di Akhir Konsep (Temuan Validator 10) */}
      {stepIndex === currentConcept.steps.length - 1 && (
        <div className="bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-xl text-xs font-black text-emerald-950 flex items-center gap-2 shrink-0">
          <span>✨ <strong>Rangkuman:</strong>{' '}
            {conceptIndex === 0 && 'Sisa pembagian harus selalu lebih kecil (<) dari jumlah kotak pembagi!'}
            {conceptIndex === 1 && 'Hasil bagi dikali pembagi harus sama dengan bilangan semula (Pembagian adalah kebalikan perkalian)!'}
            {conceptIndex === 2 && 'Bilangan dibagi nol TIDAK BISA dilakukan, sedangkan nol dibagi bilangan hasilnya selalu NOL!'}
          </span>
        </div>
      )}

      {/* Persamaan Matematika (Dynamic Equation) Utama */}
      <div className="shrink-0 flex justify-center">
        {currentStep.equationType === 'custom' && (
          <DynamicEquationBadge
            customEquation={currentStep.customEq}
            subtitle={currentStep.subtitle}
            variant="custom"
            className="w-full sm:w-auto"
          />
        )}
        {currentStep.equationType === 'standard' && (
          <DynamicEquationBadge
            dividend={currentStep.dividend}
            divisor={currentStep.divisor}
            quotient={currentStep.quotient}
            remainder={currentStep.remainder}
            showCheck={currentStep.showCheck}
            subtitle={currentStep.subtitle}
            className="w-full sm:w-auto"
          />
        )}
        {currentStep.equationType === 'inverse' && (
          <DynamicEquationBadge
            dividend={currentStep.dividend}
            divisor={currentStep.divisor}
            quotient={currentStep.quotient}
            variant="inverse"
            subtitle={currentStep.subtitle}
            className="w-full sm:w-auto"
          />
        )}
        {currentStep.equationType === 'zero-division' && (
          <DynamicEquationBadge
            dividend={currentStep.dividend}
            divisor={currentStep.divisor}
            quotient={currentStep.quotient}
            variant="zero-division"
            subtitle={currentStep.subtitle}
            className="w-full sm:w-auto"
          />
        )}
        {/* Dynamic Coba Bersama 1 */}
        {currentStep.equationType === 'dynamic1' && (
          <DynamicEquationBadge
            dividend={11}
            divisor={3}
            quotient={coba1Plates[0]}
            remainder={coba1Candies}
            showCheck={coba1Candies < 3}
            subtitle={
              coba1Candies < 3
                ? `✨ Selesai! 11 kelereng dibagi 3 kotak = ${coba1Plates[0]} per kotak, sisa ${coba1Candies} di baki.`
                : 'Bagikan terus sampai sisa kelereng di baki kurang dari 3 kotak!'
            }
            className="w-full sm:w-auto"
          />
        )}
        {/* Dynamic Coba Bersama 2 */}
        {currentStep.equationType === 'dynamic2' && (
          <DynamicEquationBadge
            dividend={12}
            divisor={coba2Rotated ? 6 : 2}
            quotient={coba2Rotated ? 2 : 6}
            variant="inverse"
            subtitle={
              coba2Rotated
                ? 'Posisi tegak: 12 kristal dibagi 6 baris = 2 per baris (6 × 2 = 12)'
                : 'Posisi mendatar: 12 kristal dibagi 2 baris = 6 per baris (2 × 6 = 12)'
            }
            className="w-full sm:w-auto"
          />
        )}
        {/* Dynamic Coba Bersama 3 */}
        {currentStep.equationType === 'dynamic3' && (
          <DynamicEquationBadge
            dividend={10}
            divisor={coba3PlatesCount}
            quotient={coba3PlatesCount === 0 ? undefined : Math.floor(10 / coba3PlatesCount)}
            remainder={coba3PlatesCount === 0 ? undefined : 10 % coba3PlatesCount}
            variant={coba3PlatesCount === 0 ? 'zero-division' : 'standard'}
            subtitle={
              coba3PlatesCount === 0
                ? '🚫 Kotak berjumlah 0! Tidak ada tempat penerima, maka pembagian tidak bisa dilakukan.'
                : `Ada ${coba3PlatesCount} kotak: tiap kotak dapat ${Math.floor(10 / coba3PlatesCount)} benda, sisa ${10 % coba3PlatesCount}.`
            }
            className="w-full sm:w-auto"
          />
        )}
      </div>

      {/* AREA UTAMA DUA ZONA: Visual 3D (Kiri) & Balon Petunjuk Kak Bagi (Kanan) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2.5 min-h-0 overflow-hidden">
        {/* ZONA KIRI: Panggung Simulasi 3D Bersih (7 Kolom) */}
        <div className="lg:col-span-7 bg-white/90 border-2 border-amber-200 rounded-2xl p-2.5 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="flex-1 w-full flex flex-col justify-center relative min-h-[240px]">
            {conceptIndex === 0 && (
              <div className="h-full w-full flex flex-col justify-center">
                {stepIndex < 4 ? (
                  <ThreeKelerengScene
                    className="w-full flex-1 min-h-[240px]"
                    totalMarbles={stepIndex === 0 || stepIndex === 1 ? 12 : 13}
                    boxCount={4}
                    distributedMarbles={
                      stepIndex === 0 || stepIndex === 1
                        ? [3, 3, 3, 3]
                        : [3, 3, 3, 3]
                    }
                    remainingMarbles={stepIndex === 0 || stepIndex === 1 ? 0 : 1}
                    isInteractive={false}
                  />
                ) : (
                  <ThreeKelerengScene
                    className="w-full flex-1 min-h-[240px]"
                    totalMarbles={11}
                    boxCount={3}
                    distributedMarbles={coba1Plates}
                    remainingMarbles={coba1Candies}
                    onDistributeOne={handleDistributeCoba1}
                    onResetDistribution={handleResetCoba1}
                    isInteractive={true}
                  />
                )}
              </div>
            )}

            {conceptIndex === 1 && (
              <div className="h-full w-full flex flex-col justify-center">
                {stepIndex < 4 ? (
                  <ThreeArrayScene
                    className="w-full flex-1 min-h-[240px]"
                    rows={3}
                    cols={5}
                    isRotated={false}
                    highlightStatus="correct"
                  />
                ) : (
                  <ThreeArrayScene
                    className="w-full flex-1 min-h-[240px]"
                    rows={coba2Rotated ? 6 : 2}
                    cols={coba2Rotated ? 2 : 6}
                    isRotated={coba2Rotated}
                    highlightStatus="correct"
                    onToggleRotate={() => setCoba2Rotated((prev) => !prev)}
                  />
                )}
              </div>
            )}

            {conceptIndex === 2 && (
              <div className="h-full w-full flex flex-col justify-center">
                {stepIndex < 4 ? (
                  <ThreeZeroBoxScene
                    className="w-full flex-1 min-h-[240px]"
                    candyCount={stepIndex === 2 ? 0 : 10}
                    boxCount={stepIndex === 2 ? 5 : 0}
                    isInverseMode={stepIndex === 2}
                  />
                ) : (
                  <ThreeZeroBoxScene
                    className="w-full flex-1 min-h-[240px]"
                    candyCount={10}
                    boxCount={coba3PlatesCount}
                  />
                )}
              </div>
            )}
          </div>

          <div className="text-[10px] text-center text-slate-500 font-bold shrink-0">
            Geser layar 3D untuk memutar sudut pandang • Cubit / scroll untuk zoom
          </div>
        </div>

        {/* ZONA KANAN: Balon Dialog Petunjuk Kak Bagi & Kontrol Langkah (5 Kolom) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white border-2 border-amber-200 rounded-2xl p-3 shadow-xs space-y-2 overflow-y-auto">
          {/* Balon Dialog Petunjuk Langkah Bertahap bersama Maskot Kak Bagi */}
          <MascotStepInstruction
            stepNumber={stepIndex + 1}
            totalSteps={currentConcept.steps.length}
            stepTitle={currentStep.heading}
            instructionText={currentStep.narration}
            actionHint={currentStep.hint}
            isSpeaking={isSpeaking}
            onReplayVoice={() => {
              setIsSpeaking(true);
              audioService.speak(currentStep.narration, {
                onEnd: () => setIsSpeaking(false),
              });
            }}
            mascotMood={stepIndex === 4 ? 'celebrating' : isSpeaking ? 'explaining' : 'happy'}
          />

          {/* Kontrol Khusus Coba Bersama Jika Berada di Langkah 5 (Bersih & Mudah) */}
          {stepIndex === 4 && (
            <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <span className="text-[10px] font-black text-amber-900 uppercase tracking-wide block">
                Aksi Coba Bersama
              </span>

              {conceptIndex === 0 && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={handleDistributeCoba1}
                      disabled={coba1Candies < 3}
                      className={`flex-1 py-2 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 ${
                        coba1Candies >= 3
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Bagi 1 ke Tiap Kotak 📦
                    </button>
                    <button
                      onClick={handleResetCoba1}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl active:scale-95 transition-all"
                    >
                      Ulang
                    </button>
                  </div>
                  {coba1Candies < 3 && (
                    <div className="p-2 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-950 text-center font-bold text-xs">
                      ✨ Sisa {coba1Candies} kelereng di baki! Sisa ini sudah lebih kecil dari 3 kotak, jadi pembagian selesai!
                    </div>
                  )}
                </div>
              )}

              {conceptIndex === 1 && (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      audioService.playTapSound();
                      setCoba2Rotated((prev) => !prev);
                    }}
                    className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>🔄 Putar Susunan 90°</span>
                  </button>
                  <p className="text-[11px] text-center text-slate-600 font-bold">
                    Perhatikan persamaan di atas otomatis menyesuaikan saat susunan diputar!
                  </p>
                </div>
              )}

              {conceptIndex === 2 && (
                <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-xl border border-amber-300">
                  <span className="font-bold text-amber-950 text-xs">Ubah Jumlah Kotak:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        audioService.playTapSound();
                        setCoba3PlatesCount((prev) => Math.max(0, prev - 1));
                      }}
                      className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-lg text-sm active:scale-95 transition-all"
                    >
                      - Kurangi Kotak
                    </button>
                    <span className="w-8 text-center font-black text-base text-slate-800">
                      {coba3PlatesCount}
                    </span>
                    <button
                      onClick={() => {
                        audioService.playTapSound();
                        setCoba3PlatesCount((prev) => Math.min(5, prev + 1));
                      }}
                      className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-lg text-sm active:scale-95 transition-all"
                    >
                      + Tambah Kotak
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tombol Navigasi Bawah */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-200">
            <button
              onClick={handlePrevStep}
              disabled={stepIndex === 0}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                stepIndex > 0
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95'
                  : 'opacity-0 cursor-default'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <button
              onClick={handleNextStep}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs border-b-2 border-orange-700 active:scale-95 transition-all"
            >
              <span>
                {stepIndex < currentConcept.steps.length - 1
                  ? 'Langkah Berikutnya'
                  : conceptIndex < conceptsData.length - 1
                  ? 'Konsep Berikutnya ✨'
                  : 'Buka Peta Petualangan! 🗺️'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
