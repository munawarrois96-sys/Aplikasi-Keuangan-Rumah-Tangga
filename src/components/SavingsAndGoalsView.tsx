import React, { useState } from 'react';
import {
  ShieldCheck,
  Target,
  TrendingUp,
  Plus,
  Coins,
  GraduationCap,
  Palmtree,
  Home,
  Check,
  Sparkles,
  Layers,
  X
} from 'lucide-react';
import {
  EmergencyFund,
  FinancialGoal,
  InvestmentAsset,
  InvestmentType,
  RiskProfile,
  UserRole
} from '../types/finance';
import { formatRupiah } from '../utils/formatters';

interface SavingsAndGoalsViewProps {
  emergencyFund: EmergencyFund;
  goals: FinancialGoal[];
  investments: InvestmentAsset[];
  totalMonthlyExpense: number;
  onUpdateEmergencyFund: (ef: EmergencyFund) => void;
  onAddGoal: (g: Omit<FinancialGoal, 'id'>) => void;
  onContributeGoal: (id: string, amount: number) => void;
  onAddInvestment: (inv: Omit<InvestmentAsset, 'id'>) => void;
  activeRole: UserRole;
}

export const SavingsAndGoalsView: React.FC<SavingsAndGoalsViewProps> = ({
  emergencyFund,
  goals,
  investments,
  totalMonthlyExpense,
  onUpdateEmergencyFund,
  onAddGoal,
  onContributeGoal,
  onAddInvestment,
  activeRole,
}) => {
  const [subTab, setSubTab] = useState<'emergency' | 'goals' | 'investments'>('emergency');

  // Emergency Fund local controls
  const [riskProfile, setRiskProfile] = useState<RiskProfile>(emergencyFund.riskProfile);
  const [dependents, setDependents] = useState<number>(emergencyFund.dependentsCount);
  const [monthlyExpense, setMonthlyExpense] = useState<number>(
    emergencyFund.monthlyExpenseBaseline || totalMonthlyExpense || 10500000
  );

  // Dynamic target months calculation based on Indonesian financial standard
  // Base:
  // Karyawan Tetap: 3 bln (single) / 6 bln (menikah/1-2 anak) / 9 bln (3+ anak)
  // Karyawan Kontrak: 6 bln (single) / 9 bln (menikah)
  // Pengusaha / Freelancer: 9 bln (single) / 12 bln (menikah/anak)
  const calculateTargetMonths = (r: RiskProfile, dep: number): number => {
    if (r === 'Karyawan Tetap') {
      if (dep === 0) return 3;
      if (dep <= 2) return 6;
      return 9;
    } else if (r === 'Karyawan Kontrak') {
      if (dep === 0) return 6;
      return 9;
    } else {
      // Pengusaha / Freelancer
      if (dep === 0) return 9;
      return 12;
    }
  };

  const currentTargetMonths = calculateTargetMonths(riskProfile, dependents);
  const targetEmergencyFundAmount = monthlyExpense * currentTargetMonths;
  const currentEmergencyFundBalance = emergencyFund.currentBalance;
  const emergencyFundProgressPct = Math.min(
    100,
    Math.round((currentEmergencyFundBalance / (targetEmergencyFundAmount || 1)) * 100)
  );
  const monthsCovered = monthlyExpense > 0 ? (currentEmergencyFundBalance / monthlyExpense).toFixed(1) : '0';

  const handleSaveEmergencyConfig = () => {
    onUpdateEmergencyFund({
      ...emergencyFund,
      riskProfile,
      dependentsCount: dependents,
      monthlyExpenseBaseline: monthlyExpense,
      targetMonths: currentTargetMonths,
    });
    alert('Konfigurasi Dana Darurat Keluarga berhasil diperbarui!');
  };

  const handleTopupEmergencyFund = () => {
    const amountStr = prompt('Masukkan nominal tambahan alokasi Dana Darurat (Rp):', '1000000');
    if (amountStr && !isNaN(Number(amountStr))) {
      onUpdateEmergencyFund({
        ...emergencyFund,
        currentBalance: emergencyFund.currentBalance + Number(amountStr),
      });
    }
  };

  // Goals modal
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState<FinancialGoal['category']>('Pendidikan Anak');
  const [goalTargetAmount, setGoalTargetAmount] = useState<number>(20000000);
  const [goalCurrentAmount, setGoalCurrentAmount] = useState<number>(0);
  const [goalDeadline, setGoalDeadline] = useState('2027-12');
  const [goalContribution, setGoalContribution] = useState<number>(500000);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    onAddGoal({
      title: goalTitle,
      category: goalCategory,
      targetAmount: Number(goalTargetAmount),
      currentAmount: Number(goalCurrentAmount),
      deadline: goalDeadline,
      monthlyContribution: Number(goalContribution),
    });
    setIsAddGoalOpen(false);
    setGoalTitle('');
  };

  // Investment modal
  const [isAddInvOpen, setIsAddInvOpen] = useState(false);
  const [invName, setInvName] = useState('');
  const [invType, setInvType] = useState<InvestmentType>('emas');
  const [invBuyAmount, setInvBuyAmount] = useState<number>(5000000);
  const [invCurrentVal, setInvCurrentVal] = useState<number>(5500000);
  const [invUnits, setInvUnits] = useState<number>(5);
  const [invUnitLabel, setInvUnitLabel] = useState<string>('gram');
  const [invNotes, setInvNotes] = useState<string>('');

  const handleCreateInv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName.trim()) return;
    onAddInvestment({
      name: invName,
      type: invType,
      buyAmount: Number(invBuyAmount),
      currentValuation: Number(invCurrentVal),
      unitsOrGrams: Number(invUnits) || undefined,
      unitLabel: invUnitLabel || undefined,
      lastUpdated: new Date().toISOString().split('T')[0],
      notes: invNotes,
    });
    setIsAddInvOpen(false);
    setInvName('');
  };

  const totalInvBuy = investments.reduce((sum, i) => sum + i.buyAmount, 0);
  const totalInvCurrent = investments.reduce((sum, i) => sum + i.currentValuation, 0);
  const totalInvProfit = totalInvCurrent - totalInvBuy;
  const totalInvProfitPct = totalInvBuy > 0 ? ((totalInvProfit / totalInvBuy) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* HEADER WITH SUBTABS */}
      <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800">Manajemen Tabungan & Tangga Keuangan</h2>
          <p className="text-xs text-slate-400">
            Fondasi dana darurat, pencapaian target masa depan, dan pertumbuhan portofolio investasi keluarga.
          </p>
        </div>

        <div className="flex bg-sky-50 p-1 rounded-xl border border-sky-200 text-xs font-bold">
          <button
            onClick={() => setSubTab('emergency')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'emergency' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-sky-700'
            }`}
          >
            🛡️ Dana Darurat
          </button>
          <button
            onClick={() => setSubTab('goals')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'goals' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-sky-700'
            }`}
          >
            🎯 Target Keuangan ({goals.length})
          </button>
          <button
            onClick={() => setSubTab('investments')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'investments' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-sky-700'
            }`}
          >
            📈 Portofolio Investasi ({investments.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: DANA DARURAT (EMERGENCY FUND CALCULATOR) */}
      {subTab === 'emergency' && (
        <div className="space-y-6">
          {/* Hero Emergency Gauge */}
          <div className="bg-gradient-to-br from-sky-600 via-sky-700 to-cyan-800 text-white rounded-2xl p-6 shadow-lg shadow-sky-600/20 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-sky-500/30 border border-sky-300/30 px-3 py-1 rounded-full text-xs font-semibold text-sky-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Fondasi Pertama Tangga Keuangan Keluarga</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black">
                  Ketersediaan Dana Darurat: {monthsCovered} Bulan Pengeluaran
                </h3>
                <p className="text-xs text-sky-100/80 max-w-xl">
                  Dana darurat berfungsi melindungi keluarga dari risiko mendadak seperti PHK, perbaikan rumah darurat, atau kebutuhan medis darurat tanpa harus berutang.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handleTopupEmergencyFund}
                    className="px-4 py-2 bg-white text-sky-800 hover:bg-sky-50 font-bold text-xs rounded-xl shadow-md transition"
                  >
                    + Setor Tambahan Dana Darurat
                  </button>
                </div>
              </div>

              {/* Progress Box */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 min-w-[260px] text-center">
                <div className="text-xs text-sky-200 font-semibold mb-1">Progres Target Terpenuhi</div>
                <div className="text-3xl font-black text-white">{emergencyFundProgressPct}%</div>
                <div className="w-full bg-white/20 rounded-full h-2.5 my-3 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all"
                    style={{ width: `${emergencyFundProgressPct}%` }}
                  ></div>
                </div>
                <div className="text-xs text-sky-100 flex justify-between">
                  <span>Saat ini: {formatRupiah(currentEmergencyFundBalance)}</span>
                  <span className="font-bold">Target: {formatRupiah(targetEmergencyFundAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Calculator Controls */}
          <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Kalkulator Kebutuhan Dana Darurat Interaktif</h4>
                <p className="text-xs text-slate-400">Sesuaikan profil pekerjaan dan jumlah tanggungan untuk melihat rekomendasi ideal.</p>
              </div>
              <button
                onClick={handleSaveEmergencyConfig}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition"
              >
                Simpan Parameter
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Profil Risiko */}
              <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100 space-y-2">
                <label className="font-bold text-slate-700 block">Profil Risiko Pekerjaan</label>
                <select
                  value={riskProfile}
                  onChange={(e) => setRiskProfile(e.target.value as RiskProfile)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold"
                >
                  <option value="Karyawan Tetap">Karyawan Tetap (Risiko Rendah - Target 3-6x)</option>
                  <option value="Karyawan Kontrak">Karyawan Kontrak (Risiko Sedang - Target 6-9x)</option>
                  <option value="Pengusaha / Freelancer">Pengusaha / Freelancer (Risiko Fluktuatif - Target 9-12x)</option>
                </select>
                <span className="text-[10px] text-slate-400 block">
                  Pekerja lepas membutuhkan cadangan lebih tebal untuk mengantisipasi jeda proyek.
                </span>
              </div>

              {/* Tanggungan */}
              <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100 space-y-2">
                <label className="font-bold text-slate-700 block">Jumlah Tanggungan Keluarga</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={dependents}
                  onChange={(e) => setDependents(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 block">
                  Termasuk anak, orang tua (sandwich generation), atau anggota keluarga yang dinafkahi.
                </span>
              </div>

              {/* Pengeluaran Bulanan Dasar */}
              <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100 space-y-2">
                <label className="font-bold text-slate-700 block">Rata-Rata Pengeluaran Pokok / Bulan</label>
                <input
                  type="number"
                  step="500000"
                  value={monthlyExpense}
                  onChange={(e) => setMonthlyExpense(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 block">
                  Biaya makan dapur, cicilan, utilitas, dan kebutuhan dasar minimal per bulan.
                </span>
              </div>
            </div>

            {/* Rekomendasi Penempatan Instrumen */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>Rekomendasi Penempatan Instrumen Dana Darurat yang Aman & Likuid:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="font-bold text-sky-800">40% Tabungan Bank Terpisah</div>
                  <div className="text-[11px] text-slate-500">Sangat likuid, bisa ditarik lewat ATM kapan saja saat darurat medis tengah malam.</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="font-bold text-indigo-800">40% Reksa Dana Pasar Uang (RDPU)</div>
                  <div className="text-[11px] text-slate-500">Bebas pajak, potensi imbal hasil 4-5% p.a., pencairan 1-2 hari kerja.</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="font-bold text-amber-800">20% Logam Mulia Emas Fisik</div>
                  <div className="text-[11px] text-slate-500">Penyimpan nilai anti-inflasi dan dapat digadaikan dengan cepat jika mendesak.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: TARGET KEUANGAN (FINANCIAL GOALS) */}
      {subTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Daftar Target Keuangan Keluarga (Financial Goals)</h3>
              <p className="text-xs text-slate-400">Rencana terukur untuk pendidikan anak, hari tua, liburan, dan kepemilikan aset.</p>
            </div>
            <button
              onClick={() => setIsAddGoalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Target Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((g) => {
              const progressPct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
              const remaining = g.targetAmount - g.currentAmount;
              const monthsLeft = g.monthlyContribution > 0 ? Math.ceil(remaining / g.monthlyContribution) : 0;

              return (
                <div
                  key={g.id}
                  className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                          {g.category === 'Pendidikan Anak' ? (
                            <GraduationCap className="w-5 h-5" />
                          ) : g.category === 'Liburan Keluarga' ? (
                            <Palmtree className="w-5 h-5" />
                          ) : g.category === 'Beli Aset' ? (
                            <Home className="w-5 h-5" />
                          ) : (
                            <Target className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800">{g.title}</h4>
                          <span className="text-[10px] text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded-full">
                            {g.category}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-sky-700 bg-sky-50 px-2 py-1 rounded-lg">
                        {progressPct}%
                      </span>
                    </div>

                    <div className="space-y-1.5 my-3">
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-sky-600 h-full rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Terkumpul: <strong className="text-slate-800">{formatRupiah(g.currentAmount)}</strong></span>
                        <span>Target: <strong className="text-slate-800">{formatRupiah(g.targetAmount)}</strong></span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Setoran Bulanan:</span>
                        <span className="font-bold text-slate-800">{formatRupiah(g.monthlyContribution)}/bln</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimasi Tercapai:</span>
                        <span className="font-bold text-emerald-600">
                          {remaining <= 0 ? 'Sudah Tercapai! 🎉' : `${monthsLeft} bulan lagi (${g.deadline})`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        const amt = prompt(`Setor dana untuk ${g.title} (Rp):`, g.monthlyContribution.toString());
                        if (amt && !isNaN(Number(amt))) {
                          onContributeGoal(g.id, Number(amt));
                        }
                      }}
                      className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-lg text-xs transition"
                    >
                      + Setor Dana
                    </button>
                    <span className="text-[11px] text-slate-400">Sisa: {formatRupiah(Math.max(0, remaining))}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: PORTOFOLIO INVESTASI */}
      {subTab === 'investments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Portofolio Aset Investasi Keluarga</h3>
              <p className="text-xs text-slate-400">Pencatatan deposito, reksa dana, saham, emas batangan, dan properti produktif.</p>
            </div>
            <button
              onClick={() => setIsAddInvOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Aset Investasi</span>
            </button>
          </div>

          {/* KPI Investasi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-2xs">
              <span className="text-slate-400 font-semibold">Total Modal Beli</span>
              <div className="text-lg font-black text-slate-800">{formatRupiah(totalInvBuy)}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-2xs">
              <span className="text-slate-400 font-semibold">Total Nilai Pasar Sekarang</span>
              <div className="text-lg font-black text-sky-700">{formatRupiah(totalInvCurrent)}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-2xs">
              <span className="text-slate-400 font-semibold">Imbal Hasil / Capital Gain</span>
              <div className={`text-lg font-black ${totalInvProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {totalInvProfit >= 0 ? '+' : ''}{formatRupiah(totalInvProfit)} ({totalInvProfitPct}%)
              </div>
            </div>
          </div>

          {/* Investment list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {investments.map((inv) => {
              const profit = inv.currentValuation - inv.buyAmount;
              const profitPct = inv.buyAmount > 0 ? ((profit / inv.buyAmount) * 100).toFixed(1) : '0';

              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-xl font-bold">
                          {inv.type === 'emas' ? '🪙' : inv.type === 'saham' ? '📊' : inv.type === 'reksadana' ? '📈' : '🏦'}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">{inv.name}</h4>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {inv.type} {inv.unitsOrGrams ? `• ${inv.unitsOrGrams} ${inv.unitLabel || 'unit'}` : ''}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded ${
                          profit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {profit >= 0 ? '+' : ''}{profitPct}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px]">Nilai Taksiran Sekarang:</span>
                        <div className="font-black text-slate-900 text-sm">{formatRupiah(inv.currentValuation)}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Modal Investasi Awal:</span>
                        <div className="font-bold text-slate-600">{formatRupiah(inv.buyAmount)}</div>
                      </div>
                    </div>

                    {inv.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-sky-50/40 p-2 rounded-lg border border-sky-100">
                        {inv.notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
                    <span>Terakhir update: {inv.lastUpdated}</span>
                    <span className="font-semibold text-slate-600">
                      Keuntungan: {formatRupiah(profit)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL CREATE GOAL */}
      {isAddGoalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-sky-100 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">Target Keuangan Baru</h3>
              <button onClick={() => setIsAddGoalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Target</label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="Misal: Dana Kuliah Anak, Beli Rumah Baru..."
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                <select
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="Pendidikan Anak">Pendidikan Anak</option>
                  <option value="Pensiun">Dana Pensiun</option>
                  <option value="Liburan Keluarga">Liburan Keluarga</option>
                  <option value="Beli Aset">Beli Aset (Rumah / Kendaraan)</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Nominal (Rp)</label>
                  <input
                    type="number"
                    value={goalTargetAmount}
                    onChange={(e) => setGoalTargetAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Saldo Awal (Rp)</label>
                  <input
                    type="number"
                    value={goalCurrentAmount}
                    onChange={(e) => setGoalCurrentAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Tenggat (YYYY-MM)</label>
                  <input
                    type="month"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Setoran Bulanan (Rp)</label>
                  <input
                    type="number"
                    value={goalContribution}
                    onChange={(e) => setGoalContribution(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddGoalOpen(false)}
                  className="flex-1 py-2 border rounded-xl font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREATE INVESTMENT */}
      {isAddInvOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-sky-100 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">Catat Aset Investasi Baru</h3>
              <button onClick={() => setIsAddInvOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateInv} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Aset / Produk</label>
                <input
                  type="text"
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  placeholder="Misal: Emas Antam 10gr, Sukuk Ritel SR019, BBCA..."
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Aset</label>
                <select
                  value={invType}
                  onChange={(e) => setInvType(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="emas">Emas / Logam Mulia</option>
                  <option value="reksadana">Reksa Dana</option>
                  <option value="saham">Saham</option>
                  <option value="deposito">Deposito Bank</option>
                  <option value="properti">Properti Produktif</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modal Beli (Rp)</label>
                  <input
                    type="number"
                    value={invBuyAmount}
                    onChange={(e) => setInvBuyAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nilai Sekarang (Rp)</label>
                  <input
                    type="number"
                    value={invCurrentVal}
                    onChange={(e) => setInvCurrentVal(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah Unit / Gram</label>
                  <input
                    type="number"
                    value={invUnits}
                    onChange={(e) => setInvUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Satuan (gram, lot, unit)</label>
                  <input
                    type="text"
                    value={invUnitLabel}
                    onChange={(e) => setInvUnitLabel(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tempat Penyimpanan / Platform</label>
                <input
                  type="text"
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  placeholder="Misal: Aplikasi Bibit, Brankas Rumah, Ajaib Sekuritas..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddInvOpen(false)}
                  className="flex-1 py-2 border rounded-xl font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700"
                >
                  Simpan Portofolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
