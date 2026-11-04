# Pembersihan Kotak Teks & Optimalisasi Visual 3D SMART-DIV

Menghilangkan seluruh kotak teks statis mengambang yang menutupi objek 3D, memindahkan status informasi dan tombol kontrol ke bilah bersih di luar kanvas, serta mengoptimalkan sudut kamera Three.js agar visualisasi matematika pembagian tersampaikan dengan jelas dan menarik bagi siswa kelas 4 SD.

---

> [!IMPORTANT]
> Masalah utama yang dialami siswa saat ini adalah adanya kotak teks statis (seperti label "Kelereng Belum Dibagi", "Jumlah Kotak", "Total Objek", dan "Kotak = 0") yang melayang tepat di atas kanvas 3D Three.js. Kotak-kotak ini tidak bisa diklik, namun menutupi hingga 30% area pandang objek 3D (kelereng, wadah transparan, dan larik benda). Solusi terbaik adalah membersihkan kanvas 3D hingga **100% bebas halangan**, dan memindahkan semua data status serta tombol aksi ke **bilah status bersih (dock) di bawah kanvas** atau panel interaksi di sisi kanan.

---

## 1. Masalah yang Diperbaiki

1. **Kotak Teks Mengambang (Non-Fungsional) yang Menutupi Objek**:
   - `ThreeKelerengScene`: Badge mengambang `Kelereng Belum Dibagi (Tengah)` di pojok kiri atas dan `Jumlah Kotak` di pojok kanan atas menghalangi kelereng dan wadah.
   - `ThreeArrayScene`: Badge mengambang `Total Objek` di pojok kiri atas menutupi baris pertama kristal.
   - `ThreeZeroBoxScene`: Kotak pesan merah besar `❌ Kotak = 0! Mau dibagi ke mana?` di tengah atas menutupi tumpukan permen merah muda, ditambah kotak info permen & kotak di bawah.
2. **Tombol Kontrol Mengambang yang Bertabrakan dengan Objek 3D**:
   - Tombol putar dan bagi kelereng diletakkan melayang di bagian bawah kanvas, sering kali menutupi wadah kelereng bagian bawah saat kamera berputar atau di layar beresolusi sedang/kecil.
3. **Proporsi Kanvas & Perspektif Kamera**:
   - Ketinggian viewport kanvas 3D pada layout grid dua kolom terkadang terlalu sempit sehingga objek terlihat terpotong jika ada kotak teks mengambang di dalamnya.

---

## 2. Solusi Desain & Pengalaman Pengguna (UX)

### A. Prinsip Kanvas 3D Bersih (Zero-Occlusion 3D Stage)
- **Kanvas 3D 100% Bebas Teks Mengambang**: Di dalam area render Three.js, tidak ada lagi `div absolute` yang melayang menutupi objek 3D. Area kanvas difokuskan murni untuk visualisasi matematis, pencahayaan studio, material PBR yang mengkilap, dan rotasi interaktif.
- **Bilah Info Bersih (Clean Dock Bar) di Luar / di Bawah Kanvas**:
  - Diletakkan tepat di strip bawah atau luar kanvas, berupa indikator tipis dengan ikon dan angka yang jelas tanpa gaya "floating bubble" yang membingungkan.
  - Menampilkan ringkasan status real-time yang edukatif (misal: `Kelereng di wadah tengah: X · Kotak tersedia: Y`).
- **Penyelarasan Tombol Aksi Fungsional**:
  - Seluruh tombol interaksi (seperti *Bagikan 1 ke Tiap Kotak*, *Reset*, *Putar Susunan 90°*) memiliki target sentuh $\ge 44\text{px}$, gaya visual tombol aktif yang jelas, dan umpan balik suara ceria dari `audioService`.
  - Tombol-tombol ini diletakkan pada footer panggung 3D yang rapi atau pada panel instruksi Kak Bagi di sebelah kanan, sehingga siswa tidak salah mengira kotak teks biasa sebagai tombol.

### B. Optimalisasi Sudut Kamera & Pencahayaan Three.js
- **ThreeKelerengScene**: Menyesuaikan posisi kamera (`camera.position.set(0, 8.5, 9.5)`) dan *target lookAt* agar seluruh baki tengah dan semua kotak wadah terlihat proporsional tanpa terpotong batas kanvas.
- **ThreeArrayScene**: Mengatur jarak kamera dinamis berdasarkan jumlah baris dan kolom (`rows × cols`) agar kristal selalu berada di tengah panggung dengan ruang bernapas yang cukup.
- **ThreeZeroBoxScene**: Memperluas jarak pandang kamera saat jumlah kotak berubah dari 3 ke 0, sehingga saat kotak = 0, kelereng yang berkumpul di lantai terlihat dramatis tanpa terhalang banner peringatan merah.

---

## 3. Rencana Perubahan Komponen

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DynamicEquationBadge                            │
│                 (Persamaan Matematika Real-time)                       │
├──────────────────────────────────────┬─────────────────────────────────┤
│     Panggung 3D Bebas Halangan      │  Panel Instruksi & Aksi Interaktif
│                                      │
│  ┌────────────────────────────────┐  │  ┌───────────────────────────┐  │
│  │                                │  │  │ Balon Dialog Maskot       │  │
│  │     Kanvas 3D Three.js         │  │  │ Kak Bagi Bertahap         │  │
│  │   (Murni Objek, Tanpa Kotak    │  │  └───────────────────────────┘  │
│  │    Teks Mengambang di Dalam)   │  │                                 │
│  │                                │  │  ┌───────────────────────────┐  │
│  └────────────────────────────────┘  │  │ Pilihan / Input Jawaban   │  │
│  ┌────────────────────────────────┐  │  │ Siswa & Tombol Lanjut     │  │
│  │ Bilah Info & Kontrol Aksi Rapi │  │  │                           │  │
│  │ [Kelereng: 14] [Kotak: 4] [🎮] │  │  └───────────────────────────┘  │
│  └────────────────────────────────┘  │                                 │
└──────────────────────────────────────┴─────────────────────────────────┘
```

1. **`src/components/3d/ThreeKelerengScene.tsx`**:
   - Hapus badge absolut `top-3 left-3` ("Kelereng Belum Dibagi") dan `top-3 right-3` ("Jumlah Kotak").
   - Pindahkan kontrol rotasi dan tombol aksi bagi/reset ke footer dock terpisah di bawah kanvas dengan latar belakang bersih.
   - Sempurnakan posisi kamera agar baki kelereng dan kotak terlihat luas dan nyaman dilihat.

2. **`src/components/3d/ThreeArrayScene.tsx`**:
   - Hapus badge absolut `top-3 left-3` ("Total Objek").
   - Pindahkan tombol "Putar Susunan 90°" dan label dimensi baris × kolom ke bilah kontrol dock di bawah kanvas.
   - Sempurnakan auto-fit kamera sesuai rasio baris/kolom.

3. **`src/components/3d/ThreeZeroBoxScene.tsx`**:
   - Hapus kotak merah besar `Kotak = 0! Mau dibagi ke mana?` yang menutupi bagian atas permen.
   - Hapus badge info permen & kotak yang melayang di pojok kiri bawah.
   - Sediakan bilah status bersih di bawah kanvas yang mengindikasikan status permen dan kotak.

4. **`src/screens/ConceptsLearningScreen.tsx`**:
   - Sesuaikan tata letak wadah 3D agar panggung visual memiliki porsi tinggi yang seimbang.
   - Pastikan langkah "Coba Bersama" terintegrasi mulus dengan kontrol bilah bawah baru.

5. **`src/screens/Level1KelerengScreen.tsx`**, **`src/screens/Level2PasanganScreen.tsx`**, **`src/screens/Level3KotakKosongScreen.tsx`**:
   - Menyesuaikan pembungkus panggung 3D agar bilah dock informasi baru terintegrasi selaras dengan tema warna tiap level (Kuning Amber untuk Level 1, Hijau Emerald untuk Level 2, Merah Lembut/Rose untuk Level 3).

---

## 4. Hasil Verifikasi & Uji Kualitas

- [x] Memeriksa setiap langkah di **Belajar Konsep** (Konsep 1, 2, dan 3): seluruh area visual 3D telah bersih 100% tanpa ada teks yang menutupi objek.
- [x] Memeriksa **Level 1 (Pulau Kelereng)**: kelereng di baki tengah dan di dalam kotak 100% tampak jelas, tombol bagi dan ulang di bilah bawah berfungsi responsif.
- [x] Memeriksa **Level 2 (Pulau Pasangan Ajaib)**: tombol rotasi 90° memutar susunan kristal secara halus tanpa ada kartu teks menimpa kristal.
- [x] Memeriksa **Level 3 (Pulau Kotak Kosong)**: saat kotak dikurangi menjadi 0, kelereng terlihat jelas di tengah panggung tanpa tertutup banner peringatan besar.
- [x] Menjalankan `compile_applet` dan `lint_applet`: kompilasi berhasil tanpa peringatan maupun error.
