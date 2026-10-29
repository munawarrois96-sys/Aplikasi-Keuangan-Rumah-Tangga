import React, { useState } from 'react';
import {
  PieChart,
  AlertTriangle,
  Sparkles,
  Plus,
  TrendingUp,
  ShieldAlert,
  Calendar,
  Heart,
  Sliders,
  CheckCircle2,
  HelpCircle,
  X
} from 'lucide-react';
import { Budget, UserRole } from '../types/finance';
import { formatRupiah } from '../utils/formatters';

interface SmartBudgetingViewProps {
  budgets: Budget[];
  totalIncome: number;
  totalExpense: number;
  onUpdateBudget: (id: string, allocatedAmount: number) => void;
  onAddBudget: (b: Omit<Budget, 'id'>) => void;
  onDeleteBudget: (id: string) => void;
  activeRole: UserRole;
}

export type BudgetMethod = '50_30_20' | 'zero_based' | 'custom';

export const SmartBudgetingView: React.FC<SmartBudgetingViewProps> = ({
  budgets,
  totalIncome,
  totalExpense,
  onUpdateBudget,
  onAddBudget,
  onDeleteBudget,
  activeRole,
}) => {
  const [method, setMethod] = useState<BudgetMethod>('50_30_20');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState<number>(1000000);
  const [newIsSpecial, setNewIsSpecial] = useState(false);
  const [newSpecialNote, setNewSpecialNote] = useState('');
  const [newManagedBy, setNewManagedBy] = useState<UserRole>('Bersama');

  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<any | null>(null);

  // Total allocated vs total income
  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const remainingToZero = totalIncome - totalAllocated;

  const handleFetchAiAdvice = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/budget-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: method === '50_30_20' ? '50/30/20' : method === 'zero_based' ? 'Zero-Based Budgeting' : 'Kategori Mandiri',
          totalIncome: totalIncome || 15000000,
          totalExpense,
          familyMembers: 3,
        }),
      });
      const data = await res.json();
      setAiAdvice(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim() || newAmount <= 0) return;

    onAddBudget({
      category: newCategory,
      allocatedAmount: Number(newAmount),
      spentAmount: 0,
      isSpecialPos: newIsSpecial,
      specialNote: newSpecialNote || undefined,
      managedBy: newManagedBy,
    });

    setIsAddOpen(false);
    setNewCategory('');
    setNewAmount(1000000);
    setNewIsSpecial(false);
    setNewSpecialNote('');
  };

  // 80% and 100% alerts
  const warningList = budgets.filter((b) => {
    const ratio = (b.spentAmount / (b.allocatedAmount || 1)) * 100;
    return ratio >= 80;
  });

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-800">Penganggaran Smart (Smart Budgeting)</h2>
            <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200">
              Peringatan Dini 80% & 100%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Terapkan metode 50/30/20, Zero-Based Budgeting, atau alokasi pos khusus acara keluarga.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Method selector */}
          <div className="flex bg-sky-50 p-1 rounded-xl border border-sky-200 text-xs font-bold">
            <button
              onClick={() => setMethod('50_30_20')}
              className={`px-3 py-1.5 rounded-lg transition ${
                method === '50_30_20' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              Metode 50/30/20
            </button>
            <button
              onClick={() => setMethod('zero_based')}
              className={`px-3 py-1.5 rounded-lg transition ${
                method === 'zero_based' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              Zero-Based (ZBB)
            </button>
            <button
              onClick={() => setMethod('custom')}
              className={`px-3 py-1.5 rounded-lg transition ${
                method === 'custom' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              Kategori Mandiri
            </button>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Pos Anggaran</span>
          </button>
        </div>
      </div>

      {/* METHOD OVERVIEW BANNER */}
      {method === '50_30_20' && (
        <div className="bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 border border-sky-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-sky-900 text-xs flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              <span>Panduan Metode 50/30/20 untuk Pendapatan Bulan Ini ({formatRupiah(totalIncome)})</span>
            </div>
            <button
              onClick={handleFetchAiAdvice}
              disabled={aiLoading}
              className="text-xs font-bold text-sky-700 bg-white hover:bg-sky-100 px-3 py-1 rounded-lg border border-sky-300 transition flex items-center gap-1 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>{aiLoading ? 'Menganalisis...' : 'Minta Rekomendasi AI'}</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/80 p-3 rounded-xl border border-sky-100">
              <div className="font-bold text-sky-800">50% Kebutuhan Pokok (Needs)</div>
              <div className="text-sm font-black text-slate-800">{formatRupiah(totalIncome * 0.5)}</div>
              <div className="text-[10px] text-slate-500 mt-1">Dapur, utilitas, cicilan, SPP & kesehatan</div>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-sky-100">
              <div className="font-bold text-indigo-800">30% Keinginan (Wants)</div>
              <div className="text-sm font-black text-slate-800">{formatRupiah(totalIncome * 0.3)}</div>
              <div className="text-[10px] text-slate-500 mt-1">Kuliner, liburan, hobi & gaya hidup</div>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-sky-100">
              <div className="font-bold text-emerald-800">20% Tabungan & Masa Depan</div>
              <div className="text-sm font-black text-slate-800">{formatRupiah(totalIncome * 0.2)}</div>
              <div className="text-[10px] text-slate-500 mt-1">Dana darurat, emas, investasi & pelunasan utang</div>
            </div>
          </div>
        </div>
      )}

      {method === 'zero_based' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-amber-900 text-xs">Prinsip Zero-Based Budgeting (ZBB)</div>
              <p className="text-xs text-amber-800/80">
                Setiap rupiah pendapatan keluarga harus memiliki tugas yang jelas hingga sisa alokasi = Rp 0.
              </p>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-semibold text-slate-500">Sisa Belum Dialokasikan:</div>
              <div
                className={`text-base font-black ${
                  remainingToZero === 0
                    ? 'text-emerald-600'
                    : remainingToZero > 0
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {formatRupiah(remainingToZero)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI ADVICE RESULT IF TRIGGERED */}
      {aiAdvice && (
        <div className="bg-white border-2 border-sky-400/80 rounded-2xl p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-sky-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Rekomendasi AI Anggaran Keluarga ({aiAdvice.methodName})</span>
            </span>
            <button onClick={() => setAiAdvice(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            {aiAdvice.recommendations?.map((r: any, idx: number) => (
              <div key={idx} className="bg-sky-50/50 p-2.5 rounded-xl border border-sky-100">
                <div className="font-bold text-slate-800">{r.category}</div>
                <div className="text-sky-700 font-extrabold">{r.idealPercentage}% • {formatRupiah(r.idealAmount || (totalIncome * r.idealPercentage) / 100)}</div>
                <div className="text-[10px] text-slate-500 mt-1">{r.notes}</div>
              </div>
            ))}
          </div>
          {aiAdvice.familyAdvice && (
            <div className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              💬 "{aiAdvice.familyAdvice}"
            </div>
          )}
        </div>
      )}

      {/* WARNING NOTIFICATION PILL */}
      {warningList.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs space-y-2">
          <div className="font-bold text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Peringatan Dini: {warningList.length} Pos Pengeluaran Mendekati / Melebihi Batas!</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {warningList.map((b) => {
              const ratio = Math.round((b.spentAmount / b.allocatedAmount) * 100);
              const isOver = ratio >= 100;
              return (
                <div
                  key={b.id}
                  className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-2 ${
                    isOver ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  <span>{b.category}</span>
                  <span className="text-[11px] underline">({ratio}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BUDGET CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((b) => {
          const ratio = Math.round((b.spentAmount / (b.allocatedAmount || 1)) * 100);
          const isDanger = ratio >= 100;
          const isWarning = ratio >= 80 && ratio < 100;
          const remaining = b.allocatedAmount - b.spentAmount;

          return (
            <div
              key={b.id}
              className={`bg-white rounded-2xl p-5 border shadow-sm transition hover:shadow-md relative overflow-hidden ${
                isDanger
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : isWarning
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : 'border-sky-100'
              }`}
            >
              {/* Badge alert */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-xs text-slate-800">{b.category}</h3>
                    {b.isSpecialPos && (
                      <span className="bg-pink-100 text-pink-700 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                        Pos Khusus
                      </span>
                    )}
                  </div>
                  {b.specialNote && (
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{b.specialNote}</p>
                  )}
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    isDanger
                      ? 'bg-rose-600 text-white'
                      : isWarning
                      ? 'bg-amber-500 text-white'
                      : 'bg-sky-100 text-sky-800'
                  }`}
                >
                  {isDanger ? '100% OVER' : isWarning ? '80% WASPADA' : `${ratio}%`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="my-3 space-y-1">
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-sky-500'
                    }`}
                    style={{ width: `${Math.min(100, ratio)}%` }}
                  ></div>
                </div>
              </div>

              {/* Numbers */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Realisasi Terpakai:</span>
                  <span className="font-extrabold text-slate-800">{formatRupiah(b.spentAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Plafon Anggaran:</span>
                  <span className="font-bold text-slate-700">{formatRupiah(b.allocatedAmount)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-400">Sisa Kuota:</span>
                  <span
                    className={`font-black ${
                      remaining < 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {remaining < 0 ? `-${formatRupiah(Math.abs(remaining))}` : formatRupiah(remaining)}
                  </span>
                </div>
              </div>

              {/* Footer controls */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  Dikelola: <strong className="text-slate-600">{b.managedBy || 'Bersama'}</strong>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newPlafon = prompt(`Ubah batas anggaran untuk ${b.category}:`, b.allocatedAmount.toString());
                      if (newPlafon !== null && !isNaN(Number(newPlafon))) {
                        onUpdateBudget(b.id, Number(newPlafon));
                      }
                    }}
                    className="text-sky-600 hover:text-sky-800 font-bold"
                  >
                    Edit Batas
                  </button>
                  <button
                    onClick={() => onDeleteBudget(b.id)}
                    className="text-slate-300 hover:text-rose-600 font-bold"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL TAMBAH POS ANGGARAN BARU */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-sky-100 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">Tambah Pos Anggaran Baru</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pos / Kategori</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Misal: Pos Belanja Dapur, Les Berenang Anak, Renovasi..."
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Batas Plafon Bulanan (Rp)</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Penanggung Jawab Pos</label>
                <select
                  value={newManagedBy}
                  onChange={(e) => setNewManagedBy(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                >
                  <option value="Bersama">🏡 Bersama</option>
                  <option value="Suami">👨 Suami (Rian)</option>
                  <option value="Istri">👩 Istri (Siti)</option>
                </select>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsSpecial}
                    onChange={(e) => setNewIsSpecial(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600"
                  />
                  <span className="font-bold text-slate-700">Tandai sebagai Pos Khusus Keluarga</span>
                </label>
              </div>

              {newIsSpecial && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catatan Acara / Pos Khusus</label>
                  <input
                    type="text"
                    value={newSpecialNote}
                    onChange={(e) => setNewSpecialNote(e.target.value)}
                    placeholder="Contoh: Tiket mudik lebaran, hampers, belanja harian..."
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2 rounded-xl border text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700"
                >
                  Simpan Pos Anggaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
