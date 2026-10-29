import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Users,
  Shield,
  Heart,
  CheckCircle2,
  Calendar,
  Sparkles,
  Wallet,
  ArrowRight,
  Smile
} from 'lucide-react';
import { HouseholdCollaboration, Transaction, UserRole } from '../types/finance';
import { formatRupiah } from '../utils/formatters';

interface CollaborationViewProps {
  collaboration: HouseholdCollaboration;
  transactions: Transaction[];
  onUpdateCollaboration: (collab: HouseholdCollaboration) => void;
  onQuickLogDailyAllowance: (amount: number, note: string) => void;
  activeRole: UserRole;
}

export const CollaborationView: React.FC<CollaborationViewProps> = ({
  collaboration,
  transactions,
  onUpdateCollaboration,
  onQuickLogDailyAllowance,
  activeRole,
}) => {
  const [dailyTarget, setDailyTarget] = useState<number>(collaboration.dailyAllowanceTarget || 150000);
  const [husbandName, setHusbandName] = useState(collaboration.husbandName);
  const [wifeName, setWifeName] = useState(collaboration.wifeName);
  const [familyName, setFamilyName] = useState(collaboration.familyName);

  useEffect(() => {
    setHusbandName(collaboration.husbandName);
    setWifeName(collaboration.wifeName);
    setFamilyName(collaboration.familyName);
  }, [collaboration.husbandName, collaboration.wifeName, collaboration.familyName]);

  const [roleBelanja, setRoleBelanja] = useState<UserRole>(collaboration.assignedRoles.belanjaHarian);
  const [roleUtilitas, setRoleUtilitas] = useState<UserRole>(collaboration.assignedRoles.utilitasRumah);
  const [roleInvestasi, setRoleInvestasi] = useState<UserRole>(collaboration.assignedRoles.investasiUtang);

  // Quick daily expense logger state
  const [quickAmount, setQuickAmount] = useState<number>(100000);
  const [quickNote, setQuickNote] = useState<string>('Sayur mayur, lauk & bumbu dapur');

  // Days in current month
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - currentDay;

  // Monthly grocery calculation
  const totalDailyTargetMonth = dailyTarget * daysInMonth;
  const spentThisMonth = collaboration.dailyAllowanceSpentThisMonth;
  const remainingAllowance = totalDailyTargetMonth - spentThisMonth;
  const dailyRemainingBudget = daysLeft > 0 ? Math.round(remainingAllowance / daysLeft) : 0;

  const handleSaveSettings = () => {
    onUpdateCollaboration({
      ...collaboration,
      husbandName,
      wifeName,
      familyName,
      dailyAllowanceTarget: dailyTarget,
      assignedRoles: {
        belanjaHarian: roleBelanja,
        utilitasRumah: roleUtilitas,
        investasiUtang: roleInvestasi,
      },
    });
    alert('Pengaturan Kolaborasi Keluarga berhasil disimpan!');
  };

  const handleLogExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickAmount <= 0) return;
    onQuickLogDailyAllowance(quickAmount, quickNote);
    onUpdateCollaboration({
      ...collaboration,
      dailyAllowanceSpentThisMonth: collaboration.dailyAllowanceSpentThisMonth + quickAmount,
    });
    setQuickAmount(100000);
    alert('Pengeluaran harian berhasil dicatat ke pos belanja!');
  };

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-800">Kolaborasi Keuangan Rumah Tangga</h2>
            <span className="bg-pink-100 text-pink-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-pink-200">
              Harmonis & Transparan
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Akses bersama suami dan istri, pembagian peran tanggung jawab, dan pengelolaan uang belanja harian (daily allowance).
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs self-start md:self-auto"
        >
          Simpan Peran & Kesepakatan
        </button>
      </div>

      {/* PROFIL PASANGAN CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Suami */}
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-sky-500/20">
            👨
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-sky-700 font-bold uppercase tracking-wider">Pencari Nafkah Utama / Admin</span>
            <input
              type="text"
              value={husbandName}
              onChange={(e) => setHusbandName(e.target.value)}
              className="font-black text-slate-800 text-base bg-transparent border-b border-transparent hover:border-sky-300 focus:border-sky-500 focus:outline-hidden w-full transition"
            />
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                Kelola: {roleUtilitas === 'Suami' ? 'Utilitas & Cicilan' : 'Investasi'}
              </span>
            </div>
          </div>
        </div>

        {/* Istri */}
        <div className="bg-white rounded-2xl p-5 border border-pink-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center font-black text-xl shadow-md shadow-pink-500/20">
            👩
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-pink-700 font-bold uppercase tracking-wider">Menteri Keuangan Keluarga</span>
            <input
              type="text"
              value={wifeName}
              onChange={(e) => setWifeName(e.target.value)}
              className="font-black text-slate-800 text-base bg-transparent border-b border-transparent hover:border-pink-300 focus:border-pink-500 focus:outline-hidden w-full transition"
            />
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                Kelola: {roleBelanja === 'Istri' ? 'Belanja Dapur Harian' : 'Semua'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SPOTLIGHT: DAILY ALLOWANCE CALCULATOR (UANG BELANJA HARIAN) */}
      <div className="bg-gradient-to-br from-pink-50/80 via-white to-sky-50/80 rounded-2xl p-6 border border-pink-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">Manajemen Uang Belanja Harian (Daily Allowance)</h3>
              <p className="text-xs text-slate-500">
                Alokasi harian operasional dapur & kebutuhan pokok agar tidak terjadi overbudget di akhir bulan.
              </p>
            </div>
          </div>

          <div className="bg-white px-4 py-2 rounded-xl border border-pink-200 shadow-2xs text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">Target Alokasi Harian:</span>
            <div className="text-base font-black text-pink-700">
              {formatRupiah(dailyTarget)} / hari
            </div>
          </div>
        </div>

        {/* Meters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-2xs">
            <span className="text-slate-400 font-semibold">Total Kuota Bulan Ini ({daysInMonth} hari)</span>
            <div className="text-lg font-black text-slate-800 mt-0.5">{formatRupiah(totalDailyTargetMonth)}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-2xs">
            <span className="text-slate-400 font-semibold">Terpakai Sampai Hari Ini (Tgl {currentDay})</span>
            <div className="text-lg font-black text-pink-600 mt-0.5">{formatRupiah(spentThisMonth)}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-2xs">
            <span className="text-slate-400 font-semibold">Sisa Dana Belanja Bulan Ini</span>
            <div className={`text-lg font-black mt-0.5 ${remainingAllowance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatRupiah(remainingAllowance)}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-2xs">
            <span className="text-slate-400 font-semibold">Sisa Jatah Harian Rata-rata ({daysLeft} hari lagi)</span>
            <div className="text-lg font-black text-sky-700 mt-0.5">{formatRupiah(dailyRemainingBudget)} / hari</div>
          </div>
        </div>

        {/* Quick Log Form for Grocery / Daily */}
        <form onSubmit={handleLogExpense} className="bg-white/80 p-4 rounded-xl border border-pink-100 space-y-3">
          <div className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-pink-500" />
            <span>Catat Pengeluaran Belanja Harian Cepat:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              placeholder="Keterangan belanja (misal sayur pasar, beras, gas elpiji)"
              className="px-3 py-2 bg-slate-50 border rounded-xl text-xs sm:col-span-2"
              required
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={quickAmount}
                onChange={(e) => setQuickAmount(Number(e.target.value))}
                className="px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold text-slate-800 flex-1"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs transition"
              >
                Catat
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* PEMBAGIAN PERAN & TUGAS KELUARGA */}
      <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-600" />
          <span>Struktur Pembagian Peran & Izin Akses Finansial</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800">1. Belanja Harian & Dapur</div>
            <p className="text-[11px] text-slate-500">Membeli kebutuhan makanan, perlengkapan mandi, dan keperluan rumah tangga.</p>
            <select
              value={roleBelanja}
              onChange={(e) => setRoleBelanja(e.target.value as UserRole)}
              className="w-full px-3 py-1.5 bg-white border rounded-lg font-semibold"
            >
              <option value="Istri">Dikelola Istri (Rekomendasi)</option>
              <option value="Suami">Dikelola Suami</option>
              <option value="Bersama">Dikelola Bersama</option>
            </select>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800">2. Utilitas & Tagihan Rumah</div>
            <p className="text-[11px] text-slate-500">Pembayaran listrik PLN, WiFi, air PDAM, dan biaya pemeliharaan lingkungan.</p>
            <select
              value={roleUtilitas}
              onChange={(e) => setRoleUtilitas(e.target.value as UserRole)}
              className="w-full px-3 py-1.5 bg-white border rounded-lg font-semibold"
            >
              <option value="Suami">Dikelola Suami (Rekomendasi)</option>
              <option value="Istri">Dikelola Istri</option>
              <option value="Bersama">Dikelola Bersama</option>
            </select>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800">3. Portofolio Investasi & KPR</div>
            <p className="text-[11px] text-slate-500">Keputusan alokasi tabungan, emas batangan, cicilan KPR, dan aset besar.</p>
            <select
              value={roleInvestasi}
              onChange={(e) => setRoleInvestasi(e.target.value as UserRole)}
              className="w-full px-3 py-1.5 bg-white border rounded-lg font-semibold"
            >
              <option value="Bersama">Keputusan Bersama (Suami & Istri)</option>
              <option value="Suami">Dikelola Suami</option>
              <option value="Istri">Dikelola Istri</option>
            </select>
          </div>
        </div>

        {/* Tips Komunikasi Keuangan Harmonis */}
        <div className="mt-4 p-4 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900 space-y-2">
          <div className="font-bold flex items-center gap-1.5">
            <Smile className="w-4 h-4 text-sky-600" />
            <span>3 Kaidah Komunikasi Finansial Pasangan yang Sehat:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
            <li><strong>Kencan Finansial Mingguan:</strong> Duduk bersama 15 menit setiap akhir pekan dengan teh hangat untuk mengecek saldo tanpa nada menyalahkan.</li>
            <li><strong>Aturan Transaksi Bebas Lapor:</strong> Sepakati batas nominal (misal Rp 200.000) di mana masing-masing pasangan boleh membelanjakan uang pribadinya tanpa harus meminta izin terlebih dahulu.</li>
            <li><strong>Keberkahan & Transparansi:</strong> Saling mendoakan rezeki dan memprioritaskan sedekah/zakat agar keluarga senantiasa dilimpahi ketenangan.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
