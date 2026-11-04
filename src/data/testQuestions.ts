/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Soal Misi Awal (Pretest) dan Misi Akhir (Posttest) Format Pilihan Ganda (Multiple Choice)
 * Dilengkapi opsi diagnostik:
 * - PK (Paham Konsep) = Skor 3
 * - M (Miskonsepsi) = Skor 1
 * - TPK (Tidak Paham Konsep) = Skor 0
 */

export interface TestOption {
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
  code: 'PK' | 'M' | 'TPK';
  score: number;
  isCorrect: boolean;
}

export interface TestQuestion {
  id: number;
  number: number;
  misconceptionId: 'M1' | 'M2' | 'M3';
  promptText: string;
  options: TestOption[];
  illustrationType: 'candy_zero' | 'zero_divided' | 'array_fact' | 'check_mult' | 'boxes_remainder' | 'wrong_remainder';
  researcherKey: string;
  sampleExplanation: string;
}

export const PRETEST_QUESTIONS: TestQuestion[] = [
  {
    id: 1,
    number: 1,
    misconceptionId: 'M1',
    promptText: 'Ada 6 permen akan dibagikan sama banyak kepada 0 anak. Berapa permen yang diterima setiap anak?',
    illustrationType: 'candy_zero',
    researcherKey: 'Pilihan A: Tidak dapat dibagikan, karena tidak ada anak yang menerima permen (tidak terdefinisi).',
    sampleExplanation: 'M1: Pembagian dengan nol tidak bisa dilakukan.',
    options: [
      {
        label: 'A',
        text: 'Tidak dapat dibagikan (karena tidak ada anak yang menerima permen)',
        code: 'PK',
        score: 3,
        isCorrect: true,
      },
      {
        label: 'B',
        text: 'Setiap anak mendapat 0 permen',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'C',
        text: 'Setiap anak mendapat 6 permen',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'D',
        text: 'Setiap anak mendapat 1 permen',
        code: 'TPK',
        score: 0,
        isCorrect: false,
      },
    ],
  },
  {
    id: 2,
    number: 2,
    misconceptionId: 'M1',
    promptText: 'Berapakah hasil dari 0 : 4?',
    illustrationType: 'zero_divided',
    researcherKey: 'Pilihan A: 0, karena tidak ada benda yang dibagikan dan 4 × 0 = 0.',
    sampleExplanation: 'M1: Nol dibagi bilangan lain hasilnya 0.',
    options: [
      {
        label: 'A',
        text: '0 (karena tidak ada benda yang dibagikan dan 4 × 0 = 0)',
        code: 'PK',
        score: 3,
        isCorrect: true,
      },
      {
        label: 'B',
        text: '4 (karena nol tidak mengubah bilangan)',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'C',
        text: 'Tidak bisa dibagi',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'D',
        text: '1',
        code: 'TPK',
        score: 0,
        isCorrect: false,
      },
    ],
  },
  {
    id: 3,
    number: 3,
    misconceptionId: 'M2',
    promptText: 'Diketahui 6 × 4 = 24. Tanpa menghitung dari awal, berapakah hasil dari 24 : 4 dan 24 : 6?',
    illustrationType: 'array_fact',
    researcherKey: 'Pilihan A: 24 : 4 = 6 dan 24 : 6 = 4, karena pembagian adalah kebalikan dari perkalian.',
    sampleExplanation: 'M2: Hubungan kebalikan perkalian dan pembagian.',
    options: [
      {
        label: 'A',
        text: '24 : 4 = 6  dan  24 : 6 = 4',
        code: 'PK',
        score: 3,
        isCorrect: true,
      },
      {
        label: 'B',
        text: '24 : 4 = 4  dan  24 : 6 = 6',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'C',
        text: '24 : 4 = 20  dan  24 : 6 = 18',
        code: 'TPK',
        score: 0,
        isCorrect: false,
      },
      {
        label: 'D',
        text: 'Harus dihitung ulang dari awal dengan pengurangan berulang',
        code: 'TPK',
        score: 0,
        isCorrect: false,
      },
    ],
  },
  {
    id: 4,
    number: 4,
    misconceptionId: 'M2',
    promptText: 'Dina menghitung 36 : 9 = 4. Bagaimana cara Dina memeriksa bahwa jawabannya benar menggunakan perkalian?',
    illustrationType: 'check_mult',
    researcherKey: 'Pilihan A: Menghitung 4 × 9 = 36 (hasil bagi dikali pembagi harus sama dengan 36).',
    sampleExplanation: 'M2: Pengecekan hasil bagi menggunakan perkalian.',
    options: [
      {
        label: 'A',
        text: 'Menghitung 4 × 9 = 36 (hasil bagi dikali pembagi harus sama dengan 36)',
        code: 'PK',
        score: 3,
        isCorrect: true,
      },
      {
        label: 'B',
        text: 'Menghitung 36 × 9 = 324',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'C',
        text: 'Menghitung 36 + 4 = 40',
        code: 'TPK',
        score: 0,
        isCorrect: false,
      },
      {
        label: 'D',
        text: 'Menghitung 36 - 9 = 27',
        code: 'TPK',
        score: 0,
        isCorrect: false,
      },
    ],
  },
  {
    id: 5,
    number: 5,
    misconceptionId: 'M3',
    promptText: 'Ada 17 kelereng dibagi sama banyak ke dalam 5 kotak. Berapa kelereng di setiap kotak, dan berapa kelereng yang tersisa?',
    illustrationType: 'boxes_remainder',
    researcherKey: 'Pilihan A: Setiap kotak dapat 3 kelereng, sisa 2 kelereng (karena 17 = (5 × 3) + 2 dan 2 < 5).',
    sampleExplanation: 'M3: Pembagian bersisa dan syarat sisa < pembagi.',
    options: [
      {
        label: 'A',
        text: 'Setiap kotak dapat 3 kelereng, sisa 2 kelereng',
        code: 'PK',
        score: 3,
        isCorrect: true,
      },
      {
        label: 'B',
        text: 'Setiap kotak dapat 2 kelereng, sisa 7 kelereng',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'C',
        text: 'Setiap kotak dapat 3 kelereng, sisa 5 kelereng',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'D',
        text: 'Setiap kotak dapat 4 kelereng, sisa 0 kelereng',
        code: 'TPK',
        score: 0,
        isCorrect: false,
      },
    ],
  },
  {
    id: 6,
    number: 6,
    misconceptionId: 'M3',
    promptText: 'Andi menulis 19 : 4 = 3 sisa 7. Apakah tulisan Andi benar atau salah, beserta alasan yang tepat?',
    illustrationType: 'wrong_remainder',
    researcherKey: 'Pilihan A: Salah; karena sisa 7 masih lebih besar dari pembagi 4, yang benar adalah 4 sisa 3.',
    sampleExplanation: 'M3: Miskonsepsi sisa nakal yang lebih besar dari pembagi.',
    options: [
      {
        label: 'A',
        text: 'Salah; karena sisa 7 masih lebih besar dari 4, yang benar adalah 4 sisa 3',
        code: 'PK',
        score: 3,
        isCorrect: true,
      },
      {
        label: 'B',
        text: 'Benar; karena 19 dibagi 4 memang menghasilkan 3 dan bersisa 7',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'C',
        text: 'Benar; asalkan ada sisa maka pembagian sudah selesai',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'D',
        text: 'Salah; karena bilangan 19 tidak bisa dibagi 4 sama sekali',
        code: 'TPK',
        score: 0,
        isCorrect: false,
      },
    ],
  },
];

export const POSTTEST_QUESTIONS: TestQuestion[] = [
  {
    id: 1,
    number: 1,
    misconceptionId: 'M1',
    promptText: 'Ada 8 kelereng akan dimasukkan sama banyak ke dalam 0 kotak. Berapa kelereng di setiap kotak?',
    illustrationType: 'candy_zero',
    researcherKey: 'Pilihan A: Tidak dapat dimasukkan/dibagi, karena tidak ada kotak yang menerima kelereng (tidak terdefinisi).',
    sampleExplanation: 'M1: Pembagian dengan nol tidak bisa dilakukan.',
    options: [
      {
        label: 'A',
        text: 'Tidak dapat dimasukkan/dibagi (karena tidak ada kotak untuk menerima kelereng)',
        code: 'PK',
        score: 3,
        isCorrect: true,
      },
      {
        label: 'B',
        text: 'Setiap kotak mendapat 0 kelereng',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'C',
        text: 'Setiap kotak mendapat 8 kelereng',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'D',
        text: 'Setiap kotak mendapat 1 kelereng',
        code: 'TPK',
        score: 0,
        isCorrect: false,
      },
    ],
  },
  {
    id: 2,
    number: 2,
    misconceptionId: 'M1',
    promptText: 'Berapakah hasil dari 0 : 7?',
    illustrationType: 'zero_divided',
    researcherKey: 'Pilihan A: 0, karena tidak ada benda yang dimasukkan dan 7 × 0 = 0.',
    sampleExplanation: 'M1: Nol dibagi bilangan lain hasilnya 0.',
    options: [
      {
        label: 'A',
        text: '0 (karena tidak ada kelereng yang dibagikan dan 7 × 0 = 0)',
        code: 'PK',
        score: 3,
        isCorrect: true,
      },
      {
        label: 'B',
        text: '7 (karena nol tidak mengubah bilangan)',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'C',
        text: 'Tidak bisa dibagi',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'D',
        text: '1',
        code: 'TPK',
        score: 0,
        isCorrect: false,
      },
    ],
  },
  {
    id: 3,
    number: 3,
    misconceptionId: 'M2',
    promptText: 'Diketahui 7 × 3 = 21. Tanpa menghitung dari awal, berapakah hasil dari 21 : 3 dan 21 : 7?',
    illustrationType: 'array_fact',
    researcherKey: 'Pilihan A: 21 : 3 = 7 dan 21 : 7 = 3, karena pembagian adalah kebalikan dari perkalian.',
    sampleExplanation: 'M2: Hubungan kebalikan perkalian dan pembagian.',
    options: [
      {
        label: 'A',
        text: '21 : 3 = 7  dan  21 : 7 = 3',
        code: 'PK',
        score: 3,
        isCorrect: true,
      },
      {
        label: 'B',
        text: '21 : 3 = 3  dan  21 : 7 = 7',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'C',
        text: '21 : 3 = 18  dan  21 : 7 = 14',
        code: 'TPK',
        score: 0,
        isCorrect: false,
      },
      {
        label: 'D',
        text: 'Harus dihitung ulang dari awal dengan pengurangan berulang',
        code: 'TPK',
        score: 0,
        isCorrect: false,
      },
    ],
  },
  {
    id: 4,
    number: 4,
    misconceptionId: 'M2',
    promptText: 'Sinta menghitung 45 : 5 = 9. Bagaimana cara Sinta memeriksa bahwa jawabannya benar menggunakan perkalian?',
    illustrationType: 'check_mult',
    researcherKey: 'Pilihan A: Menghitung 9 × 5 = 45 (hasil bagi dikali pembagi harus sama dengan 45).',
    sampleExplanation: 'M2: Pengecekan hasil bagi menggunakan perkalian.',
    options: [
      {
        label: 'A',
        text: 'Menghitung 9 × 5 = 45 (hasil bagi dikali pembagi harus sama dengan 45)',
        code: 'PK',
        score: 3,
        isCorrect: true,
      },
      {
        label: 'B',
        text: 'Menghitung 45 × 5 = 225',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'C',
        text: 'Menghitung 45 - 9 = 36',
        code: 'TPK',
        score: 0,
        isCorrect: false,
      },
      {
        label: 'D',
        text: 'Menghitung 45 + 5 = 50',
        code: 'TPK',
        score: 0,
        isCorrect: false,
      },
    ],
  },
  {
    id: 5,
    number: 5,
    misconceptionId: 'M3',
    promptText: 'Ada 23 kelereng dibagi sama banyak ke dalam 6 kotak. Berapa kelereng di setiap kotak, dan berapa kelereng yang tersisa?',
    illustrationType: 'boxes_remainder',
    researcherKey: 'Pilihan A: Setiap kotak dapat 3 kelereng, sisa 5 kelereng (karena 23 = (6 × 3) + 5 dan 5 < 6).',
    sampleExplanation: 'M3: Pembagian bersisa dan syarat sisa < pembagi.',
    options: [
      {
        label: 'A',
        text: 'Setiap kotak dapat 3 kelereng, sisa 5 kelereng',
        code: 'PK',
        score: 3,
        isCorrect: true,
      },
      {
        label: 'B',
        text: 'Setiap kotak dapat 2 kelereng, sisa 11 kelereng',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'C',
        text: 'Setiap kotak dapat 3 kelereng, sisa 6 kelereng',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'D',
        text: 'Setiap kotak dapat 4 kelereng, sisa 0 kelereng',
        code: 'TPK',
        score: 0,
        isCorrect: false,
      },
    ],
  },
  {
    id: 6,
    number: 6,
    misconceptionId: 'M3',
    promptText: 'Sinta menulis 25 : 6 = 3 sisa 7. Apakah tulisan Sinta benar atau salah, beserta alasan yang tepat?',
    illustrationType: 'wrong_remainder',
    researcherKey: 'Pilihan A: Salah; karena sisa 7 masih lebih besar dari 6, yang benar adalah 4 sisa 1.',
    sampleExplanation: 'M3: Miskonsepsi sisa nakal yang lebih besar dari pembagi.',
    options: [
      {
        label: 'A',
        text: 'Salah; karena sisa 7 masih lebih besar dari 6, yang benar adalah 4 sisa 1',
        code: 'PK',
        score: 3,
        isCorrect: true,
      },
      {
        label: 'B',
        text: 'Benar; karena 25 dibagi 6 memang dapat 3 sisa 7',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'C',
        text: 'Benar; asalkan ada sisa maka pembagian sudah selesai',
        code: 'M',
        score: 1,
        isCorrect: false,
      },
      {
        label: 'D',
        text: 'Salah; karena bilangan 25 tidak bisa dibagi 6 sama sekali',
        code: 'TPK',
        score: 0,
        isCorrect: false,
      },
    ],
  },
];
