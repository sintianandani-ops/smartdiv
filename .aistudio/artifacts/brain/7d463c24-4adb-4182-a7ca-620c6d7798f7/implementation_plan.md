# Rencana Implementasi: Petunjuk Langkah, Pembersihan Elemen, & Persamaan Matematika (Equation)

Rencana ini merinci penambahan panduan pengerjaan terstruktur pada setiap layar, penyederhanaan antarmuka dengan menghapus elemen yang membingungkan siswa di kelas, serta penambahan persamaan matematika (*equation*) visual dan dinamis di seluruh aktivitas belajar.

---

## 1. Pembersihan Elemen yang Membingungkan & Tidak Digunakan

- **Hapus Mode AR Kamera & Cetak Penanda**:
  - Di kelas (laptop/Chromebook), tombol beralih ke kamera AR dan pop-up cetak penanda sering memunculkan permintaan izin kamera browser yang gagal atau membingungkan anak-anak yang tidak memegang kertas cetak fisik.
  - Sederhanakan antarmuka menjadi **Mode 3D Interaktif Penuh** yang responsif dan langsung dapat digeser atau diketuk dengan mouse/layar sentuh tanpa memerlukan izin kamera atau penanda kertas.
  - Bersihkan tombol AR dan tombol Cetak Penanda dari `HeaderNav.tsx` dan modul terkait.
- **Sederhanakan Kontrol Navigasi Atas**:
  - Pertahankan hanya kontrol esensial anak: Logo SMART-DIV, Identitas Petualang, Tombol Ulangi Suara, Tombol Konsep (otomatis nonaktif saat tes), Kontrol Bisu Suara, dan Akses PIN Peneliti.

---

## 2. Petunjuk Pengerjaan Langkah demi Langkah pada Setiap Layar

Menyediakan komponen panduan langkah yang konsisten dan ramah anak kelas 4 SD:
- **Pola Belajar Konsisten**:
  - **Langkah 1 (Tebak/Amati)**: Mengamati masalah dan memperkirakan hasil.
  - **Langkah 2 (Coba/Bagi)**: Membagi benda secara adil ke dalam wadah (interaksi 3D).
  - **Langkah 3 (Amati Persamaan & Simpulkan)**: Memperhatikan persamaan matematika yang terbentuk lalu memilih kesimpulan yang tepat.
- **Indikator Visual Langkah Aktif**:
  - Tampilan nomor langkah `[1]`, `[2]`, `[3]` dengan warna menyala pada langkah yang sedang dikerjakan.
  - Setiap pergantian langkah otomatis dibacakan oleh narasi suara Kak Bagi.
  - Tombol bantuan/petunjuk bertahap (*scaffolding*) tetap tersedia jika siswa menemui kendala.

---

## 3. Penambahan Persamaan Matematika (*Equation*) di Semua Bagian

Menyediakan komponen persamaan matematika visual dengan warna kode istilah matematika (*color-coded terms*):
- **Di Layar Konsep Materi**:
  - Konsep 1: $a \div b = q \text{ sisa } r$ dan bentuk perkalian $a = (b \times q) + r$.
  - Konsep 2: Pasangan ajaib kebalikan perkalian $a \times b = c \iff c \div a = b \text{ dan } c \div b = a$.
  - Konsep 3: Pembagian nol $0 \div b = 0$ dan $a \div 0 = \text{Tidak Dapat Dilakukan}$.
- **Di Layar Permainan 3D (Level 1, 2, 3)**:
  - **Papan Persamaan Dinamis (*Live Equation Board*)**: Angka pada rumus otomatis terisi dan bergerak seiring siswa membagi kelereng atau memasukkan angka (misal: saat 15 kelereng masuk ke 4 kotak, rumus langsung menampilkan $15 = (4 \times 3) + 3$).
- **Di Misi Awal & Misi Akhir (Pretest & Posttest)**:
  - Kotak rumus matematika bergaya papan tulis mini yang menampilkan persamaan inti soal (misal: $0 \div 4 = \dots$, $24 \div 4 = \dots$, $17 \div 5 = \dots$).
- **Di Modal Ringkasan Materi & Kesimpulan Level**:
  - Rangkuman persamaan matematika lengkap sebagai penguat konsep.

---

## Rencana File yang Dimodifikasi

1. **`src/components/MathEquationCard.tsx`** *(Baru)*: Komponen visual persamaan matematika berwarna dan mudah dibaca anak.
2. **`src/components/StepGuidanceBanner.tsx`** *(Baru)*: Komponen petunjuk langkah 1-2-3 berurutan dengan sorotan visual.
3. **`src/components/HeaderNav.tsx`**: Menghilangkan tombol AR kamera dan cetak penanda, menjaga header tetap bersih dan fokus.
4. **`src/screens/Level1KelerengScreen.tsx`**: Menambahkan petunjuk langkah dan live equation $a = (b \times q) + r$.
5. **`src/screens/Level2PasanganScreen.tsx`**: Menambahkan petunjuk langkah dan segitiga pasangan equation perkalian-pembagian.
6. **`src/screens/Level3KotakKosongScreen.tsx`**: Menambahkan petunjuk langkah dan perbandingan equation $0 \div b$ vs $a \div 0$.
7. **`src/screens/ConceptsLearningScreen.tsx`**: Menambahkan equation visual pada tiap kartu konsep.
8. **`src/screens/TestScreen.tsx`**: Menambahkan badge equation pada setiap butir soal tes dan menyederhanakan alur pengerjaan.
9. **`src/App.tsx`**: Memperbarui state header nav dan prop layar.

---

## Rencana Verifikasi

- Memastikan `lint_applet` lolos tanpa kesalahan tipe TypeScript.
- Memastikan `compile_applet` berhasil membangun aset produksi Vite.
- Memastikan seluruh langkah bersuara dengan Web Speech API dan tombol ulangi suara.
- Memastikan dev server merespons HTTP 200 tanpa kendala.
