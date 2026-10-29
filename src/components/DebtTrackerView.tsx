import React, { useState } from 'react';
import {
  CreditCard,
  TrendingDown,
  Layers,
  Calendar,
  AlertCircle,
  Plus,
  CheckCircle2,
  HelpCircle,
  Zap,
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { DebtItem, UserRole } from '../types/finance';
import { formatRupiah } from '../utils/formatters';

interface DebtTrackerViewProps {
  debts: DebtItem[];
  totalMonthlyIncome: number;
  onAddDebt: (d: Omit<DebtItem, 'id'>) => void;
  onPayInstallment: (id: string, amount: number) => void;
  onDeleteDebt: (id: string) => void;
  activeRole: UserRole;
}

export type RepaymentStrategy = 'snowball' | 'avalanche';

export const DebtTrackerView: React.FC<DebtTrackerViewProps> = ({
  debts,
  totalMonthlyIncome,
  onAddDebt,
  onPayInstallment,
  onDeleteDebt,
  activeRole,
}) => {
  const [strategy, setStrategy] = useState<RepaymentStrategy>('snowball');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [lender, setLender] = useState('');
  const [type, setType] = useState<DebtItem['type']>('kpr');
  const [remainingBalance, setRemainingBalance] = useState<number>(10000000);
  const [interestRate, setInterestRate] = useState<number>(9.5);
  const [minimumPayment, setMinimumPayment] = useState<number>(1000000);
  const [dueDateDay, setDueDateDay] = useState<number>(25);

  const totalDebtBalance = debts.reduce((sum, d) => sum + d.remainingBalance, 0);
  const totalMonthlyCommitment = debts.reduce((sum, d) => sum + d.minimumPaymentMonthly, 0);

  // Debt Service Ratio (DSR): total cicilan / total pemasukan
  const dsrPct = totalMonthlyIncome > 0 ? Math.round((totalMonthlyCommitment / totalMonthlyIncome) * 100) : 0;
  const isDsrSafe = dsrPct <= 30;

  // Sorting based on Strategy
  // Snowball: Sort by remainingBalance ASC (smallest debt first for quick psychological win)
  // Avalanche: Sort by interestRatePctAnnual DESC (highest interest rate first for math efficiency)
  const sortedDebts = [...debts].sort((a, b) => {
    if (strategy === 'snowball') {
      return a.remainingBalance - b.remainingBalance;
    } else {
      return b.interestRatePctAnnual - a.interestRatePctAnnual;
    }
  });

  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddDebt({
      name,
      lender: lender || 'Lembaga Keuangan',
      type,
      initialAmount: remainingBalance,
      remainingBalance,
      interestRatePctAnnual: interestRate,
      minimumPaymentMonthly: minimumPayment,
      dueDateDay,
    });

    setIsAddOpen(false);
    setName('');
    setLender('');
  };

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-800">Pelacakan Utang & Liabilitas Rumah Tangga</h2>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                isDsrSafe
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              DSR: {dsrPct}% ({isDsrSafe ? 'Aman ≤ 30%' : 'Waspada > 30%'})
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola cicilan KPR, kendaraan, kartu kredit, dan jalankan simulasi pelunasan cerdas Snowball vs Avalanche.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Liabilitas</span>
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs">
          <span className="text-xs font-bold text-slate-400">Total Sisa Pokok Utang</span>
          <div className="text-xl font-black text-slate-900 mt-1">{formatRupiah(totalDebtBalance)}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Dari {debts.length} kontrak kewajiban</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs">
          <span className="text-xs font-bold text-slate-400">Total Cicilan Wajib / Bulan</span>
          <div className="text-xl font-black text-slate-900 mt-1">{formatRupiah(totalMonthlyCommitment)}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Batas wajar maks: {formatRupiah(totalMonthlyIncome * 0.3)}</span>
        </div>

        <div className={`p-5 rounded-2xl border shadow-xs ${isDsrSafe ? 'bg-sky-50/60 border-sky-200' : 'bg-rose-50/60 border-rose-200'}`}>
          <div className="flex justify-between items-center text-xs font-bold">
            <span className={isDsrSafe ? 'text-sky-900' : 'text-rose-900'}>Debt Service Ratio (DSR)</span>
            <span className={isDsrSafe ? 'text-sky-700' : 'text-rose-700'}>{dsrPct}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 my-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${isDsrSafe ? 'bg-sky-600' : 'bg-rose-600'}`}
              style={{ width: `${Math.min(100, (dsrPct / 40) * 100)}%` }}
            ></div>
          </div>
          <div className="text-[11px] text-slate-600">
            {isDsrSafe
              ? '✅ Rasio cicilan keluarga berada dalam rentang sehat di bawah 30% pendapatan.'
              : '⚠️ Rasio cicilan melampaui batas aman. Prioritaskan percepatan pelunasan utang.'}
          </div>
        </div>
      </div>

      {/* STRATEGY SIMULATION BANNER */}
      <div className="bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 border border-sky-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-bold text-sky-900 text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-sky-600" />
              <span>Simulasi Strategi Pelunasan Utang Keluarga</span>
            </div>
            <p className="text-xs text-sky-800/80 mt-0.5">
              Pilih strategi pelunasan terbaik untuk mempercepat kebebasan finansial keluarga.
            </p>
          </div>

          <div className="flex bg-white p-1 rounded-xl border border-sky-200 text-xs font-bold shadow-2xs">
            <button
              onClick={() => setStrategy('snowball')}
              className={`px-3 py-1.5 rounded-lg transition ${
                strategy === 'snowball' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              ❄️ Metode Snowball (Saldo Terkecil Dulu)
            </button>
            <button
              onClick={() => setStrategy('avalanche')}
              className={`px-3 py-1.5 rounded-lg transition ${
                strategy === 'avalanche' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              🏔️ Metode Avalanche (Bunga Tertinggi Dulu)
            </button>
          </div>
        </div>

        {/* Strategy comparison description */}
        <div className="bg-white/90 p-4 rounded-xl border border-sky-100 text-xs space-y-2">
          {strategy === 'snowball' ? (
            <div>
              <span className="font-extrabold text-sky-800 block mb-1">
                Kenapa Memilih Metode Snowball? (Kemenangan Psikologis & Cepat):
              </span>
              <p className="text-slate-600 leading-relaxed">
                Anda membayar cicilan minimum di semua utang, lalu mengerahkan setiap sisa uang berlebih untuk melunasi
                <strong> utang dengan nominal terkecil lebih dahulu</strong>. Setelah satu pos lunas, beban mental berkurang drastis dan alokasi dananya digulung (efek bola salju) untuk melunasi utang berikutnya.
              </p>
            </div>
          ) : (
            <div>
              <span className="font-extrabold text-sky-800 block mb-1">
                Kenapa Memilih Metode Avalanche? (Efisiensi Matematis Terhemat):
              </span>
              <p className="text-slate-600 leading-relaxed">
                Anda memprioritaskan utang dengan
                <strong> suku bunga/margin persentase tertinggi lebih dahulu</strong> (misal Kartu Kredit 21% p.a.). Strategi ini secara matematis menghemat paling banyak uang dari biaya bunga compounding.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PRIORITIZED DEBTS LIST */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-sm">
          Urutan Prioritas Pelunasan ({strategy === 'snowball' ? 'Snowball: Terkecil ke Terbesar' : 'Avalanche: Bunga Tertinggi'})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedDebts.map((debt, index) => {
            const isTopPriority = index === 0;

            return (
              <div
                key={debt.id}
                className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between relative overflow-hidden transition ${
                  isTopPriority
                    ? 'border-sky-400 ring-2 ring-sky-200'
                    : 'border-slate-200'
                }`}
              >
                {isTopPriority && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-sky-600 to-cyan-500 text-white text-[10px] font-black px-3 py-0.5 rounded-bl-xl shadow-xs">
                    PRIORITAS #1 PELUNASAN
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 text-xs font-black flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{debt.name}</h4>
                      <span className="text-[10px] text-slate-400">{debt.lender}</span>
                    </div>
                  </div>

                  <div className="my-3 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Sisa Saldo Pokok</span>
                    <div className="text-lg font-black text-slate-900">{formatRupiah(debt.remainingBalance)}</div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Cicilan Bulanan:</span>
                      <span className="font-bold text-slate-800">{formatRupiah(debt.minimumPaymentMonthly)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Suku Bunga / Margin:</span>
                      <span className="font-extrabold text-amber-600">{debt.interestRatePctAnnual}% p.a.</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Jatuh Tempo:</span>
                      <span className="font-semibold text-slate-700">Tgl {debt.dueDateDay} tiap bulan</span>
                    </div>
                    {debt.tenorRemainingMonths && (
                      <div className="flex justify-between text-slate-600">
                        <span>Sisa Tenor:</span>
                        <span className="font-semibold text-sky-700">{debt.tenorRemainingMonths} bulan lagi</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const pay = prompt(`Catat pelunasan cicilan untuk ${debt.name} (Rp):`, debt.minimumPaymentMonthly.toString());
                      if (pay && !isNaN(Number(pay))) {
                        onPayInstallment(debt.id, Number(pay));
                      }
                    }}
                    className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-bold transition"
                  >
                    + Bayar Cicilan
                  </button>
                  <button
                    onClick={() => onDeleteDebt(debt.id)}
                    className="text-[11px] text-slate-300 hover:text-rose-600 font-semibold"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL TAMBAH UTANG */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-sky-100 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">Catat Liabilitas / Utang Baru</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDebt} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kewajiban</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: KPR BTN Griya Asri, Cicilan Mobil, Kartu Kredit..."
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kreditur / Bank Pemberi Pinjaman</label>
                <input
                  type="text"
                  value={lender}
                  onChange={(e) => setLender(e.target.value)}
                  placeholder="Misal: Bank BTN Syariah, BCA Finance, Mandiri..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sisa Pokok Utang (Rp)</label>
                  <input
                    type="number"
                    value={remainingBalance}
                    onChange={(e) => setRemainingBalance(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cicilan Bulanan (Rp)</label>
                  <input
                    type="number"
                    value={minimumPayment}
                    onChange={(e) => setMinimumPayment(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bunga Tahunan (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Jatuh Tempo (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDateDay}
                    onChange={(e) => setDueDateDay(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2 border rounded-xl font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700"
                >
                  Simpan Liabilitas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
