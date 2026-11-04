import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.warn('Terjadi kendala pada aplikasi:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-white border-4 border-amber-300 rounded-3xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-700 flex items-center justify-center mx-auto text-3xl">
              🏝️
            </div>
            <div>
              <h1 className="text-xl font-black text-amber-950 font-heading">
                Ups, Ada Sedikit Kendala!
              </h1>
              <p className="text-sm font-semibold text-slate-600 mt-1">
                Jangan khawatir, data petualanganmu tetap tersimpan dengan aman. Yuk kita muat ulang layarnya!
              </p>
            </div>
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm rounded-xl shadow-md border-b-2 border-orange-700 transition-all cursor-pointer active:scale-95"
            >
              🔄 Kembali ke Beranda Petualangan
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
