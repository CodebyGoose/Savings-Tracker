import { useState, useEffect, useCallback } from 'react';
import { Goal, GoalFormData, ToastMessage, ToastType } from '../types';
import { Storage } from '../utils/storage';

export function useSavingsTracker() {
  const [goals, setGoals] = useState<Goal[]>(() => Storage.getGoals());
  const [currentGoalId, setCurrentGoalId] = useState<number | null>(() => {
    const savedId = Storage.getCurrentGoalId();
    const loadedGoals = Storage.getGoals();
    if (savedId && loadedGoals.some(g => g.id === savedId)) {
      return savedId;
    }
    return loadedGoals.length > 0 ? loadedGoals[0].id : null;
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => Storage.getTheme());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Keep storage in sync
  useEffect(() => {
    Storage.saveGoals(goals);
  }, [goals]);

  useEffect(() => {
    Storage.saveCurrentGoalId(currentGoalId);
  }, [currentGoalId]);

  useEffect(() => {
    Storage.saveTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const activeGoal = goals.find(g => g.id === currentGoalId) || null;

  const createGoal = useCallback((formData: GoalFormData) => {
    const targetAmount = Number(formData.targetAmount);
    const timeValue = Number(formData.timeValue) || 1;

    if (!formData.name.trim()) {
      showToast('Please enter a goal name.', 'warning');
      return false;
    }
    if (!targetAmount || targetAmount <= 0) {
      showToast('Please enter a valid target amount.', 'warning');
      return false;
    }
    if (formData.selectedDays.length === 0) {
      showToast('Please select at least one deposit day per week.', 'warning');
      return false;
    }

    const newGoal: Goal = {
      id: Date.now(),
      name: formData.name.trim(),
      targetAmount,
      timeValue,
      timeUnit: formData.timeUnit,
      startDate: new Date().toISOString(),
      selectedDays: formData.selectedDays,
      deposits: [],
    };

    setGoals(prev => [newGoal, ...prev]);
    setCurrentGoalId(newGoal.id);
    showToast(`Goal "${newGoal.name}" created successfully!`, 'success');
    return true;
  }, [showToast]);

  const updateGoal = useCallback((goalId: number, formData: GoalFormData) => {
    const targetAmount = Number(formData.targetAmount);
    const timeValue = Number(formData.timeValue) || 1;

    if (!formData.name.trim()) {
      showToast('Please enter a goal name.', 'warning');
      return false;
    }
    if (!targetAmount || targetAmount <= 0) {
      showToast('Please enter a valid target amount.', 'warning');
      return false;
    }
    if (formData.selectedDays.length === 0) {
      showToast('Please select at least one deposit day per week.', 'warning');
      return false;
    }

    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            name: formData.name.trim(),
            targetAmount,
            timeValue,
            timeUnit: formData.timeUnit,
            selectedDays: formData.selectedDays,
          };
        }
        return g;
      })
    );

    showToast(`Goal "${formData.name.trim()}" updated successfully!`, 'success');
    return true;
  }, [showToast]);

  const deleteGoal = useCallback((goalId: number) => {
    setGoals(prev => {
      const remaining = prev.filter(g => g.id !== goalId);
      if (currentGoalId === goalId) {
        setCurrentGoalId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
    showToast('Goal deleted.', 'info');
  }, [currentGoalId, showToast]);

  const selectGoal = useCallback((goalId: number) => {
    setCurrentGoalId(goalId);
  }, []);

  const addDeposit = useCallback((goalId: number, amount: number, note?: string, customDate?: string) => {
    if (!amount || amount <= 0) {
      showToast('Please enter a deposit amount greater than zero.', 'warning');
      return false;
    }

    const newDeposit = {
      id: Date.now(),
      amount: Number(amount),
      date: customDate ? new Date(customDate).toISOString() : new Date().toISOString(),
      note: note?.trim() || undefined,
    };

    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            deposits: [newDeposit, ...(g.deposits || [])],
          };
        }
        return g;
      })
    );

    showToast(`Deposit of ₱${amount.toLocaleString()} added!`, 'success');
    return true;
  }, [showToast]);

  const deleteDeposit = useCallback((goalId: number, depositId: number) => {
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            deposits: (g.deposits || []).filter(d => d.id !== depositId),
          };
        }
        return g;
      })
    );
    showToast('Deposit removed.', 'info');
  }, [showToast]);

  return {
    goals,
    activeGoal,
    currentGoalId,
    theme,
    toasts,
    toggleTheme,
    showToast,
    removeToast,
    createGoal,
    updateGoal,
    deleteGoal,
    selectGoal,
    addDeposit,
    deleteDeposit,
  };
}
