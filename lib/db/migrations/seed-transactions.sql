-- Insert Sample Transactions
INSERT INTO transactions (id, date, amount, type, category, description, source_account_id, target_account_id, created_at) VALUES
-- Income transactions
('txn_1', '2024-03-01', 5000.00, 'income', 'Salary', 'Monthly salary deposit', NULL, NULL, NOW()),

-- Expense transactions
('txn_3', '2024-03-02', -150.00, 'expense', 'Food & Groceries', 'Weekly grocery shopping', NULL, NULL, NOW()),
('txn_4', '2024-03-05', -45.00, 'expense', 'Dining Out', 'Dinner at restaurant', NULL, NULL, NOW()),
('txn_5', '2024-03-10', -120.00, 'expense', 'Utilities', 'Electricity bill', NULL, NULL, NOW()),
('txn_6', '2024-03-12', -80.00, 'expense', 'Transportation', 'Gas refill', NULL, NULL, NOW()),
('txn_7', '2024-03-15', -200.00, 'expense', 'Shopping', 'New clothes', NULL, NULL, NOW()),
('txn_8', '2024-03-20', -75.00, 'expense', 'Entertainment', 'Movie tickets', NULL, NULL, NOW()),

-- Transfer transactions
('txn_9', '2024-03-01', 1000.00, 'transfer', NULL, 'Transfer to savings', 'acc_check', 'acc_sav', NOW()),