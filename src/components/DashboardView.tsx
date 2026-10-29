import React from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  PiggyBank,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  CreditCard,
  Building2,
  Coffee,
  Heart
} from 'lucide-react';
import {
  Account,
  AssetItem,
  Budget,
  DebtItem,
  EmergencyFund,
  RecurringBill,
  Transaction,
  UserRole
} from '../types/finance';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface DashboardViewProps {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  debts: DebtItem[];
  assets: AssetItem[];
  bills: RecurringBill[];
  emergencyFund: EmergencyFund;
  activeRole: UserRole;
  onNavigateTab: (tab: any) => void;
  onOpenNewTransaction: () => void;
  onPayBill: (billId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  accounts,
  transactions,
  budgets,
  debts,
  assets,
  bills,
  emergencyFund,
  activeRole,
  onNavigateTab,
  onOpenNewTransaction,
  onPayBill,
}) => {
  // Calculations
  const totalLiquidCash = accounts
    .filter((a) => a.type !== 'credit_card')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalAssets = assets.reduce((sum, a) => sum + a.estimatedValue, 0);
  const totalLiabilities = debts.reduce((sum, d) => sum + d.remainingBalance, 0);
  const netWorth = totalAssets - totalLiabilities;

  const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-10"

  const monthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));

  const totalIncomeThisMonth = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenseThisMonth = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashflow = totalIncomeThisMonth - totalExpenseThisMonth;

  const savingsRate =
    totalIncomeThisMonth > 0
      ? Math.max(0, Math.round(((totalIncomeThisMonth - totalExpenseThisMonth) / totalIncomeThisMonth) * 100))
      : 0;

  // Alerts: Budgets >= 80% or >= 100%
  const alertBudgets = budgets.filter((b) => {
    const ratio = (b.spentAmount / (b.allocatedAmount || 1)) * 100;
    return ratio >= 80;
  });

  // Unpaid bills
  const unpaidBills = bills.filter((b) => !b.isPaidThisMonth);

  // Pos Khusus Belanja Harian
  const dailyGroceryPos = budgets.find((b) => b.category.includes('Belanja Harian'));
  const mudikPos = budgets.find((b) => b.category.includes('Mudik') || b.category.includes('Acara'));

  // 50/30/20 rule calculation
  // Needs: Kebutuhan Pokok, Cicilan, Utilitas, Edukasi
  // Wants: Hiburan, Gaya Hidup, Kuliner
  // Savings: Tabungan, Zakat, Investasi
  const needsSpent = monthTransactions
    .filter((t) =>
      ['Kebutuhan Pokok', 'Cicilan', 'Utilitas Rumah', 'Edukasi', 'Kesehatan'].includes(t.category)
    )
    .reduce((s, t) => s + t.amount, 0);

  const wantsSpent = monthTransactions
    .filter((t) => ['Hiburan', 'Gaya Hidup', 'Kuliner'].includes(t.category))
    .reduce((s, t) => s + t.amount, 0);

  const savingsSpent = monthTransactions
    .filter((t) => ['Tabungan', 'Zakat', 'Infaq'].includes(t.category))
    .reduce((s, t) => s + t.amount, 0);

  const targetNeeds = totalIncomeThisMonth * 0.5;
  const targetWants = totalIncomeThisMonth * 0.3;
  const targetSavings = totalIncomeThisMonth * 0.2;

  return (
    <div className="space-y-6">
      {/* 4 MAIN SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Net Worth */}
        <div className="bg-gradient-to-br from-sky-600 via-sky-700 to-cyan-800 text-white rounded-2xl p-5 shadow-lg shadow-sky-600/20 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition duration-500"></div>
          <div className="flex items-center justify-between text-sky-100 text-xs font-semibold mb-2">
            <span>Kekayaan Bersih (Net Worth)</span>
            <Building2 className="w-4 h-4 text-sky-200" />
          </div>
          <div className="text-2xl font-black tracking-tight mb-1">
            {formatRupiah(netWorth)}
          </div>
          <div className="text-[11px] text-sky-200/90 flex items-center justify-between pt-2 border-t border-sky-500/40">
            <span>Aset: {formatRupiah(totalAssets)}</span>
            <span className="text-sky-300">Utang: {formatRupiah(totalLiabilities)}</span>
          </div>
        </div>

        {/* Card 2: Saldo Kas & Bank */}
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Saldo Kas & Bank</span>
            <Wallet className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 tracking-tight mb-1">
            {formatRupiah(totalLiquidCash)}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>{accounts.length} Akun & E-Wallet</span>
            <button
              onClick={() => onNavigateTab('cashflow')}
              className="text-sky-600 hover:text-sky-800 font-bold flex items-center gap-0.5"
            >
              Lihat Akun <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Arus Kas Bulan Ini */}
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Arus Kas Bulan Ini</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                netCashflow >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {netCashflow >= 0 ? 'Surplus' : 'Defisit'}
            </span>
          </div>
          <div className={`text-2xl font-black tracking-tight mb-1 ${netCashflow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatRupiah(netCashflow)}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-emerald-600 font-semibold">+{formatRupiah(totalIncomeThisMonth)}</span>
            <span className="text-rose-500 font-semibold">-{formatRupiah(totalExpenseThisMonth)}</span>
          </div>
        </div>

        {/* Card 4: Rasio Tabungan */}
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Rasio Menabung (Savings Rate)</span>
            <PiggyBank className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-black text-slate-800">{savingsRate}%</span>
            <span className="text-xs font-semibold text-slate-400">/ Target min. 20%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                savingsRate >= 20 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, (savingsRate / 30) * 100)}%` }}
            ></div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span className={savingsRate >= 20 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
              {savingsRate >= 20 ? 'Kondisi Finansial Prima' : 'Tingkatkan Tabungan'}
            </span>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-sky-600 hover:text-sky-800 text-[11px] font-bold"
            >
              Cek Rasio
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE WARNINGS & NOTIFICATIONS (IF ANY) */}
      {(alertBudgets.length > 0 || unpaidBills.length > 0) && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-amber-900 text-sm mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Peringatan Dini Keuangan Keluarga</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {alertBudgets.map((b) => {
              const ratio = Math.round((b.spentAmount / b.allocatedAmount) * 100);
              const isOver = ratio >= 100;
              return (
                <div
                  key={b.id}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isOver ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-amber-100/60 border-amber-300 text-amber-900'
                  }`}
                >
                  <div>
                    <span className="font-bold">{b.category}</span>
                    <div className="text-[11px] opacity-80">
                      Terpakai: {formatRupiah(b.spentAmount)} dari {formatRupiah(b.allocatedAmount)} ({ratio}%)
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      isOver ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                    }`}
                  >
                    {isOver ? 'Overbudget' : 'Waspada 80%'}
                  </span>
                </div>
              );
            })}

            {unpaidBills.slice(0, 2).map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-xl border bg-sky-50 border-sky-200 text-sky-900 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold">{b.name}</span>
                  <div className="text-[11px] opacity-80">
                    Jatuh tempo tgl {b.dueDay} • {formatRupiah(b.amount)}
                  </div>
                </div>
                <button
                  onClick={() => onPayBill(b.id)}
                  className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  Bayar Sekarang
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POS KHUSUS & DAILY ALLOWANCE SPOTLIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pos Belanja Harian Istri */}
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-pink-50 text-pink-600 rounded-xl">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Pos Uang Belanja Harian</h3>
                <p className="text-[11px] text-slate-400">Dikelola Istri (Sayur, Lauk & Operasional)</p>
              </div>
            </div>
            <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full">
              Rp 150rb / hari
            </span>
          </div>

          {dailyGroceryPos && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Terpakai Bulan Ini:</span>
                <span className="text-slate-900 font-bold">{formatRupiah(dailyGroceryPos.spentAmount)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-pink-500 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (dailyGroceryPos.spentAmount / dailyGroceryPos.allocatedAmount) * 100)}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Alokasi: {formatRupiah(dailyGroceryPos.allocatedAmount)}</span>
                <span className="font-bold text-emerald-600">
                  Sisa: {formatRupiah(Math.max(0, dailyGroceryPos.allocatedAmount - dailyGroceryPos.spentAmount))}
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Alokasi Harian Terkendali</span>
            <button
              onClick={() => onNavigateTab('collaboration')}
              className="text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1"
            >
              Atur Kolaborasi <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 50/30/20 Smart Budget Progress */}
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Penerapan Kaidah Anggaran 50/30/20</h3>
              <p className="text-[11px] text-slate-400">
                Keseimbangan Kebutuhan Pokok (50%), Keinginan (30%), dan Tabungan (20%)
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('budget')}
              className="text-xs font-bold text-sky-600 hover:text-sky-800"
            >
              Kelola Anggaran &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Needs */}
            <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-sky-900">50% Kebutuhan (Needs)</span>
                <span className="text-[11px] text-sky-700 font-semibold">
                  {totalIncomeThisMonth > 0 ? Math.round((needsSpent / totalIncomeThisMonth) * 100) : 0}%
                </span>
              </div>
              <div className="text-sm font-extrabold text-slate-800">{formatRupiah(needsSpent)}</div>
              <div className="w-full bg-sky-200/50 rounded-full h-2">
                <div
                  className="bg-sky-600 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, targetNeeds > 0 ? (needsSpent / targetNeeds) * 100 : 0)}%`,
                  }}
                ></div>
              </div>
              <div className="text-[10px] text-slate-500">Maks ideal: {formatRupiah(targetNeeds)}</div>
            </div>

            {/* Wants */}
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-indigo-900">30% Keinginan (Wants)</span>
                <span className="text-[11px] text-indigo-700 font-semibold">
                  {totalIncomeThisMonth > 0 ? Math.round((wantsSpent / totalIncomeThisMonth) * 100) : 0}%
                </span>
              </div>
              <div className="text-sm font-extrabold text-slate-800">{formatRupiah(wantsSpent)}</div>
              <div className="w-full bg-indigo-200/50 rounded-full h-2">
                <div
                  className={`h-full rounded-full ${wantsSpent > targetWants ? 'bg-rose-500' : 'bg-indigo-600'}`}
                  style={{
                    width: `${Math.min(100, targetWants > 0 ? (wantsSpent / targetWants) * 100 : 0)}%`,
                  }}
                ></div>
              </div>
              <div className="text-[10px] text-slate-500">Maks ideal: {formatRupiah(targetWants)}</div>
            </div>

            {/* Savings */}
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-900">20% Tabungan & Utang</span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  {totalIncomeThisMonth > 0 ? Math.round((savingsSpent / totalIncomeThisMonth) * 100) : 0}%
                </span>
              </div>
              <div className="text-sm font-extrabold text-slate-800">{formatRupiah(savingsSpent)}</div>
              <div className="w-full bg-emerald-200/50 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, targetSavings > 0 ? (savingsSpent / targetSavings) * 100 : 0)}%`,
                  }}
                ></div>
              </div>
              <div className="text-[10px] text-slate-500">Target min: {formatRupiah(targetSavings)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: RECENT TRANSACTIONS & BILLS REMINDER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Catatan Arus Kas Terkini</h3>
              <p className="text-[11px] text-slate-400">Pencatatan real-time suami, istri & keluarga</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenNewTransaction}
                className="text-xs font-bold text-sky-600 hover:text-sky-800 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 transition"
              >
                + Tambah
              </button>
              <button
                onClick={() => onNavigateTab('cashflow')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Lihat Semua &rarr;
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 5).map((tx) => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';
              return (
                <div key={tx.id} className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isIncome
                          ? 'bg-emerald-100 text-emerald-700'
                          : isTransfer
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isIncome ? '+' : isTransfer ? '⇄' : '-'}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-800">{tx.description}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-medium text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded">
                          {tx.category}
                        </span>
                        <span>•</span>
                        <span>{formatDateIndo(tx.date)}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-600">
                          {tx.creator === 'Suami' ? '👨 Suami' : tx.creator === 'Istri' ? '👩 Istri' : '🏡 Bersama'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-xs font-extrabold ${
                        isIncome ? 'text-emerald-600' : isTransfer ? 'text-sky-600' : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? '+' : isTransfer ? '' : '-'}{formatRupiah(tx.amount)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tagihan Mendatang & AI Tip */}
        <div className="space-y-5">
          {/* Tagihan Berkala Widget */}
          <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 text-sm">Tagihan Rutin Bulan Ini</h3>
              <button
                onClick={() => onNavigateTab('bills')}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-800"
              >
                Semua Tagihan
              </button>
            </div>
            <div className="space-y-2.5">
              {bills.slice(0, 4).map((bill) => (
                <div
                  key={bill.id}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800">{bill.name}</div>
                    <div className="text-[10px] text-slate-400">
                      Jatuh tempo: Tgl {bill.dueDay} • {formatRupiah(bill.amount)}
                    </div>
                  </div>
                  {bill.isPaidThisMonth ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Lunas
                    </span>
                  ) : (
                    <button
                      onClick={() => onPayBill(bill.id)}
                      className="px-2 py-1 text-[11px] font-bold text-sky-700 bg-sky-100 hover:bg-sky-200 rounded-md transition"
                    >
                      Bayar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Quick Insight Box */}
          <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-4 border border-sky-200 shadow-2xs">
            <div className="flex items-center gap-2 text-sky-800 font-bold text-xs mb-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Saran Asisten Keuangan Keluarga AI</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Arus kas bulan ini surplus <strong>{formatRupiah(netCashflow)}</strong>. Segera sisihkan untuk target
              <strong> Dana Pendidikan Anak</strong> dan simpanan emas Antam sebelum akhir pekan.
            </p>
            <div className="mt-3 pt-2 border-t border-sky-200/60 flex justify-between items-center text-[11px]">
              <span className="text-sky-700 font-semibold">Evaluasi Kebocoran Halus</span>
              <button
                onClick={() => onNavigateTab('ai')}
                className="font-bold text-sky-600 hover:text-sky-800"
              >
                Buka AI &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
