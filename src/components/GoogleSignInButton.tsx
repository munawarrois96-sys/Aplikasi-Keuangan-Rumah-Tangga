import React from 'react';
import { LogOut, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { User } from 'firebase/auth';

interface GoogleSignInButtonProps {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  compact?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  user,
  token,
  isLoading,
  onSignIn,
  onSignOut,
  compact = false,
}) => {
  if (user && token) {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl shadow-2xs">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'Google User'}
            className="w-6 h-6 rounded-full border border-emerald-300"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
            {user.email ? user.email.charAt(0).toUpperCase() : 'G'}
          </div>
        )}
        <div className="text-left hidden sm:block">
          <div className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
            <span>{user.displayName || 'Google Connected'}</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
          </div>
          <div className="text-[10px] text-emerald-700/80 truncate max-w-[150px]">
            {user.email}
          </div>
        </div>
        <button
          onClick={onSignOut}
          title="Keluar dari Akun Google"
          className="p-1 hover:bg-emerald-100 text-emerald-800 rounded-lg transition"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        onClick={onSignIn}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-xs transition disabled:opacity-50"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        <span>{isLoading ? 'Menghubungkan...' : 'Hubungkan Google'}</span>
      </button>
    );
  }

  // Official Standard Sign in with Google Button
  return (
    <button
      onClick={onSignIn}
      disabled={isLoading}
      className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-sm transition disabled:opacity-50"
    >
      <div className="w-5 h-5 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
      </div>
      <span>{isLoading ? 'Menghubungkan ke Google...' : 'Sign in with Google'}</span>
    </button>
  );
};
