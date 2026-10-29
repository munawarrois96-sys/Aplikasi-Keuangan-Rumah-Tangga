import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  AlertTriangle,
  CheckCircle2,
  Send,
  Coffee,
  Coins,
  CreditCard,
  Layers,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  MessageSquareHeart,
  Bot
} from 'lucide-react';
import {
  Account,
  AILeakAnalysis,
  Budget,
  HouseholdCollaboration,
  Transaction,
  UserRole
} from '../types/finance';
import { formatRupiah } from '../utils/formatters';

interface AIAdvisorViewProps {
  leakReport: AILeakAnalysis;
  transactions: Transaction[];
  budgets: Budget[];
  accounts: Account[];
  collaboration: HouseholdCollaboration;
  onUpdateLeakReport: (report: AILeakAnalysis) => void;
  activeRole: UserRole;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AIAdvisorView: React.FC<AIAdvisorViewProps> = ({
  leakReport,
  transactions,
  budgets,
  accounts,
  collaboration,
  onUpdateLeakReport,
  activeRole,
}) => {
  const [subTab, setSubTab] = useState<'leaks' | 'chat'>('leaks');
  const [analyzing, setAnalyzing] = useState(false);

  // Chatbot states
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Halo ${activeRole === 'Bersama' ? 'Keluarga Hendrawan' : activeRole === 'Suami' ? 'Pak Rian' : 'Ibu Siti'}! Saya adalah Asisten Keuangan Keluarga Cerdas berbasis AI Anda. 

Saya siap membantu menganalisis arus kas bulanan, strategi pelunasan KPR/utang, dana pendidikan anak, maupun mendeteksi kebocoran pengeluaran halus keluarga. Ada yang ingin didiskusikan hari ini?`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Run AI leak analysis
  const handleRunLeakAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-leaks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions,
          budgets,
          accounts,
          familyInfo: collaboration,
        }),
      });
      const data = await response.json();
      onUpdateLeakReport(data);
    } catch (err) {
      console.error('Error running leak analysis:', err);
      alert('Gagal menjalankan analisis AI, silakan periksa koneksi internet.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Send message to AI Advisor
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            activeRole,
            husbandName: collaboration.husbandName,
            wifeName: collaboration.wifeName,
            totalTransactionsCount: transactions.length,
            leakReportScore: leakReport.score,
          },
        }),
      });

      const data = await response.json();
      const aiReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply || 'Mohon maaf, terjadi kendala saat memproses jawaban. Silakan ulangi.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Terima kasih atas pertanyaannya. Sebagai langkah awal, pastikan pos kebutuhan pokok dan tabungan dana darurat telah teralokasikan minimal 20% dari penghasilan.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const quickPrompts = [
    'Bantu evaluasi kebocoran halus bulan ini',
    'Bagaimana strategi tercepat melunasi cicilan KPR?',
    'Berapa ideal alokasi dana pendidikan anak TK ke SD?',
    'Cara bagi uang belanja harian tanpa konflik',
  ];

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-800">Asisten Keuangan Rumah Tangga AI & Deteksi Kebocoran</h2>
            <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200">
              Gemini 3.8 Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Analisis otomatis pengeluaran impulsif, pembengkakan pos rutin, dan konsultasi keuangan suportif tanpa menghakimi.
          </p>
        </div>

        <div className="flex bg-sky-50 p-1 rounded-xl border border-sky-200 text-xs font-bold">
          <button
            onClick={() => setSubTab('leaks')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'leaks' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-sky-700'
            }`}
          >
            🔍 Deteksi Kebocoran Halus
          </button>
          <button
            onClick={() => setSubTab('chat')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'chat' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-sky-700'
            }`}
          >
            💬 Konsultan Finansial AI
          </button>
        </div>
      </div>

      {/* SUBTAB 1: EVALUASI KEBOCORAN HALUS (AI LEAK DETECTOR) */}
      {subTab === 'leaks' && (
        <div className="space-y-6">
          {/* Hero Leak Score Card */}
          <div className="bg-gradient-to-br from-sky-600 via-sky-700 to-cyan-800 text-white rounded-2xl p-6 shadow-lg shadow-sky-600/20 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-200 block">
                  Sistem Evaluasi Kebocoran Halus (Micro-Spending Detector)
                </span>
                <h3 className="text-xl md:text-2xl font-black">
                  Skor Efisiensi Pengeluaran Keluarga: {leakReport.score} / 100
                </h3>
                <p className="text-xs text-sky-100/80 max-w-xl leading-relaxed">
                  {leakReport.summary}
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleRunLeakAnalysis}
                    disabled={analyzing}
                    className="px-4 py-2 bg-white text-sky-800 hover:bg-sky-50 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                    <span>{analyzing ? 'Sedang Menganalisis Arus Kas...' : 'Jalankan Deteksi AI Sekarang'}</span>
                  </button>
                </div>
              </div>

              {/* Score meter gauge */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 min-w-[240px] text-center">
                <span className="text-xs text-sky-200 font-semibold">Tingkat Kebersihan Arus Kas</span>
                <div className="text-4xl font-black text-white my-1">{leakReport.score}%</div>
                <div className="w-full bg-white/20 rounded-full h-2.5 my-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      leakReport.score >= 80 ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${leakReport.score}%` }}
                  ></div>
                </div>
                <span className="text-[11px] text-sky-100">
                  {leakReport.score >= 80 ? 'Keluarga Sangat Cermat' : 'Potensi Penghematan Terbuka'}
                </span>
              </div>
            </div>
          </div>

          {/* DETECTED LEAKS GRID */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Titik Kebocoran Halus yang Ditemukan ({leakReport.leaksDetected?.length || 0})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leakReport.leaksDetected?.map((leak, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-800">{leak.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          leak.severity === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : leak.severity === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {leak.severity}
                      </span>
                    </div>

                    <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 mb-3">
                      <span className="text-[10px] text-rose-700 block font-semibold">Estimasi Kebocoran Bulanan:</span>
                      <div className="text-lg font-black text-rose-700">
                        {formatRupiah(leak.estimatedMonthlyLoss)} / bulan
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Setara {formatRupiah(leak.estimatedMonthlyLoss * 12)} per tahun
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {leak.detail}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <div className="bg-sky-50 p-2.5 rounded-xl border border-sky-200/80 text-[11px] text-sky-900">
                      <span className="font-extrabold block text-sky-800 mb-0.5">💡 Aksi Nyata Siap Eksekusi:</span>
                      {leak.actionStep}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STRATEGIC ACTION PLAN CARDS */}
          {leakReport.actionPlan?.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Rekomendasi Rencana Aksi Bersama Suami-Istri</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {leakReport.actionPlan.map((action, i) => (
                  <div key={i} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-slate-700 leading-relaxed">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: KONSULTAN FINANSIAL AI (CHAT INTERAKTIF) */}
      {subTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden flex flex-col h-[650px]">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-sky-600 to-cyan-600 px-6 py-3.5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Konsultan Finansial Keluarga ArthaKeluarga</h3>
                <span className="text-[11px] text-sky-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block"></span>
                  Model Gemini Siap Menjawab
                </span>
              </div>
            </div>
            <span className="text-xs bg-sky-700/60 px-3 py-1 rounded-full font-semibold">
              Mode Ramah & Solutif
            </span>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-sky-50/70 p-2.5 border-b border-sky-100 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
            <span className="text-sky-800 font-bold shrink-0 text-[11px]">Pertanyaan Populer:</span>
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-full font-medium whitespace-nowrap text-[11px] transition shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Log */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAi ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isAi
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-700 text-white shadow-xs'
                    }`}
                  >
                    {isAi ? 'AI' : activeRole === 'Istri' ? '👩' : '👨'}
                  </div>
                  <div
                    className={`max-w-xl p-4 rounded-2xl leading-relaxed space-y-1 shadow-2xs ${
                      isAi
                        ? 'bg-slate-50 border border-slate-200 text-slate-800'
                        : 'bg-sky-600 text-white'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>
                    <div
                      className={`text-[10px] text-right pt-1 ${
                        isAi ? 'text-slate-400' : 'text-sky-100'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {chatLoading && (
              <div className="flex items-center gap-2 text-sky-600 font-semibold text-xs py-2">
                <Sparkles className="w-4 h-4 animate-spin text-sky-600" />
                <span>Asisten AI sedang menyusun analisis dan saran terstruktur...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Tuliskan pertanyaan seputar keuangan keluarga Anda di sini..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
                disabled={chatLoading}
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Kirim</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
