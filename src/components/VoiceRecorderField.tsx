/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Komponen Input Jawaban Soal Uraian Ramah Anak:
 * 1. Tombol Mikrofon Besar "Rekam Suaraku" (MediaRecorder max 60 detik, simpan ke IndexedDB)
 * 2. Pemutar audio rekaman sendiri
 * 3. Kotak ketik alternatif atau pelengkap
 * 4. Mode Bantuan Peneliti ("Dicatat oleh Peneliti")
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, CheckCircle, PenTool, UserCheck, AlertCircle } from 'lucide-react';
import { audioService } from '../services/audioService';
import { storageService } from '../services/storageService';

interface VoiceRecorderFieldProps {
  label: string; // 'Jawaban' | 'Alasan' | 'Cara'
  studentCode: string;
  testType: 'pre' | 'post';
  questionIndex: number;
  fieldName: 'jawaban' | 'alasan' | 'cara';
  initialText: string;
  initialHasVoice: boolean;
  initialIsAssisted?: boolean;
  onUpdate: (data: { text: string; hasVoice: boolean; isAssisted: boolean }) => void;
  onSpeakPrompt?: () => void;
}

export const VoiceRecorderField: React.FC<VoiceRecorderFieldProps> = ({
  label,
  studentCode,
  testType,
  questionIndex,
  fieldName,
  initialText,
  initialHasVoice,
  initialIsAssisted = false,
  onUpdate,
}) => {
  const [text, setText] = useState(initialText || '');
  const [isAssisted, setIsAssisted] = useState(initialIsAssisted);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [hasVoice, setHasVoice] = useState(initialHasVoice);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Ambil audio tersimpan dari IndexedDB saat pertama dibuka atau saat soal berubah
  useEffect(() => {
    setText(initialText || '');
    setHasVoice(initialHasVoice);
    setIsAssisted(initialIsAssisted);
    setAudioUrl(null);

    let active = true;
    storageService
      .getVoiceAudio(studentCode, testType, fieldName, questionIndex)
      .then((blob) => {
        if (blob && active) {
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          setHasVoice(true);
        }
      })
      .catch((err) => {
        console.warn('Gagal memuat audio tersimpan:', err);
      });

    return () => {
      active = false;
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [studentCode, testType, questionIndex, fieldName, initialText, initialHasVoice, initialIsAssisted]);

  // Handler Rekaman Suara
  const startRecording = async () => {
    setMicError(null);
    audioService.playTapSound();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser belum mendukung rekaman suara.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await storageService.saveVoiceAudio(studentCode, testType, fieldName, questionIndex, audioBlob);

        const newUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(newUrl);
        setHasVoice(true);
        onUpdate({ text, hasVoice: true, isAssisted });

        // Matikan tracks mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      // Timer 60 detik maksimal
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 59) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: unknown) {
      console.warn('Izin mikrofon gagal:', err);
      setMicError(
        'Mikrofon belum diizinkan. Jangan khawatir, kamu tetap bisa mengetik jawaban di bawah ya!'
      );
      audioService.speak(
        'Jangan khawatir, kamu bisa mengetik jawabanmu pada kotak di bawah ini.'
      );
    }
  };

  const stopRecording = () => {
    audioService.playSuccessSound();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const togglePlayAudio = () => {
    if (!audioUrl) return;
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setIsPlayingRecorded(false);
    }

    if (isPlayingRecorded) {
      audioPlayerRef.current.pause();
      setIsPlayingRecorded(false);
    } else {
      audioService.duckBgm(true);
      audioPlayerRef.current.play();
      setIsPlayingRecorded(true);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    onUpdate({ text: val, hasVoice, isAssisted });
  };

  const toggleAssisted = () => {
    const nextVal = !isAssisted;
    setIsAssisted(nextVal);
    onUpdate({ text, hasVoice, isAssisted: nextVal });
  };

  return (
    <div className="bg-amber-50/70 border-2 border-amber-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-base sm:text-lg font-bold text-amber-950 flex items-center gap-2">
          <span className="w-7 h-7 bg-amber-400 text-amber-950 rounded-xl flex items-center justify-center text-sm font-extrabold">
            {fieldName === 'jawaban' ? '1' : '2'}
          </span>
          <span>{label}mu:</span>
        </label>

        {/* Tombol Mode Bantuan Peneliti */}
        <button
          type="button"
          onClick={toggleAssisted}
          title="Tandai jika jawaban lisan anak diketik oleh peneliti"
          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl font-bold border transition-all ${
            isAssisted
              ? 'bg-purple-100 border-purple-300 text-purple-900 ring-2 ring-purple-300'
              : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>{isAssisted ? 'Dicatat Peneliti' : 'Bantuan Peneliti'}</span>
        </button>
      </div>

      {/* Bagian A: Rekam Suara */}
      <div className="bg-white rounded-2xl p-3 border-2 border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-4 py-2.5 rounded-2xl shadow-md active:scale-95 transition-all"
            >
              <Mic className="w-5 h-5 animate-pulse" />
              <span>{hasVoice ? 'Rekam Ulang Suaraku' : 'Rekam Suaraku'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-2.5 rounded-2xl shadow-md ring-4 ring-rose-200 animate-pulse active:scale-95 transition-all"
            >
              <Square className="w-5 h-5 fill-white" />
              <span>Selesai Bicara ({60 - recordingSeconds}s)</span>
            </button>
          )}

          {/* Status Rekaman */}
          {hasVoice && !isRecording && (
            <button
              type="button"
              onClick={togglePlayAudio}
              className="flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-bold px-3 py-2 rounded-2xl text-sm transition-all"
            >
              {isPlayingRecorded ? (
                <>
                  <Pause className="w-4 h-4 text-emerald-700" />
                  <span>Jeda</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-emerald-700 fill-emerald-700" />
                  <span>Dengar Rekamanku</span>
                </>
              )}
            </button>
          )}
        </div>

        {hasVoice && (
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Suara tersimpan</span>
          </div>
        )}
      </div>

      {micError && (
        <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-100 border border-amber-300 px-3 py-2 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{micError}</span>
        </div>
      )}

      {/* Bagian B: Kotak Ketik Jawaban */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span className="flex items-center gap-1">
            <PenTool className="w-3 h-3" />
            <span>Atau ketik {label.toLowerCase()} di sini:</span>
          </span>
          {isAssisted && (
            <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md">
              (Mode Dicatat Peneliti Aktif)
            </span>
          )}
        </div>
        <textarea
          rows={3}
          value={text}
          onChange={handleTextChange}
          placeholder={`Tuliskan ${label.toLowerCase()}mu di sini... (atau gunakan tombol Rekam Suaraku di atas)`}
          className="w-full bg-white border-2 border-amber-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 rounded-2xl p-3 text-base sm:text-lg text-slate-800 placeholder:text-slate-400 font-medium resize-none transition-all outline-none"
        />
      </div>
    </div>
  );
};
