# SMART-DIV: Peningkatan Panduan Langkah Interaktif, Pembersihan Antarmuka, dan Persamaan Matematika (Equation) Dinamis

Rencana ini merealisasikan instruksi pengguna untuk memberikan petunjuk pengerjaan langkah demi langkah pada setiap aktivitas menggunakan balon dialog maskot Kak Bagi, menghapus elemen yang membingungkan dan tidak digunakan (seperti tabel matriks perkalian<>pembagian di bawah konsep serta tombol/mode AR kamera yang rumit), dan menampilkan persamaan matematika (*equation*) dinamis di seluruh modul aplikasi termasuk tes dan kuis kilat.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan jawaban klarifikasi yang telah Anda berikan:
> - **Elemen Dihapus**: Menghilangkan tampilan matriks/kotak perkalian<>pembagian rumit yang berada di bawah penjelasan konsep, serta membersihkan mode AR kamera dan tombol cetak marker yang membingungkan siswa kelas 4 SD.
> - **Persamaan Matematika (Equation)**: Ditampilkan secara dinamis dan menonjol di **seluruh modul** (Konsep Pembagian, Level 1 Pulau Kelereng, Level 2 Pulau Pasangan Ajaib, Level 3 Pulau Kotak Kosong, Kuis Kilat, serta Misi Awal dan Misi Akhir).
> - **Gaya Petunjuk Langkah**: Menggunakan **balon dialog langkah bertahap bersama maskot Kak Bagi** yang dilengkapi nomor langkah terstruktur, tombol dengarkan audio suara, dan teks instruksi visual yang ramah anak.

---

### 1. Overview & Core Concept

- **Apa yang Dilakukan**:
  1. **Petunjuk Langkah Bertahap Bersama Kak Bagi**: Setiap tahapan aktivitas (Misi Awal, Belajar Konsep 1-3, Level 1 Kelereng, Level 2 Pasangan Ajaib, Level 3 Kotak Kosong, dan Misi Akhir) dilengkapi balon dialog interaktif Kak Bagi dengan nomor langkah jelas (misal: *Langkah 1 dari 4: Tebak Dulu Yuk!*, *Langkah 2 dari 4: Bagikan Permen*), petunjuk tindakan yang mudah dimengerti anak, dan tombol narasi suara.
  2. **Pembersihan Elemen Membingungkan**:
     - Menghapus matriks perkalian<>pembagian berlebih di bawah modul konsep yang membebani kognisi siswa.
     - Menghilangkan mode AR Kamera dan tombol cetak marker dari Header dan Layar Level, memfokuskan antarmuka sepenuhnya pada simulasi interaktif 3D yang stabil, responsif, dan mudah dimanipulasi tanpa kendala izin kamera perangkat.
  3. **Persamaan Matematika (*Equation Card*) Dinamis**:
     - Menyematkan kartu persamaan matematika visual berukuran besar dengan penanda warna semantik (misalnya: bilangan yang dibagi berwarna biru, pembagi berwarna ungu, hasil bagi berwarna hijau, sisa berwarna oranye).
     - Persamaan bergerak dan terbarui secara *real-time* saat siswa membagi kelereng, memutar baris perkalian, mengatur jumlah kotak ke nol, maupun saat membaca soal tes.

- **Target Pengguna**: Siswa Kelas 4 Sekolah Dasar (usia 9-10 tahun) yang sedang mempelajari konsep pembagian dan mengatasi miskonsepsi (M1: pembagian dengan nol, M2: kebalikan perkalian, M3: pembagian bersisa), serta guru/peneliti matematika.
- **Nilai Utama**: Alur belajar menjadi sangat intuitif, siswa tidak lagi bingung harus melakukan apa di setiap langkah, pemahaman matematika menjadi konkret berkat persamaan visual yang sinkron dengan manipulasi objek.

---

### 2. User Experience & Visual Design

#### A. Balon Dialog Langkah Bertahap Maskot Kak Bagi (`MascotStepInstruction`)
- **Struktur Balon Dialog**:
  - Penanda Langkah: `Langkah [X] dari [Y]` dengan warna aksen lembut.
  - Judul Tindakan: Teks tebal ringkas (misal: "Yuk, bagikan kelereng ke dalam kotak!").
  - Panduan Praktis: Instruksi singkat 1-2 kalimat yang memandu aksi jari anak di layar.
  - Tombol Suara Terintegrasi: Tombol audio putar ulang suara Kak Bagi tepat di dalam balon.
- **Penerapan**:
  - **Layar Konsep**: Menjelaskan konsep tahap demi tahap dengan jelas tanpa teks bertumpuk.
  - **Layar Level 1-3**: Menuntun anak dari fase *Tebak* $\to$ *Coba Interaktif* $\to$ *Amati/Detektif* $\to$ *Simpulkan* $\to$ *Kuis Kilat*.
  - **Layar Misi Awal & Akhir**: Menuntun cara menjawab soal pilihan ganda dan memberikan alasan suara secara santai.

#### B. Kartu Persamaan Matematika Dinamis (`DynamicEquationBadge`)
- **Tampilan Visual**:
  - Dibuat dengan tipografi besar bergaya matematis yang bersih (`font-heading`, font tebal).
  - Skema warna semantik:
    - Bilangan Awal / Dividen: Indigo/Biru (`text-indigo-700 bg-indigo-50`)
    - Operator Pembagian: Amber (`:`)
    - Pembagi / Divisor: Ungu (`text-purple-700 bg-purple-50`)
    - Hasil Bagi / Kuosien: Zamrud/Hijau (`text-emerald-700 bg-emerald-50`)
    - Sisa / Remainder: Jingga/Amber (`text-amber-800 bg-amber-50`)
  - Pada pembagian nol: Persamaan menampilkan `Bilangan : 0 = TIDAK BISA DILAKUKAN ❌` atau `0 : Bilangan = 0 ✅` dengan kartu komparasi yang terang dan mudah dibedakan.

#### C. Pembersihan Antarmuka (*De-cluttering*)
- Di `HeaderNav.tsx`: Menghapus tombol toggle AR/3D dan modal cetak marker. Navigasi menjadi sangat bersih: `SMART-DIV`, `Petualang: [Nama]`, `Ulangi Suara`, `Materi Konsep`, `Audio Bisu/Aktif`, dan `Gembok Peneliti`.
- Di `ConceptsLearningScreen.tsx`: Menghilangkan tampilan matriks 4-kotak perkalian<>pembagian di bagian bawah yang membingungkan siswa; menggantinya dengan fokus manipulasi langsung dan kartu persamaan tunggal yang terintegrasi.
- Di `Level1KelerengScreen.tsx`, `Level2PasanganScreen.tsx`, `Level3KotakKosongScreen.tsx`: Menghapus sisa kode pemanggilan `CameraArView` dan tombol marker, menyederhanakan tata letak menjadi 2 zona proporsional (Zona 3D Simulasi di kiri/atas, Zona Balon Panduan & Aksi di kanan/bawah).

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Dialog Balon Kak Bagi vs Banner Statis**:
  - *Pilihan*: Mengintegrasikan instruksi langkah langsung ke dalam balon ucapan maskot Kak Bagi yang sudah dikenal dan disukai siswa SD.
  - *Alasan*: Siswa kelas 4 lebih responsif terhadap karakter antropomorfis ramah yang "berbicara" langsung kepada mereka dibandingkan membaca instruksi kaku di kotak teks biasa.
- **Keputusan 2: Penghapusan Mode AR Kamera**:
  - *Pilihan*: Menghapus mode AR berbasis kamera fisik dan memfokuskan media pada visualisasi 3D WebGL interaktif dengan sentuhan/geser/cubit.
  - *Alasan*: Mode AR kamera di browser perangkat seluler/laptop sekolah sering kali memerlukan izin khusus, marker fisik tercetak yang merepotkan guru, dan rawan gelap/kabur, yang membingungkan siswa SD saat belajar mandiri.
- **Keputusan 3: Persamaan Matematika Lengkap di Tes & Kuis**:
  - *Pilihan*: Memberikan kartu persamaan formal di bagian atas setiap butir soal tes dan kuis kilat, melengkapi cerita narasi kontekstual.
  - *Alasan*: Membantu menjembatani representasi verbal/cerita dengan representasi simbolik formal matematika.

---

### 4. Technical Architecture & Data Strategy

#### Diagram Arsitektur & Hierarki Komponen

```
┌────────────────────────────────────────────────────────────────────────┐
│                               HeaderNav                                │
│   [Logo SMART-DIV]  [Nama Siswa]  [Ulangi Suara]  [Konsep]  [Volume]   │
└────────────────────────────────────────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌──────────────────────────────────┐        ┌──────────────────────────────────┐
│      Interactive Stage (Left)    │        │     Kak Bagi Guide Deck (Right)  │
│  - ThreeKelerengScene (Level 1)  │        │  - MascotKakBagi (Animasi)       │
│  - ThreeArrayScene (Level 2)     │        │  - MascotStepInstruction (Balon) │
│  - ThreeZeroBoxScene (Level 3)   │        │    * Step Counter: 1/4           │
│  - TestIllustration (Tes/Kuis)   │        │    * Tombol Suara Panduan        │
└──────────────────────────────────┘        │    * Teks Arahan Ramah Anak      │
                 │                          └──────────────────────────────────┘
                 ▼                                           │
┌──────────────────────────────────┐                         ▼
│    DynamicEquationBadge (Pusat)  │        ┌──────────────────────────────────┐
│   [ 14 : 4 = 3 sisa 2 ]          │        │      Action Controls (Bawah)     │
│   [ 14 = (4 × 3) + 2 ]           │◄───────│  - Tombol Bagikan / Putar        │
│   (Warna Semantik & Real-time)   │        │  - Pilihan Jawaban / Kuis        │
└──────────────────────────────────┘        └──────────────────────────────────┘
```

#### Alur State & Komponen Utama:
1. **`MascotStepInstruction.tsx` (Komponen Baru)**:
   - Komponen terstandarisasi yang merender balon dialog ramah anak dengan ekor balon menunjuk ke Kak Bagi, label nomor langkah, teks instruksi, dan tombol audio.
2. **`DynamicEquationBadge.tsx` (Komponen Baru)**:
   - Komponen persamaan matematika dinamis yang menerima parameter: `dividend`, `divisor`, `quotient`, `remainder`, `customText`, `format` (`standard`, `withCheck`, `comparison`), dan merender representasi simbolik dengan warna pembeda yang ceria.
3. **Penyempurnaan Layar-Layar**:
   - `ConceptsLearningScreen`: Balon petunjuk langkah per slide + Equation dinamis yang menonjol + eliminasi matriks membingungkan.
   - `Level1KelerengScreen`: Balon petunjuk Kak Bagi untuk tebak $\to$ coba $\to$ amati $\to$ sisa $\to$ kuis, dengan equation live `A : B = C sisa D`.
   - `Level2PasanganScreen`: Balon petunjuk investigasi detektif + equation timbal balik perkalian-pembagian.
   - `Level3KotakKosongScreen`: Balon petunjuk pengubahan kotak ke nol + equation kartu perbandingan pembagian nol.
   - `TestScreen`: Penambahan persamaan matematika di atas tiap soal dan balon instruksi Kak Bagi yang menenangkan.
   - `HeaderNav` & `App.tsx`: Pembersihan status dan toggle AR kamera.
