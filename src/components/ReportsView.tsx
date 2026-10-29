import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Users
} from 'lucide-react';
import {
  Account,
  AssetItem,
  Budget,
  DebtItem,
  EmergencyFund,
  HouseholdCollaboration,
  Transaction,
  UserRole
} from '../types/finance';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface ReportsViewProps {
  transactions: Transaction[];
  budgets: Budget[];
  accounts: Account[];
  debts: DebtItem[];
  assets: AssetItem[];
  emergencyFund: EmergencyFund;
  collaboration: HouseholdCollaboration;
  activeRole: UserRole;
  onOpenGoogleSheets?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  budgets,
  accounts,
  debts,
  assets,
  emergencyFund,
  collaboration,
  activeRole,
  onOpenGoogleSheets,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-10');

  // Filter transactions for selected month
  const periodTransactions = transactions.filter((t) => t.date.startsWith(selectedPeriod));

  const totalIncome = periodTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = periodTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const netCashflow = totalIncome - totalExpense;

  // Breakdown by category
  const expenseByCategory: Record<string, number> = {};
  periodTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });

  // Assets & Debts
  const totalAssets = assets.reduce((s, a) => s + a.estimatedValue, 0);
  const totalLiabilities = debts.reduce((s, d) => s + d.remainingBalance, 0);
  const netWorth = totalAssets - totalLiabilities;
  const totalInstallmentMonthly = debts.reduce((s, d) => s + d.minimumPaymentMonthly, 0);

  // 4 Financial Health Ratios:
  // 1. Savings Ratio: (Income - Expense) / Income >= 20%
  const savingsRatio = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
  // 2. Debt Service Ratio (DSR): Total Cicilan / Income <= 30%
  const dsrRatio = totalIncome > 0 ? Math.round((totalInstallmentMonthly / totalIncome) * 100) : 0;
  // 3. Liquidity Ratio: Emergency Fund / Monthly Expense >= 6 months
  const monthlyExpBaseline = emergencyFund.monthlyExpenseBaseline || 10500000;
  const liquidityMonths = (emergencyFund.currentBalance / (monthlyExpBaseline || 1)).toFixed(1);
  // 4. Solvency Ratio: Net Worth / Total Assets >= 50%
  const solvencyRatio = totalAssets > 0 ? Math.round((netWorth / totalAssets) * 100) : 0;

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Nominal (IDR)', 'Pencatat'];
    const rows = periodTransactions.map((t) => [
      t.id,
      t.date,
      t.type,
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      t.creator,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Keuangan_Keluarga_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-lg font-black text-slate-800">Laporan & Analisis Kesehatan Keuangan</h2>
          <p className="text-xs text-slate-400">
            Audit komprehensif arus kas, rasio kesehatan finansial keluarga, ekspor CSV, dan cetak dokumen resmi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="2026-10">Oktober 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">Agustus 2026</option>
            </select>
          </div>

          {onOpenGoogleSheets && (
            <button
              onClick={onOpenGoogleSheets}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor ke Google Sheets</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV / Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan Resmi</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE / OFFICIAL REPORT WRAPPER */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-6 card-print">
        {/* Formal Report Header */}
        <div className="border-b-2 border-sky-600 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-sky-700">
              Laporan Keuangan Rumah Tangga Terintegrasi
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {collaboration.familyName || 'Keluarga Munawar Rois'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Periode: <strong>{selectedPeriod}</strong> • Penanggung Jawab: {collaboration.husbandName} & {collaboration.wifeName}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
              Status: Terverifikasi & Sinkron
            </span>
            <div className="text-[10px] text-slate-400 mt-1">
              Dicetak pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
            </div>
          </div>
        </div>

        {/* 4 FINANCIAL HEALTH RATIOS ASSESSMENT */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Audit Rasio Kesehatan Finansial Keluarga (Financial Health Checkup)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* 1. Tabungan */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="text-slate-500 font-semibold text-[11px]">1. Rasio Tabungan & Investasi</div>
              <div className="text-xl font-black text-slate-900">{savingsRatio}%</div>
              <div className="flex items-center gap-1 font-bold text-[11px]">
                {savingsRatio >= 20 ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sehat (Target ≥ 20%)
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Di Bawah Target
                  </span>
                )}
              </div>
            </div>

            {/* 2. DSR */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="text-slate-500 font-semibold text-[11px]">2. Rasio Cicilan Utang (DSR)</div>
              <div className="text-xl font-black text-slate-900">{dsrRatio}%</div>
              <div className="flex items-center gap-1 font-bold text-[11px]">
                {dsrRatio <= 30 ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aman (Target ≤ 30%)
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Berisiko Tinggi
                  </span>
                )}
              </div>
            </div>

            {/* 3. Likuiditas Dana Darurat */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="text-slate-500 font-semibold text-[11px]">3. Kesiapan Dana Darurat</div>
              <div className="text-xl font-black text-slate-900">{liquidityMonths} Bulan</div>
              <div className="flex items-center gap-1 font-bold text-[11px]">
                {Number(liquidityMonths) >= 6 ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Kokoh (Target ≥ 6 bln)
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Perlu Tambahan
                  </span>
                )}
              </div>
            </div>

            {/* 4. Solvabilitas */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="text-slate-500 font-semibold text-[11px]">4. Solvabilitas Kekayaan Bersih</div>
              <div className="text-xl font-black text-slate-900">{solvencyRatio}%</div>
              <div className="flex items-center gap-1 font-bold text-[11px]">
                {solvencyRatio >= 50 ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Kuat (Target ≥ 50%)
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Utang Dominan
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RINGKASAN ARUS KAS (INCOME VS EXPENSE) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <span className="text-emerald-800 font-semibold">Total Pendapatan Periode Ini</span>
            <div className="text-xl font-black text-emerald-900 mt-1">+{formatRupiah(totalIncome)}</div>
          </div>
          <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200">
            <span className="text-rose-800 font-semibold">Total Pengeluaran Periode Ini</span>
            <div className="text-xl font-black text-rose-900 mt-1">-{formatRupiah(totalExpense)}</div>
          </div>
          <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-200">
            <span className="text-sky-800 font-semibold">Surplus Kas Bersih Terkumpul</span>
            <div className="text-xl font-black text-sky-900 mt-1">{formatRupiah(netCashflow)}</div>
          </div>
        </div>

        {/* BREAKDOWN PENGELUARAN PER KATEGORI */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-2">Rincian Pengeluaran Berdasarkan Kategori</h3>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-2 font-bold text-slate-700 flex justify-between">
              <span>Kategori Pengeluaran</span>
              <span>Realisasi Nominal (% Total)</span>
            </div>
            {Object.entries(expenseByCategory).map(([cat, amount]) => {
              const pct = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
              return (
                <div key={cat} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    <span className="font-semibold text-slate-800">{cat}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900">{formatRupiah(amount)}</span>
                    <span className="text-slate-400 text-[11px] ml-2">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* NERACA RINGKAS ASET & LIABILITAS */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="font-bold text-slate-800">Posisi Neraca Kekayaan Bersih (Net Worth):</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <span className="text-slate-500 text-[11px]">Total Seluruh Aset:</span>
              <div className="font-bold text-emerald-700">{formatRupiah(totalAssets)}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Total Seluruh Liabilitas:</span>
              <div className="font-bold text-rose-600">{formatRupiah(totalLiabilities)}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Kekayaan Bersih Akhir:</span>
              <div className="font-black text-sky-800">{formatRupiah(netWorth)}</div>
            </div>
          </div>
        </div>

        {/* SIGNATURE / COMMITMENT BLOCK (KHUSUS CETAK & RESMI) */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="text-slate-500 mb-12">Menyetujui & Memverifikasi,</div>
            <div className="font-bold text-slate-800 underline">{collaboration.husbandName}</div>
            <div className="text-[11px] text-slate-400">Kepala Keluarga / Suami</div>
          </div>
          <div>
            <div className="text-slate-500 mb-12">Menyetujui & Memverifikasi,</div>
            <div className="font-bold text-slate-800 underline">{collaboration.wifeName}</div>
            <div className="text-[11px] text-slate-400">Pengelola Keuangan / Istri</div>
          </div>
        </div>
      </div>
    </div>
  );
};
