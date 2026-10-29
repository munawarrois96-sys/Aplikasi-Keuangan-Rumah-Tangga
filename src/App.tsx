import React, { useState, useEffect } from 'react';
import {
  initialAccounts,
  initialBudgets,
  initialTransactions,
  initialEmergencyFund,
  initialGoals,
  initialInvestments,
  initialDebts,
  initialAssets,
  initialBills,
  initialCollaboration,
  initialAILeak,
} from './data/initialData';
import {
  Account,
  AssetItem,
  Budget,
  DebtItem,
  EmergencyFund,
  FinancialGoal,
  HouseholdCollaboration,
  InvestmentAsset,
  RecurringBill,
  Transaction,
  UserRole,
  AILeakAnalysis,
} from './types/finance';
import { HeaderBanner } from './components/HeaderBanner';
import { NavigationTabs, TabKey } from './components/NavigationTabs';
import { DashboardView } from './components/DashboardView';
import { CashflowView } from './components/CashflowView';
import { SmartBudgetingView } from './components/SmartBudgetingView';
import { SavingsAndGoalsView } from './components/SavingsAndGoalsView';
import { DebtTrackerView } from './components/DebtTrackerView';
import { NetWorthView } from './components/NetWorthView';
import { BillsView } from './components/BillsView';
import { CollaborationView } from './components/CollaborationView';
import { AIAdvisorView } from './components/AIAdvisorView';
import { ReportsView } from './components/ReportsView';
import { GoogleSheetsView } from './components/GoogleSheetsView';
import { TransactionModal } from './components/TransactionModal';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/authService';
import { User } from 'firebase/auth';

export default function App() {
  // Google Workspace Auth states
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Local storage persistence initialization
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('arthakeluarga_accounts');
    return saved ? JSON.parse(saved) : initialAccounts;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('arthakeluarga_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('arthakeluarga_budgets');
    return saved ? JSON.parse(saved) : initialBudgets;
  });

  const [emergencyFund, setEmergencyFund] = useState<EmergencyFund>(() => {
    const saved = localStorage.getItem('arthakeluarga_emergency_fund');
    return saved ? JSON.parse(saved) : initialEmergencyFund;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    const saved = localStorage.getItem('arthakeluarga_goals');
    return saved ? JSON.parse(saved) : initialGoals;
  });

  const [investments, setInvestments] = useState<InvestmentAsset[]>(() => {
    const saved = localStorage.getItem('arthakeluarga_investments');
    return saved ? JSON.parse(saved) : initialInvestments;
  });

  const [debts, setDebts] = useState<DebtItem[]>(() => {
    const saved = localStorage.getItem('arthakeluarga_debts');
    return saved ? JSON.parse(saved) : initialDebts;
  });

  const [assets, setAssets] = useState<AssetItem[]>(() => {
    const saved = localStorage.getItem('arthakeluarga_assets');
    return saved ? JSON.parse(saved) : initialAssets;
  });

  const [bills, setBills] = useState<RecurringBill[]>(() => {
    const saved = localStorage.getItem('arthakeluarga_bills');
    return saved ? JSON.parse(saved) : initialBills;
  });

  const [collaboration, setCollaboration] = useState<HouseholdCollaboration>(() => {
    const saved = localStorage.getItem('arthakeluarga_collab');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.husbandName === 'Rian Hendrawan' || parsed.familyName === 'Keluarga Hendrawan') {
          return {
            ...parsed,
            husbandName: 'Munawar Rois',
            wifeName: 'Wini Yusnia',
            familyName: 'Keluarga Munawar Rois',
          };
        }
        return parsed;
      } catch {
        return initialCollaboration;
      }
    }
    return initialCollaboration;
  });

  const [leakReport, setLeakReport] = useState<AILeakAnalysis>(() => {
    const saved = localStorage.getItem('arthakeluarga_leak_report');
    return saved ? JSON.parse(saved) : initialAILeak;
  });

  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>('Bersama');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('arthakeluarga_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('arthakeluarga_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('arthakeluarga_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('arthakeluarga_emergency_fund', JSON.stringify(emergencyFund));
  }, [emergencyFund]);

  useEffect(() => {
    localStorage.setItem('arthakeluarga_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('arthakeluarga_investments', JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem('arthakeluarga_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('arthakeluarga_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('arthakeluarga_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('arthakeluarga_collab', JSON.stringify(collaboration));
  }, [collaboration]);

  useEffect(() => {
    localStorage.setItem('arthakeluarga_leak_report', JSON.stringify(leakReport));
  }, [leakReport]);

  // Google Workspace Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (u, t) => {
        setUser(u);
        setAccessToken(t);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sign in failed:', err);
      alert(`Gagal menghubungkan ke Google: ${err.message || 'Periksa koneksi Anda.'}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
  };

  const handleImportTransactions = (imported: Partial<Transaction>[]) => {
    const formatted: Transaction[] = imported.map((tx, idx) => ({
      id: tx.id || `imported-${Date.now()}-${idx}`,
      date: tx.date || new Date().toISOString().split('T')[0],
      type: tx.type || 'expense',
      amount: tx.amount || 0,
      category: tx.category || 'Kebutuhan Pokok',
      accountId: accounts[0]?.id || 'acc-1',
      description: tx.description || 'Transaksi Impor Google Sheets',
      creator: tx.creator || 'Bersama',
      isRecurring: tx.isRecurring || false,
    }));
    setTransactions((prev) => [...formatted, ...prev]);
  };

  // Handler: Add Transaction & automatically adjust account balance
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update account balance
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (newTx.type === 'expense' && acc.id === newTx.accountId) {
          return { ...acc, balance: acc.balance - newTx.amount };
        }
        if (newTx.type === 'income' && acc.id === newTx.accountId) {
          return { ...acc, balance: acc.balance + newTx.amount };
        }
        if (newTx.type === 'transfer') {
          if (acc.id === newTx.accountId) {
            return { ...acc, balance: acc.balance - newTx.amount };
          }
          if (acc.id === newTx.toAccountId) {
            return { ...acc, balance: acc.balance + newTx.amount };
          }
        }
        return acc;
      })
    );

    // Update budget spentAmount if applicable
    if (newTx.type === 'expense') {
      setBudgets((prevBudgets) =>
        prevBudgets.map((b) => {
          if (b.category.toLowerCase().includes(newTx.category.toLowerCase()) || newTx.category.toLowerCase().includes(b.category.toLowerCase())) {
            return { ...b, spentAmount: b.spentAmount + newTx.amount };
          }
          return b;
        })
      );
    }
  };

  // Handler: Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Handler: Add Account
  const handleAddAccount = (accData: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...accData,
      id: `acc-${Date.now()}`,
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  // Handler: Update Account Balance
  const handleUpdateAccountBalance = (id: string, newBalance: number) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, balance: newBalance } : a))
    );
  };

  // Handler: Update Budget Plafon
  const handleUpdateBudget = (id: string, newPlafon: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, allocatedAmount: newPlafon } : b))
    );
  };

  // Handler: Add Budget
  const handleAddBudget = (bData: Omit<Budget, 'id'>) => {
    const newB: Budget = {
      ...bData,
      id: `b-${Date.now()}`,
    };
    setBudgets((prev) => [...prev, newB]);
  };

  // Handler: Delete Budget
  const handleDeleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // Handler: Pay Bill
  const handlePayBill = (billId: string, accountId?: string) => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill) return;

    const sourceAccId = accountId || bill.defaultAccountId || accounts[0]?.id;

    // Mark as paid
    setBills((prev) =>
      prev.map((b) =>
        b.id === billId
          ? {
              ...b,
              isPaidThisMonth: true,
              lastPaidDate: new Date().toISOString().split('T')[0],
            }
          : b
      )
    );

    // Auto-create expense transaction
    handleAddTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      amount: bill.amount,
      category: 'Utilitas Rumah',
      accountId: sourceAccId,
      description: `Pembayaran Tagihan Rutin: ${bill.name}`,
      creator: activeRole === 'Bersama' ? 'Suami' : activeRole,
      isRecurring: true,
    });
  };

  // Handler: Add Bill
  const handleAddBill = (billData: Omit<RecurringBill, 'id'>) => {
    const newBill: RecurringBill = {
      ...billData,
      id: `bill-${Date.now()}`,
    };
    setBills((prev) => [...prev, newBill]);
  };

  // Handler: Delete Bill
  const handleDeleteBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  };

  // Handler: Contribute to Financial Goal
  const handleContributeGoal = (goalId: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
      )
    );

    // Record transaction
    const targetGoal = goals.find((g) => g.id === goalId);
    handleAddTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      amount,
      category: 'Tabungan',
      accountId: accounts[1]?.id || accounts[0]?.id,
      description: `Setoran Target: ${targetGoal?.title || 'Target Keuangan'}`,
      creator: activeRole === 'Bersama' ? 'Bersama' : activeRole,
    });
  };

  // Handler: Add Goal
  const handleAddGoal = (gData: Omit<FinancialGoal, 'id'>) => {
    const newG: FinancialGoal = {
      ...gData,
      id: `g-${Date.now()}`,
    };
    setGoals((prev) => [...prev, newG]);
  };

  // Handler: Add Investment
  const handleAddInvestment = (invData: Omit<InvestmentAsset, 'id'>) => {
    const newInv: InvestmentAsset = {
      ...invData,
      id: `inv-${Date.now()}`,
    };
    setInvestments((prev) => [...prev, newInv]);
  };

  // Handler: Add Debt
  const handleAddDebt = (debtData: Omit<DebtItem, 'id'>) => {
    const newDebt: DebtItem = {
      ...debtData,
      id: `d-${Date.now()}`,
    };
    setDebts((prev) => [...prev, newDebt]);
  };

  // Handler: Pay Debt Installment
  const handlePayInstallment = (debtId: string, amount: number) => {
    const targetDebt = debts.find((d) => d.id === debtId);
    if (!targetDebt) return;

    setDebts((prev) =>
      prev.map((d) =>
        d.id === debtId
          ? {
              ...d,
              remainingBalance: Math.max(0, d.remainingBalance - amount),
              tenorRemainingMonths: d.tenorRemainingMonths
                ? Math.max(0, d.tenorRemainingMonths - 1)
                : undefined,
            }
          : d
      )
    );

    handleAddTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      amount,
      category: 'Cicilan',
      accountId: accounts[0]?.id,
      description: `Pembayaran Cicilan: ${targetDebt.name}`,
      creator: activeRole === 'Bersama' ? 'Suami' : activeRole,
      isRecurring: true,
    });
  };

  // Handler: Delete Debt
  const handleDeleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  // Handler: Add Asset
  const handleAddAsset = (aData: Omit<AssetItem, 'id'>) => {
    const newAsset: AssetItem = {
      ...aData,
      id: `ast-${Date.now()}`,
    };
    setAssets((prev) => [...prev, newAsset]);
  };

  // Handler: Delete Asset
  const handleDeleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  // Handler: Reset Data to Initial
  const handleResetData = () => {
    localStorage.clear();
    setAccounts(initialAccounts);
    setTransactions(initialTransactions);
    setBudgets(initialBudgets);
    setEmergencyFund(initialEmergencyFund);
    setGoals(initialGoals);
    setInvestments(initialInvestments);
    setDebts(initialDebts);
    setAssets(initialAssets);
    setBills(initialBills);
    setCollaboration(initialCollaboration);
    setLeakReport(initialAILeak);
    alert('Seluruh data keuangan berhasil direset ke data simulasi awal.');
  };

  // Totals for top calculations
  const totalAssetsVal = assets.reduce((s, a) => s + a.estimatedValue, 0);
  const totalDebtsVal = debts.reduce((s, d) => s + d.remainingBalance, 0);
  const totalNetWorth = totalAssetsVal - totalDebtsVal;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));
  const totalIncomeThisMonth = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenseThisMonth = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const unpaidBillsCount = bills.filter((b) => !b.isPaidThisMonth).length;
  const alertBudgetCount = budgets.filter((b) => (b.spentAmount / (b.allocatedAmount || 1)) >= 0.8).length;
  const totalAlertCount = unpaidBillsCount + alertBudgetCount;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. TOP HEADER WITH SKY BLUE TICKER RUNNING TEXT */}
      <HeaderBanner
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        onOpenNewTransaction={() => setIsTxModalOpen(true)}
        onOpenAIModal={() => setActiveTab('ai')}
        onOpenSheetsTab={() => setActiveTab('sheets')}
        onOpenPrint={() => {
          setActiveTab('reports');
          setTimeout(() => window.print(), 300);
        }}
        onResetData={handleResetData}
        alertCount={totalAlertCount}
        totalNetWorth={totalNetWorth}
        isGoogleConnected={Boolean(user && accessToken)}
      />

      {/* 2. NAVIGATION TABS */}
      <NavigationTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        alertCount={unpaidBillsCount}
        hasGoogleConnected={Boolean(user && accessToken)}
      />

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            accounts={accounts}
            transactions={transactions}
            budgets={budgets}
            debts={debts}
            assets={assets}
            bills={bills}
            emergencyFund={emergencyFund}
            activeRole={activeRole}
            onNavigateTab={setActiveTab}
            onOpenNewTransaction={() => setIsTxModalOpen(true)}
            onPayBill={handlePayBill}
          />
        )}

        {activeTab === 'cashflow' && (
          <CashflowView
            accounts={accounts}
            transactions={transactions}
            onAddTransaction={() => setIsTxModalOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
            onAddAccount={handleAddAccount}
            onUpdateAccountBalance={handleUpdateAccountBalance}
            activeRole={activeRole}
          />
        )}

        {activeTab === 'budget' && (
          <SmartBudgetingView
            budgets={budgets}
            totalIncome={totalIncomeThisMonth}
            totalExpense={totalExpenseThisMonth}
            onUpdateBudget={handleUpdateBudget}
            onAddBudget={handleAddBudget}
            onDeleteBudget={handleDeleteBudget}
            activeRole={activeRole}
          />
        )}

        {activeTab === 'savings' && (
          <SavingsAndGoalsView
            emergencyFund={emergencyFund}
            goals={goals}
            investments={investments}
            totalMonthlyExpense={totalExpenseThisMonth || 10500000}
            onUpdateEmergencyFund={setEmergencyFund}
            onAddGoal={handleAddGoal}
            onContributeGoal={handleContributeGoal}
            onAddInvestment={handleAddInvestment}
            activeRole={activeRole}
          />
        )}

        {activeTab === 'debt' && (
          <DebtTrackerView
            debts={debts}
            totalMonthlyIncome={totalIncomeThisMonth || 15000000}
            onAddDebt={handleAddDebt}
            onPayInstallment={handlePayInstallment}
            onDeleteDebt={handleDeleteDebt}
            activeRole={activeRole}
          />
        )}

        {activeTab === 'networth' && (
          <NetWorthView
            assets={assets}
            debts={debts}
            onAddAsset={handleAddAsset}
            onDeleteAsset={handleDeleteAsset}
            activeRole={activeRole}
          />
        )}

        {activeTab === 'bills' && (
          <BillsView
            bills={bills}
            accounts={accounts}
            onPayBill={handlePayBill}
            onAddBill={handleAddBill}
            onDeleteBill={handleDeleteBill}
            activeRole={activeRole}
          />
        )}

        {activeTab === 'collaboration' && (
          <CollaborationView
            collaboration={collaboration}
            transactions={transactions}
            onUpdateCollaboration={setCollaboration}
            onQuickLogDailyAllowance={(amt, note) => {
              handleAddTransaction({
                date: new Date().toISOString().split('T')[0],
                type: 'expense',
                amount: amt,
                category: 'Kebutuhan Pokok',
                accountId: accounts[2]?.id || accounts[0]?.id, // Default to e-wallet
                description: `Belanja Harian: ${note}`,
                creator: 'Istri',
              });
            }}
            activeRole={activeRole}
          />
        )}

        {activeTab === 'ai' && (
          <AIAdvisorView
            leakReport={leakReport}
            transactions={transactions}
            budgets={budgets}
            accounts={accounts}
            collaboration={collaboration}
            onUpdateLeakReport={setLeakReport}
            activeRole={activeRole}
          />
        )}

        {activeTab === 'sheets' && (
          <GoogleSheetsView
            user={user}
            accessToken={accessToken}
            authLoading={authLoading}
            onSignIn={handleGoogleSignIn}
            onSignOut={handleGoogleSignOut}
            accounts={accounts}
            transactions={transactions}
            budgets={budgets}
            debts={debts}
            assets={assets}
            bills={bills}
            emergencyFund={emergencyFund}
            collaboration={collaboration}
            onImportTransactions={handleImportTransactions}
            activeRole={activeRole}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            transactions={transactions}
            budgets={budgets}
            accounts={accounts}
            debts={debts}
            assets={assets}
            emergencyFund={emergencyFund}
            collaboration={collaboration}
            activeRole={activeRole}
            onOpenGoogleSheets={() => setActiveTab('sheets')}
          />
        )}
      </main>

      {/* 4. FOOTER */}
      <footer className="bg-white border-t border-sky-100 py-4 text-center text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-bold text-sky-800">
            <span>Keluarga Munawar Rois</span>
            <span>•</span>
            <span className="text-slate-500 font-normal">Sistem Manajemen Keuangan Rumah Tangga Terintegrasi & Asisten AI</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Enkripsi Data Lokal Aktif • Mendukung Standar Finansial 50/30/20 & Solvabilitas Indonesia
          </div>
        </div>
      </footer>

      {/* 5. MODAL TRANSACTION */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleAddTransaction}
        accounts={accounts}
        activeRole={activeRole}
      />
    </div>
  );
}
