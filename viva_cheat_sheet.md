# 🎓 TEMS: Major Project Viva Cheat Sheet

Your database architecture is now at a professional industry level. During your project defense (Viva), professors will no longer attack your table structure. Instead, they will test your **System Logic**. 

Memorize these 4 critical engineering answers.

---

### 🛑 Question 1: The Objection Rules
**Q:** *What happens if an expense is added, one person objects, but the other two approve? What is the final status?*
**A:** **The "One-Veto" Rule.** If **ANY** user objects, the entire expense is marked as `REJECTED`. The system prioritizes strict financial consent over majority rule. A completely new, corrected expense must be filed.

---

### ⏱️ Question 2: The 24-Hour Timer
**Q:** *How does the 24-hour auto-approval timer work? What if a user never opens the app? Does a continuous timer run in the background?*
**A:** **Lazy Evaluation.** We do *not* run expensive continuous chron-jobs. Instead, when a user accesses the dashboard, the backend performs a real-time check: `if (current_time - created_at_timestamp >= 24)`. If true, the backend automatically transitions the `status` to `APPROVED` right at that moment.

---

### ⚖️ Question 3: Subgroups vs. Custom Splits
**Q:** *What if a `subgroup_id` (like "Girls") is attached to an expense, but the user manually edited the amounts so they are unequal? Which data is the priority?*
**A:** **`expense_splits` is the Final Authority.** The `subgroup_id` acts merely as a UI template to quickly auto-fill users. Regardless of the subgroup attached, the system's financial math *exclusively* reads the rows inside the `expense_splits` table.

---

### 🔔 Question 4: Budget Alert Execution
**Q:** *When exactly does the system trigger a Budget Alert? On every expense add, or only when the dashboard loads?*
**A:** **Database Transaction Layer.** Alerts are triggered strictly on the backend during the `Expense Insert/Update` transaction block. When an expense is approved, the Java backend sums the category, compares it to the `limit_amount` in the `budgets` table, and if exceeded, inserts a record into `budget_alerts` instantly.
