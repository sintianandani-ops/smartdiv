/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Modul Logika Matematika & Validitas Penelitian SMART-DIV:
 * - Menjamin tidak ada kebocoran angka tes (Misi Awal & Misi Akhir) ke dalam permainan, konsep, atau kuis kilat
 * - Perhitungan pembagian bersisa dan kebalikan perkalian secara presisi
 * - Perhitungan N-Gain dan pengelompokan miskonsepsi (M1, M2, M3)
 */

// Pasangan angka yang MUTLAK DILARANG muncul di luar Misi Awal dan Misi Akhir
export const FORBIDDEN_TEST_PAIRS: Array<{ a: number; b: number }> = [
  // Misi Awal
  { a: 6, b: 0 },
  { a: 0, b: 4 },
  { a: 24, b: 4 },
  { a: 24, b: 6 },
  { a: 6, b: 4 },
  { a: 4, b: 6 },
  { a: 36, b: 9 },
  { a: 36, b: 4 },
  { a: 4, b: 9 },
  { a: 9, b: 4 },
  { a: 17, b: 5 },
  { a: 19, b: 4 },

  // Misi Akhir
  { a: 8, b: 0 },
  { a: 0, b: 7 },
  { a: 21, b: 3 },
  { a: 21, b: 7 },
  { a: 7, b: 3 },
  { a: 3, b: 7 },
  { a: 45, b: 5 },
  { a: 45, b: 9 },
  { a: 5, b: 9 },
  { a: 9, b: 5 },
  { a: 23, b: 6 },
  { a: 25, b: 6 },
];

/**
 * Memeriksa apakah pasangan (a, b) masuk dalam daftar terlarang
 */
export function isForbiddenPair(a: number, b: number): boolean {
  return FORBIDDEN_TEST_PAIRS.some(pair => pair.a === a && pair.b === b);
}

/**
 * Menghitung pembagian dengan sisa sesuai formula a = (b x q) + r
 * Sisa harus selalu 0 <= r < b
 */
export interface DivisionResult {
  canDivide: boolean;
  quotient: number;
  remainder: number;
  explanation: string;
}

export function divideWithRemainder(dividend: number, divisor: number): DivisionResult {
  if (divisor === 0) {
    return {
      canDivide: false,
      quotient: 0,
      remainder: 0,
      explanation: 'Pembagian dengan 0 tidak bisa dilakukan karena tidak ada tempat penerima.',
    };
  }

  const quotient = Math.floor(dividend / divisor);
  const remainder = dividend % divisor;

  return {
    canDivide: true,
    quotient,
    remainder,
    explanation: `${dividend} = (${divisor} × ${quotient}) + ${remainder}, dengan sisa ${remainder} lebih kecil dari ${divisor}.`,
  };
}

/**
 * Pembangkit angka acak untuk Level 1 (Habis dibagi dan bersisa)
 * Memilih bilangan yang dijamin AMAN dari daftar terlarang
 */
export function generateSafeLevel1Problem(): { dividend: number; divisor: number } {
  // Kandidat aman untuk anak kelas 4
  const safeCandidates = [
    { dividend: 14, divisor: 4 }, // 14 : 4 = 3 sisa 2
    { dividend: 20, divisor: 6 }, // 20 : 6 = 3 sisa 2
    { dividend: 26, divisor: 7 }, // 26 : 7 = 3 sisa 5
    { dividend: 15, divisor: 4 }, // 15 : 4 = 3 sisa 3
    { dividend: 18, divisor: 5 }, // 18 : 5 = 3 sisa 3
    { dividend: 22, divisor: 5 }, // 22 : 5 = 4 sisa 2
    { dividend: 27, divisor: 6 }, // 27 : 6 = 4 sisa 3
    { dividend: 16, divisor: 3 }, // 16 : 3 = 5 sisa 1
  ];

  const pool = safeCandidates.filter(p => !isForbiddenPair(p.dividend, p.divisor));
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Pembangkit angka acak untuk Level 2 (Kebalikan Perkalian)
 */
export function generateSafeLevel2Problem(): { rows: number; cols: number; total: number } {
  const safeCandidates = [
    { rows: 4, cols: 5, total: 20 },
    { rows: 5, cols: 6, total: 30 },
    { rows: 4, cols: 8, total: 32 },
    { rows: 9, cols: 3, total: 27 },
    { rows: 3, cols: 8, total: 24 }, // 3x8 aman (yang dilarang adalah 6x4=24)
    { rows: 6, cols: 5, total: 30 },
    { rows: 7, cols: 4, total: 28 },
    { rows: 8, cols: 4, total: 32 },
  ];

  const pool = safeCandidates.filter(
    p => !isForbiddenPair(p.total, p.rows) && !isForbiddenPair(p.total, p.cols)
  );
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Pembangkit angka acak untuk Level 3 (Pembagian dengan Nol)
 */
export function generateSafeLevel3Candies(): number {
  const safeNumbers = [9, 12, 15, 10, 14, 16];
  // 6 dan 8 adalah angka tes untuk n : 0, jadi hindari 6 dan 8
  const pool = safeNumbers.filter(n => n !== 6 && n !== 8);
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Perhitungan Skor & N-Gain
 */
export function calculateTestTotal(scores: Record<number, { score: number }>): number {
  let total = 0;
  for (let i = 1; i <= 6; i++) {
    total += scores[i]?.score || 0;
  }
  return total;
}

export function calculateTestPercentage(totalScore: number): number {
  return Number(((totalScore / 18) * 100).toFixed(1));
}

export function calculateNGain(prePercentage: number, postPercentage: number): {
  gain: number | null;
  category: 'Tinggi' | 'Sedang' | 'Rendah' | 'Tidak Dihitung';
} {
  if (prePercentage >= 100) {
    return { gain: null, category: 'Tidak Dihitung' };
  }

  const nGain = (postPercentage - prePercentage) / (100 - prePercentage);
  const rounded = Number(nGain.toFixed(2));

  let category: 'Tinggi' | 'Sedang' | 'Rendah' = 'Rendah';
  if (rounded >= 0.7) {
    category = 'Tinggi';
  } else if (rounded >= 0.3) {
    category = 'Sedang';
  }

  return { gain: rounded, category };
}

/**
 * Klasifikasi Miskonsepsi:
 * M1 = Soal 1 & 2
 * M2 = Soal 3 & 4
 * M3 = Soal 5 & 6
 * Aturan:
 * - "Paham Konsep" jika kedua soal berkode PK
 * - "Miskonsepsi" jika minimal satu soal berkode M
 * - Selain itu "Tidak Paham Konsep"
 */
export type MisconceptionCategory = 'Paham Konsep' | 'Miskonsepsi' | 'Tidak Paham Konsep';

export function classifyMisconceptionPair(
  codeA?: 'PK' | 'M' | 'TPK',
  codeB?: 'PK' | 'M' | 'TPK'
): MisconceptionCategory {
  if (codeA === 'PK' && codeB === 'PK') {
    return 'Paham Konsep';
  }
  if (codeA === 'M' || codeB === 'M') {
    return 'Miskonsepsi';
  }
  return 'Tidak Paham Konsep';
}
