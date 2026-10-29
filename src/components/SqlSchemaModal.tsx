import React, { useState } from 'react';
import {
  X,
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
  ShieldCheck
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

interface SqlSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
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
}

export const SqlSchemaModal: React.FC<SqlSchemaModalProps> = ({
  isOpen,
  onClose,
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
  bills
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'ddl' | 'dump'>('sync');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([fullSqlDump], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `keluarga_munawar_rois_database_schema_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-sky-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-sky-100/50 to-blue-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                SQL Connect Schema & Sinkronisasi Cloud
                <span className="px-2 py-0.5 text-xs rounded-full bg-sky-200 text-sky-800 font-semibold">
                  Multi-Device Sync
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Penyimpanan Database Terpusat Keluarga Munawar Rois (Suami & Istri)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-6 pt-3 bg-slate-50/50 gap-2">
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'sync'
                ? 'border-sky-600 text-sky-700 font-bold bg-white rounded-t-lg shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Cloud className="w-4 h-4 text-sky-500" />
            Status Sinkronisasi Multi-Perangkat
          </button>

          <button
            onClick={() => setActiveTab('ddl')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'ddl'
                ? 'border-sky-600 text-sky-700 font-bold bg-white rounded-t-lg shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Server className="w-4 h-4 text-sky-500" />
            Skema Relasional DDL (10 Tabel SQL)
          </button>

          <button
            onClick={() => setActiveTab('dump')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'dump'
                ? 'border-sky-600 text-sky-700 font-bold bg-white rounded-t-lg shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4 text-sky-500" />
            Export Live SQL Dump (.sql)
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'sync' && (
            <div className="space-y-6">
              {/* Cloud Status Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-medium backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Status Database: AKTIF & TERSINKRONISASI
                    </div>
                    <h3 className="text-xl font-bold">Cloud Database Sinkronisasi Otomatis</h3>
                    <p className="text-xs text-sky-100 max-w-xl">
                      Setiap pencatatan arus kas, alokasi anggaran, atau perubahan tabungan di satu
                      perangkat langsung tersimpan ke Cloud Database dan disinkronkan ke perangkat
                      lain yang menggunakan akun ini.
                    </p>
                  </div>
                  <button
                    onClick={onManualSync}
                    disabled={isSyncing}
                    className="px-4 py-2.5 rounded-xl bg-white text-sky-700 hover:bg-sky-50 font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start md:self-auto disabled:opacity-75"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
                  </button>
                </div>
              </div>

              {/* Sync Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/40">
                  <span className="text-xs text-slate-500 block mb-1">Akun Google Terhubung</span>
                  <div className="font-semibold text-slate-800 text-xs truncate flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{user ? user.email : 'Belum Login'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/40">
                  <span className="text-xs text-slate-500 block mb-1">Terakhir Disinkronkan</span>
                  <div className="font-semibold text-slate-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <span>
                      {lastSyncedAt
                        ? new Date(lastSyncedAt).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : 'Baru saja'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/40">
                  <span className="text-xs text-slate-500 block mb-1">Perangkat Saat Ini</span>
                  <div className="font-semibold text-slate-800 text-xs flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <span>{navigator.userAgent.includes('Mobile') ? 'Smartphone' : 'Komputer / Laptop'}</span>
                  </div>
                </div>
              </div>

              {/* Multi-Device Architecture Diagram */}
              <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-sky-600" />
                  Alur Sinkronisasi Lintas Perangkat (Multi-Device Workflow)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-center">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                    <Smartphone className="w-8 h-8 text-sky-600 mb-2" />
                    <span className="font-bold text-xs text-slate-700">Perangkat 1 (HP Suami)</span>
                    <span className="text-[11px] text-slate-400 mt-1">Munawar Rois catat pengeluaran</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-2 text-sky-600">
                    <ArrowRight className="w-6 h-6 hidden md:block" />
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full my-1">
                      Cloud Sync Real-time
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                    <Laptop className="w-8 h-8 text-sky-600 mb-2" />
                    <span className="font-bold text-xs text-slate-700">Perangkat 2 (Laptop/HP Istri)</span>
                    <span className="text-[11px] text-slate-400 mt-1">Wini Yusnia langsung melihat update</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-sky-50 border border-sky-100 text-xs text-sky-900 leading-relaxed">
                  💡 <strong>Tip Multi-Perangkat:</strong> Buka tautan aplikasi ini di browser ponsel Anda (Chrome, Safari) dan tekan tombol <strong>"Login Google"</strong>. Semua saldo rekening, catatan utang, pos anggaran belanja harian, dan grafik keuangan Keluarga Munawar Rois akan otomatis tampil sama persis.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ddl' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Struktur Skema DDL Relasional Database (PostgreSQL / SQL Connect)
                  </h4>
                  <p className="text-xs text-slate-500">
                    10 tabel relasional terstruktur dengan Primary Key, Foreign Key, dan Constraint ACID.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(SQL_DDL_SCHEMA)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Tersalin!' : 'Salin DDL SQL'}
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4">
                <pre className="text-xs font-mono text-emerald-400 overflow-x-auto max-h-[380px] leading-relaxed">
                  {SQL_DDL_SCHEMA}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'dump' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Dump Data SQL Aktif (Live Insert Statements)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Berisi skema DDL lengkap beserta perintah INSERT untuk data transaksi dan anggaran terkini.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(fullSqlDump)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Tersalin!' : 'Salin Semua'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh File .sql
                  </button>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4">
                <pre className="text-xs font-mono text-sky-300 overflow-x-auto max-h-[380px] leading-relaxed">
                  {fullSqlDump}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Enkripsi TLS/SSL aman &amp; tersimpan di cloud region Google Cloud Asia-East1</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
