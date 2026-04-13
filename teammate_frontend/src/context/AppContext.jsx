import { createContext, useEffect, useMemo, useState, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import { groupService } from '../services/groupService';
import { expenseService } from '../services/expenseService';
import { adminService } from '../services/adminService';
import api from '../services/api';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = window.localStorage.getItem('tems-selected-group');
        return saved ? parseInt(saved) : null;
    }
    return null;
  });

  const [groupLocked, setGroupLocked] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = typeof window !== 'undefined' ? window.localStorage.getItem('tems-theme') : null;

    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  // Sync selectedGroupId with localStorage for Global Persistence!
  useEffect(() => {
    if (typeof window !== 'undefined') {
        if (selectedGroupId) {
            window.localStorage.setItem('tems-selected-group', selectedGroupId.toString());
        } else {
            window.localStorage.removeItem('tems-selected-group');
        }
    }
  }, [selectedGroupId]);

  // CRITICAL FIX: Use String coercion to ensure robust matching even if IDs come from different types (JSON number vs Route string)
  const selectedGroup = useMemo(() => {
    if (!selectedGroupId) return null;
    return groups.find(g => String(g.groupId) === String(selectedGroupId)) || null;
  }, [groups, selectedGroupId]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tems-theme', theme);
    }
  }, [theme]);

  const refreshHistory = useCallback(async (currentUser) => {
    if (!currentUser) return;
    try {
        if (currentUser.role === 'ADMIN') {
            const h = await adminService.getHistoryLogs();
            setHistory(h || []);
        } else {
            // Priority: If a group is selected, show group-wide feed (Notifications logic)
            // Fallback: Show personal activity
            const endpoint = selectedGroupId 
                ? `/history?groupId=${selectedGroupId}` 
                : `/history?userId=${currentUser.userId}`;
                
            const res = await api.get(endpoint);
            setHistory(res.data || []);
        }
    } catch (err) {
        console.error("History sync failed", err);
    }
  }, []); // Only rebuild if user identity truly changes, not on every group switch

  const refreshSettlements = useCallback(async () => {
    if (!user || !user.userId) return;
    try {
        const { settlementService } = await import('../services/settlementService');
        // Fix: Fetch by group if selected, otherwise fetch UNIVERSAL list for all user's groups
        const data = selectedGroupId 
            ? await settlementService.getSettlements(selectedGroupId)
            : await settlementService.getUserSettlements(user.userId);
            
        setSettlements(data || []);
    } catch (err) {
        console.error("Settlement re-sync failed", err);
    }
  }, [selectedGroupId, user]);

  // Master Bootstrapper - Runs exactly ONCE when the user logs in
  useEffect(() => {
    if (user && user.userId) {
        groupService.getGroupsForApp(user).then(setGroups);
        // Only fetch GLOBAL data here. Group-specific data is handled by localized effects.
        expenseService.getExpenses(user).then(setExpenses);
        expenseService.getPendingApprovals(user.userId).then(setNotifications);
        
        // Initial global history fetch
        adminService.getHistoryLogs()
            .then(setHistory)
            .catch(() => refreshHistory(user));
    } else {
        setGroups([]);
        setExpenses([]);
        setNotifications([]);
        setHistory([]);
    }
  }, [user]); // Removed refreshHistory as a dependency to stop loops!

  useEffect(() => {
    if (selectedGroupId) {
        refreshSettlements();
        refreshHistory(user); // Fetch group-specific history only when selection changes
        if (selectedGroup) {
            setGroupLocked(selectedGroup.isLocked || false);
        }
    } else {
        setSettlements([]);
        setGroupLocked(false);
        if (user) refreshHistory(user); // Revert to global history
    }
  }, [selectedGroupId, selectedGroup, refreshSettlements, user]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  /**
   * PERSISTENT AUDIT LOGGER
   * Writes history events directly to the MySQL database so they survive logouts/refreshes!
   */
  const addHistoryEvent = useCallback(async (action, newData, actorName = user?.name || 'System') => {
    const logPayload = {
        action,
        newData,
        performedByName: actorName,
        performedBy: user?.userId || null,
        entityType: 'ACTIVITY',
        groupId: selectedGroupId,
        groupName: selectedGroup?.name || null
    };

    try {
        // Physically push the log to the Java Backend!
        await api.post('/history/add', logPayload);
        // Instant refresh to sync the UI with the real DB state
        refreshHistory(user);
    } catch (err) {
        console.warn("Audit persistence failed, using local fallback", err);
        setHistory(prev => [{ ...logPayload, createdAt: new Date().toISOString() }, ...prev]);
    }
  }, [user, selectedGroupId, selectedGroup, refreshHistory]);

  const value = useMemo(
    () => ({
      groups,
      setGroups,
      selectedGroupId,
      setSelectedGroupId,
      selectedGroup,
      expenses,
      setExpenses,
      budgets,
      setBudgets,
      notifications,
      setNotifications,
      history,
      addHistoryEvent,
      settlements,
      setSettlements,
      groupLocked,
      setGroupLocked,
      theme,
      setTheme,
      toggleTheme,
      refreshHistory: () => refreshHistory(user),
      refreshSettlements
    }),
    [groups, selectedGroupId, selectedGroup, expenses, budgets, notifications, history, addHistoryEvent, settlements, groupLocked, theme, user, refreshHistory, refreshSettlements]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
