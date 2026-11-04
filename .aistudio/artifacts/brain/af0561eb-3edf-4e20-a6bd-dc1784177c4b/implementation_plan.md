# Tata Letak Satu Layar Bebas Scroll & Pembersihan Elemen Soal Tes (SMART-DIV)

Penyederhanaan antarmuka Misi Awal (Pretest) dan Misi Akhir (Posttest) matematika kelas 4 SD dengan menghapus elemen ilustrasi netral yang terpotong dan membingungkan di bawah soal, serta mengunci seluruh tata letak agar pas dalam satu layar penuh (*single viewport 100vh*) tanpa memunculkan bilah gulir (*scroll bar*).

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan konfirmasi pengguna pada tahap klarifikasi:
> - **Penanganan Elemen di Bawah Soal**: Elemen kotak ilustrasi (`TestIllustration`) di bawah teks pertanyaan resmi **dihapus sepenuhnya** agar kartu soal bersih, fokus, dan lapang bagi siswa.
> - **Preferensi Tampilan**: Seluruh tata letak **dikunci pas satu layar penuh tanpa scroll bar sama sekali** pada resolusi standar Chromebook, laptop, dan tablet sekolah.

---

## 1. Overview & Core Concept

- **Apa yang Dilakukan**:
  1. Menghilangkan komponen `TestIllustration` yang sebelumnya berada di bawah teks pertanyaan pada `TestScreen.tsx`.
  2. Memadatkan header progres soal dan bilah 4 langkah pengerjaan sehingga hanya menggunakan ruang vertikal minimal (~40px).
  3. Mengatur proporsi 2 kolom (Kolom Kiri: Balon Kak Bagi & Rekam Alasan; Kolom Kanan: Pilihan Jawaban A, B, C, D dan Navigasi Lanjut) agar 100% pas di layar (*zero-scroll viewport*).
- **Target Pengguna**: Siswa kelas 4 SD (Fase B Kurikulum Merdeka) yang mengerjakan asesmen diagnostik dan formatif tanpa kebingungan navigasi.
- **Nilai Utama**: Siswa dapat langsung melihat pertanyaan, seluruh pilihan jawaban, dan tombol simpan secara instan tanpa perlu repot menggulir layar ke bawah.

---

## 2. User Experience & Visual Design

- **Alur Pengguna di Layar Soal (Pretest & Posttest)**:
  1. Siswa melihat nomor soal dan bilah progres di baris atas ringkas.
  2. Balon dialog Kak Bagi di sebelah kiri membacakan teks soal secara jernih, didampingi tombol rekam suara alasan (opsional).
  3. Di sebelah kanan, 4 kartu pilihan jawaban (A, B, C, D) tampil rapi dan langsung dapat diklik dengan ukuran sentuh ideal (min 44px).
  4. Tombol **"Simpan & Lanjut Soal 🚀"** berada tepat di pojok kanan bawah yang langsung terlihat sejak awal, tanpa tersembunyi di bawah lipatan layar (*above the fold*).
- **Desain Bebas Scroll (Zero-Scroll Viewport)**:
  - Tinggi container diatur strictly `h-full max-h-[100dvh] overflow-hidden`.
  - Jarak antar elemen (*gap* dan *padding*) dioptimalkan secara presisi (`py-1.5`, `gap-2`).
  - Animasi transisi confetti dan suara apresiasi tetap berjalan utuh dan ceria tanpa menggeser posisi layout.

---

## 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Menghapus Elemen `TestIllustration`**:
  - *Pendekatan*: Menghapus kotak ilustrasi netral di bawah teks soal.
  - *Alasan*: Ilustrasi tersebut sebelumnya terpotong oleh batas tinggi dan tidak memberikan nilai diagnostik nyata bagi siswa SD kelas 4, bahkan membuat siswa bertanya-tanya maksud gambar tersebut.
  - *Alternatif yang Ditinggalkan*: Memperbesar gambar ditolak karena akan memakan ruang vertikal lebih banyak dan memperparah masalah scroll.
- **Keputusan 2: Mengunci Satu Layar Pas (*Zero-Scroll*)**:
  - *Pendekatan*: Menggunakan flexbox responsif dengan `flex-1 min-h-0` pada grid soal utama, memadatkan padding header dan bilah langkah.
  - *Alasan*: Menjamin kenyamanan siswa saat menggunakan Chromebook atau laptop sekolah dengan layar 1366x768 atau tablet, di mana tombol submit tidak boleh hilang dari pandangan mata.

---

## 4. Technical Architecture & Component Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TOP BAR & PROGRES SOAL                          │
│ [🧭 Misi Awal]                  [1] [2] [3] [4] [5] [6]  [⏸️ Berhenti] │
├────────────────────────────────────────────────────────────────────────┤
│ 📋 4 LANGKAH: 1. 🎧 Dengarkan › 2. ✍️ Pilih › 3. 🎤 Alasan › 4. 🚀 Simpan│
├───────────────────────────────────┬────────────────────────────────────┤
│       KOLOM KIRI (5 KOLOM)        │        KOLOM KANAN (7 KOLOM)       │
│                                   │                                    │
│ ┌───────────────────────────────┐ │ 👉 PILIH SALAH SATU JAWABAN:       │
│ │ 🤖 Maskot Kak Bagi            │ │ ┌────────────────────────────────┐ │
│ │ "Ada 12 kue dibagikan..."     │ │ │ [A] 0 kue                      │ │
│ └───────────────────────────────┘ │ ├────────────────────────────────┤ │
│                                   │ │ [B] 3 kue                      │ │
│ ┌───────────────────────────────┐ │ ├────────────────────────────────┤ │
│ │ 🎤 Rekam Alasan (Opsional)    │ │ │ [C] 4 kue                      │ │
│ └───────────────────────────────┘ │ ├────────────────────────────────┤ │
│                                   │ │ [D] Tidak bisa dilakukan       │ │
│                                   │ └────────────────────────────────┘ │
│                                   │                                    │
│                                   │ [◀ Soal Sebelumnya] [🚀 Simpan]    │
└───────────────────────────────────┴────────────────────────────────────┘
```

### Rencana File yang Dimodifikasi:
1. `/src/screens/TestScreen.tsx`:
   - Hapus rendering `<TestIllustration />` dan wadah kotaknya.
   - Perbarui container luar dan grid menjadi `h-full flex flex-col justify-between overflow-hidden`.
   - Padatkan margin dan padding agar seluruh elemen muat dengan lega dalam 1 layar penuh tanpa scroll bar.
2. `/src/App.tsx`:
   - Pastikan wadah layar tes mengisi `h-full overflow-hidden` saat menampilkan `pretest` dan `posttest`.
