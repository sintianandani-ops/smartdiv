/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Panel Peneliti & Guru (SMART-DIV):
 * 1. Manajemen Siswa (Tambah, Edit, Hapus, Lanjutkan Sesi, Reset Progres)
 * 2. Penilaian Tes (Pretest & Posttest, Pemutaran Audio Suara Siswa dari IndexedDB, Rubrik 0-3, Coding PK/M/TPK, Kunci Jawaban Lengkap)
 * 3. Analisis & Rekapitulasi Penelitian: Nilai Awal, Nilai Akhir, N-Gain otomatis, Kategori N-Gain, Persentase M1, M2, M3
 * 4. Analisis Kepraktisan: Durasi waktu per fase, Jumlah petunjuk scaffolding & salah coba, Hasil Angket Siswa
 * 5. Lembar Observasi Digital per Sesi
 * 6. Angket Guru (10 butir skala 1-4 + saran)
 * 7. Ekspor CSV Lengkap & Reset Data
 */

import React, { useState, useEffect } from 'react';
import {
  Shield, KeyRound, Users, FileCheck, BarChart3, Clock, ClipboardList,
  Download, Trash2, Play, Pause, Plus, Edit2, Check, X, ArrowLeft, RefreshCw, AlertTriangle
} from 'lucide-react';
import { PRETEST_QUESTIONS, POSTTEST_QUESTIONS } from '../data/testQuestions';
import {
  storageService, StudentProgress, StudentEvaluation, TestScoreItem, ObservationRecord, TeacherSurvey
} from '../services/storageService';
import {
  calculateTestTotal, calculateTestPercentage, calculateNGain,
  classifyMisconceptionPair, MisconceptionCategory
} from '../services/mathService';
import { audioService } from '../services/audioService';

interface ResearcherPanelProps {
  onBackToApp: () => void;
  onContinueStudentSession: (code: string) => void;
}

export const ResearcherPanel: React.FC<ResearcherPanelProps> = ({
  onBackToApp,
  onContinueStudentSession,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'scoring' | 'analytics' | 'practicality' | 'observation' | 'teacher_survey' | 'settings'>('scoring');
  const [studentCodes, setStudentCodes] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [newStudentCode, setNewStudentCode] = useState<string>('');

  // Tab Penilaian Tes
  const [testStage, setTestStage] = useState<'pre' | 'post'>('pre');
  const [evaluations, setEvaluations] = useState<Record<string, StudentEvaluation>>({});

  // Audio playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({});

  // Observasi Digital State
  const [obsRecords, setObsRecords] = useState<ObservationRecord[]>([]);
  const [newObsStudent, setNewObsStudent] = useState<string>('');
  const [obsEngaged, setObsEngaged] = useState(true);
  const [obsUnderstood, setObsUnderstood] = useState(true);
  const [obsNeededHelp, setObsNeededHelp] = useState(false);
  const [obsTechIssue, setObsTechIssue] = useState(false);
  const [obsAudioClear, setObsAudioClear] = useState(true);
  const [obsNotes, setObsNotes] = useState('');

  // Angket Guru State
  const [teacherSurveys, setTeacherSurveys] = useState<TeacherSurvey[]>([]);
  const [teacherCode, setTeacherCode] = useState('');
  const [teacherAnswers, setTeacherAnswers] = useState<number[]>(Array(10).fill(4));
  const [teacherFeedback, setTeacherFeedback] = useState('');

  // Pengaturan PIN
  const [pinInput, setPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  // Pengaturan Suara & Audio (Validator 9)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(0.88);
  const [speechPitch, setSpeechPitch] = useState<number>(1.08);
  const [isQuietMode, setIsQuietMode] = useState<boolean>(false);

  const teacherItems = [
    'Petunjuk dan bahasa dalam aplikasi mudah dipahami oleh siswa kelas 4 SD.',
    'Urutan konsep materi (habis dibagi, kebalikan perkalian, nol) tersusun logis.',
    'Objek 3D dan fitur AR sangat membantu siswa mengonstruksi pemahaman konsep pembagian.',
    'Bantuan bertahap (scaffolding) efektif mencegah siswa dari keputusasaan.',
    'Fitur rekaman suara mempermudah siswa yang kesulitan menuangkan ide secara tertulis.',
    'Audio narasi Kak Bagi terdengar jelas dan membuat siswa lebih berkonsentrasi.',
    'Aplikasi efektif dalam mengungkap dan memperbaiki miskonsepsi pembagian siswa.',
    'Aplikasi stabil, tidak macet, dan mudah dioperasikan di kelas.',
    'Panel peneliti menyajikan data penilaian dan kepraktisan yang sangat lengkap.',
    'Secara keseluruhan, media SMART-DIV sangat layak diterapkan dalam pembelajaran matematika SD.',
  ];

  // Muat data awal
  useEffect(() => {
    const codes = storageService.getStudentCodes();
    setStudentCodes(codes);
    if (codes.length > 0) {
      setSelectedStudent(codes[0]);
      setNewObsStudent(codes[0]);
    }

    // Muat semua evaluasi
    const evals: Record<string, StudentEvaluation> = {};
    codes.forEach((c) => {
      evals[c] = storageService.getEvaluation(c);
    });
    setEvaluations(evals);

    // Muat observasi & survei guru
    setObsRecords(storageService.getObservationRecords());
    setTeacherSurveys(storageService.getTeacherSurveys());

    // Muat suara & pengaturan audio
    setAvailableVoices(audioService.getAvailableVoices());
    setSelectedVoiceUri(audioService.getSelectedVoiceUri() || '');
    const currentSettings = audioService.getSpeechSettings();
    setSpeechRate(currentSettings.rate);
    setSpeechPitch(currentSettings.pitch);
    setIsQuietMode(audioService.getIsQuietMode());
  }, []);

  // Update Nilai Rubrik
  const handleScoreChange = (
    studentCode: string,
    type: 'pre' | 'post',
    qNum: number,
    field: 'score' | 'code' | 'notes',
    value: unknown
  ) => {
    const curEval = evaluations[studentCode] || { pretestScores: {}, posttestScores: {} };
    const targetMap = type === 'pre' ? curEval.pretestScores : curEval.posttestScores;
    const currentItem = targetMap[qNum] || { score: 0, code: 'TPK', notes: '' };

    const updatedItem: TestScoreItem = {
      ...currentItem,
      [field]: value,
    };

    const newEval: StudentEvaluation = {
      ...curEval,
      [type === 'pre' ? 'pretestScores' : 'posttestScores']: {
        ...targetMap,
        [qNum]: updatedItem,
      },
    };

    setEvaluations((prev) => ({ ...prev, [studentCode]: newEval }));
    storageService.saveEvaluation(studentCode, newEval);
  };

  // Putar rekaman suara siswa dari IndexedDB
  const handlePlayVoice = async (studentCode: string, type: 'pre' | 'post', fieldName: 'jawaban' | 'alasan' | 'cara', qNum: number) => {
    const audioKey = `${studentCode}_${type}_${fieldName}_q${qNum}`;

    if (playingAudioId === audioKey) {
      audioElements[audioKey]?.pause();
      setPlayingAudioId(null);
      return;
    }

    try {
      const blob = await storageService.getVoiceAudio(studentCode, type, fieldName, qNum);
      if (!blob) {
        alert('Tidak ada rekaman suara tersimpan untuk kolom ini.');
        return;
      }

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => setPlayingAudioId(null);

      // Stop audio sebelumnya jika ada
      if (playingAudioId && audioElements[playingAudioId]) {
        audioElements[playingAudioId].pause();
      }

      setAudioElements((prev) => ({ ...prev, [audioKey]: audio }));
      setPlayingAudioId(audioKey);
      audio.play();
    } catch (e) {
      console.warn('Gagal memutar audio:', e);
    }
  };

  // Tambah Nama Siswa Baru
  const handleAddStudent = () => {
    if (!newStudentCode.trim()) return;
    const clean = newStudentCode
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    if (!studentCodes.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      const next = [...studentCodes, clean];
      setStudentCodes(next);
      storageService.saveStudentCodes(next);
      setNewStudentCode('');
    }
  };

  // Hapus Siswa
  const handleDeleteStudent = (code: string) => {
    if (confirm(`Yakin ingin menghapus siswa ${code}? Data progres siswa ini akan direset.`)) {
      const next = studentCodes.filter((c) => c !== code);
      setStudentCodes(next);
      storageService.saveStudentCodes(next);
      localStorage.removeItem(`smart_div_prog_${code}`);
      localStorage.removeItem(`smart_div_eval_${code}`);
      localStorage.removeItem(`scaff_ar_prog_${code}`);
      localStorage.removeItem(`scaff_ar_eval_${code}`);
      if (selectedStudent === code && next.length > 0) {
        setSelectedStudent(next[0]);
      }
    }
  };

  // Simpan Observasi Peneliti
  const handleSaveObservation = () => {
    if (!newObsStudent) return;
    const rec: ObservationRecord = {
      id: `obs_${Date.now()}`,
      studentCode: newObsStudent,
      date: new Date().toLocaleDateString('id-ID'),
      childEngaged: obsEngaged,
      understoodVoiceGuides: obsUnderstood,
      neededHelp: obsNeededHelp,
      technicalIssues: obsTechIssue,
      audioClear: obsAudioClear,
      notes: obsNotes,
    };
    storageService.saveObservationRecord(rec);
    setObsRecords(storageService.getObservationRecords());
    setObsNotes('');
    alert('Lembar observasi berhasil disimpan!');
  };

  // Simpan Angket Guru
  const handleSaveTeacherSurvey = () => {
    if (!teacherCode.trim()) {
      alert('Masukkan identitas / kode guru.');
      return;
    }
    const s: TeacherSurvey = {
      id: `survey_${Date.now()}`,
      teacherNameOrCode: teacherCode.trim(),
      answers: teacherAnswers,
      feedback: teacherFeedback,
      date: new Date().toLocaleDateString('id-ID'),
    };
    storageService.saveTeacherSurvey(s);
    setTeacherSurveys(storageService.getTeacherSurveys());
    setTeacherFeedback('');
    alert('Angket respon guru berhasil disimpan!');
  };

  // Reset Semua Data Aplikasi
  const handleResetAllData = async () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA (seluruh siswa, nilai, rekaman suara, angket)? Tindakan ini tidak dapat dibatalkan.')) {
      await storageService.resetAllData();
      alert('Semua data berhasil dibersihkan.');
      window.location.reload();
    }
  };

  // Ekspor CSV
  const handleExportCSV = () => {
    let csv = 'Nama Siswa,Nilai Awal (Pretest),Nilai Akhir (Posttest),N-Gain,Kategori N-Gain,M1 Awal,M1 Akhir,M2 Awal,M2 Akhir,M3 Awal,M3 Akhir\n';

    studentCodes.forEach((code) => {
      const ev = evaluations[code] || { pretestScores: {}, posttestScores: {} };
      const preTot = calculateTestTotal(ev.pretestScores);
      const postTot = calculateTestTotal(ev.posttestScores);
      const prePct = calculateTestPercentage(preTot);
      const postPct = calculateTestPercentage(postTot);
      const ngain = calculateNGain(prePct, postPct);

      const m1Pre = classifyMisconceptionPair(ev.pretestScores[1]?.code, ev.pretestScores[2]?.code);
      const m1Post = classifyMisconceptionPair(ev.posttestScores[1]?.code, ev.posttestScores[2]?.code);
      const m2Pre = classifyMisconceptionPair(ev.pretestScores[3]?.code, ev.pretestScores[4]?.code);
      const m2Post = classifyMisconceptionPair(ev.posttestScores[3]?.code, ev.posttestScores[4]?.code);
      const m3Pre = classifyMisconceptionPair(ev.pretestScores[5]?.code, ev.pretestScores[6]?.code);
      const m3Post = classifyMisconceptionPair(ev.posttestScores[5]?.code, ev.posttestScores[6]?.code);

      csv += `"${code}",${prePct},${postPct},${ngain.gain !== null ? ngain.gain : '"Tidak Dihitung"'},"${ngain.category}","${m1Pre}","${m1Post}","${m2Pre}","${m2Post}","${m3Pre}","${m3Post}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rekap_Penelitian_SMART_DIV_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentQuestions = testStage === 'pre' ? PRETEST_QUESTIONS : POSTTEST_QUESTIONS;
  const currentProg = selectedStudent ? storageService.getStudentProgress(selectedStudent) : null;
  const currentEval = selectedStudent ? evaluations[selectedStudent] || { pretestScores: {}, posttestScores: {} } : { pretestScores: {}, posttestScores: {} };
  const currentScoresMap = testStage === 'pre' ? currentEval.pretestScores : currentEval.posttestScores;
  const currentAnswersMap = testStage === 'pre' ? currentProg?.pretestAnswers || {} : currentProg?.posttestAnswers || {};

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Top Bar Panel Peneliti */}
      <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 shadow-md border-b-4 border-amber-400">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-400 text-slate-950 rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg sm:text-xl tracking-tight">
              Panel Guru & Peneliti Pendidikan Matematika
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              SMART-DIV • Pengembang Media Pembelajaran Berbasis Riset
            </p>
          </div>
        </div>

        <button
          onClick={onBackToApp}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl border border-slate-700 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Mode Siswa</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Tab Menu Utama */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {[
            { id: 'scoring', label: 'Penilaian Tes Uraian', icon: FileCheck },
            { id: 'analytics', label: 'Rekap Skor & N-Gain', icon: BarChart3 },
            { id: 'practicality', label: 'Data Kepraktisan', icon: Clock },
            { id: 'students', label: 'Daftar Siswa', icon: Users },
            { id: 'observation', label: 'Observasi Kelas', icon: ClipboardList },
            { id: 'teacher_survey', label: 'Angket Respon Guru', icon: FileCheck },
            { id: 'settings', label: 'Pengaturan & PIN', icon: KeyRound },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-400 text-amber-950 shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: PENILAIAN TES */}
        {activeTab === 'scoring' && (
          <div className="space-y-6">
            {/* Pemilihan Siswa & Tahap Tes */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-extrabold text-slate-700">Pilih Siswa:</span>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="bg-amber-50 border-2 border-amber-300 rounded-xl px-3 py-1.5 font-black text-amber-950 outline-none text-sm"
                >
                  {studentCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => onContinueStudentSession(selectedStudent)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Lanjutkan Sesi Siswa Ini 🚀
                </button>
              </div>

              {/* Pilihan Tahap: Misi Awal vs Misi Akhir */}
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  onClick={() => setTestStage('pre')}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    testStage === 'pre'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Misi Awal (Pretest)
                </button>
                <button
                  onClick={() => setTestStage('post')}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    testStage === 'post'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Misi Akhir (Posttest)
                </button>
              </div>
            </div>

            {/* Rubrik Penilaian Peneliti Info Banner */}
            <div className="bg-amber-50/70 border border-amber-300 p-4 rounded-2xl text-xs text-amber-950 space-y-1">
              <strong className="block text-sm">Pedoman Rubrik Skor (0 - 3):</strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-medium">
                <div className="bg-white p-2 rounded-lg border border-amber-200">
                  <strong>0 =</strong> Jawaban & alasan tidak tepat / tidak ada
                </div>
                <div className="bg-white p-2 rounded-lg border border-amber-200">
                  <strong>1 =</strong> Jawaban tepat sebagian, alasan masih mengandung miskonsepsi
                </div>
                <div className="bg-white p-2 rounded-lg border border-amber-200">
                  <strong>2 =</strong> Jawaban tepat, alasan kurang lengkap
                </div>
                <div className="bg-white p-2 rounded-lg border border-amber-200">
                  <strong>3 =</strong> Jawaban tepat dengan alasan benar & jelas
                </div>
              </div>
            </div>

            {/* Daftar Soal 1..6 */}
            <div className="space-y-6">
              {currentQuestions.map((q) => {
                const ans = currentAnswersMap[q.number];
                const scoreItem = currentScoresMap[q.number] || { score: 0, code: 'TPK', notes: '' };

                return (
                  <div
                    key={q.number}
                    className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm space-y-4"
                  >
                    {/* Header Soal */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center">
                          {q.number}
                        </span>
                        <span className="font-extrabold text-slate-800 text-sm sm:text-base">
                          {q.promptText}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Target: {q.misconceptionId}
                      </span>
                    </div>

                    {/* Kunci Jawaban Peneliti */}
                    <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 text-xs text-sky-950 space-y-1">
                      <strong className="text-sky-900 font-extrabold flex items-center gap-1">
                        🔑 KUNCI JAWABAN PENELITI:
                      </strong>
                      <p className="font-semibold">{q.researcherKey}</p>
                    </div>

                    {/* Jawaban Pilihan Ganda Siswa & Opsi Soal */}
                    <div className="space-y-3">
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-600 uppercase">
                            Pilihan Jawaban Siswa:
                          </span>
                          {ans?.selectedOptionLabel ? (
                            <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-400 text-amber-950">
                              Memilih Opsi {ans.selectedOptionLabel}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-200 text-slate-600">
                              Belum Dijawab
                            </span>
                          )}
                        </div>

                        {/* Daftar Semua Opsi dan Sorotan Opsi yang Dipilih Siswa */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {q.options.map((opt) => {
                            const isChosen = ans?.selectedOptionLabel === opt.label;
                            return (
                              <div
                                key={opt.label}
                                className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                                  isChosen
                                    ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300 font-extrabold text-amber-950'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                  isChosen ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {opt.label}
                                </span>
                                <div className="flex-1">
                                  <p>{opt.text}</p>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded mt-1 inline-block ${
                                    opt.code === 'PK'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : opt.code === 'M'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    Kategori: {opt.code} (Skor: {opt.score})
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Rekaman Suara Siswa jika Ada */}
                        {ans?.hasVoiceRecording && (
                          <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                            <span className="text-xs font-bold text-slate-600">
                              Rekaman Suara Alasan Siswa:
                            </span>
                            <button
                              onClick={() => handlePlayVoice(selectedStudent, testStage, 'alasan', q.number)}
                              className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                playingAudioId === `${selectedStudent}_${testStage}_alasan_q${q.number}`
                                  ? 'bg-rose-500 text-white animate-pulse'
                                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                              }`}
                            >
                              {playingAudioId === `${selectedStudent}_${testStage}_alasan_q${q.number}` ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                              <span>Putar Suara Siswa 🎙️</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Input Penilaian Rubrik Peneliti */}
                    <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                      {/* Skor 0 - 3 */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-extrabold text-slate-700">Skor Rubrik:</label>
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map((val) => (
                            <button
                              key={val}
                              onClick={() =>
                                handleScoreChange(selectedStudent, testStage, q.number, 'score', val)
                              }
                              className={`w-9 h-9 rounded-xl font-black text-sm transition-all ${
                                scoreItem.score === val
                                  ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300'
                                  : 'bg-white hover:bg-amber-100 border border-slate-300 text-slate-700'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Kode Diagnostik: PK / M / TPK */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-extrabold text-slate-700">Kode Diagnostik:</label>
                        <div className="flex gap-1 text-xs font-extrabold">
                          {[
                            { code: 'PK', label: 'PK (Paham)' },
                            { code: 'M', label: 'M (Miskonsepsi)' },
                            { code: 'TPK', label: 'TPK (Tidak Paham)' },
                          ].map((item) => (
                            <button
                              key={item.code}
                              onClick={() =>
                                handleScoreChange(
                                  selectedStudent,
                                  testStage,
                                  q.number,
                                  'code',
                                  item.code as 'PK' | 'M' | 'TPK'
                                )
                              }
                              className={`px-3 py-2 rounded-xl transition-all ${
                                scoreItem.code === item.code
                                  ? item.code === 'PK'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : item.code === 'M'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'bg-slate-700 text-white shadow-sm'
                                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Catatan Pola Miskonsepsi */}
                      <div className="w-full">
                        <input
                          type="text"
                          value={scoreItem.notes || ''}
                          onChange={(e) =>
                            handleScoreChange(selectedStudent, testStage, q.number, 'notes', e.target.value)
                          }
                          placeholder="Catatan pola miskonsepsi / cara berpikir siswa..."
                          className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-200"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ANALISIS & REKAP SKOR & N-GAIN */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">
                Rekapitulasi Skor Tes, N-Gain, & Pola Miskonsepsi
              </h2>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File CSV Lengkap</span>
              </button>
            </div>

            {/* Tabel Data Rekap per Siswa */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[11px]">
                  <tr>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Pretest (Max 18)</th>
                    <th className="p-3">Nilai Awal</th>
                    <th className="p-3">Posttest (Max 18)</th>
                    <th className="p-3">Nilai Akhir</th>
                    <th className="p-3">N-Gain</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3 text-center">M1 (Awal → Akhir)</th>
                    <th className="p-3 text-center">M2 (Awal → Akhir)</th>
                    <th className="p-3 text-center">M3 (Awal → Akhir)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {studentCodes.map((code) => {
                    const ev = evaluations[code] || { pretestScores: {}, posttestScores: {} };
                    const preTot = calculateTestTotal(ev.pretestScores);
                    const postTot = calculateTestTotal(ev.posttestScores);
                    const prePct = calculateTestPercentage(preTot);
                    const postPct = calculateTestPercentage(postTot);
                    const ngain = calculateNGain(prePct, postPct);

                    const m1Pre = classifyMisconceptionPair(ev.pretestScores[1]?.code, ev.pretestScores[2]?.code);
                    const m1Post = classifyMisconceptionPair(ev.posttestScores[1]?.code, ev.posttestScores[2]?.code);
                    const m2Pre = classifyMisconceptionPair(ev.pretestScores[3]?.code, ev.pretestScores[4]?.code);
                    const m2Post = classifyMisconceptionPair(ev.posttestScores[3]?.code, ev.posttestScores[4]?.code);
                    const m3Pre = classifyMisconceptionPair(ev.pretestScores[5]?.code, ev.pretestScores[6]?.code);
                    const m3Post = classifyMisconceptionPair(ev.posttestScores[5]?.code, ev.posttestScores[6]?.code);

                    return (
                      <tr key={code} className="hover:bg-slate-50">
                        <td className="p-3 font-black text-slate-900">{code}</td>
                        <td className="p-3">{preTot}</td>
                        <td className="p-3 font-bold text-amber-700">{prePct}</td>
                        <td className="p-3">{postTot}</td>
                        <td className="p-3 font-bold text-emerald-700">{postPct}</td>
                        <td className="p-3 font-black">
                          {ngain.gain !== null ? ngain.gain : 'Tidak Dihitung'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                              ngain.category === 'Tinggi'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ngain.category === 'Sedang'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {ngain.category}
                          </span>
                        </td>
                        <td className="p-3 text-center text-xs">
                          <span className="text-slate-500">{m1Pre}</span> →{' '}
                          <span className="font-bold text-emerald-700">{m1Post}</span>
                        </td>
                        <td className="p-3 text-center text-xs">
                          <span className="text-slate-500">{m2Pre}</span> →{' '}
                          <span className="font-bold text-emerald-700">{m2Post}</span>
                        </td>
                        <td className="p-3 text-center text-xs">
                          <span className="text-slate-500">{m3Pre}</span> →{' '}
                          <span className="font-bold text-emerald-700">{m3Post}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DATA KEPRAKTISAN */}
        {activeTab === 'practicality' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 font-heading">
              Data Kepraktisan, Durasi Waktu, & Penggunaan Scaffolding
            </h2>

            {/* Rata-Rata Durasi Aktual per Bagian (Temuan Validator 8) */}
            {(() => {
              const count = studentCodes.length || 1;
              const avgPretest = Math.round(
                studentCodes.reduce((acc, c) => acc + (storageService.getStudentProgress(c).phaseDurations?.pretestSeconds || 0), 0) / count
              );
              const avgIngat = Math.round(
                studentCodes.reduce((acc, c) => acc + (storageService.getStudentProgress(c).phaseDurations?.ingatPerkalianSeconds || 0), 0) / count
              );
              const avgL1 = Math.round(
                studentCodes.reduce((acc, c) => acc + (storageService.getStudentProgress(c).phaseDurations?.level1Seconds || 0), 0) / count
              );
              const avgL2 = Math.round(
                studentCodes.reduce((acc, c) => acc + (storageService.getStudentProgress(c).phaseDurations?.level2Seconds || 0), 0) / count
              );
              const avgL3 = Math.round(
                studentCodes.reduce((acc, c) => acc + (storageService.getStudentProgress(c).phaseDurations?.level3Seconds || 0), 0) / count
              );
              const avgPosttest = Math.round(
                studentCodes.reduce((acc, c) => acc + (storageService.getStudentProgress(c).phaseDurations?.posttestSeconds || 0), 0) / count
              );
              const totalAvg = avgPretest + avgIngat + avgL1 + avgL2 + avgL3 + avgPosttest;

              return (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-amber-950 text-base flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-700" />
                        <span>Rata-Rata Durasi Aktual Siswa per Bagian</span>
                      </h3>
                      <p className="text-xs text-amber-900 font-semibold">
                        Berdasarkan data tersimpan dari {studentCodes.length} siswa (tanpa membebani siswa dengan timer hitung mundur)
                      </p>
                    </div>
                    <span className="bg-amber-400 text-amber-950 px-3 py-1 rounded-xl text-xs font-black shadow-xs">
                      Total Rata-rata: {Math.floor(totalAvg / 60)}m {totalAvg % 60}s
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1 text-center">
                    <div className="bg-white p-2.5 rounded-2xl border border-amber-200">
                      <span className="text-[11px] text-slate-500 font-bold block">Misi Awal</span>
                      <strong className="text-sm font-black text-amber-950">{avgPretest}s ({Math.round(avgPretest / 60)}m)</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-2xl border border-amber-200">
                      <span className="text-[11px] text-slate-500 font-bold block">Ingat Perkalian</span>
                      <strong className="text-sm font-black text-amber-950">{avgIngat}s ({Math.round(avgIngat / 60)}m)</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-2xl border border-amber-200">
                      <span className="text-[11px] text-slate-500 font-bold block">Level 1 (Kelereng)</span>
                      <strong className="text-sm font-black text-emerald-700">{avgL1}s ({Math.round(avgL1 / 60)}m)</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-2xl border border-amber-200">
                      <span className="text-[11px] text-slate-500 font-bold block">Level 2 (Pasangan)</span>
                      <strong className="text-sm font-black text-sky-700">{avgL2}s ({Math.round(avgL2 / 60)}m)</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-2xl border border-amber-200">
                      <span className="text-[11px] text-slate-500 font-bold block">Level 3 (Kotak Kosong)</span>
                      <strong className="text-sm font-black text-rose-700">{avgL3}s ({Math.round(avgL3 / 60)}m)</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-2xl border border-amber-200">
                      <span className="text-[11px] text-slate-500 font-bold block">Misi Akhir</span>
                      <strong className="text-sm font-black text-purple-700">{avgPosttest}s ({Math.round(avgPosttest / 60)}m)</strong>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="bg-white rounded-3xl border border-slate-200 overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[11px]">
                  <tr>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Durasi Misi Awal</th>
                    <th className="p-3">Durasi Level 1</th>
                    <th className="p-3">Durasi Level 2</th>
                    <th className="p-3">Durasi Level 3</th>
                    <th className="p-3">Durasi Misi Akhir</th>
                    <th className="p-3">Petunjuk Terpakai</th>
                    <th className="p-3">Skor Kuis Kilat (L1/L2/L3)</th>
                    <th className="p-3">Skor Angket Siswa (Max 30)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {studentCodes.map((code) => {
                    const prog = storageService.getStudentProgress(code);
                    const totalHints =
                      (prog.scaffoldingStats?.level1?.hintsUsed || 0) +
                      (prog.scaffoldingStats?.level2?.hintsUsed || 0) +
                      (prog.scaffoldingStats?.level3?.hintsUsed || 0);

                    const surveySum =
                      prog.surveyAnswers && prog.surveyAnswers.length > 0
                        ? prog.surveyAnswers.reduce((a, b) => a + b, 0)
                        : 0;

                    return (
                      <tr key={code} className="hover:bg-slate-50">
                        <td className="p-3 font-black text-slate-900">{code}</td>
                        <td className="p-3">{prog.phaseDurations.pretestSeconds || 0}s</td>
                        <td className="p-3">{prog.phaseDurations.level1Seconds || 0}s</td>
                        <td className="p-3">{prog.phaseDurations.level2Seconds || 0}s</td>
                        <td className="p-3">{prog.phaseDurations.level3Seconds || 0}s</td>
                        <td className="p-3">{prog.phaseDurations.posttestSeconds || 0}s</td>
                        <td className="p-3 font-bold text-amber-700">{totalHints} kali</td>
                        <td className="p-3 font-mono">
                          {prog.quizScores?.level1 || 0} / {prog.quizScores?.level2 || 0} / {prog.quizScores?.level3 || 0}
                        </td>
                        <td className="p-3 font-bold text-emerald-700">
                          {surveySum > 0 ? `${surveySum} / 30 (${((surveySum / 30) * 100).toFixed(0)}%)` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DAFTAR SISWA */}
        {activeTab === 'students' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900 font-heading">
              Kelola Nama Siswa Penelitian
            </h2>

            {/* Tambah Nama Siswa Baru */}
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={newStudentCode}
                onChange={(e) => setNewStudentCode(e.target.value)}
                placeholder="Ketik nama siswa (contoh: Siti Rahma)..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm font-bold outline-none"
              />
              <button
                onClick={handleAddStudent}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Siswa</span>
              </button>
            </div>

            {/* Grid Daftar Kode Siswa */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {studentCodes.map((code) => {
                const prog = storageService.getStudentProgress(code);
                return (
                  <div
                    key={code}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-800 text-base">{code}</span>
                      <button
                        onClick={() => handleDeleteStudent(code)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                        title="Hapus siswa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Tahap: {prog.currentStep}
                    </span>
                    <button
                      onClick={() => onContinueStudentSession(code)}
                      className="w-full py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs rounded-lg transition-all"
                    >
                      Buka Sesi
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: LEMBAR OBSERVASI KELAS */}
        {activeTab === 'observation' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900 font-heading">
              Lembar Observasi Aktivitas Siswa Digital
            </h2>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4 max-w-2xl">
              <div>
                <label className="text-xs font-bold text-slate-600">Pilih Siswa yang Diamati:</label>
                <select
                  value={newObsStudent}
                  onChange={(e) => setNewObsStudent(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold mt-1"
                >
                  {studentCodes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Checklist Indikator Observasi */}
              <div className="space-y-2 text-xs font-bold text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={obsEngaged}
                    onChange={(e) => setObsEngaged(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>Siswa menunjukkan antusiasme / ketertarikan tinggi saat belajar</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={obsUnderstood}
                    onChange={(e) => setObsUnderstood(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>Siswa dapat memahami petunjuk narasi audio dengan baik</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={obsNeededHelp}
                    onChange={(e) => setObsNeededHelp(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>Siswa membutuhkan bantuan langsung dari guru / peneliti</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={obsTechIssue}
                    onChange={(e) => setObsTechIssue(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>Terdapat kendala teknis (kamera, mic, jaringan)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={obsAudioClear}
                    onChange={(e) => setObsAudioClear(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>Audio dan suara terdengar jernih</span>
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">Catatan Khusus Peneliti:</label>
                <textarea
                  rows={2}
                  value={obsNotes}
                  onChange={(e) => setObsNotes(e.target.value)}
                  placeholder="Contoh: Siswa S02 tersenyum saat melihat sisa nakal, dan langsung mencoba lagi..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs outline-none mt-1"
                />
              </div>

              <button
                onClick={handleSaveObservation}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
              >
                Simpan Lembar Observasi Ini
              </button>
            </div>

            {/* Riwayat Observasi */}
            <div className="space-y-3 pt-2">
              <h3 className="font-extrabold text-sm text-slate-700">Riwayat Observasi Tersimpan:</h3>
              {obsRecords.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Belum ada rekaman observasi.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {obsRecords.map((r) => (
                    <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-extrabold">
                        <span className="text-amber-700">{r.studentCode}</span>
                        <span className="text-slate-400">{r.date}</span>
                      </div>
                      <p className="text-slate-600 font-medium">{r.notes || 'Tanpa catatan tambahan'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: ANGKET RESPON GURU */}
        {activeTab === 'teacher_survey' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900 font-heading">
              Angket Respon Kepraktisan & Kebermanfaatan bagi Guru
            </h2>

            <div className="space-y-4 max-w-3xl">
              <div>
                <label className="text-xs font-bold text-slate-600">Nama / Kode Guru Penilai:</label>
                <input
                  type="text"
                  value={teacherCode}
                  onChange={(e) => setTeacherCode(e.target.value)}
                  placeholder="Contoh: Guru Kelas 4A / Ibu Siti"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm font-bold mt-1 outline-none"
                />
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-extrabold text-slate-500 block">
                  Skala: 1 = Sangat Tidak Setuju, 2 = Kurang Setuju, 3 = Setuju, 4 = Sangat Setuju
                </span>
                {teacherItems.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-800 flex-1">{idx + 1}. {item}</span>
                    <div className="flex gap-1 shrink-0">
                      {[1, 2, 3, 4].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => {
                            const copy = [...teacherAnswers];
                            copy[idx] = v;
                            setTeacherAnswers(copy);
                          }}
                          className={`w-7 h-7 rounded-lg font-bold text-xs ${
                            teacherAnswers[idx] === v
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-white border border-slate-300 text-slate-700'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">Kritik & Saran Pengembangan:</label>
                <textarea
                  rows={2}
                  value={teacherFeedback}
                  onChange={(e) => setTeacherFeedback(e.target.value)}
                  placeholder="Tuliskan saran untuk penyempurnaan media..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs outline-none mt-1"
                />
              </div>

              <button
                onClick={handleSaveTeacherSurvey}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
              >
                Simpan Respon Guru
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: PENGATURAN & PIN */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-w-2xl">
            <h2 className="text-xl font-black text-slate-900 font-heading">
              Pengaturan Sistem, Suara & Keamanan
            </h2>

            {/* Pengaturan Suara & Audio Narasi (Temuan Validator 9) */}
            <div className="p-4 bg-amber-50/70 border-2 border-amber-300 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-sm text-amber-950 block">
                    🎙️ Pengaturan Suara Narasi (Kak Bagi TTS)
                  </span>
                  <span className="text-xs text-amber-900 font-semibold">
                    Penyesuaian suara bahasa Indonesia, kecepatan bicara, dan intonasi ramah anak
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => audioService.testVoice('Halo sahabat pintar! Suara narasi Kak Bagi terdengar ramah dan jelas di kelas!')}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  🔊 Uji Suara
                </button>
              </div>

              {/* Pilihan Suara Browser */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Pilih Karakter Suara TTS:
                </label>
                <select
                  value={selectedVoiceUri}
                  onChange={(e) => {
                    const uri = e.target.value;
                    setSelectedVoiceUri(uri);
                    audioService.setVoiceByUri(uri);
                  }}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                >
                  {availableVoices.length === 0 ? (
                    <option value="">Suara Default Sistem (id-ID)</option>
                  ) : (
                    availableVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang}) {v.lang.startsWith('id') ? '⭐ [Bahasa Indonesia]' : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Slider Kecepatan dan Nada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Kecepatan Bicara:</span>
                    <strong className="text-amber-900">{speechRate.toFixed(2)}x</strong>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.2"
                    step="0.02"
                    value={speechRate}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setSpeechRate(val);
                      audioService.setSpeechSettings(val, speechPitch);
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block">Default anak SD: 0.88x (santai & jelas)</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Nada / Intonasi (Pitch):</span>
                    <strong className="text-amber-900">{speechPitch.toFixed(2)}</strong>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.4"
                    step="0.02"
                    value={speechPitch}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setSpeechPitch(val);
                      audioService.setSpeechSettings(speechRate, val);
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block">Default: 1.08 (ceria dan hangat)</span>
                </div>
              </div>

              {/* Mode Tenang (Quiet Mode) */}
              <div className="flex items-center justify-between pt-2 border-t border-amber-200">
                <div>
                  <span className="font-extrabold text-xs text-amber-950 block">Mode Tenang (Quiet Mode)</span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    Kurangi efek suara keras untuk siswa yang sensitif terhadap kebisingan
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !isQuietMode;
                    setIsQuietMode(next);
                    audioService.setQuietMode(next);
                  }}
                  className={`px-3 py-1 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    isQuietMode
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isQuietMode ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>
            </div>

            {/* Ubah PIN */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="font-extrabold text-sm text-slate-800 block">Ubah PIN Peneliti</span>
              <input
                type="password"
                maxLength={8}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Masukkan PIN baru (angka)"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm outline-none font-bold"
              />
              <button
                onClick={() => {
                  if (newPin.trim()) {
                    storageService.saveResearcherPin(newPin.trim());
                    setPinChangeMsg('PIN berhasil diperbarui!');
                    setTimeout(() => setPinChangeMsg(''), 2500);
                  }
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Simpan PIN Baru
              </button>
              {pinChangeMsg && <p className="text-xs font-bold text-emerald-600">{pinChangeMsg}</p>}
            </div>

            {/* Pengaturan Angket Siswa Aktif/Nonaktif */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-extrabold text-sm text-slate-800 block">Angket Siswa "Pendapatmu"</span>
                <span className="text-xs text-slate-500">Dapat dinonaktifkan jika sesi pembelajaran terbatas</span>
              </div>
              <button
                onClick={() => {
                  const current = storageService.isSurveyEnabled();
                  storageService.setSurveyEnabled(!current);
                  alert(`Angket siswa sekarang ${!current ? 'DIAKTIFKAN' : 'DINONAKTIFKAN'}.`);
                }}
                className="px-3 py-1.5 bg-amber-400 text-amber-950 font-bold text-xs rounded-xl"
              >
                Ubah Status
              </button>
            </div>

            {/* Reset Seluruh Data */}
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
              <span className="font-extrabold text-sm text-rose-900 block flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Zona Berbahaya: Reset Seluruh Data
              </span>
              <p className="text-xs text-rose-700">
                Menghapus semua daftar siswa, skor, jawaban, rekaman suara dari IndexedDB, dan catatan observasi.
              </p>
              <button
                onClick={handleResetAllData}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-sm"
              >
                Hapus Semua Data Penelitian
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
