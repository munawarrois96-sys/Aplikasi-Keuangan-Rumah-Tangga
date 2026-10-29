import {
  Account,
  AssetItem,
  Budget,
  DebtItem,
  EmergencyFund,
  HouseholdCollaboration,
  RecurringBill,
  Transaction,
} from '../types/finance';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

export interface SpreadsheetInfo {
  id: string;
  name: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

export interface ExportDataPayload {
  collaboration: HouseholdCollaboration;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  debts: DebtItem[];
  assets: AssetItem[];
  bills: RecurringBill[];
  emergencyFund: EmergencyFund;
  totalIncome: number;
  totalExpense: number;
  netWorth: number;
}

export const createHouseholdSpreadsheet = async (
  token: string,
  title: string,
  data: ExportDataPayload
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const payload = {
    properties: {
      title,
      locale: 'id_ID',
      timeZone: 'Asia/Jakarta',
    },
    sheets: [
      { properties: { title: 'Ringkasan & Neraca', index: 0, gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'Arus Kas Transaksi', index: 1, gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'Anggaran 50-30-20', index: 2, gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'Utang & Liabilitas', index: 3, gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'Aset & Kekayaan', index: 4, gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'Pengingat Tagihan', index: 5, gridProperties: { frozenRowCount: 1 } } },
    ],
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gagal membuat spreadsheet (${createRes.status})`);
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Populate data for each sheet using batchUpdate values
  const dateNow = new Date().toLocaleDateString('id-ID', { dateStyle: 'full' });

  // 1. Data Ringkasan & Neraca
  const summaryRows = [
    ['LAPORAN KEUANGAN KELUARGA MUNAWAR ROIS', '', '', ''],
    ['Tanggal Pembuatan:', dateNow, '', ''],
    ['Suami:', data.collaboration.husbandName, 'Istri:', data.collaboration.wifeName],
    ['', '', '', ''],
    ['METRIK UTAMA', 'NOMINAL (IDR)', 'CATATAN / STATUS', ''],
    ['Total Kekayaan Bersih (Net Worth)', data.netWorth, 'Total Aset - Total Liabilitas', ''],
    ['Total Pemasukan Bulan Ini', data.totalIncome, 'Arus Masuk', ''],
    ['Total Pengeluaran Bulan Ini', data.totalExpense, 'Arus Keluar', ''],
    ['Surplus / Defisit Kas Bersih', data.totalIncome - data.totalExpense, data.totalIncome >= data.totalExpense ? 'Surplus' : 'Defisit', ''],
    ['Saldo Kas & Bank Likuid', data.accounts.filter(a => a.type !== 'credit_card').reduce((s, a) => s + a.balance, 0), `${data.accounts.length} Akun & E-Wallet`, ''],
    ['Saldo Dana Darurat', data.emergencyFund.currentBalance, `Target: ${data.emergencyFund.targetMonths} bulan pengeluaran`, ''],
  ];

  // 2. Data Arus Kas Transaksi
  const transactionRows = [
    ['ID', 'TANGGAL', 'JENIS', 'KATEGORI', 'KETERANGAN', 'NOMINAL (IDR)', 'AKUN / BANK', 'PENCATAT', 'RUTIN BULANAN'],
    ...data.transactions.map((tx) => [
      tx.id,
      tx.date,
      tx.type === 'income' ? 'Pemasukan (+)' : tx.type === 'expense' ? 'Pengeluaran (-)' : 'Transfer (⇄)',
      tx.category,
      tx.description,
      tx.amount,
      data.accounts.find((a) => a.id === tx.accountId)?.name || 'Kas',
      tx.creator,
      tx.isRecurring ? 'Ya' : 'Tidak',
    ]),
  ];

  // 3. Data Anggaran
  const budgetRows = [
    ['KATEGORI POS ANGGARAN', 'PLAFON ALOKASI (IDR)', 'REALISASI TERPAKAI (IDR)', 'SISA KUOTA (IDR)', 'PERSENTASE (%)', 'STATUS / PERINGATAN', 'PENANGGUNG JAWAB'],
    ...data.budgets.map((b) => {
      const pct = Math.round((b.spentAmount / (b.allocatedAmount || 1)) * 100);
      const remaining = b.allocatedAmount - b.spentAmount;
      const status = pct >= 100 ? 'OVERBUDGET (Bahaya)' : pct >= 80 ? 'WASPADA (≥ 80%)' : 'Aman';
      return [
        b.category,
        b.allocatedAmount,
        b.spentAmount,
        remaining,
        `${pct}%`,
        status,
        b.managedBy || 'Bersama',
      ];
    }),
  ];

  // 4. Data Utang & Liabilitas
  const debtRows = [
    ['NAMA KEWAJIBAN', 'KREDITUR / BANK', 'SISA POKOK UTANG (IDR)', 'BUNGA (% P.A.)', 'CICILAN BULANAN (IDR)', 'TANGGAL JATUH TEMPO', 'SISA TENOR (BULAN)'],
    ...data.debts.map((d) => [
      d.name,
      d.lender,
      d.remainingBalance,
      `${d.interestRatePctAnnual}%`,
      d.minimumPaymentMonthly,
      `Tgl ${d.dueDateDay}`,
      d.tenorRemainingMonths || '-',
    ]),
  ];

  // 5. Data Aset & Kekayaan
  const assetRows = [
    ['NAMA ASET', 'TIPE ASET', 'KATEGORI', 'TAKASIRAN NILAI PASAR (IDR)', 'TAHUN PEROLEHAN', 'CATATAN DOKUMEN'],
    ...data.assets.map((a) => [
      a.name,
      a.type === 'lancar' ? 'Aset Lancar (Likuid)' : 'Aset Tetap (Riil)',
      a.category,
      a.estimatedValue,
      a.acquisitionYear || '-',
      a.notes || '-',
    ]),
  ];

  // 6. Data Tagihan Rutin
  const billRows = [
    ['NAMA TAGIHAN', 'KATEGORI', 'ESTIMASI NOMINAL (IDR)', 'JATUH TEMPO', 'STATUS BULAN INI', 'TANGGAL TERAKHIR BAYAR', 'NO. PELANGGAN / ID'],
    ...data.bills.map((b) => [
      b.name,
      b.category,
      b.amount,
      `Tgl ${b.dueDay}`,
      b.isPaidThisMonth ? 'Lunas' : 'Belum Dibayar',
      b.lastPaidDate || '-',
      b.customerNumber || '-',
    ]),
  ];

  const valueUpdates = [
    { range: "'Ringkasan & Neraca'!A1", values: summaryRows },
    { range: "'Arus Kas Transaksi'!A1", values: transactionRows },
    { range: "'Anggaran 50-30-20'!A1", values: budgetRows },
    { range: "'Utang & Liabilitas'!A1", values: debtRows },
    { range: "'Aset & Kekayaan'!A1", values: assetRows },
    { range: "'Pengingat Tagihan'!A1", values: billRows },
  ];

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: valueUpdates,
      }),
    }
  );

  if (!updateRes.ok) {
    console.warn('Batch update values partially succeeded or had non-fatal warning');
  }

  return { spreadsheetId, spreadsheetUrl };
};

// Append a newly recorded transaction to an existing sheet
export const appendTransactionToSpreadsheet = async (
  token: string,
  spreadsheetId: string,
  tx: Transaction,
  accountName?: string
): Promise<boolean> => {
  const row = [
    tx.id,
    tx.date,
    tx.type === 'income' ? 'Pemasukan (+)' : tx.type === 'expense' ? 'Pengeluaran (-)' : 'Transfer (⇄)',
    tx.category,
    tx.description,
    tx.amount,
    accountName || 'Kas',
    tx.creator,
    tx.isRecurring ? 'Ya' : 'Tidak',
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Arus Kas Transaksi'!A:I:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  return res.ok;
};

// Fetch user's financial spreadsheets from Google Drive
export const listDriveSpreadsheets = async (token: string): Promise<SpreadsheetInfo[]> => {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink,createdTime,modifiedTime)&orderBy=modifiedTime desc&pageSize=15`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Gagal mengambil daftar spreadsheet dari Google Drive');
  }

  const data = await res.json();
  return data.files || [];
};

// Read transactions from an existing Google Sheet tab
export const readTransactionsFromSpreadsheet = async (
  token: string,
  spreadsheetId: string,
  sheetName = 'Arus Kas Transaksi'
): Promise<Partial<Transaction>[]> => {
  const range = encodeURIComponent(`'${sheetName}'!A2:I`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    throw new Error('Gagal membaca data transaksi dari Google Spreadsheet');
  }

  const data = await res.json();
  const rows: any[][] = data.values || [];

  return rows
    .filter((r) => r.length >= 6 && r[1] && r[5])
    .map((r, index) => {
      const typeStr = (r[2] || '').toLowerCase();
      const type = typeStr.includes('pemasukan')
        ? 'income'
        : typeStr.includes('transfer')
        ? 'transfer'
        : 'expense';

      // Parse amount numeric
      const rawAmt = typeof r[5] === 'string' ? r[5].replace(/[^0-9]/g, '') : r[5];
      const amount = Number(rawAmt) || 0;

      return {
        id: r[0] || `imported-${Date.now()}-${index}`,
        date: r[1] || new Date().toISOString().split('T')[0],
        type,
        category: r[3] || 'Lainnya',
        description: r[4] || 'Transaksi Google Sheets',
        amount,
        creator: (r[7] === 'Istri' ? 'Istri' : r[7] === 'Suami' ? 'Suami' : 'Bersama') as any,
        isRecurring: r[8] === 'Ya',
      };
    });
};
