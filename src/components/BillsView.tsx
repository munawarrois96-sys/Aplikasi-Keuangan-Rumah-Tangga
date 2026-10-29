import React, { useState } from 'react';
import {
  BellRing,
  CheckCircle2,
  AlertCircle,
  Plus,
  Zap,
  Droplets,
  Wifi,
  Shield,
  GraduationCap,
  FileText,
  Calendar,
  X
} from 'lucide-react';
import { Account, RecurringBill, UserRole } from '../types/finance';
import { formatRupiah } from '../utils/formatters';

interface BillsViewProps {
  bills: RecurringBill[];
  accounts: Account[];
  onPayBill: (billId: string, accountId?: string) => void;
  onAddBill: (bill: Omit<RecurringBill, 'id'>) => void;
  onDeleteBill: (id: string) => void;
  activeRole: UserRole;
}

export const BillsView: React.FC<BillsViewProps> = ({
  bills,
  accounts,
  onPayBill,
  onAddBill,
  onDeleteBill,
  activeRole,
}) => {
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<RecurringBill['category']>('listrik');
  const [amount, setAmount] = useState<number>(500000);
  const [dueDay, setDueDay] = useState<number>(20);
  const [defaultAccountId, setDefaultAccountId] = useState<string>(accounts[0]?.id || '');
  const [customerNumber, setCustomerNumber] = useState('');

  const filteredBills = bills.filter((b) => {
    if (filter === 'unpaid') return !b.isPaidThisMonth;
    if (filter === 'paid') return b.isPaidThisMonth;
    return true;
  });

  const totalMonthlyBills = bills.reduce((sum, b) => sum + b.amount, 0);
  const totalPaid = bills.filter((b) => b.isPaidThisMonth).reduce((sum, b) => sum + b.amount, 0);
  const totalUnpaid = bills.filter((b) => !b.isPaidThisMonth).reduce((sum, b) => sum + b.amount, 0);

  const getCategoryIcon = (cat: RecurringBill['category']) => {
    switch (cat) {
      case 'listrik':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'air':
        return <Droplets className="w-4 h-4 text-cyan-500" />;
      case 'internet':
        return <Wifi className="w-4 h-4 text-sky-500" />;
      case 'asuransi':
        return <Shield className="w-4 h-4 text-emerald-500" />;
      case 'sekolah':
        return <GraduationCap className="w-4 h-4 text-indigo-500" />;
      case 'pajak':
        return <FileText className="w-4 h-4 text-rose-500" />;
      default:
        return <BellRing className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddBill({
      name,
      category,
      amount: Number(amount),
      dueDay: Number(dueDay),
      defaultAccountId,
      customerNumber: customerNumber || undefined,
      isPaidThisMonth: false,
    });

    setIsAddOpen(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-800">Pengingat Tagihan Berkala Rumah Tangga</h2>
            <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200">
              Autodebet & Pencatatan Otomatis
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Jadwal pembayaran listrik PLN, air PDAM, WiFi internet, BPJS/asuransi, pajak PBB/STNK, dan SPP anak.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter pills */}
          <div className="flex bg-sky-50 p-1 rounded-xl border border-sky-200 text-xs font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'all' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              Semua ({bills.length})
            </button>
            <button
              onClick={() => setFilter('unpaid')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'unpaid' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              Belum Bayar ({bills.filter((b) => !b.isPaidThisMonth).length})
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'paid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Sudah Lunas ({bills.filter((b) => b.isPaidThisMonth).length})
            </button>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Tagihan</span>
          </button>
        </div>
      </div>

      {/* METRIC CHIPS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-2xs">
          <span className="text-slate-400 font-semibold">Total Tagihan Bulanan</span>
          <div className="text-lg font-black text-slate-800">{formatRupiah(totalMonthlyBills)}</div>
        </div>
        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-2xs">
          <span className="text-emerald-800 font-semibold">Sudah Terbayar Bulan Ini</span>
          <div className="text-lg font-black text-emerald-900">{formatRupiah(totalPaid)}</div>
        </div>
        <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 shadow-2xs">
          <span className="text-amber-800 font-semibold">Sisa Tagihan Tertunda</span>
          <div className="text-lg font-black text-amber-900">{formatRupiah(totalUnpaid)}</div>
        </div>
      </div>

      {/* BILLS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBills.map((bill) => {
          const account = accounts.find((a) => a.id === bill.defaultAccountId);

          return (
            <div
              key={bill.id}
              className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between transition hover:shadow-md ${
                bill.isPaidThisMonth ? 'border-slate-200' : 'border-amber-300 ring-1 ring-amber-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                      {getCategoryIcon(bill.category)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{bill.name}</h4>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        {bill.category}
                      </span>
                    </div>
                  </div>

                  {bill.isPaidThisMonth ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5" /> Belum Bayar
                    </span>
                  )}
                </div>

                <div className="my-3">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Nominal Tagihan</span>
                  <div className="text-xl font-black text-slate-900">{formatRupiah(bill.amount)}</div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Jatuh Tempo:</span>
                    <span className="font-bold text-slate-800">Tgl {bill.dueDay} tiap bulan</span>
                  </div>
                  {bill.customerNumber && (
                    <div className="flex justify-between text-slate-600 font-mono text-[11px]">
                      <span>ID Pelanggan:</span>
                      <span className="font-semibold text-slate-700">{bill.customerNumber}</span>
                    </div>
                  )}
                  {account && (
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>Sumber Dana:</span>
                      <span className="font-semibold text-sky-700">{account.name.slice(0, 18)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {!bill.isPaidThisMonth ? (
                  <button
                    onClick={() => onPayBill(bill.id)}
                    className="w-full py-2 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tandai Lunas & Catat Transaksi</span>
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-between text-[11px] text-slate-400">
                    <span>Dibayar tgl {bill.lastPaidDate || 'Bulan ini'}</span>
                    <button
                      onClick={() => onDeleteBill(bill.id)}
                      className="text-slate-300 hover:text-rose-600"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL CREATE BILL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-sky-100 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">Tambah Tagihan Rutin</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBill} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Tagihan</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Tagihan Listrik PLN, WiFi Indihome..."
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="listrik">Listrik PLN</option>
                    <option value="air">Air PDAM</option>
                    <option value="internet">WiFi / Internet</option>
                    <option value="asuransi">Asuransi / BPJS</option>
                    <option value="sekolah">SPP Sekolah</option>
                    <option value="pajak">Pajak (PBB / STNK)</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Jatuh Tempo (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimasi Nominal (Rp)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sumber Rekening Pembayaran</label>
                <select
                  value={defaultAccountId}
                  onChange={(e) => setDefaultAccountId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">No. ID Pelanggan / Kontrak (Opsional)</label>
                <input
                  type="text"
                  value={customerNumber}
                  onChange={(e) => setCustomerNumber(e.target.value)}
                  placeholder="Misal: 5381-0029-3829"
                  className="w-full px-3 py-2 border rounded-xl"
                />
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
                  Simpan Pengingat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
