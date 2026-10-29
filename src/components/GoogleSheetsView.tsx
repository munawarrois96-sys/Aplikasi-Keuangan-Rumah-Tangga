import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  ExternalLink,
  Upload,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Shield,
  Layers,
  Sparkles,
  Link2,
  Calendar,
  Check,
  X
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  Account,
  AssetItem,
  Budget,
  DebtItem,
  EmergencyFund,
  HouseholdCollaboration,
  RecurringBill,
  Transaction,
  UserRole
} from '../types/finance';
import {
  createHouseholdSpreadsheet,
  listDriveSpreadsheets,
  readTransactionsFromSpreadsheet,
  appendTransactionToSpreadsheet,
  SpreadsheetInfo,
  ExportDataPayload
} from '../services/googleSheetsService';
import { GoogleSignInButton } from './GoogleSignInButton';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface GoogleSheetsViewProps {
  user: User | null;
  accessToken: string | null;
  authLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  debts: DebtItem[];
  assets: AssetItem[];
  bills: RecurringBill[];
  emergencyFund: EmergencyFund;
  collaboration: HouseholdCollaboration;
  onImportTransactions: (imported: Partial<Transaction>[]) => void;
  activeRole: UserRole;
}

export const GoogleSheetsView: React.FC<GoogleSheetsViewProps> = ({
  user,
  accessToken,
  authLoading,
  onSignIn,
  onSignOut,
  accounts,
  transactions,
  budgets,
  debts,
  assets,
  bills,
  emergencyFund,
  collaboration,
  onImportTransactions,
  activeRole,
}) => {
  const [sheetTitle, setSheetTitle] = useState(() => {
    const month = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    return `Laporan Keuangan Keluarga Munawar Rois - ${month}`;
  });

  const [isExporting, setIsExporting] = useState(false);
  const [lastCreatedSheet, setLastCreatedSheet] = useState<{ id: string; url: string; title: string } | null>(() => {
    const saved = localStorage.getItem('arthakeluarga_active_sheet');
    return saved ? JSON.parse(saved) : null;
  });

  const [driveSheets, setDriveSheets] = useState<SpreadsheetInfo[]>([]);
  const [loadingDriveSheets, setLoadingDriveSheets] = useState(false);

  // Import states
  const [customSheetId, setCustomSheetId] = useState('');
  const [importPreview, setImportPreview] = useState<Partial<Transaction>[] | null>(null);
  const [isReadingSheet, setIsReadingSheet] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Fetch user's spreadsheets from Drive when token is available
  useEffect(() => {
    if (accessToken) {
      loadDriveSheets();
    }
  }, [accessToken]);

  const loadDriveSheets = async () => {
    if (!accessToken) return;
    setLoadingDriveSheets(true);
    try {
      const files = await listDriveSpreadsheets(accessToken);
      setDriveSheets(files);
    } catch (err) {
      console.error('Failed to list spreadsheets:', err);
    } finally {
      setLoadingDriveSheets(false);
    }
  };

  // Handler for Exporting to a New Spreadsheet with explicit confirmation dialog
  const handleExportClick = () => {
    if (!accessToken) {
      alert('Silakan Masuk dengan Google terlebih dahulu untuk mengekspor ke Google Sheets.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Konfirmasi Pembuatan Spreadsheet Baru',
      description: `Apakah Anda yakin ingin membuat Google Spreadsheet baru berjudul "${sheetTitle}" di akun Google Drive Anda (${user?.email})? Seluruh data ringkasan, arus kas (${transactions.length} transaksi), anggaran, dan liabilitas akan disinkronkan secara rapi.`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setIsExporting(true);
        try {
          const currentMonth = new Date().toISOString().slice(0, 7);
          const monthTx = transactions.filter((t) => t.date.startsWith(currentMonth));
          const totalIncome = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
          const totalExpense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
          const totalAssetsVal = assets.reduce((s, a) => s + a.estimatedValue, 0);
          const totalDebtsVal = debts.reduce((s, d) => s + d.remainingBalance, 0);

          const payload: ExportDataPayload = {
            collaboration,
            accounts,
            transactions,
            budgets,
            debts,
            assets,
            bills,
            emergencyFund,
            totalIncome,
            totalExpense,
            netWorth: totalAssetsVal - totalDebtsVal,
          };

          const result = await createHouseholdSpreadsheet(accessToken, sheetTitle, payload);
          const sheetRecord = {
            id: result.spreadsheetId,
            url: result.spreadsheetUrl,
            title: sheetTitle,
          };
          setLastCreatedSheet(sheetRecord);
          localStorage.setItem('arthakeluarga_active_sheet', JSON.stringify(sheetRecord));
          loadDriveSheets();
          alert('Spreadsheet berhasil dibuat dan disinkronkan ke Google Drive!');
        } catch (error: any) {
          console.error(error);
          alert(`Gagal mengekspor data: ${error.message}`);
        } finally {
          setIsExporting(false);
        }
      },
    });
  };

  // Handler for reading and importing transactions
  const handleReadTransactions = async (sheetIdToRead: string) => {
    if (!accessToken) return;
    setIsReadingSheet(true);
    try {
      const rows = await readTransactionsFromSpreadsheet(accessToken, sheetIdToRead);
      setImportPreview(rows);
    } catch (err: any) {
      alert(`Gagal membaca sheet: ${err.message}. Pastikan tab bernama 'Arus Kas Transaksi' ada.`);
    } finally {
      setIsReadingSheet(false);
    }
  };

  const handleConfirmImport = () => {
    if (!importPreview || importPreview.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: 'Konfirmasi Impor Transaksi',
      description: `Apakah Anda yakin ingin mengimpor ${importPreview.length} transaksi dari Google Sheets ke dalam pencatatan aplikasi?`,
      onConfirm: () => {
        onImportTransactions(importPreview);
        setImportPreview(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        alert(`${importPreview.length} transaksi berhasil diimpor!`);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-800">Integrasi Google Sheets Terintegrasi</h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Official Google Workspace API
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sinkronisasi dua arah dengan akun Google Drive & Spreadsheet Keluarga Munawar Rois.
            </p>
          </div>
        </div>

        <div>
          <GoogleSignInButton
            user={user}
            token={accessToken}
            isLoading={authLoading}
            onSignIn={onSignIn}
            onSignOut={onSignOut}
          />
        </div>
      </div>

      {/* NOT AUTHENTICATED STATE BANNER */}
      {!accessToken && (
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-sky-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-base text-slate-800">
              Hubungkan Akun Google untuk Menggunakan Google Sheets
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ekspor seluruh laporan keuangan, neraca aset, dan arus kas secara instan ke spreadsheet Google Drive resmi dengan format tabel rapi.
            </p>
          </div>
          <div className="pt-2">
            <GoogleSignInButton
              user={user}
              token={accessToken}
              isLoading={authLoading}
              onSignIn={onSignIn}
              onSignOut={onSignOut}
            />
          </div>
        </div>
      )}

      {/* AUTHENTICATED WORKSPACE ACTIONS */}
      {accessToken && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* KOLOM KIRI (2 COLS): EKSPOR & SINKRONISASI */}
          <div className="lg:col-span-2 space-y-6">
            {/* CARD 1: EKSPOR SPREADSHEET BARU */}
            <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Ekspor Seluruh Data ke Google Spreadsheet Baru</h3>
                    <p className="text-[11px] text-slate-400">Dibuat otomatis lengkap dengan 6 tab terstruktur</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Spreadsheet di Google Drive
                  </label>
                  <input
                    type="text"
                    value={sheetTitle}
                    onChange={(e) => setSheetTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    placeholder="Judul file spreadsheet..."
                  />
                </div>

                {/* 6 Tabs preview */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <span className="font-bold text-slate-700 text-[11px] block">
                    Tab yang akan otomatis dibuat di Google Sheets:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>1. Ringkasan & Neraca</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>2. Arus Kas Transaksi</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>3. Anggaran 50-30-20</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>4. Utang & Liabilitas</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>5. Aset & Kekayaan</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>6. Pengingat Tagihan</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleExportClick}
                    disabled={isExporting || !sheetTitle.trim()}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FileSpreadsheet className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
                    <span>{isExporting ? 'Sedang Membuat Spreadsheet di Google...' : 'Ekspor ke Google Sheets Sekarang'}</span>
                  </button>
                </div>
              </div>

              {/* Success Result Box */}
              {lastCreatedSheet && (
                <div className="mt-4 p-4 bg-emerald-50/80 border border-emerald-300 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Spreadsheet Terakhir Berhasil Dibuat:</span>
                    </span>
                    <a
                      href={lastCreatedSheet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[11px] hover:bg-emerald-700 transition shadow-2xs"
                    >
                      <span>Buka di Google Sheets</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    File: <strong>{lastCreatedSheet.title}</strong>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono break-all">
                    Link: {lastCreatedSheet.url}
                  </div>
                </div>
              )}
            </div>

            {/* CARD 2: IMPOR TRANSAKSI DARI SPREADSHEET */}
            <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Impor Data Transaksi dari Google Sheet</h3>
                    <p className="text-[11px] text-slate-400">Baca baris transaksi dari tab 'Arus Kas Transaksi'</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSheetId}
                    onChange={(e) => {
                      // Extract id if full url pasted
                      let val = e.target.value.trim();
                      const match = val.match(/\/d\/([a-zA-Z0-9-_]+)/);
                      if (match && match[1]) val = match[1];
                      setCustomSheetId(val);
                    }}
                    placeholder="Masukkan Spreadsheet ID atau paste URL Google Sheet..."
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                  <button
                    onClick={() => handleReadTransactions(customSheetId || lastCreatedSheet?.id || '')}
                    disabled={isReadingSheet || (!customSheetId && !lastCreatedSheet?.id)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shrink-0"
                  >
                    {isReadingSheet ? 'Membaca...' : 'Baca Data'}
                  </button>
                </div>

                {/* Import Preview */}
                {importPreview && (
                  <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-200 space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sky-900">
                        Ditemukan {importPreview.length} baris transaksi valid:
                      </span>
                      <button
                        onClick={handleConfirmImport}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition"
                      >
                        Konfirmasi & Impor ke Aplikasi
                      </button>
                    </div>

                    <div className="max-h-40 overflow-y-auto divide-y divide-sky-100 bg-white rounded-lg p-2 border border-sky-100 text-[11px]">
                      {importPreview.slice(0, 8).map((tx, idx) => (
                        <div key={idx} className="py-1.5 flex justify-between">
                          <span className="text-slate-700">
                            {tx.date} • {tx.description} ({tx.category})
                          </span>
                          <span className="font-bold text-slate-900">
                            {formatRupiah(tx.amount || 0)}
                          </span>
                        </div>
                      ))}
                      {importPreview.length > 8 && (
                        <div className="py-1 text-center text-slate-400 italic">
                          ...dan {importPreview.length - 8} transaksi lainnya
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: DAFTAR SPREADSHEET DI GOOGLE DRIVE */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Spreadsheet di Google Drive Anda</span>
                </div>
                <button
                  onClick={loadDriveSheets}
                  className="p-1 text-slate-400 hover:text-sky-600 rounded transition"
                  title="Segarkan daftar"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingDriveSheets ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loadingDriveSheets ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Memuat berkas dari Drive...
                </div>
              ) : driveSheets.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Belum ada spreadsheet keuangan yang terdeteksi di Drive Anda.
                </div>
              ) : (
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {driveSheets.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 bg-slate-50 hover:bg-sky-50/50 rounded-xl border border-slate-100 transition space-y-2 text-xs"
                    >
                      <div className="font-bold text-slate-800 line-clamp-1">{file.name}</div>
                      <div className="text-[10px] text-slate-400">
                        Diperbarui: {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('id-ID') : '-'}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setCustomSheetId(file.id);
                            handleReadTransactions(file.id);
                          }}
                          className="text-[11px] font-bold text-sky-600 hover:text-sky-800"
                        >
                          Impor Transaksi
                        </button>
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                          >
                            <span>Buka</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Security & Privacy Assurance */}
            <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 text-xs text-sky-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-sky-600" />
                <span>Privasi Data Keluarga Terjamin</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Token otentikasi disimpan di memori per sesi saja (tidak pernah disimpan di penyimpanan lokal/cookies). Akses hanya digunakan saat Anda memilih untuk mengekspor atau membaca spreadsheet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION MODAL BEFORE ANY WORKSPACE WRITE/MUTATION */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-sky-100 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base pb-2 border-b border-slate-100">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <span>{confirmModal.title}</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              {confirmModal.description}
            </p>
            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold rounded-xl shadow-md transition"
              >
                Lanjutkan & Eksekusi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
