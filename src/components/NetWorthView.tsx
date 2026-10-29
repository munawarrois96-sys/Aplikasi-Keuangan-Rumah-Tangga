import React, { useState } from 'react';
import {
  Building2,
  TrendingUp,
  Plus,
  Home,
  Car,
  Coins,
  Wallet,
  ShieldCheck,
  Percent,
  Trash2,
  X
} from 'lucide-react';
import { AssetItem, DebtItem, UserRole } from '../types/finance';
import { formatRupiah } from '../utils/formatters';

interface NetWorthViewProps {
  assets: AssetItem[];
  debts: DebtItem[];
  onAddAsset: (a: Omit<AssetItem, 'id'>) => void;
  onDeleteAsset: (id: string) => void;
  activeRole: UserRole;
}

export const NetWorthView: React.FC<NetWorthViewProps> = ({
  assets,
  debts,
  onAddAsset,
  onDeleteAsset,
  activeRole,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'lancar' | 'tetap'>('tetap');
  const [category, setCategory] = useState<AssetItem['category']>('Properti');
  const [estimatedValue, setEstimatedValue] = useState<number>(100000000);
  const [notes, setNotes] = useState('');

  // Calculations
  const liquidAssets = assets.filter((a) => a.type === 'lancar');
  const fixedAssets = assets.filter((a) => a.type === 'tetap');

  const totalLiquid = liquidAssets.reduce((sum, a) => sum + a.estimatedValue, 0);
  const totalFixed = fixedAssets.reduce((sum, a) => sum + a.estimatedValue, 0);
  const totalAssets = totalLiquid + totalFixed;

  const totalLiabilities = debts.reduce((sum, d) => sum + d.remainingBalance, 0);
  const netWorth = totalAssets - totalLiabilities;

  // Solvency ratio: Net Worth / Total Assets
  const solvencyRatio = totalAssets > 0 ? Math.round((netWorth / totalAssets) * 100) : 0;

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddAsset({
      name,
      type,
      category,
      estimatedValue: Number(estimatedValue),
      acquisitionYear: new Date().getFullYear(),
      notes,
    });

    setIsAddOpen(false);
    setName('');
    setNotes('');
  };

  const getAssetIcon = (cat: AssetItem['category']) => {
    switch (cat) {
      case 'Properti':
        return <Home className="w-4 h-4 text-sky-600" />;
      case 'Kendaraan':
        return <Car className="w-4 h-4 text-indigo-600" />;
      case 'Emas':
        return <Coins className="w-4 h-4 text-amber-600" />;
      default:
        return <Wallet className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800">Manajemen Aset & Neraca Kekayaan Keluarga</h2>
          <p className="text-xs text-slate-400">
            Pencatatan aset lancar, aset tetap riil, liabilitas, serta perhitungan otomatis Kekayaan Bersih (Net Worth).
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Aset Baru</span>
        </button>
      </div>

      {/* HERO NET WORTH BANNER */}
      <div className="bg-gradient-to-br from-sky-600 via-sky-700 to-cyan-800 text-white rounded-2xl p-6 shadow-lg shadow-sky-600/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-sky-200 text-xs font-bold uppercase tracking-wider block mb-1">
              Neraca Keuangan Keluarga Terintegrasi
            </span>
            <div className="text-2xl md:text-3xl font-black mb-1">
              {formatRupiah(netWorth)}
            </div>
            <p className="text-xs text-sky-100/80">
              Total Kekayaan Bersih = Total Seluruh Aset ({formatRupiah(totalAssets)}) dikurangi Total Liabilitas Utang ({formatRupiah(totalLiabilities)}).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[240px] text-center">
            <span className="text-xs text-sky-200 font-semibold">Tingkat Solvabilitas Aset</span>
            <div className="text-2xl font-black text-white my-1">{solvencyRatio}%</div>
            <div className="w-full bg-white/20 rounded-full h-2 my-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, solvencyRatio)}%` }}
              ></div>
            </div>
            <span className="text-[11px] text-sky-100">
              {solvencyRatio >= 50 ? '✅ Kondisi Solvabilitas Kuat' : '⚠️ Tingkatkan Aset Bersih'}
            </span>
          </div>
        </div>
      </div>

      {/* BALANCE SHEET (DUAL COLUMN: ASSETS vs LIABILITIES) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KOLOM KIRI: TOTAL ASET (LANCAR & TETAP) */}
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600" />
                <span>Total Aset Keluarga</span>
              </h3>
              <p className="text-[11px] text-slate-400">Aset Lancar ({formatRupiah(totalLiquid)}) + Aset Tetap ({formatRupiah(totalFixed)})</p>
            </div>
            <div className="text-right">
              <div className="font-black text-sky-700 text-base">{formatRupiah(totalAssets)}</div>
            </div>
          </div>

          {/* List Aset */}
          <div className="space-y-2.5">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="p-3 rounded-xl border border-slate-100 hover:border-sky-200 bg-slate-50/50 hover:bg-sky-50/30 transition flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    {getAssetIcon(asset.category)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{asset.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-semibold text-sky-700">{asset.category}</span>
                      <span>•</span>
                      <span className="capitalize">{asset.type === 'lancar' ? 'Aset Lancar' : 'Aset Tetap'}</span>
                      {asset.acquisitionYear && <span>• Thn {asset.acquisitionYear}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-black text-slate-800">{formatRupiah(asset.estimatedValue)}</div>
                  </div>
                  <button
                    onClick={() => onDeleteAsset(asset.id)}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KOLOM KANAN: TOTAL LIABILITAS & KEWAJIBAN */}
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Percent className="w-4 h-4 text-purple-600" />
                <span>Total Liabilitas & Utang</span>
              </h3>
              <p className="text-[11px] text-slate-400">{debts.length} Pos Kontrak Kewajiban</p>
            </div>
            <div className="text-right">
              <div className="font-black text-rose-600 text-base">-{formatRupiah(totalLiabilities)}</div>
            </div>
          </div>

          {/* List Liabilitas */}
          <div className="space-y-2.5">
            {debts.map((d) => (
              <div
                key={d.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-800">{d.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {d.lender} • Bunga {d.interestRatePctAnnual}% p.a.
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-800">{formatRupiah(d.remainingBalance)}</div>
                  <div className="text-[10px] text-slate-400">Cicilan: {formatRupiah(d.minimumPaymentMonthly)}/bln</div>
                </div>
              </div>
            ))}
          </div>

          {/* Net Worth Calculation Bar */}
          <div className="mt-4 p-4 bg-sky-50 rounded-xl border border-sky-200 text-xs space-y-2">
            <div className="font-bold text-sky-900">Perhitungan Neraca Kekayaan Bersih:</div>
            <div className="flex justify-between text-slate-600">
              <span>Total Seluruh Aset:</span>
              <span className="font-bold text-emerald-700">+{formatRupiah(totalAssets)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Seluruh Utang:</span>
              <span className="font-bold text-rose-600">-{formatRupiah(totalLiabilities)}</span>
            </div>
            <div className="pt-2 border-t border-sky-200 flex justify-between font-black text-sm text-sky-950">
              <span>Kekayaan Bersih (Net Worth):</span>
              <span>{formatRupiah(netWorth)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH ASET */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-sky-100 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">Catat Aset Keluarga Baru</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAsset} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Aset</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Rumah Tinggal SHM, Mobil Honda Brio, Emas Batangan..."
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipe Aset</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="tetap">Aset Tetap (Riil)</option>
                    <option value="lancar">Aset Lancar (Likuid)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="Properti">Properti (Rumah / Tanah)</option>
                    <option value="Kendaraan">Kendaraan</option>
                    <option value="Emas">Emas Fisik</option>
                    <option value="Kas & Bank">Kas & Tabungan Bank</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Taksiran Nilai Pasar Saat Ini (Rp)</label>
                <input
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Dokumen / Lokasi</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Sertifikat SHM di safe deposit box..."
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
                  Simpan Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
