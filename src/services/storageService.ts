/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Layanan Penyimpanan Lokal & IndexedDB untuk Penelitian:
 * - Menyimpan rekaman suara siswa di IndexedDB (kapasitas besar, tidak hilang saat browser refresh)
 * - Menyimpan profil, progres, jawaban teks, penilaian tes, dan observasi di localStorage
 */

export interface StudentAnswer {
  selectedOptionLabel?: 'A' | 'B' | 'C' | 'D';
  selectedOptionIndex?: number;
  selectedOptionText?: string;
  textAnswer?: string;
  reasonOrCara?: string;
  hasVoiceRecording?: boolean;
  isResearcherAssisted?: boolean;
  timestamp: number;
}

export interface StudentProgress {
  studentCode: string; // Identifier / nama siswa
  studentName?: string; // Nama lengkap siswa
  currentStep: 'welcome' | 'pretest' | 'ingat_perkalian' | 'concepts' | 'map' | 'level1' | 'level2' | 'level3' | 'posttest' | 'survey' | 'certificate';
  pretestCurrentQ: number;
  posttestCurrentQ: number;
  pretestAnswers: Record<number, StudentAnswer>;
  posttestAnswers: Record<number, StudentAnswer>;
  conceptsDone: boolean[];
  unlockedLevel: number; // 1, 2, or 3
  stars: {
    level1: number;
    level2: number;
    level3: number;
  };
  quizScores: {
    level1: number;
    level2: number;
    level3: number;
  };
  scaffoldingStats: {
    level1: { hintsUsed: number; wrongTries: number };
    level2: { hintsUsed: number; wrongTries: number };
    level3: { hintsUsed: number; wrongTries: number };
  };
  phaseDurations: {
    pretestSeconds: number;
    ingatPerkalianSeconds?: number;
    concept1Seconds: number;
    concept2Seconds: number;
    concept3Seconds: number;
    level1Seconds: number;
    level2Seconds: number;
    level3Seconds: number;
    posttestSeconds: number;
  };
  surveyAnswers: number[]; // 10 items (1..3)
  completedAt?: number;
}

export interface TestScoreItem {
  score: number; // 0, 1, 2, 3
  code: 'PK' | 'M' | 'TPK'; // PK: Paham Konsep, M: Miskonsepsi, TPK: Tidak Paham Konsep
  notes: string;
}

export interface StudentEvaluation {
  pretestScores: Record<number, TestScoreItem>;
  posttestScores: Record<number, TestScoreItem>;
}

export interface ObservationRecord {
  id: string;
  studentCode: string;
  date: string;
  childEngaged: boolean;
  understoodVoiceGuides: boolean;
  neededHelp: boolean;
  technicalIssues: boolean;
  audioClear: boolean;
  notes: string;
}

export interface TeacherSurvey {
  id: string;
  teacherNameOrCode: string;
  answers: number[]; // 10 items (1..4)
  feedback: string;
  date: string;
}

const DB_NAME = 'smart_div_audio_db';
const DB_VERSION = 1;
const AUDIO_STORE = 'student_voice_records';

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initDB();
    }
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB tidak didukung pada browser ini'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(AUDIO_STORE)) {
          db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // Simpan rekaman audio ke IndexedDB
  public async saveVoiceAudio(
    studentCode: string,
    testType: 'pre' | 'post',
    field: 'jawaban' | 'alasan' | 'cara',
    questionIndex: number,
    blob: Blob
  ): Promise<void> {
    const db = await this.initDB();
    const id = `${studentCode}_${testType}_q${questionIndex}_${field}`;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE, 'readwrite');
      const store = tx.objectStore(AUDIO_STORE);
      const record = {
        id,
        studentCode,
        testType,
        field,
        questionIndex,
        blob,
        updatedAt: Date.now(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Ambil rekaman audio dari IndexedDB
  public async getVoiceAudio(
    studentCode: string,
    testType: 'pre' | 'post',
    field: 'jawaban' | 'alasan' | 'cara',
    questionIndex: number
  ): Promise<Blob | null> {
    const db = await this.initDB();
    const id = `${studentCode}_${testType}_q${questionIndex}_${field}`;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE, 'readonly');
      const store = tx.objectStore(AUDIO_STORE);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  // Hapus semua rekaman audio
  public async clearAllAudio(): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE, 'readwrite');
      const store = tx.objectStore(AUDIO_STORE);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Profil & Daftar Nama Siswa
  public getStudentNames(): string[] {
    try {
      const saved = localStorage.getItem('smart_div_student_names') || localStorage.getItem('smart_div_students') || localStorage.getItem('scaff_ar_students');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    const defaultNames = ['Budi Pratama', 'Siti Rahma', 'Ahmad Rizki', 'Dewi Lestari', 'Fajar Nugraha'];
    this.saveStudentNames(defaultNames);
    return defaultNames;
  }

  public saveStudentNames(names: string[]): void {
    localStorage.setItem('smart_div_student_names', JSON.stringify(names));
    localStorage.setItem('smart_div_students', JSON.stringify(names));
  }

  public addStudentName(name: string): string[] {
    const trimmed = name.trim();
    if (!trimmed) return this.getStudentNames();
    const current = this.getStudentNames();
    const exists = current.some((n) => n.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      const next = [...current, trimmed];
      this.saveStudentNames(next);
      return next;
    }
    return current;
  }

  // Alias untuk kompatibilitas kode lama
  public getStudentCodes(): string[] {
    return this.getStudentNames();
  }

  public saveStudentCodes(codes: string[]): void {
    this.saveStudentNames(codes);
  }

  // PIN Peneliti
  public getResearcherPin(): string {
    return localStorage.getItem('smart_div_pin') || localStorage.getItem('scaff_ar_pin') || '1234';
  }

  public saveResearcherPin(pin: string): void {
    localStorage.setItem('smart_div_pin', pin);
  }

  // Status Angket Aktif/Nonaktif
  public isSurveyEnabled(): boolean {
    const val = localStorage.getItem('smart_div_survey_enabled') || localStorage.getItem('scaff_ar_survey_enabled');
    return val !== 'false'; // default true
  }

  public setSurveyEnabled(enabled: boolean): void {
    localStorage.setItem('smart_div_survey_enabled', enabled ? 'true' : 'false');
  }

  // Progres Siswa
  public getStudentProgress(studentCode: string): StudentProgress {
    try {
      const saved = localStorage.getItem(`smart_div_prog_${studentCode}`) || localStorage.getItem(`scaff_ar_prog_${studentCode}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.studentName) parsed.studentName = studentCode;
        return parsed;
      }
    } catch {
      // ignore
    }

    const defaultProg: StudentProgress = {
      studentCode,
      studentName: studentCode,
      currentStep: 'pretest',
      pretestCurrentQ: 0,
      posttestCurrentQ: 0,
      pretestAnswers: {},
      posttestAnswers: {},
      conceptsDone: [false, false, false],
      unlockedLevel: 1,
      stars: { level1: 0, level2: 0, level3: 0 },
      quizScores: { level1: 0, level2: 0, level3: 0 },
      scaffoldingStats: {
        level1: { hintsUsed: 0, wrongTries: 0 },
        level2: { hintsUsed: 0, wrongTries: 0 },
        level3: { hintsUsed: 0, wrongTries: 0 },
      },
      phaseDurations: {
        pretestSeconds: 0,
        concept1Seconds: 0,
        concept2Seconds: 0,
        concept3Seconds: 0,
        level1Seconds: 0,
        level2Seconds: 0,
        level3Seconds: 0,
        posttestSeconds: 0,
      },
      surveyAnswers: [],
    };

    return defaultProg;
  }

  public saveStudentProgress(prog: StudentProgress): void {
    localStorage.setItem(`smart_div_prog_${prog.studentCode}`, JSON.stringify(prog));
  }

  // Penilaian Tes oleh Peneliti
  public getEvaluation(studentCode: string): StudentEvaluation {
    try {
      const saved = localStorage.getItem(`smart_div_eval_${studentCode}`) || localStorage.getItem(`scaff_ar_eval_${studentCode}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      pretestScores: {},
      posttestScores: {},
    };
  }

  public saveEvaluation(studentCode: string, evalData: StudentEvaluation): void {
    localStorage.setItem(`smart_div_eval_${studentCode}`, JSON.stringify(evalData));
  }

  // Observasi Digital
  public getObservationRecords(): ObservationRecord[] {
    try {
      const saved = localStorage.getItem('smart_div_observations') || localStorage.getItem('scaff_ar_observations');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  }

  public saveObservationRecord(rec: ObservationRecord): void {
    const records = this.getObservationRecords().filter(r => r.id !== rec.id);
    records.push(rec);
    localStorage.setItem('smart_div_observations', JSON.stringify(records));
  }

  // Angket Guru
  public getTeacherSurveys(): TeacherSurvey[] {
    try {
      const saved = localStorage.getItem('smart_div_teacher_surveys') || localStorage.getItem('scaff_ar_teacher_surveys');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  }

  public saveTeacherSurvey(survey: TeacherSurvey): void {
    const list = this.getTeacherSurveys().filter(s => s.id !== survey.id);
    list.push(survey);
    localStorage.setItem('smart_div_teacher_surveys', JSON.stringify(list));
  }

  // Reset Semua Data
  public async resetAllData(): Promise<void> {
    await this.clearAllAudio();
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('smart_div_') || key.startsWith('scaff_ar_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }
}

export const storageService = new StorageService();
