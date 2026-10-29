import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Filter,
  Trash2,
  Wallet,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
  TrendingUp,
  TrendingDown,
  Check,
  X
} from 'lucide-react';
import { Account, AccountType, Transaction, TransactionType, UserRole } from '../types/finance';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface CashflowViewProps {
  accounts: Account[];
  transactions: Transaction[];
  onAddTransaction: () => void;
  onDeleteTransaction: (id: string) => void;
  onAddAccount: (acc: Omit<Account, 'id'>) => void;
  onUpdateAccountBalance: (id: string, newBalance: number) => void;
  activeRole: UserRole;
}

export const CashflowView: React.FC<CashflowViewProps> = ({
  accounts,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onAddAccount,
  onUpdateAccountBalance,
  activeRole,
}) => {
  const [subTab, setSubTab] = useState<'transactions' | 'accounts'>('transactions');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterCreator, setFilterCreator] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New account modal state
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<AccountType>('bank');
  const [newAccBalance, setNewAccBalance] = useState<number>(0);
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccCreditLimit, setNewAccCreditLimit] = useState<number>(10000000);

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (filterAccount !== 'all' && tx.accountId !== filterAccount && tx.toAccountId !== filterAccount) return false;
    if (filterCategory !== 'all' && tx.category !== filterCategory) return false;
    if (filterCreator !== 'all' && tx.creator !== filterCreator) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchCat = tx.category.toLowerCase().includes(q);
      if (!matchDesc && !matchCat) return false;
    }
    return true;
  });

  const totalIn = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOut = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;

    let color = 'from-blue-600 to-sky-600';
    if (newAccType === 'ewallet') color = 'from-cyan-500 to-teal-500';
    if (newAccType === 'cash') color = 'from-emerald-500 to-teal-600';
    if (newAccType === 'credit_card') color = 'from-slate-700 to-slate-900';

    onAddAccount({
      name: newAccName,
      type: newAccType,
      balance: newAccType === 'credit_card' ? 0 : Number(newAccBalance),
      accountNumber: newAccNumber || undefined,
      color,
      creditLimit: newAccType === 'credit_card' ? Number(newAccCreditLimit) : undefined,
    });

    setIsAddAccountOpen(false);
    setNewAccName('');
    setNewAccBalance(0);
    setNewAccNumber('');
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return <Building className="w-5 h-5 text-sky-600" />;
      case 'credit_card':
        return <CreditCard className="w-5 h-5 text-purple-600" />;
      case 'ewallet':
        return <Smartphone className="w-5 h-5 text-cyan-600" />;
      case 'cash':
        return <Banknote className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & SUBTABS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-sky-100 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-800">Pencatatan Arus Kas & Multi-Akun</h2>
          <p className="text-xs text-slate-400">
            Kelola pendapatan, pengeluaran berposisi, transfer, dan saldo rekening bank & e-wallet keluarga.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtab Switcher */}
          <div className="flex bg-sky-50 p-1 rounded-xl border border-sky-200 text-xs font-bold">
            <button
              onClick={() => setSubTab('transactions')}
              className={`px-3 py-1.5 rounded-lg transition ${
                subTab === 'transactions' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              Riwayat Transaksi
            </button>
            <button
              onClick={() => setSubTab('accounts')}
              className={`px-3 py-1.5 rounded-lg transition ${
                subTab === 'accounts' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              Kelola Multi-Akun ({accounts.length})
            </button>
          </div>

          <button
            onClick={onAddTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TRANSACTIONS LIST */}
      {subTab === 'transactions' && (
        <div className="space-y-4">
          {/* Arus Kas Summary Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-emerald-800">Total Pemasukan</div>
                  <div className="text-sm font-black text-emerald-900">+{formatRupiah(totalIn)}</div>
                </div>
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-rose-800">Total Pengeluaran</div>
                  <div className="text-sm font-black text-rose-900">-{formatRupiah(totalOut)}</div>
                </div>
              </div>
            </div>

            <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-sky-800">Net Arus Kas</div>
                  <div className="text-sm font-black text-sky-900">{formatRupiah(totalIn - totalOut)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari transaksi atau kategori..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Filter Type */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">Semua Jenis</option>
                <option value="income">Pendapatan (+)</option>
                <option value="expense">Pengeluaran (-)</option>
                <option value="transfer">Transfer (⇄)</option>
              </select>

              {/* Filter Account */}
              <select
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">Semua Akun / Bank</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>

              {/* Filter Creator */}
              <select
                value={filterCreator}
                onChange={(e) => setFilterCreator(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">Semua Pencatat</option>
                <option value="Suami">👨 Suami</option>
                <option value="Istri">👩 Istri</option>
                <option value="Bersama">🏡 Bersama</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sky-50/70 text-sky-900 border-b border-sky-100 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Akun Rekening</th>
                    <th className="py-3 px-4">Pencatat</th>
                    <th className="py-3 px-4 text-right">Nominal</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Tidak ada transaksi yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const isIncome = tx.type === 'income';
                      const isTransfer = tx.type === 'transfer';
                      const sourceAcc = accounts.find((a) => a.id === tx.accountId);
                      const targetAcc = tx.toAccountId ? accounts.find((a) => a.id === tx.toAccountId) : null;

                      return (
                        <tr key={tx.id} className="hover:bg-sky-50/30 transition">
                          <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-medium">
                            {formatDateIndo(tx.date)}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800">
                            <div className="flex items-center gap-2">
                              <span>{tx.description}</span>
                              {tx.isRecurring && (
                                <span className="bg-sky-100 text-sky-700 text-[10px] font-semibold px-1.5 py-0.2 rounded">
                                  Rutin
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md text-[11px]">
                              {tx.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                            {isTransfer && targetAcc ? (
                              <span className="flex items-center gap-1 text-[11px]">
                                {sourceAcc?.name?.slice(0, 15)} &rarr; {targetAcc?.name?.slice(0, 15)}
                              </span>
                            ) : (
                              sourceAcc?.name || 'Kas'
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tx.creator === 'Suami'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : tx.creator === 'Istri'
                                  ? 'bg-pink-50 text-pink-700 border border-pink-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {tx.creator}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-right font-black">
                            <span
                              className={
                                isIncome
                                  ? 'text-emerald-600'
                                  : isTransfer
                                  ? 'text-sky-600'
                                  : 'text-slate-800'
                              }
                            >
                              {isIncome ? '+' : isTransfer ? '' : '-'}{formatRupiah(tx.amount)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => onDeleteTransaction(tx.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MULTI-ACCOUNT MANAGEMENT */}
      {subTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Daftar Rekening Bank & Dompet Digital</h3>
              <p className="text-xs text-slate-400">Pemisahan rekening operasional, tabungan darurat, dan kartu kredit.</p>
            </div>
            <button
              onClick={() => setIsAddAccountOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Rekening / E-Wallet</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => {
              const isCreditCard = acc.type === 'credit_card';
              const usedCredit = isCreditCard ? Math.abs(acc.balance) : 0;
              const limit = acc.creditLimit || 15000000;
              const remainingLimit = isCreditCard ? limit - usedCredit : 0;

              return (
                <div
                  key={acc.id}
                  className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-sky-50 border border-sky-100">
                          {getAccountIcon(acc.type)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">{acc.name}</h4>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            {acc.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="my-3">
                      <div className="text-[11px] text-slate-400">
                        {isCreditCard ? 'Total Tagihan Berjalan' : 'Saldo Terkini'}
                      </div>
                      <div
                        className={`text-xl font-black ${
                          isCreditCard ? 'text-rose-600' : 'text-slate-900'
                        }`}
                      >
                        {formatRupiah(Math.abs(acc.balance))}
                      </div>
                    </div>

                    {isCreditCard && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px]">
                        <div className="flex justify-between text-slate-500">
                          <span>Limit Plafon:</span>
                          <span className="font-bold text-slate-700">{formatRupiah(limit)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Sisa Limit:</span>
                          <span className="font-bold text-emerald-600">{formatRupiah(remainingLimit)}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-purple-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, (usedCredit / limit) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {acc.accountNumber && (
                      <div className="text-[11px] text-slate-400 font-mono mt-2">
                        No. Rekening: {acc.accountNumber}
                      </div>
                    )}
                  </div>

                  {/* Quick Edit Balance Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        const newBalStr = prompt(`Sesuaikan saldo untuk ${acc.name}:`, acc.balance.toString());
                        if (newBalStr !== null && !isNaN(Number(newBalStr))) {
                          onUpdateAccountBalance(acc.id, Number(newBalStr));
                        }
                      }}
                      className="text-xs text-sky-600 hover:text-sky-800 font-bold"
                    >
                      Sesuaikan Saldo &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH REKENING BARU */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-sky-100 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">Tambah Rekening Baru</h3>
              <button
                onClick={() => setIsAddAccountOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Akun / Bank</label>
                <input
                  type="text"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  placeholder="Misal: BCA Tabungan, BRI BritAma, OVO..."
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Akun</label>
                <select
                  value={newAccType}
                  onChange={(e) => setNewAccType(e.target.value as AccountType)}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                >
                  <option value="bank">Rekening Bank Utama</option>
                  <option value="ewallet">Dompet Digital (E-Wallet)</option>
                  <option value="cash">Kas Tunai Dompet</option>
                  <option value="credit_card">Kartu Kredit</option>
                </select>
              </div>

              {newAccType !== 'credit_card' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Saldo Awal (Rp)</label>
                  <input
                    type="number"
                    value={newAccBalance}
                    onChange={(e) => setNewAccBalance(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plafon Limit Kartu Kredit (Rp)</label>
                  <input
                    type="number"
                    value={newAccCreditLimit}
                    onChange={(e) => setNewAccCreditLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Rekening / No. HP (Opsional)</label>
                <input
                  type="text"
                  value={newAccNumber}
                  onChange={(e) => setNewAccNumber(e.target.value)}
                  placeholder="Misal: 123-456-789"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="flex-1 py-2 rounded-xl border text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
