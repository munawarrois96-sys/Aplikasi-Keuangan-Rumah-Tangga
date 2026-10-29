export type TransactionType = 'income' | 'expense' | 'transfer';

export type UserRole = 'Suami' | 'Istri' | 'Bersama';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number;
  category: string;
  subCategory?: string;
  accountId: string;
  toAccountId?: string; // For transfer
  description: string;
  creator: UserRole;
  isRecurring?: boolean;
  notes?: string;
}

export type AccountType = 'bank' | 'credit_card' | 'ewallet' | 'cash';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  accountNumber?: string;
  color: string;
  creditLimit?: number; // for credit card
  billingDay?: number;
  dueDay?: number;
}

export interface Budget {
  id: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  isSpecialPos?: boolean;
  specialNote?: string; // e.g. "Pos Belanja Harian Istri" | "Pos Acara Lebaran"
  managedBy?: UserRole;
}

export type RiskProfile = 'Karyawan Tetap' | 'Karyawan Kontrak' | 'Pengusaha / Freelancer';

export interface EmergencyFund {
  currentBalance: number;
  monthlyExpenseBaseline: number;
  riskProfile: RiskProfile;
  dependentsCount: number;
  targetMonths: number;
  accountId?: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  category: 'Pendidikan Anak' | 'Pensiun' | 'Liburan Keluarga' | 'Beli Aset' | 'Lainnya';
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM
  monthlyContribution: number;
  iconName?: string;
}

export type InvestmentType = 'deposito' | 'reksadana' | 'saham' | 'emas' | 'properti';

export interface InvestmentAsset {
  id: string;
  name: string;
  type: InvestmentType;
  buyAmount: number;
  currentValuation: number;
  unitsOrGrams?: number;
  unitLabel?: string; // e.g. "gram", "lembar saham", "unit"
  lastUpdated: string;
  notes?: string;
}

export interface DebtItem {
  id: string;
  name: string;
  lender: string;
  type: 'kpr' | 'kendaraan' | 'kartu_kredit' | 'pinjaman_pribadi' | 'lainnya';
  initialAmount: number;
  remainingBalance: number;
  interestRatePctAnnual: number;
  minimumPaymentMonthly: number;
  dueDateDay: number;
  tenorRemainingMonths?: number;
}

export interface AssetItem {
  id: string;
  name: string;
  type: 'lancar' | 'tetap';
  category: 'Kas & Bank' | 'Emas' | 'Properti' | 'Kendaraan' | 'Elektronik' | 'Lainnya';
  estimatedValue: number;
  acquisitionYear?: number;
  notes?: string;
}

export interface RecurringBill {
  id: string;
  name: string;
  category: 'listrik' | 'air' | 'internet' | 'asuransi' | 'pajak' | 'sekolah' | 'lainnya';
  amount: number;
  dueDay: number;
  isPaidThisMonth: boolean;
  lastPaidDate?: string;
  defaultAccountId: string;
  customerNumber?: string;
}

export interface HouseholdCollaboration {
  activeProfile: UserRole;
  husbandName: string;
  wifeName: string;
  familyName: string;
  dailyAllowanceTarget: number; // e.g. 150000 per day
  dailyAllowanceSpentThisMonth: number;
  monthlyGroceryBudget: number;
  assignedRoles: {
    belanjaHarian: UserRole;
    utilitasRumah: UserRole;
    investasiUtang: UserRole;
  };
}

export interface AILeakItem {
  title: string;
  category: string;
  estimatedMonthlyLoss: number;
  severity: 'low' | 'medium' | 'high';
  detail: string;
  actionStep: string;
}

export interface AILeakAnalysis {
  summary: string;
  score: number;
  leaksDetected: AILeakItem[];
  actionPlan: string[];
}
