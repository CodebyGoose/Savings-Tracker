import React from 'react';
import { Wallet, Plus, Moon, Sun, LayoutGrid } from 'lucide-react';
import { Goal } from '../types';
import { formatCurrency } from '../utils/calculations';

interface HeaderProps {
  goals: Goal[];
  theme: 'dark' | 'light';
  viewMode: 'overview' | 'list';
  onToggleTheme: () => void;
  onOpenNewGoalModal: () => void;
  onToggleViewMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  goals,
  theme,
  viewMode,
  onToggleTheme,
  onOpenNewGoalModal,
  onToggleViewMode,
}) => {
  const totalPortfolioSaved = goals.reduce((sum, g) => {
    const goalDeposits = Array.isArray(g.deposits) ? g.deposits : [];
    return sum + goalDeposits.reduce((dSum, d) => dSum + (Number(d.amount) || 0), 0);
  }, 0);

  return (
    <header className="app-header">
      <div className="container" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon-box">
              <Wallet size={22} />
            </div>
            <div>
              <h1 className="brand-title">Savings Tracker</h1>
              <div className="brand-subtitle">
                {goals.length > 0 ? (
                  <span>
                    Portfolio Total: <strong>{formatCurrency(totalPortfolioSaved)}</strong> across {goals.length}{' '}
                    {goals.length === 1 ? 'goal' : 'goals'}
                  </span>
                ) : (
                  <span>Track and reach your financial goals</span>
                )}
              </div>
            </div>
          </div>

          <div className="header-actions">
            {goals.length > 0 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onToggleViewMode}
                title={viewMode === 'overview' ? 'View all goals' : 'View active goal'}
              >
                <LayoutGrid size={15} />
                <span>{viewMode === 'overview' ? 'All Goals' : 'Active Goal'}</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onOpenNewGoalModal}
            >
              <Plus size={15} />
              <span>New Goal</span>
            </button>

            <button
              type="button"
              className="btn-icon-only"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
