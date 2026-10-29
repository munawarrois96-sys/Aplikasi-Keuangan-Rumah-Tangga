import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  PlusCircle,
  Users,
  ShieldCheck,
  RotateCcw,
  Printer,
  Calendar,
  Volume2,
  VolumeX,
  Play,
  Pause,
  FileSpreadsheet,
  Database
} from 'lucide-react';
import { UserRole } from '../types/finance';
import { getGreetingIndo } from '../utils/formatters';

interface HeaderBannerProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenNewTransaction: () => void;
  onOpenAIModal: () => void;
  onOpenSheetsTab: () => void;
  onOpenSqlModal: () => void;
  onOpenPrint: () => void;
  onResetData: () => void;
  alertCount: number;
  totalNetWorth: number;
  isGoogleConnected?: boolean;
  isCloudSynced?: boolean;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  activeRole,
  onRoleChange,
  onOpenNewTransaction,
  onOpenAIModal,
  onOpenSheetsTab,
  onOpenSqlModal,
  onOpenPrint,
  onResetData,
  alertCount,
  isGoogleConnected,
  isCloudSynced = true,
}) => {
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);
  const [todayStr] = useState(() => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-sky-100 no-print">
      {/* SKY BLUE RUNNING TEXT TICKER (REQUIRED BY PROMPT) */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 text-white text-xs font-semibold px-3 py-2 flex items-center justify-between shadow-inner overflow-hidden border-b border-sky-400/40">
        <div className="flex items-center gap-2 shrink-0 z-10 bg-sky-700/80 px-2.5 py-0.5 rounded-full backdrop-blur-xs text-[11px] uppercase tracking-wider font-bold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping inline-block"></span>
          <span>Info Terkini</span>
        </div>

        {/* Marquee Content */}
        <div className="overflow-hidden whitespace-nowrap mx-3 flex-1 relative">
          <div
            className={`inline-block whitespace-nowrap text-xs md:text-sm tracking-wide font-medium ${
              isMarqueePaused ? '' : 'animate-marquee'
            }`}
            style={{ animationDuration: '28s' }}
          >
            <span className="font-extrabold uppercase tracking-widest text-sky-100 px-3 bg-sky-900/30 py-0.5 rounded mr-3">
              SELAMAT DATANG DI APLIKASI KEUANGAN RUMAH TANGGA
            </span>
            <span className="text-white/90">
              • Kelola arus kas, pos anggaran 50/30/20, dana darurat, simulasi pelunasan utang & neraca aset keluarga dengan aman dan transparan •
            </span>
            <span className="ml-4 text-sky-200">
              💡 Tips Hari Ini: Amankan tabungan di awal gajian (Pay Yourself First) sebelum mengalokasikan pos belanja harian.
            </span>
            <span className="ml-4 font-bold text-amber-200">
              {alertCount > 0 ? `⚠️ Perhatian: Ada ${alertCount} pos anggaran/tagihan mendekati jatuh tempo!` : '✅ Seluruh anggaran dalam batas aman.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 z-10 text-[11px]">
          <button
            onClick={() => setIsMarqueePaused(!isMarqueePaused)}
            title={isMarqueePaused ? 'Jalankan Teks' : 'Jeda Teks'}
            className="p-1 rounded hover:bg-sky-700/50 text-sky-100 transition"
          >
            {isMarqueePaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <div className="hidden sm:flex items-center gap-1 text-sky-100 bg-sky-700/50 px-2 py-0.5 rounded-full text-[11px]">
            <Calendar className="w-3 h-3 text-sky-200" />
            <span>{todayStr}</span>
          </div>
        </div>
      </div>

      {/* MAIN TOP BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Greeting */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 ring-2 ring-sky-200">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-extrabold tracking-tight bg-gradient-to-r from-sky-700 via-sky-600 to-cyan-600 bg-clip-text text-transparent">
                Keluarga Munawar Rois
              </h1>
              <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200">
                AI Integrated
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span>{getGreetingIndo()},</span>
              <span className="font-semibold text-slate-700">Keluarga Munawar Rois</span>
            </p>
          </div>
        </div>

        {/* Center: Household User Role Switcher */}
        <div className="flex items-center bg-sky-50/80 p-1 rounded-xl border border-sky-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-sky-700 px-2 flex items-center gap-1 hidden md:flex">
            <Users className="w-3.5 h-3.5" />
            <span>Akses:</span>
          </div>
          {(['Bersama', 'Suami', 'Istri'] as UserRole[]).map((role) => {
            const isActive = activeRole === role;
            const labelMap: Record<UserRole, string> = {
              Bersama: '🏡 Keluarga Munawar Rois',
              Suami: '👨 Suami (Munawar Rois)',
              Istri: '👩 Istri (Wini Yusnia)',
            };
            return (
              <button
                key={role}
                onClick={() => onRoleChange(role)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/30'
                    : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100/60'
                }`}
              >
                {labelMap[role]}
              </button>
            );
          })}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* SQL Connect & Cloud Sync Button */}
          <button
            onClick={onOpenSqlModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-xl transition shadow-xs"
            title="Lihat Skema SQL & Status Sinkronisasi Multi-Perangkat"
          >
            <Database className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">SQL Connect</span>
            <span className={`w-2 h-2 rounded-full ${isCloudSynced ? 'bg-sky-500 ring-2 ring-sky-200 animate-pulse' : 'bg-slate-300'}`}></span>
          </button>

          {/* Google Sheets Quick Button */}
          <button
            onClick={onOpenSheetsTab}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition shadow-xs"
            title="Kelola Integrasi Google Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Google Sheets</span>
            {isGoogleConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
            )}
          </button>

          {/* AI Assistant button */}
          <button
            onClick={onOpenAIModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-xl transition shadow-xs"
            title="Buka Asisten AI & Evaluasi Kebocoran Halus"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
            <span className="hidden sm:inline">Asisten AI</span>
          </button>

          {/* Cetak / Print */}
          <button
            onClick={onOpenPrint}
            className="p-2 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-xl border border-slate-200 transition"
            title="Cetak Laporan Keuangan Resmi"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Reset Data Default */}
          <button
            onClick={() => {
              if (window.confirm('Kembalikan seluruh data keuangan ke simulasi default awal?')) {
                onResetData();
              }
            }}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition"
            title="Reset ke Data Awal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* New Transaction Button */}
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 rounded-xl shadow-md shadow-sky-500/25 active:scale-95 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Catat Transaksi</span>
          </button>
        </div>
      </div>
    </header>
  );
};
