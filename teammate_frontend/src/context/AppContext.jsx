import { createContext, useEffect, useMemo, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { groupService } from '../services/groupService';
import { expenseService } from '../services/expenseService';
import { adminService } from '../services/adminService';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [tripLocked, setTripLocked] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = typeof window !== 'undefined' ? window.localStorage.getItem('tems-theme') : null;

    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  const selectedGroup = useMemo(() => 
    groups.find(g => g.groupId === selectedGroupId), 
    [groups, selectedGroupId]
  );

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tems-theme', theme);
    }
  }, [theme]);

  // Master Bootstrapper: Populating global Application State explicitly from MySQL whenever a User logs in natively
  useEffect(() => {
    if (user && user.userId) {
        groupService.getGroupsForApp(user).then(setGroups);
        expenseService.getExpenses(user).then(setExpenses);
        expenseService.getPendingApprovals(user.userId).then(setNotifications);
        
        // Populate History Log explicitly from MySQL!
        if (user.role === 'ADMIN') {
            adminService.getHistoryLogs().then(setHistory);
        } else {
            // For regular users, history is currently session-based or fetched via specific group logic
            setHistory([]);
        }
    } else {
        setGroups([]);
        setExpenses([]);
        setNotifications([]);
        setHistory([]);
    }
  }, [user]);

  useEffect(() => {
    if (selectedGroupId) {
        import('../services/settlementService').then(({ settlementService }) => {
            settlementService.getSettlements(selectedGroupId).then(setSettlements);
        });
        if (selectedGroup) {
            setTripLocked(selectedGroup.isLocked || false);
        }
    } else {
        setSettlements([]);
        setTripLocked(false);
    }
  }, [selectedGroupId, selectedGroup]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  const addHistoryEvent = (event, details, actor = 'You') => {
    setHistory((prev) => [
      {
        id: Date.now(),
        event,
        actor,
        details,
        time: new Date().toISOString()
      },
      ...prev
    ]);
  };

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
      tripLocked,
      setTripLocked,
      theme,
      setTheme,
      toggleTheme
    }),
    [groups, selectedGroupId, selectedGroup, expenses, budgets, notifications, history, settlements, tripLocked, theme]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
