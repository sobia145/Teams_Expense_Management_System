-- ==============================================================================
-- TEAM EXPENSE MANAGEMENT SYSTEM (TEMS)
-- Version 2.0: "Resume-Level" Production Grade Schema
-- Features: CHECK constraints, Soft Deletes, Strict Indexes, Subgroup Logic
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS tems;
USE tems;

-- ------------------------------------------------------------------------------
-- 1. USERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    phone VARCHAR(20),
    is_deleted BOOLEAN DEFAULT FALSE, -- Soft delete for historical data safety
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. GROUPS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS groups (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    created_by INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ------------------------------------------------------------------------------
-- 3. GROUP MEMBERS (Unique Constraint)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS group_members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(50) DEFAULT 'MEMBER', -- Enum removed
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (group_id, user_id), -- IMPOSSIBLE to add same user twice
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 4. SUBGROUPS (Dynamic Spilts - "Just the Girls" etc.)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subgroups (
    subgroup_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 5. SUBGROUP MEMBERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subgroup_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subgroup_id INT NOT NULL,
    user_id INT NOT NULL,
    UNIQUE (subgroup_id, user_id),
    FOREIGN KEY (subgroup_id) REFERENCES subgroups(subgroup_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 6. CATEGORIES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- ------------------------------------------------------------------------------
-- 7. EXPENSES (CHECK Constraint)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
    expense_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    subgroup_id INT, -- Linking explicitly to a subgroup if applicable
    paid_by INT NOT NULL,
    category_id INT,
    title VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING_APPROVAL',
    expense_date DATE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Required for 24hr objection window
    CHECK (total_amount > 0), -- IMPOSSIBLE to log a 0 or negative expense
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (subgroup_id) REFERENCES subgroups(subgroup_id) ON DELETE SET NULL,
    FOREIGN KEY (paid_by) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- ------------------------------------------------------------------------------
-- 8. EXPENSE SPLITS (CHECK Constraint)
-- ------------------------------------------------------------------------------
-- Percentage column removed globally to prevent desync calculation errors
CREATE TABLE IF NOT EXISTS expense_splits (
    split_id INT AUTO_INCREMENT PRIMARY KEY,
    expense_id INT NOT NULL,
    user_id INT NOT NULL,
    amount_owed DECIMAL(10,2) NOT NULL,
    is_settled BOOLEAN DEFAULT FALSE,
    CHECK (amount_owed >= 0), -- IMPOSSIBLE to owe a negative amount
    UNIQUE (expense_id, user_id),
    FOREIGN KEY (expense_id) REFERENCES expenses(expense_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 9. APPROVALS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approvals (
    approval_id INT AUTO_INCREMENT PRIMARY KEY,
    expense_id INT NOT NULL,
    user_id INT NOT NULL,
    action VARCHAR(50) NOT NULL, -- e.g., 'OBJECTION', 'APPROVAL'
    status VARCHAR(50) DEFAULT 'PENDING',
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actioned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_id) REFERENCES expenses(expense_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 10. BUDGETS (Unique Constraint)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS budgets (
    budget_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    category_id INT NOT NULL,
    limit_amount DECIMAL(10,2) NOT NULL,
    period VARCHAR(50) DEFAULT 'TRIP',
    UNIQUE (group_id, category_id, period), -- Prevents duplicate duplicate budgets
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 11. BUDGET ALERTS (Derived values removed)
-- ------------------------------------------------------------------------------
-- Removed spent_amount/limit_amount. Only storing the threshold event.
CREATE TABLE IF NOT EXISTS budget_alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    budget_id INT NOT NULL,
    exceeded_amount DECIMAL(10,2) NOT NULL, -- Precisely capture by how much it exceeded
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES budgets(budget_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 12. SETTLEMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settlements (
    settlement_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    payer_id INT NOT NULL,
    payee_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    settled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (payer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (payee_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 13. SETTLEMENT DETAILS (Traceability Fixed)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settlement_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    settlement_id INT NOT NULL,
    expense_id INT NOT NULL,
    amount_allocated DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (settlement_id) REFERENCES settlements(settlement_id) ON DELETE CASCADE,
    FOREIGN KEY (expense_id) REFERENCES expenses(expense_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 14. HISTORY LOG
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS history_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT,
    triggered_by INT,
    entity_type VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    old_value JSON,
    new_value JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 🚀 TARGETED PERFORMANCE INDEXES
-- ==============================================================================
-- Automatically speeds up specific heavily-run backend queries.

-- Faster group dashboard loads (find all expenses in a group)
CREATE INDEX idx_expenses_group ON expenses(group_id);

-- Faster timeline sorting
CREATE INDEX idx_expenses_date ON expenses(expense_date);

-- Faster "Amount You Owe" calculation (find all splits for a specific user)
CREATE INDEX idx_splits_user ON expense_splits(user_id);

-- Faster history audit pulls
CREATE INDEX idx_history_group ON history_log(group_id);

