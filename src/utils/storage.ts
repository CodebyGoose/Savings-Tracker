import { Goal } from '../types';

const STORAGE_KEYS = {
  GOALS: 'savingsGoals',
  CURRENT_GOAL_ID: 'currentGoalId',
  THEME: 'savings_theme',
  LEGACY_GOAL: 'savingsGoal',
  LEGACY_DEPOSITS: 'savingsDeposits',
} as const;

export const Storage = {
  getGoals(): Goal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.map((g: any) => ({
            id: Number(g.id) || Date.now(),
            name: String(g.name || 'Untitled Goal'),
            targetAmount: Number(g.targetAmount) || 0,
            timeValue: Number(g.timeValue) || 1,
            timeUnit: ['days', 'months', 'years'].includes(g.timeUnit) ? g.timeUnit : 'months',
            startDate: g.startDate || new Date().toISOString(),
            selectedDays: Array.isArray(g.selectedDays) && g.selectedDays.length > 0 ? g.selectedDays : [1, 2, 3, 4, 5],
            deposits: Array.isArray(g.deposits)
              ? g.deposits.map((d: any) => ({
                  id: Number(d.id) || Date.now(),
                  amount: Number(d.amount) || 0,
                  date: d.date || new Date().toISOString(),
                  note: d.note ? String(d.note) : undefined,
                }))
              : [],
          }));
        }
      }

      // Check legacy single-goal migration
      const legacyGoal = localStorage.getItem(STORAGE_KEYS.LEGACY_GOAL);
      const legacyDeposits = localStorage.getItem(STORAGE_KEYS.LEGACY_DEPOSITS);

      if (legacyGoal) {
        const parsedGoal = JSON.parse(legacyGoal);
        const parsedDeposits = legacyDeposits ? JSON.parse(legacyDeposits) : [];

        const migratedGoal: Goal = {
          id: Date.now(),
          name: parsedGoal.name || 'My Savings Goal',
          targetAmount: Number(parsedGoal.targetAmount) || 0,
          timeValue: Number(parsedGoal.timeValue) || 6,
          timeUnit: parsedGoal.timeUnit || 'months',
          startDate: parsedGoal.startDate || new Date().toISOString(),
          selectedDays: Array.isArray(parsedGoal.selectedDays) && parsedGoal.selectedDays.length > 0
            ? parsedGoal.selectedDays
            : [1, 2, 3, 4, 5],
          deposits: Array.isArray(parsedDeposits)
            ? parsedDeposits.map((d: any) => ({
                id: Number(d.id) || Date.now(),
                amount: Number(d.amount) || 0,
                date: d.date || new Date().toISOString(),
                note: d.note,
              }))
            : [],
        };

        const migratedList = [migratedGoal];
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(migratedList));
        localStorage.setItem(STORAGE_KEYS.CURRENT_GOAL_ID, JSON.stringify(migratedGoal.id));

        // Clean up legacy keys
        localStorage.removeItem(STORAGE_KEYS.LEGACY_GOAL);
        localStorage.removeItem(STORAGE_KEYS.LEGACY_DEPOSITS);

        return migratedList;
      }

      return [];
    } catch (e) {
      console.error('Failed to load goals from localStorage:', e);
      return [];
    }
  },

  saveGoals(goals: Goal[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed to save goals to localStorage:', e);
    }
  },

  getCurrentGoalId(): number | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_GOAL_ID);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveCurrentGoalId(id: number | null): void {
    try {
      if (id !== null) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_GOAL_ID, JSON.stringify(id));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_GOAL_ID);
      }
    } catch (e) {
      console.error('Failed to save current goal ID:', e);
    }
  },

  getTheme(): 'dark' | 'light' {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored === 'light' || stored === 'dark') return stored;
      return 'dark'; // Default to sleek dark mode
    } catch {
      return 'dark';
    }
  },

  saveTheme(theme: 'dark' | 'light'): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  },
};
