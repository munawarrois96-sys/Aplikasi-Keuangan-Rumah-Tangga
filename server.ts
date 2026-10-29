import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gemini SDK on the server side
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper for fallback AI financial intelligence if key is missing or model fails
function generateFallbackLeakAnalysis(transactions: any[], budgets: any[], accounts: any[]) {
  // Compute metrics from real data
  const totalExpense = transactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
  
  const totalIncome = transactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

  const entertainmentExpense = transactions
    .filter((t: any) => t.type === 'expense' && (t.category === 'Hiburan' || t.category === 'Gaya Hidup' || t.description?.toLowerCase().includes('kopi') || t.description?.toLowerCase().includes('nongkrong')))
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

  const adminFees = transactions
    .filter((t: any) => t.type === 'expense' && (t.description?.toLowerCase().includes('admin') || t.description?.toLowerCase().includes('transfer') || t.description?.toLowerCase().includes('biaya')))
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

  return {
    summary: `Berdasarkan analisis arus kas rumah tangga dengan total pengeluaran Rp ${totalExpense.toLocaleString('id-ID')} dan pendapatan Rp ${totalIncome.toLocaleString('id-ID')}, kondisi keuangan secara umum terkontrol namun terdapat beberapa area 'kebocoran halus' (latte factor & subscription) yang dapat dioptimalkan.`,
    score: totalIncome > 0 ? Math.min(95, Math.max(40, Math.round(((totalIncome - totalExpense) / totalIncome) * 100) + 40)) : 70,
    leaksDetected: [
      {
        title: "Kebocoran Gaya Hidup & Kafein Harian (Latte Factor)",
        category: "Hiburan / Kuliner",
        estimatedMonthlyLoss: entertainmentExpense > 0 ? Math.round(entertainmentExpense * 0.4) : 450000,
        severity: "medium",
        detail: "Frekuensi transaksi jajan kopi kekinian dan pesan antar makanan di luar jam makan utama mencapai akumulasi yang cukup tinggi. Rata-rata pengeluaran kecil Rp 25.000 - Rp 45.000 jika terjadi 15x sebulan menjadi kebocoran signifikan.",
        actionStep: "Terapkan aturan 'Jajan Terjadwal' maksimal 2x seminggu atau gunakan voucher promo khusus, alihkan sisanya ke pos Tabungan Dana Darurat."
      },
      {
        title: "Biaya Administrasi & Transfer Antar Rekening",
        category: "Biaya Layanan",
        estimatedMonthlyLoss: adminFees > 0 ? adminFees : 75000,
        severity: "low",
        detail: "Terdapat biaya transaksi transfer antar bank atau top-up dompet digital kecil secara berulang.",
        actionStep: "Gunakan aplikasi transfer gratis (seperti BI-Fast Rp 2.500 atau e-wallet tanpa biaya transfer) dan lakukan top-up sekaligus satu kali di awal bulan."
      },
      {
        title: "Potensi Langganan Digital / Subscriptions Tak Terpakai",
        category: "Langganan",
        estimatedMonthlyLoss: 189000,
        severity: "medium",
        detail: "Akumulasi langganan platform streaming (film/musik/cloud storage) keluarga yang sering tidak terpakai bersamaan.",
        actionStep: "Gunakan paket Family Plan bersama pasangan/keluarga atau batasi hanya 1 streaming aktif bergantian setiap bulan."
      }
    ],
    actionPlan: [
      "Amankan minimal 20% penghasilan di awal bulan (metode 'Pay Yourself First') sebelum dialokasikan ke pos harian.",
      "Sepakati limit uang jajan harian operasional (daily allowance) bersama pasangan untuk menghindari belanja impulsif.",
      "Gunakan amplop digital (rekening khusus belanja harian) terpisah dari rekening gaji utama."
    ]
  };
}

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// API: Chat with AI Financial Advisor
app.post('/api/ai/chat', async (req, res) => {
  const { message, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Construct system prompt in supportive, empathetic Indonesian
  const systemInstruction = `Anda adalah Asisten Keuangan Rumah Tangga Cerdas dan Sistem Manajer Keuangan Keluarga Berbasis AI untuk "Keluarga Munawar Rois" (Suami: Munawar Rois, Istri: Wini Yusnia).
Karakteristik & Sikap:
- Menggunakan Bahasa Indonesia yang suportif, hangat, ramah, penuh empati, dan solutif tanpa pernah menghakimi kondisi keuangan keluarga.
- Selalu memberikan saran aksi nyata yang siap dieksekusi (actionable steps) saat ditemukan ketidakseimbangan arus kas.
- Sajikan data rinci dalam format poin terstruktur, bullet point yang rapi, atau tabel sederhana agar mudah dipahami oleh suami maupun istri.
- Paham konteks keuangan keluarga di Indonesia (seperti THR, zakat, infaq, arisan, KPR, cicilan motor/mobil, BPJS, biaya sekolah/SPP, BI-Fast, emas Antam).
- Konteks keuangan keluarga saat ini (jika disediakan):
${JSON.stringify(context || {}, null, 2)}
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const text = response.text || "Mohon maaf, saya belum dapat memproses jawaban saat ini. Silakan ulangi kembali.";
      return res.json({ reply: text });
    } catch (error: any) {
      console.error("Gemini API Error in /api/ai/chat:", error);
      // Fallback response with financial wisdom
    }
  }

  // Smart heuristic response if no API key or on error
  let reply = "";
  const msgLower = (message || "").toLowerCase();

  if (msgLower.includes("dana darurat") || msgLower.includes("darurat")) {
    reply = `### Rekomendasi Alokasi Dana Darurat Keluarga 🛡️\n\n` +
      `Untuk kondisi rumah tangga di Indonesia, rasio ideal ketersediaan dana darurat adalah:\n` +
      `- **Keluarga tanpa anak / 1 pekerja tetap**: Minimal 6x pengeluaran bulanan rutin.\n` +
      `- **Keluarga dengan 1-2 anak**: Minimal 9x pengeluaran bulanan rutin.\n` +
      `- **Pengusaha / Pekerja lepas (Freelancer)**: Minimal 12x pengeluaran bulanan rutin.\n\n` +
      `**Aksi Nyata Siap Eksekusi:**\n` +
      `1. Simpan dana darurat di instrumen likuid dan bebas risiko: 50% di rekening tabungan terpisah (tanpa ATM) dan 50% di Reksadana Pasar Uang atau Logam Mulia Emas.\n` +
      `2. Alokasikan minimal 10-15% dari pendapatan bulanan saat tanggal gajian sebelum dana dipakai belanja.`;
  } else if (msgLower.includes("utang") || msgLower.includes("cicilan") || msgLower.includes("snowball") || msgLower.includes("avalanche")) {
    reply = `### Strategi Pelunasan Utang Rumah Tangga 💳\n\n` +
      `Terdapat dua strategi terbukti yang dapat dipilih bersama pasangan:\n\n` +
      `1. **Metode Snowball (Kemenangan Psikologis)**:\n` +
      `   - Urutkan semua utang dari nominal saldo terkecil ke terbesar.\n` +
      `   - Bayar pembayaran minimum untuk semua utang, dan alokasikan kelebihan uang ke utang terkecil hingga lunas.\n` +
      `   - Memberikan dorongan semangat cepat dan mengurangi jumlah pos cicilan yang harus diingat tiap bulan.\n\n` +
      `2. **Metode Avalanche (Efisiensi Bunga/Margin)**:\n` +
      `   - Urutkan dari bunga tertinggi (misal pinjaman online / kartu kredit 20-30% p.a.).\n` +
      `   - Paling hemat uang secara matematis dalam jangka panjang.\n\n` +
      `**Batas Aman Finansial:** Total seluruh cicilan bulanan keluarga tidak boleh melebihi **30% - 35%** dari total pendapatan bersih (Debt Service Ratio).`;
  } else if (msgLower.includes("50/30/20") || msgLower.includes("budget") || msgLower.includes("anggaran")) {
    reply = `### Panduan Metode Penganggaran 50/30/20 📊\n\n` +
      `Metode ini sangat fleksibel dan menyeimbangkan kebutuhan sekarang dengan masa depan:\n\n` +
      `- **50% Kebutuhan Pokok (Needs)**: Makanan sehari-hari, belanja dapur, listrik PLN, air PDAM, internet, cicilan KPR/kendaraan, SPP sekolah, transport kerja.\n` +
      `- **30% Keinginan (Wants)**: Liburan keluarga, makan di restoran akhir pekan, hiburan streaming, hobi, belanja pakaian baru.\n` +
      `- **20% Tabungan & Investasi (Savings/Investments)**: Dana darurat, investasi pensiun, dana pendidikan anak, pelunasan utang percepatan.\n\n` +
      `**Tips Harmonisasi Pasangan:** Buat rekening terpisah untuk pos belanja bulanan agar tidak bercampur dengan pos dana masa depan!`;
  } else {
    reply = `Terima kasih telah berbagi pertanyaan! Sebagai Asisten Keuangan Keluarga Anda, berikut pandangan saya:\n\n` +
      `1. **Evaluasi Arus Kas:** Pastikan setiap pengeluaran tercatat dan dialokasikan ke pos yang tepat (Kebutuhan vs Keinginan vs Investasi).\n` +
      `2. **Komunikasi Suami-Istri:** Buat jadwal mingguan "Kencan Finansial" (15 menit santai) untuk mengevaluasi sisa saldo dan rencana minggu depan.\n` +
      `3. **Pilar Proteksi:** Utamakan perlindungan kesehatan dasar (BPJS Kesehatan/Asuransi Jiwa untuk pencari nafkah utama) sebelum masuk ke investasi berisiko tinggi.\n\n` +
      `Apakah Anda ingin saya menganalisis simulasi dana pendidikan anak, rasio utang, atau pos belanja harian saat ini?`;
  }

  res.json({ reply });
});

// API: AI Leak Evaluation (Evaluasi Kebocoran Halus)
app.post('/api/ai/analyze-leaks', async (req, res) => {
  const { transactions, budgets, accounts, familyInfo } = req.body;

  if (ai) {
    try {
      const prompt = `Analisis data transaksi keuangan rumah tangga berikut dan cari "kebocoran halus" (latte factor, impulsive spending, biaya admin, subscription berlebih, pembengkakan pos hiburan/jajan).
Data Transaksi Terkini:
${JSON.stringify((transactions || []).slice(0, 40), null, 2)}

Data Anggaran:
${JSON.stringify(budgets || [], null, 2)}

Format Jawaban HARUS berupa JSON valid persis dengan struktur berikut:
{
  "summary": "Ringkasan evaluasi ramah dan solutif (1-2 paragraf)",
  "score": 85, // Skor kesehatan pengeluaran 0-100
  "leaksDetected": [
    {
      "title": "Nama Kebocoran",
      "category": "Kategori",
      "estimatedMonthlyLoss": 350000,
      "severity": "low" | "medium" | "high",
      "detail": "Penjelasan rinci mengapa ini menjadi kebocoran halus",
      "actionStep": "Langkah aksi nyata yang siap dieksekusi bersama pasangan"
    }
  ],
  "actionPlan": [
    "Aksi nyata 1",
    "Aksi nyata 2",
    "Aksi nyata 3"
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      const responseText = response.text?.trim() || "";
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch (err: any) {
      console.error("Gemini API Error in /api/ai/analyze-leaks:", err);
      // Fallback gracefully below
    }
  }

  // Graceful fallback
  const fallbackResult = generateFallbackLeakAnalysis(transactions || [], budgets || [], accounts || []);
  return res.json(fallbackResult);
});

// API: AI Smart Budget Advice
app.post('/api/ai/budget-advice', async (req, res) => {
  const { method, totalIncome, totalExpense, familyMembers } = req.body;

  if (ai) {
    try {
      const prompt = `Berikan rekomendasi pembagian pos anggaran rumah tangga menggunakan metode ${method} (50/30/20, Zero-Based Budgeting, atau Kustom) untuk total pendapatan Rp ${Number(totalIncome || 0).toLocaleString('id-ID')} dengan tanggungan keluarga ${familyMembers || 3} orang.
Jawab dalam format JSON:
{
  "methodName": "${method}",
  "recommendations": [
    { "category": "Kebutuhan Pokok & Dapur", "idealPercentage": 50, "idealAmount": 0, "notes": "Alasan singkat" },
    { "category": "Cicilan & Tagihan", "idealPercentage": 20, "idealAmount": 0, "notes": "Alasan singkat" },
    { "category": "Tabungan & Investasi", "idealPercentage": 20, "idealAmount": 0, "notes": "Alasan singkat" },
    { "category": "Keinginan & Hiburan", "idealPercentage": 10, "idealAmount": 0, "notes": "Alasan singkat" }
  ],
  "familyAdvice": "Saran komunikasi suami istri untuk mematuhi pos ini"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.5,
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("Error generating budget advice:", err);
    }
  }

  // Fallback calculation
  const income = Number(totalIncome) || 12000000;
  res.json({
    methodName: method || "50/30/20",
    recommendations: [
      { category: "Kebutuhan Pokok & Pangan", idealPercentage: 45, idealAmount: Math.round(income * 0.45), notes: "Kebutuhan beras, lauk, sayur, perlengkapan mandi, dan utilitas rumah." },
      { category: "Cicilan & Liabilitas Rutin", idealPercentage: 20, idealAmount: Math.round(income * 0.20), notes: "Maksimal DSR 30% agar arus kas keluarga tetap fleksibel." },
      { category: "Dana Darurat & Investasi", idealPercentage: 20, idealAmount: Math.round(income * 0.20), notes: "Disisihkan otomatis di awal bulan ke instrumen pasar uang / emas." },
      { category: "Edukasi & Masa Depan Anak", idealPercentage: 10, idealAmount: Math.round(income * 0.10), notes: "Tabungan pendidikan dan les anak." },
      { category: "Sosial, Zakat & Infaq", idealPercentage: 5, idealAmount: Math.round(income * 0.05), notes: "Kewajiban zakat 2.5% dan infaq/sedekah bulanan." }
    ],
    familyAdvice: "Diskusikan anggaran ini bersama pasangan pada awal bulan gajian, dan tinjau kembali setiap minggu."
  });
});

// Configure Vite integration for development or serve dist in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
