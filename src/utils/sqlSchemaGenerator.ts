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
  Transaction
} from '../types/finance';

export const SQL_DDL_SCHEMA = `-- =====================================================================
-- SKEMA RELASIONAL DATABASE KEUANGAN RUMAH TANGGA
-- KELUARGA MUNAWAR ROIS & WINI YUSNIA
-- Kompatibel: PostgreSQL 14+, Cloud SQL, CockroachDB, MySQL 8.0
-- Karakteristik: ACID compliant, Foreign Key Cascades, Multi-User Sync
-- =====================================================================

-- 1. Tabel Profil Rumah Tangga & Kolaborasi Suami Istri
CREATE TABLE IF NOT EXISTS households (
    id VARCHAR(64) PRIMARY KEY,
    family_name VARCHAR(128) NOT NULL DEFAULT 'Keluarga Munawar Rois',
    husband_name VARCHAR(128) NOT NULL DEFAULT 'Munawar Rois',
    wife_name VARCHAR(128) NOT NULL DEFAULT 'Wini Yusnia',
    daily_allowance_target NUMERIC(15, 2) NOT NULL DEFAULT 150000.00,
    monthly_grocery_budget NUMERIC(15, 2) NOT NULL DEFAULT 3500000.00,
    role_belanja VARCHAR(32) NOT NULL DEFAULT 'Istri',
    role_utilitas VARCHAR(32) NOT NULL DEFAULT 'Suami',
    role_investasi VARCHAR(32) NOT NULL DEFAULT 'Bersama',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Rekening & Akun Keuangan (Bank, E-Wallet, Kartu Kredit, Tunai)
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(64) PRIMARY KEY,
    household_id VARCHAR(64) NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('bank', 'credit_card', 'ewallet', 'cash')),
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    account_number VARCHAR(64),
    credit_limit NUMERIC(15, 2) DEFAULT 0.00,
    billing_day INT CHECK (billing_day BETWEEN 1 AND 31),
    due_day INT CHECK (due_day BETWEEN 1 AND 31),
    color VARCHAR(32) DEFAULT '#0284c7',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Pos Anggaran (50/30/20 & Kustom)
CREATE TABLE IF NOT EXISTS budgets (
    id VARCHAR(64) PRIMARY KEY,
    household_id VARCHAR(64) NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    category VARCHAR(128) NOT NULL,
    allocated_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    spent_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    is_special_pos BOOLEAN DEFAULT FALSE,
    special_note TEXT,
    managed_by VARCHAR(32) DEFAULT 'Bersama',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Transaksi Arus Kas (Income, Expense, Transfer)
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    household_id VARCHAR(64) NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    account_id VARCHAR(64) NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    to_account_id VARCHAR(64) REFERENCES accounts(id) ON DELETE SET NULL,
    type VARCHAR(16) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount NUMERIC(15, 2) NOT NULL,
    category VARCHAR(128) NOT NULL,
    sub_category VARCHAR(128),
    description TEXT NOT NULL,
    creator VARCHAR(32) NOT NULL CHECK (creator IN ('Suami', 'Istri', 'Bersama')),
    transaction_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index performa query riwayat transaksi
CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_tx_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_tx_category ON transactions(category);

-- 5. Tabel Dana Darurat Keluarga
CREATE TABLE IF NOT EXISTS emergency_funds (
    id VARCHAR(64) PRIMARY KEY,
    household_id VARCHAR(64) NOT NULL UNIQUE REFERENCES households(id) ON DELETE CASCADE,
    current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    monthly_expense_baseline NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    risk_profile VARCHAR(64) NOT NULL,
    dependents_count INT NOT NULL DEFAULT 2,
    target_months INT NOT NULL DEFAULT 6,
    account_id VARCHAR(64) REFERENCES accounts(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel Target Keuangan & Impian Keluarga
CREATE TABLE IF NOT EXISTS financial_goals (
    id VARCHAR(64) PRIMARY KEY,
    household_id VARCHAR(64) NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    title VARCHAR(256) NOT NULL,
    category VARCHAR(64) NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL,
    current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    deadline_ym VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    monthly_contribution NUMERIC(15, 2) DEFAULT 0.00,
    icon_name VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabel Portofolio Investasi
CREATE TABLE IF NOT EXISTS investment_assets (
    id VARCHAR(64) PRIMARY KEY,
    household_id VARCHAR(64) NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(256) NOT NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('deposito', 'reksadana', 'saham', 'emas', 'properti')),
    buy_amount NUMERIC(15, 2) NOT NULL,
    current_valuation NUMERIC(15, 2) NOT NULL,
    units_or_grams NUMERIC(15, 4),
    unit_label VARCHAR(32),
    notes TEXT,
    last_updated DATE NOT NULL
);

-- 8. Tabel Pelacakan Utang & Liabilitas
CREATE TABLE IF NOT EXISTS debts (
    id VARCHAR(64) PRIMARY KEY,
    household_id VARCHAR(64) NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(256) NOT NULL,
    lender VARCHAR(128) NOT NULL,
    type VARCHAR(32) NOT NULL,
    initial_amount NUMERIC(15, 2) NOT NULL,
    remaining_balance NUMERIC(15, 2) NOT NULL,
    interest_rate_pct_annual NUMERIC(5, 2) NOT NULL,
    minimum_payment_monthly NUMERIC(15, 2) NOT NULL,
    due_date_day INT NOT NULL CHECK (due_date_day BETWEEN 1 AND 31),
    tenor_remaining_months INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tabel Aset Riil & Kekayaan Bersih
CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR(64) PRIMARY KEY,
    household_id VARCHAR(64) NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(256) NOT NULL,
    type VARCHAR(16) NOT NULL CHECK (type IN ('lancar', 'tetap')),
    category VARCHAR(64) NOT NULL,
    estimated_value NUMERIC(15, 2) NOT NULL,
    acquisition_year INT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tabel Pengingat Tagihan Berkala
CREATE TABLE IF NOT EXISTS recurring_bills (
    id VARCHAR(64) PRIMARY KEY,
    household_id VARCHAR(64) NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(256) NOT NULL,
    category VARCHAR(32) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    due_day INT NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    is_paid_this_month BOOLEAN DEFAULT FALSE,
    last_paid_date DATE,
    default_account_id VARCHAR(64) REFERENCES accounts(id) ON DELETE SET NULL,
    customer_number VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

export function generateLiveSqlDataDump(
  household: HouseholdCollaboration,
  accounts: Account[],
  transactions: Transaction[],
  budgets: Budget[],
  emergencyFund: EmergencyFund,
  goals: FinancialGoal[],
  investments: InvestmentAsset[],
  debts: DebtItem[],
  assets: AssetItem[],
  bills: RecurringBill[]
): string {
  const householdId = 'hh-munawar-rois-001';
  const escapeSql = (str: string | undefined | null) => {
    if (!str) return "''";
    return `'${str.replace(/'/g, "''")}'`;
  };

  const output: string[] = [
    SQL_DDL_SCHEMA,
    '\n-- =====================================================================',
    '-- LIVE DATA INSERTS (DATA SINKRONISASI AKTIF KELUARGA MUNAWAR ROIS)',
    '-- =====================================================================\n',
  ];

  // 1. Household
  output.push(`-- 1. Insert Profil Rumah Tangga`);
  output.push(
    `INSERT INTO households (id, family_name, husband_name, wife_name, daily_allowance_target, monthly_grocery_budget, role_belanja, role_utilitas, role_investasi) VALUES (` +
      `${escapeSql(householdId)}, ` +
      `${escapeSql(household.familyName || 'Keluarga Munawar Rois')}, ` +
      `${escapeSql(household.husbandName || 'Munawar Rois')}, ` +
      `${escapeSql(household.wifeName || 'Wini Yusnia')}, ` +
      `${household.dailyAllowanceTarget || 150000}, ` +
      `${household.monthlyGroceryBudget || 3500000}, ` +
      `${escapeSql(household.assignedRoles?.belanjaHarian || 'Istri')}, ` +
      `${escapeSql(household.assignedRoles?.utilitasRumah || 'Suami')}, ` +
      `${escapeSql(household.assignedRoles?.investasiUtang || 'Bersama')}` +
      `) ON CONFLICT (id) DO UPDATE SET ` +
      `daily_allowance_target = EXCLUDED.daily_allowance_target, ` +
      `monthly_grocery_budget = EXCLUDED.monthly_grocery_budget;\n`
  );

  // 2. Accounts
  output.push(`-- 2. Insert Rekening Akun`);
  accounts.forEach((acc) => {
    output.push(
      `INSERT INTO accounts (id, household_id, name, type, balance, account_number, credit_limit, billing_day, due_day, color) VALUES (` +
        `${escapeSql(acc.id)}, ` +
        `${escapeSql(householdId)}, ` +
        `${escapeSql(acc.name)}, ` +
        `${escapeSql(acc.type)}, ` +
        `${acc.balance}, ` +
        `${escapeSql(acc.accountNumber || '')}, ` +
        `${acc.creditLimit || 0}, ` +
        `${acc.billingDay || 'NULL'}, ` +
        `${acc.dueDay || 'NULL'}, ` +
        `${escapeSql(acc.color)}` +
        `) ON CONFLICT (id) DO UPDATE SET balance = EXCLUDED.balance;`
    );
  });
  output.push('');

  // 3. Budgets
  output.push(`-- 3. Insert Anggaran`);
  budgets.forEach((b) => {
    output.push(
      `INSERT INTO budgets (id, household_id, category, allocated_amount, spent_amount, is_special_pos, special_note, managed_by) VALUES (` +
        `${escapeSql(b.id)}, ` +
        `${escapeSql(householdId)}, ` +
        `${escapeSql(b.category)}, ` +
        `${b.allocatedAmount}, ` +
        `${b.spentAmount}, ` +
        `${b.isSpecialPos ? 'TRUE' : 'FALSE'}, ` +
        `${escapeSql(b.specialNote || '')}, ` +
        `${escapeSql(b.managedBy || 'Bersama')}` +
        `) ON CONFLICT (id) DO UPDATE SET allocated_amount = EXCLUDED.allocated_amount, spent_amount = EXCLUDED.spent_amount;`
    );
  });
  output.push('');

  // 4. Transactions
  output.push(`-- 4. Insert Riwayat Transaksi`);
  transactions.slice(0, 100).forEach((tx) => {
    output.push(
      `INSERT INTO transactions (id, household_id, account_id, to_account_id, type, amount, category, sub_category, description, creator, transaction_date, is_recurring, notes) VALUES (` +
        `${escapeSql(tx.id)}, ` +
        `${escapeSql(householdId)}, ` +
        `${escapeSql(tx.accountId)}, ` +
        `${tx.toAccountId ? escapeSql(tx.toAccountId) : 'NULL'}, ` +
        `${escapeSql(tx.type)}, ` +
        `${tx.amount}, ` +
        `${escapeSql(tx.category)}, ` +
        `${escapeSql(tx.subCategory || '')}, ` +
        `${escapeSql(tx.description)}, ` +
        `${escapeSql(tx.creator)}, ` +
        `${escapeSql(tx.date)}, ` +
        `${tx.isRecurring ? 'TRUE' : 'FALSE'}, ` +
        `${escapeSql(tx.notes || '')}` +
        `) ON CONFLICT (id) DO NOTHING;`
    );
  });
  output.push('');

  // 5. Emergency Fund
  output.push(`-- 5. Insert Dana Darurat`);
  output.push(
    `INSERT INTO emergency_funds (id, household_id, current_balance, monthly_expense_baseline, risk_profile, dependents_count, target_months, account_id) VALUES (` +
      `'ef-munawar-01', ` +
      `${escapeSql(householdId)}, ` +
      `${emergencyFund.currentBalance}, ` +
      `${emergencyFund.monthlyExpenseBaseline}, ` +
      `${escapeSql(emergencyFund.riskProfile)}, ` +
      `${emergencyFund.dependentsCount}, ` +
      `${emergencyFund.targetMonths}, ` +
      `${emergencyFund.accountId ? escapeSql(emergencyFund.accountId) : 'NULL'}` +
      `) ON CONFLICT (id) DO UPDATE SET current_balance = EXCLUDED.current_balance;\n`
  );

  // 6. Goals
  output.push(`-- 6. Insert Target Finansial`);
  goals.forEach((g) => {
    output.push(
      `INSERT INTO financial_goals (id, household_id, title, category, target_amount, current_amount, deadline_ym, monthly_contribution, icon_name) VALUES (` +
        `${escapeSql(g.id)}, ` +
        `${escapeSql(householdId)}, ` +
        `${escapeSql(g.title)}, ` +
        `${escapeSql(g.category)}, ` +
        `${g.targetAmount}, ` +
        `${g.currentAmount}, ` +
        `${escapeSql(g.deadline)}, ` +
        `${g.monthlyContribution}, ` +
        `${escapeSql(g.iconName || 'Target')}` +
        `) ON CONFLICT (id) DO UPDATE SET current_amount = EXCLUDED.current_amount;`
    );
  });
  output.push('');

  // 7. Investments
  output.push(`-- 7. Insert Portofolio Investasi`);
  investments.forEach((inv) => {
    output.push(
      `INSERT INTO investment_assets (id, household_id, name, type, buy_amount, current_valuation, units_or_grams, unit_label, notes, last_updated) VALUES (` +
        `${escapeSql(inv.id)}, ` +
        `${escapeSql(householdId)}, ` +
        `${escapeSql(inv.name)}, ` +
        `${escapeSql(inv.type)}, ` +
        `${inv.buyAmount}, ` +
        `${inv.currentValuation}, ` +
        `${inv.unitsOrGrams || 'NULL'}, ` +
        `${escapeSql(inv.unitLabel || '')}, ` +
        `${escapeSql(inv.notes || '')}, ` +
        `${escapeSql(inv.lastUpdated)}` +
        `) ON CONFLICT (id) DO UPDATE SET current_valuation = EXCLUDED.current_valuation;`
    );
  });
  output.push('');

  // 8. Debts
  output.push(`-- 8. Insert Liabilitas & Utang`);
  debts.forEach((d) => {
    output.push(
      `INSERT INTO debts (id, household_id, name, lender, type, initial_amount, remaining_balance, interest_rate_pct_annual, minimum_payment_monthly, due_date_day, tenor_remaining_months) VALUES (` +
        `${escapeSql(d.id)}, ` +
        `${escapeSql(householdId)}, ` +
        `${escapeSql(d.name)}, ` +
        `${escapeSql(d.lender)}, ` +
        `${escapeSql(d.type)}, ` +
        `${d.initialAmount}, ` +
        `${d.remainingBalance}, ` +
        `${d.interestRatePctAnnual}, ` +
        `${d.minimumPaymentMonthly}, ` +
        `${d.dueDateDay}, ` +
        `${d.tenorRemainingMonths || 'NULL'}` +
        `) ON CONFLICT (id) DO UPDATE SET remaining_balance = EXCLUDED.remaining_balance;`
    );
  });
  output.push('');

  // 9. Assets
  output.push(`-- 9. Insert Aset Riil`);
  assets.forEach((a) => {
    output.push(
      `INSERT INTO assets (id, household_id, name, type, category, estimated_value, acquisition_year, notes) VALUES (` +
        `${escapeSql(a.id)}, ` +
        `${escapeSql(householdId)}, ` +
        `${escapeSql(a.name)}, ` +
        `${escapeSql(a.type)}, ` +
        `${escapeSql(a.category)}, ` +
        `${a.estimatedValue}, ` +
        `${a.acquisitionYear || 'NULL'}, ` +
        `${escapeSql(a.notes || '')}` +
        `) ON CONFLICT (id) DO UPDATE SET estimated_value = EXCLUDED.estimated_value;`
    );
  });
  output.push('');

  // 10. Recurring Bills
  output.push(`-- 10. Insert Tagihan Rutin`);
  bills.forEach((b) => {
    output.push(
      `INSERT INTO recurring_bills (id, household_id, name, category, amount, due_day, is_paid_this_month, last_paid_date, default_account_id, customer_number) VALUES (` +
        `${escapeSql(b.id)}, ` +
        `${escapeSql(householdId)}, ` +
        `${escapeSql(b.name)}, ` +
        `${escapeSql(b.category)}, ` +
        `${b.amount}, ` +
        `${b.dueDay}, ` +
        `${b.isPaidThisMonth ? 'TRUE' : 'FALSE'}, ` +
        `${b.lastPaidDate ? escapeSql(b.lastPaidDate) : 'NULL'}, ` +
        `${escapeSql(b.defaultAccountId)}, ` +
        `${escapeSql(b.customerNumber || '')}` +
        `) ON CONFLICT (id) DO UPDATE SET is_paid_this_month = EXCLUDED.is_paid_this_month;`
    );
  });

  output.push('\n-- Selesai dieksekusi: data telah terstruktur rapi dalam skema relasional.');
  return output.join('\n');
}
