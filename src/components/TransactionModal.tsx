import React, { useState } from 'react';
import { X, Check, ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { Account, Transaction, TransactionType, UserRole } from '../types/finance';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>) => void;
  accounts: Account[];
  activeRole: UserRole;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accounts,
  activeRole,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<string>('Kebutuhan Pokok');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState<string>(accounts[1]?.id || '');
  const [description, setDescription] = useState<string>('');
  const [creator, setCreator] = useState<UserRole>(activeRole === 'Bersama' ? 'Suami' : activeRole);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const incomeCategories = [
    'Gaji Pokok',
    'Bonus & THR',
    'Hasil Usaha',
    'Pendapatan Pasif',
    'Pendapatan Tidak Terduga',
    'Lainnya',
  ];

  const expenseCategories = [
    'Kebutuhan Pokok',
    'Cicilan',
    'Tabungan',
    'Edukasi',
    'Hiburan',
    'Sosial',
    'Zakat',
    'Infaq',
    'Utilitas Rumah',
    'Kesehatan',
    'Belanja Harian',
    'Lainnya',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Mohon masukkan nominal transaksi yang valid.');
      return;
    }
    if (!description.trim()) {
      alert('Mohon isi keterangan transaksi.');
      return;
    }

    onSave({
      date,
      type,
      amount,
      category: type === 'transfer' ? 'Transfer Antar Rekening' : category,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      description,
      creator,
      isRecurring,
    });

    onClose();
  };

  const addQuickAmount = (val: number) => {
    setAmount((prev) => prev + val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-sky-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-cyan-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base md:text-lg">Catat Transaksi Keuangan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-sky-700/60 transition text-sky-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-3 gap-2 bg-sky-50 p-1.5 rounded-xl border border-sky-100">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('Kebutuhan Pokok');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Gaji Pokok');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Pendapatan</span>
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition ${
                type === 'transfer'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-sky-600'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Transfer</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nominal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                Rp
              </span>
              <input
                type="number"
                min="0"
                step="500"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                required
              />
            </div>
            {/* Quick amount chips */}
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 text-[11px]">
              {[50000, 100000, 250000, 500000, 1000000].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => addQuickAmount(chip)}
                  className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold rounded-lg border border-sky-200 transition shrink-0"
                >
                  +{chip.toLocaleString('id-ID')}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount(0)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px]"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {type !== 'transfer' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
                >
                  {(type === 'income' ? incomeCategories : expenseCategories).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ke Rekening Tujuan
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
                >
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Transaksi
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Account Source */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {type === 'transfer' ? 'Dari Rekening Sumber' : 'Rekening / Sumber Dana'}
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} (Saldo: Rp {a.balance.toLocaleString('id-ID')})
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Keterangan Transaksi
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Belanja beras & minyak, Bayar listrik, Gaji bulanan..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
              required
            />
          </div>

          {/* Creator & Options */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Dicatat oleh:</span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
                {(['Suami', 'Istri', 'Bersama'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setCreator(r)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                      creator === r
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
              />
              <span>Rutin Tiap Bulan</span>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 shadow-md shadow-sky-500/20 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Transaksi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
