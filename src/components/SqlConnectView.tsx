import React, { useState } from 'react';
import {
  Database,
  Cloud,
  CheckCircle2,
  Copy,
  Download,
  RefreshCw,
  Server,
  Layers,
  Smartphone,
  Laptop,
  ArrowRight,
  ShieldCheck,
  Table,
  KeyRound,
  Check
} from 'lucide-react';
import {
  Account,
  AssetItem,
  Budget,
  DebtItem,
  EmergencyFund,
  FinancialGoal,
  HouseholdCollaboration,
  InvestmentAsset,
  RecurringBill,
  Transaction
} from '../types/finance';
import { SQL_DDL_SCHEMA, generateLiveSqlDataDump } from '../utils/sqlSchemaGenerator';
import { User } from 'firebase/auth';

interface SqlConnectViewProps {
  user: User | null;
  lastSyncedAt: string | null;
  isSyncing: boolean;
  onManualSync: () => void;
  household: HouseholdCollaboration;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  emergencyFund: EmergencyFund;
  goals: FinancialGoal[];
  investments: InvestmentAsset[];
  debts: DebtItem[];
  assets: AssetItem[];
  bills: RecurringBill[];
  onOpenGoogleSignIn?: () => void;
}

export const SqlConnectView: React.FC<SqlConnectViewProps> = ({
  user,
  lastSyncedAt,
  isSyncing,
  onManualSync,
  household,
  accounts,
  transactions,
  budgets,
  emergencyFund,
  goals,
  investments,
  debts,
  assets,
  bills,
  onOpenGoogleSignIn
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'ddl' | 'dump'>('sync');
  const [copied, setCopied] = useState<string | null>(null);

  const fullSqlDump = generateLiveSqlDataDump(
    household,
    accounts,
    transactions,
    budgets,
    emergencyFund,
    goals,
    investments,
    debts,
    assets,
    bills
  );

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([fullSqlDump], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `keluarga_munawar_rois_schema_dan_data_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800">
                SQL Connect Schema &amp; Sinkronisasi Multi-Perangkat
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Cloud Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola arsitektur basis data relasional keluarga dan pastikan data di HP, tablet, maupun laptop selalu sinkron secara real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onManualSync}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-600/20 transition-all disabled:opacity-75"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-sky-100 bg-white rounded-t-xl px-4 pt-2 gap-2 shadow-2xs">
        <button
          onClick={() => setActiveTab('sync')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'sync'
              ? 'border-sky-600 text-sky-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Cloud className="w-4 h-4 text-sky-500" />
          Status Sinkronisasi Multi-Perangkat
        </button>

        <button
          onClick={() => setActiveTab('ddl')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'ddl'
              ? 'border-sky-600 text-sky-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Server className="w-4 h-4 text-sky-500" />
          Skema Relasional DDL (10 Tabel Database)
        </button>

        <button
          onClick={() => setActiveTab('dump')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'dump'
              ? 'border-sky-600 text-sky-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4 text-sky-500" />
          Dump SQL Lengkap (.sql)
        </button>
      </div>

      {/* Content */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          {/* Main Hero Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-600 via-sky-700 to-blue-800 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-medium backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Database Engine: Cloud Firestore + Relational SQL Connect
              </div>
              <h3 className="text-xl md:text-2xl font-bold">
                Sinkronisasi Database Aktif untuk Keluarga Munawar Rois
              </h3>
              <p className="text-xs md:text-sm text-sky-100 max-w-2xl leading-relaxed">
                Aplikasi ini secara otomatis menduplikasi dan menyelaraskan perubahan data antara memori lokal perangkat dengan Google Cloud Firestore database. Anda dapat membuka aplikasi ini dari handphone Suami (Munawar Rois) dan handphone Istri (Wini Yusnia) sekaligus, dan seluruh pembaruan saldo maupun catatan pos belanja langsung masuk sinkron tanpa perlu input ulang.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-lg bg-sky-900/60 border border-sky-400/30 text-xs text-sky-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Akun Google: <strong>{user ? user.email : 'munawarrois81@guru.sma.belajar.id'}</strong></span>
                </div>
                <div className="px-3.5 py-1.5 rounded-lg bg-sky-900/60 border border-sky-400/30 text-xs text-sky-100 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-cyan-300" />
                  <span>Sinkron Terakhir: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString('id-ID') : 'Baru saja'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Device Sync Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">Perangkat 1 (Smartphone)</h4>
              <p className="text-xs text-slate-500 mt-1">
                Catat pengeluaran harian, struk belanja pasar, atau transfer e-wallet secara cepat saat bepergian.
              </p>
              <span className="mt-3 inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                ● Tersinkron Real-time
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                <Laptop className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">Perangkat 2 (Laptop / PC)</h4>
              <p className="text-xs text-slate-500 mt-1">
                Evaluasi laporan bulanan, simulasi pelunasan utang avalanche, dan analisis AI deteksi kebocoran.
              </p>
              <span className="mt-3 inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                ● Tersinkron Real-time
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                <Server className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">Penyimpanan Cloud Google</h4>
              <p className="text-xs text-slate-500 mt-1">
                Tersimpan di Cloud Project <code>gen-lang-client-0164403115</code> dengan proteksi data terenkripsi.
              </p>
              <span className="mt-3 inline-block px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] font-semibold border border-sky-200">
                ● ACID &amp; Security Rules Aktif
              </span>
            </div>
          </div>

          {/* Database Tables Summary */}
          <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Table className="w-4 h-4 text-sky-600" />
              Daftar Tabel Database yang Disinkronkan
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-sky-700 block">1. households</span>
                <span className="text-slate-500 text-[11px]">Profil &amp; Pembagian Tugas</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-sky-700 block">2. accounts</span>
                <span className="text-slate-500 text-[11px]">{accounts.length} Rekening &amp; Saldo</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-sky-700 block">3. transactions</span>
                <span className="text-slate-500 text-[11px]">{transactions.length} Riwayat Transaksi</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-sky-700 block">4. budgets</span>
                <span className="text-slate-500 text-[11px]">{budgets.length} Pos Anggaran</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-sky-700 block">5. emergency_funds</span>
                <span className="text-slate-500 text-[11px]">Dana Darurat Keluarga</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-sky-700 block">6. financial_goals</span>
                <span className="text-slate-500 text-[11px]">{goals.length} Target Keuangan</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-sky-700 block">7. investment_assets</span>
                <span className="text-slate-500 text-[11px]">{investments.length} Aset Investasi</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-sky-700 block">8. debts</span>
                <span className="text-slate-500 text-[11px]">{debts.length} Pelacakan Utang</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-sky-700 block">9. assets</span>
                <span className="text-slate-500 text-[11px]">{assets.length} Aset Lancar &amp; Tetap</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-sky-700 block">10. recurring_bills</span>
                <span className="text-slate-500 text-[11px]">{bills.length} Tagihan Bulanan</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ddl' && (
        <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Skema Relasional DDL (SQL Data Definition Language)
              </h3>
              <p className="text-xs text-slate-500">
                Skema tabel resmi dengan Primary Key, Foreign Key (ON DELETE CASCADE), dan Check Constraints.
              </p>
            </div>
            <button
              onClick={() => handleCopy(SQL_DDL_SCHEMA, 'ddl')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              {copied === 'ddl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied === 'ddl' ? 'Tersalin!' : 'Salin DDL SQL'}
            </button>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4">
            <pre className="text-xs font-mono text-emerald-400 overflow-x-auto max-h-[500px] leading-relaxed">
              {SQL_DDL_SCHEMA}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'dump' && (
        <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Live SQL Data Dump (DDL + Data Nyata Aktif)
              </h3>
              <p className="text-xs text-slate-500">
                Perintah SQL lengkap siap dieksekusi di database PostgreSQL, Cloud SQL, atau MySQL Anda.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => handleCopy(fullSqlDump, 'dump')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {copied === 'dump' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === 'dump' ? 'Tersalin!' : 'Salin Semua'}
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh .sql
              </button>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4">
            <pre className="text-xs font-mono text-sky-300 overflow-x-auto max-h-[500px] leading-relaxed">
              {fullSqlDump}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
