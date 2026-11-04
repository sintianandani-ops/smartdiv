/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Aplikasi Web Edukasi: "Petualangan Pembagian AR" (Media SMART-DIV)
 * Penelitian Pengembangan Pendidikan Matematika Kelas 4 SD
 * Mengatasi Tiga Miskonsepsi Pembagian (M1, M2, M3)
 * 
 * Alur Terstruktur Berdasarkan Validasi Ahli Media:
 * 0. Sambutan & Masuk Siswa (Audio unlock) + Cara Bermain Otomatis pada Kunjungan Pertama
 * 1. Misi Awal (Pretest - 6 soal pilihan ganda diagnostik)
 * 2. Ingat Perkalian (Fondasi Apersepsi - 5 langkah interaktif)
 * 3. Belajar Konsep (Konsep 1 Habis & Sisa, Konsep 2 Kebalikan Perkalian, Konsep 3 Pembagian Nol)
 * 4. Peta Petualangan (Level 1 Pulau Kelereng, Level 2 Pulau Pasangan, Level 3 Pulau Kotak Kosong)
 * 5. Misi Akhir (Posttest N-Gain)
 * 6. Pendapatmu (Angket 10 pernyataan)
 * 7. Piagam Sertifikat Petualang
 * + Panel Guru/Peneliti (Rubrik 0-3, N-Gain, Observasi, Pengaturan Suara, Ekspor CSV)
 */

import React, { useState, useEffect } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { TestScreen } from './screens/TestScreen';
import { IngatPerkalianScreen } from './screens/IngatPerkalianScreen';
import { ConceptsLearningScreen } from './screens/ConceptsLearningScreen';
import { AdventureMapScreen } from './screens/AdventureMapScreen';
import { Level1KelerengScreen } from './screens/Level1KelerengScreen';
import { Level2PasanganScreen } from './screens/Level2PasanganScreen';
import { Level3KotakKosongScreen } from './screens/Level3KotakKosongScreen';
import { SurveyScreen } from './screens/SurveyScreen';
import { CertificateScreen } from './screens/CertificateScreen';
import { ResearcherPanel } from './screens/ResearcherPanel';
import { ConceptsModal } from './components/ConceptsModal';
import { ResearcherPinModal } from './components/ResearcherPinModal';
import { CaraBermainModal } from './components/CaraBermainModal';
import { RencanaBelajarModal } from './components/RencanaBelajarModal';
import { audioService } from './services/audioService';
import { storageService, StudentProgress } from './services/storageService';

export default function App() {
  const [studentCodes, setStudentCodes] = useState<string[]>([]);
  const [currentStudentCode, setCurrentStudentCode] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<
    'welcome' | 'pretest' | 'ingat_perkalian' | 'concepts' | 'map' | 'level1' | 'level2' | 'level3' | 'posttest' | 'survey' | 'certificate'
  >('welcome');

  // Modals & Mode
  const [isResearcherActive, setIsResearcherActive] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isConceptsModalOpen, setIsConceptsModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isRencanaModalOpen, setIsRencanaModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Inisialisasi daftar nama siswa dari storage
  useEffect(() => {
    const codes = storageService.getStudentCodes();
    setStudentCodes(codes);
  }, []);

  // Saat siswa masuk
  const handleSelectStudent = (code: string) => {
    setCurrentStudentCode(code);
    const prog = storageService.getStudentProgress(code);
    setCurrentStep(prog.currentStep || 'pretest');
  };

  // Toggle Mute Audio
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioService.setMuted(nextMute);
    audioService.initAudioContext();
    if (!nextMute) {
      audioService.playSuccessSound();
      audioService.speak('Suara aktif!');
    }
  };

  // Ulangi Suara Layar Saat Ini
  const handleReplayVoice = () => {
    audioService.initAudioContext();
    if (isMuted) {
      setIsMuted(false);
      audioService.setMuted(false);
    }
    if (currentStep === 'welcome') {
      audioService.speak('Tuliskan nama lengkapmu ya! Lalu klik Mulai Petualangan.');
    } else if (currentStep === 'ingat_perkalian') {
      audioService.speak('Ingat kembali konsep perkalian sebagai dasar untuk belajar pembagian!');
    } else if (currentStep === 'concepts') {
      audioService.speak('Perhatikan peragaan tiga dimensi konsep pembagian bersama Kak Bagi!');
    } else if (currentStep === 'level1') {
      audioService.speak('Bagikan kelereng ke dalam piring sampai sisanya ditaruh di piring tengah!');
    } else if (currentStep === 'level2') {
      audioService.speak('Amati hubungan perkalian dan pembagian yang saling berkebalikan!');
    } else if (currentStep === 'level3') {
      audioService.speak('Perhatikan aturan pembagian dengan angka nol!');
    } else if (currentStep === 'map') {
      audioService.speak('Pilih pulau petualangan yang sudah terbuka untuk memulai tantangan!');
    } else if (currentStep === 'certificate') {
      audioService.speak('Selamat! Kamu telah menyelesaikan seluruh petualangan pembagian!');
    } else {
      audioService.speak('Perhatikan petunjuk di layar dan dengarkan penjelasan Kak Bagi.');
    }
  };

  // Navigasi Alur Utama
  const handleFinishPretest = () => {
    setCurrentStep('ingat_perkalian');
  };

  const handleFinishIngatPerkalian = () => {
    setCurrentStep('concepts');
  };

  const handleFinishConcepts = () => {
    setCurrentStep('map');
  };

  const handleSelectLevel = (lvl: 1 | 2 | 3) => {
    if (lvl === 1) setCurrentStep('level1');
    else if (lvl === 2) setCurrentStep('level2');
    else if (lvl === 3) setCurrentStep('level3');
  };

  const handleFinishLevel = () => {
    setCurrentStep('map');
  };

  const handleStartPosttest = () => {
    setCurrentStep('posttest');
  };

  const handleFinishPosttest = () => {
    if (storageService.isSurveyEnabled()) {
      setCurrentStep('survey');
    } else {
      setCurrentStep('certificate');
    }
  };

  const handleFinishSurvey = () => {
    setCurrentStep('certificate');
  };

  const handleBackToHome = () => {
    setCurrentStep('welcome');
    setCurrentStudentCode(null);
  };

  // Tombol Kembali Universal (Validator 1)
  const handleGoBack = () => {
    if (currentStep === 'ingat_perkalian') {
      setCurrentStep('pretest');
    } else if (currentStep === 'concepts') {
      setCurrentStep('ingat_perkalian');
    } else if (currentStep === 'level1' || currentStep === 'level2' || currentStep === 'level3') {
      setCurrentStep('map');
    } else if (currentStep === 'map') {
      setCurrentStep('concepts');
    } else if (currentStep === 'survey') {
      setCurrentStep('map');
    } else if (currentStep === 'certificate') {
      setCurrentStep('map');
    } else if (currentStep === 'welcome') {
      // Nothing
    }
  };

  // Tombol Beranda Universal (Validator 1)
  const handleGoHome = () => {
    if (currentStep === 'map') {
      handleBackToHome();
    } else {
      setCurrentStep('map');
    }
  };

  // Lompat ke Langkah yang Sudah Terbuka dari Stepper Mini (Validator 1)
  const handleJumpToStep = (stepId: string) => {
    if (stepId === 'pretest') setCurrentStep('pretest');
    else if (stepId === 'ingat_perkalian') setCurrentStep('ingat_perkalian');
    else if (stepId === 'concept1' || stepId === 'concept2' || stepId === 'concept3') setCurrentStep('concepts');
    else if (stepId === 'level1') setCurrentStep('level1');
    else if (stepId === 'level2') setCurrentStep('level2');
    else if (stepId === 'level3') setCurrentStep('level3');
    else if (stepId === 'posttest') setCurrentStep('posttest');
    else if (stepId === 'survey') setCurrentStep('survey');
  };

  // Istirahat dan Simpan Sesi (Validator 8)
  const handlePauseAndSave = () => {
    if (currentStudentCode) {
      const prog = storageService.getStudentProgress(currentStudentCode);
      prog.currentStep = currentStep;
      storageService.saveStudentProgress(prog);
    }
    audioService.speak('Sesi belajarmu sudah disimpan! Sampai jumpa di pertemuan berikutnya ya.');
    setCurrentStep('welcome');
    setCurrentStudentCode(null);
  };

  // Lanjutkan sesi dari Panel Peneliti
  const handleContinueStudentFromResearcher = (code: string) => {
    setCurrentStudentCode(code);
    const prog = storageService.getStudentProgress(code);
    setCurrentStep(prog.currentStep || 'pretest');
    setIsResearcherActive(false);
  };

  // Jika sedang di Panel Peneliti
  if (isResearcherActive) {
    return (
      <ResearcherPanel
        onBackToApp={() => setIsResearcherActive(false)}
        onContinueStudentSession={handleContinueStudentFromResearcher}
      />
    );
  }

  // Jika di Layar Sambutan (Belum ada siswa login)
  if (currentStep === 'welcome' || !currentStudentCode) {
    return (
      <>
        <WelcomeScreen
          studentCodes={studentCodes}
          onSelectStudent={handleSelectStudent}
          onOpenResearcherLogin={() => setIsPinModalOpen(true)}
        />

        <ResearcherPinModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          onSuccess={() => {
            setIsPinModalOpen(false);
            setIsResearcherActive(true);
          }}
        />

        {/* Modal Cara Bermain dari Layar Sambutan */}
        <CaraBermainModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
        />
      </>
    );
  }

  // Tombol "Materi Konsep" hanya aktif di luar Misi Awal dan Misi Akhir
  const canOpenConcepts = currentStep !== 'pretest' && currentStep !== 'posttest';
  const studentProg = currentStudentCode ? storageService.getStudentProgress(currentStudentCode) : null;
  const isAnyModalOpen = isHelpModalOpen || isConceptsModalOpen || isPinModalOpen || isRencanaModalOpen;

  return (
    <div className="h-screen overflow-hidden bg-amber-50/40 text-slate-800 flex flex-col justify-between selection:bg-amber-200">
      {/* Header Navigasi Universal Lengkap (Temuan Validator 1) */}
      <HeaderNav
        studentCode={currentStudentCode}
        currentStep={currentStep}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onReplayVoice={handleReplayVoice}
        onOpenConceptsModal={() => setIsConceptsModalOpen(true)}
        onOpenResearcherPanel={() => setIsPinModalOpen(true)}
        onOpenHelp={() => {
          audioService.stopSpeaking();
          setIsHelpModalOpen(true);
        }}
        onGoHome={handleGoHome}
        onGoBack={handleGoBack}
        onJumpToStep={handleJumpToStep}
        progress={studentProg}
        isSpeaking={isSpeaking}
        canOpenConcepts={canOpenConcepts}
      />

      {/* Konten Layar Berurutan Sesuai Langkah Siswa (Tanpa Perlu Scroll) */}
      <main className="flex-1 overflow-hidden max-md:overflow-y-auto p-1 sm:p-2 flex flex-col min-h-0">
        {currentStep === 'pretest' && (
          <TestScreen
            testType="pre"
            studentCode={currentStudentCode}
            onFinishTest={handleFinishPretest}
            onGoHome={handleBackToHome}
            isModalOpen={isAnyModalOpen}
          />
        )}

        {currentStep === 'ingat_perkalian' && (
          <IngatPerkalianScreen
            studentCode={currentStudentCode}
            onFinish={handleFinishIngatPerkalian}
            onGoBack={handleGoBack}
          />
        )}

        {currentStep === 'concepts' && (
          <ConceptsLearningScreen
            studentCode={currentStudentCode}
            onFinishAllConcepts={handleFinishConcepts}
          />
        )}

        {currentStep === 'map' && (
          <AdventureMapScreen
            studentCode={currentStudentCode}
            onSelectLevel={handleSelectLevel}
            onStartPosttest={handleStartPosttest}
            onPauseAndSave={handlePauseAndSave}
          />
        )}

        {currentStep === 'level1' && (
          <Level1KelerengScreen
            studentCode={currentStudentCode}
            onFinishLevel={handleFinishLevel}
            onGoBack={handleGoBack}
          />
        )}

        {currentStep === 'level2' && (
          <Level2PasanganScreen
            studentCode={currentStudentCode}
            onFinishLevel={handleFinishLevel}
            onGoBack={handleGoBack}
          />
        )}

        {currentStep === 'level3' && (
          <Level3KotakKosongScreen
            studentCode={currentStudentCode}
            onFinishLevel={handleFinishLevel}
            onGoBack={handleGoBack}
          />
        )}

        {currentStep === 'posttest' && (
          <TestScreen
            testType="post"
            studentCode={currentStudentCode}
            onFinishTest={handleFinishPosttest}
            onGoHome={handleBackToHome}
            isModalOpen={isAnyModalOpen}
          />
        )}

        {currentStep === 'survey' && (
          <SurveyScreen
            studentCode={currentStudentCode}
            onFinishSurvey={handleFinishSurvey}
          />
        )}

        {currentStep === 'certificate' && (
          <CertificateScreen
            studentCode={currentStudentCode}
            studentName={currentStudentCode}
            onBackToHome={handleBackToHome}
          />
        )}
      </main>

      {/* Footer Hak Cipta & Info Penelitian */}
      <footer className="bg-white/90 border-t border-amber-200 py-1 px-4 text-center text-[11px] text-slate-500 font-medium shrink-0">
        <span>Petualangan Pembagian AR • Media SMART-DIV Mengatasi Miskonsepsi Pembagian Kelas 4 SD</span>
      </footer>

      {/* Modal Ringkasan Materi Konsep */}
      <ConceptsModal
        isOpen={isConceptsModalOpen}
        onClose={() => setIsConceptsModalOpen(false)}
      />

      {/* Modal Petunjuk Penggunaan Bergambar (Cara Bermain) */}
      <CaraBermainModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* Modal Rencana Belajar Guru */}
      <RencanaBelajarModal
        isOpen={isRencanaModalOpen}
        onClose={() => setIsRencanaModalOpen(false)}
        onPauseAndSave={handlePauseAndSave}
      />

      {/* Modal PIN Guru/Peneliti */}
      <ResearcherPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          setIsPinModalOpen(false);
          setIsResearcherActive(true);
        }}
      />
    </div>
  );
}
