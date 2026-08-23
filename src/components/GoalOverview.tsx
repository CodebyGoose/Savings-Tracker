import React, { useState } from 'react';
import {
  Target,
  PiggyBank,
  TrendingUp,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  Award,
  Plus,
  CalendarDays,
  FileText,
} from 'lucide-react';
import { Goal } from '../types';
import {
  calculateGoalMetrics,
  formatCurrency,
  formatDate,
  DAY_NAMES_SHORT,
} from '../utils/calculations';

interface GoalOverviewProps {
  goal: Goal;
  goals: Goal[];
  onSelectGoal: (id: number) => void;
  onEditGoal: (goal: Goal) => void;
  onRequestDeleteGoal: (goal: Goal) => void;
  onAddDeposit: (goalId: number, amount: number, note?: string) => boolean;
  onRequestDeleteDeposit: (goalId: number, depositId: number, amount: number) => void;
}

export const GoalOverview: React.FC<GoalOverviewProps> = ({
  goal,
  goals,
  onSelectGoal,
  onEditGoal,
  onRequestDeleteGoal,
  onAddDeposit,
  onRequestDeleteDeposit,
}) => {
  const [depositAmount, setDepositAmount] = useState<number | ''>('');
  const [depositNote, setDepositNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const metrics = calculateGoalMetrics(goal);
  const isGoalCompleted = metrics.progressPercent >= 100;

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) return;
    const success = onAddDeposit(goal.id, Number(depositAmount), depositNote);
    if (success) {
      setDepositAmount('');
      setDepositNote('');
      setShowNoteInput(false);
    }
  };

  const handleQuickAdd = (amount: number) => {
    onAddDeposit(goal.id, amount, 'Quick deposit');
  };

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  return (
    <div className="goal-overview-view">
      {/* Goal Title & Actions Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              {goal.name}
            </h2>
            {goals.length > 1 && (
              <select
                aria-label="Switch active goal"
                value={goal.id}
                onChange={e => onSelectGoal(Number(e.target.value))}
                className="input-field"
                style={{
                  padding: '4px 8px',
                  fontSize: '0.8125rem',
                  width: 'auto',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-raised)',
                }}
              >
                {goals.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Target: <strong>{formatCurrency(goal.targetAmount)}</strong> • Duration: <strong>{goal.timeValue} {goal.timeUnit}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onEditGoal(goal)}
            title="Edit goal details"
          >
            <Edit3 size={15} />
            <span>Edit</span>
          </button>
          <button
            type="button"
            className="btn btn-danger-subtle btn-sm"
            onClick={() => onRequestDeleteGoal(goal)}
            title="Delete goal"
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* 100% Milestone Achievement Banner */}
      {isGoalCompleted && (
        <div className="milestone-banner" role="status">
          <Award size={36} className="milestone-icon" />
          <div>
            <div className="milestone-title">Goal Achieved!</div>
            <div className="milestone-desc">
              Congratulations! You have reached 100% of your target ({formatCurrency(goal.targetAmount)}).
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-header">
            <span>Target Amount</span>
            <Target size={16} />
          </div>
          <div className="stat-value">{formatCurrency(goal.targetAmount)}</div>
          <div className="stat-meta">{goal.timeValue} {goal.timeUnit} target period</div>
        </div>

        <div className="stat-box">
          <div className="stat-header">
            <span>Current Savings</span>
            <PiggyBank size={16} />
          </div>
          <div className="stat-value accent">{formatCurrency(metrics.totalDeposited)}</div>
          <div className="stat-meta">
            {goal.deposits.length} {goal.deposits.length === 1 ? 'deposit' : 'deposits'} made
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-header">
            <span>Remaining</span>
            <Clock size={16} />
          </div>
          <div className="stat-value warning">{formatCurrency(metrics.remainingAmount)}</div>
          <div className="stat-meta">
            {metrics.remainingDepositsNeeded > 0
              ? `~${metrics.remainingDepositsNeeded} deposits left at current avg`
              : 'Target achieved'}
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-header">
            <span>Progress</span>
            <TrendingUp size={16} />
          </div>
          <div className="stat-value">{metrics.progressPercent.toFixed(1)}%</div>
          <div className="stat-meta">
            {metrics.progressPercent >= 100 ? 'Completed' : `${(100 - metrics.progressPercent).toFixed(1)}% left`}
          </div>
        </div>
      </div>

      {/* Progress Bar with milestone ticks */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div className="progress-section" style={{ marginBottom: 0 }}>
          <div className="progress-header">
            <span className="progress-title">Overall Savings Progress</span>
            <span className="progress-percent-label">{metrics.progressPercent.toFixed(1)}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(metrics.progressPercent, 100)}%` }}
              role="progressbar"
              aria-valuenow={metrics.progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* Schedule & Projection Details */}
      <div className="detail-grid">
        <div className="detail-card">
          <div className="detail-card-title">
            <CalendarDays size={16} />
            <span>Estimated Timeline</span>
          </div>
          <div>
            <div className="detail-card-value">
              {metrics.estimatedCompletionDate
                ? metrics.estimatedCompletionDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Add deposits to calculate'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {metrics.formattedEstimateText}
            </div>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-card-title">
            <Calendar size={16} />
            <span>Active Deposit Schedule</span>
          </div>
          <div>
            <div className="days-chips-row">
              {DAY_NAMES_SHORT.map((dayName, idx) => {
                const isActive = (goal.selectedDays || []).includes(idx);
                return (
                  <span key={dayName} className={`day-chip ${isActive ? 'active' : ''}`}>
                    {dayName}
                  </span>
                );
              })}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              {(goal.selectedDays || []).length} scheduled {(goal.selectedDays || []).length === 1 ? 'day' : 'days'} / week
            </div>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-card-title">
            <TrendingUp size={16} />
            <span>Deposit Statistics</span>
          </div>
          <div>
            <div className="detail-card-value">
              {metrics.averageDeposit > 0 ? formatCurrency(metrics.averageDeposit) : '₱0.00'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {metrics.targetRequiredPerDay
                ? `Target pace: ${formatCurrency(metrics.targetRequiredPerDay)} / scheduled day`
                : 'Average deposit size'}
            </div>
          </div>
        </div>
      </div>

      {/* Add Deposit Panel */}
      <div className="deposit-form-panel">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
          Record New Deposit
        </h3>
        <form onSubmit={handleDepositSubmit}>
          <div className="deposit-form-row">
            <div className="input-prefix-wrapper" style={{ flex: 1 }}>
              <span className="input-prefix">₱</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input-field"
                placeholder="Enter deposit amount"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value === '' ? '' : Number(e.target.value))}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              <span>Add Deposit</span>
            </button>
          </div>

          {/* Quick preset amount chips */}
          <div className="quick-amount-tags">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Quick add:</span>
            {quickAmounts.map(amt => (
              <button
                key={amt}
                type="button"
                className="tag-btn"
                onClick={() => handleQuickAdd(amt)}
              >
                +₱{amt.toLocaleString()}
              </button>
            ))}
            <button
              type="button"
              className="tag-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setShowNoteInput(!showNoteInput)}
            >
              <FileText size={12} />
              {showNoteInput ? 'Hide note' : 'Add note'}
            </button>
          </div>

          {showNoteInput && (
            <div style={{ marginTop: '12px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Optional note (e.g., Salary savings, Freelance gig, Birthday gift)"
                value={depositNote}
                onChange={e => setDepositNote(e.target.value)}
                maxLength={80}
              />
            </div>
          )}
        </form>
      </div>

      {/* Deposit History Section */}
      <div className="card deposit-history-card">
        <div className="table-header">
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Deposit History
            </h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {goal.deposits.length} recorded {goal.deposits.length === 1 ? 'transaction' : 'transactions'}
            </span>
          </div>
        </div>

        {goal.deposits.length === 0 ? (
          <div className="empty-state-box" style={{ padding: '32px 16px' }}>
            <div className="empty-icon-wrap">
              <PiggyBank size={24} />
            </div>
            <div className="empty-state-title">No deposits yet</div>
            <div className="empty-state-text">
              Add your first deposit above to start tracking your progress and timeline estimates!
            </div>
          </div>
        ) : (
          <div className="deposit-list">
            {goal.deposits.map(dep => (
              <div key={dep.id} className="deposit-item">
                <div className="deposit-item-left">
                  <div className="deposit-item-amount">{formatCurrency(dep.amount)}</div>
                  <div className="deposit-item-date">{formatDate(dep.date)}</div>
                  {dep.note && <div className="deposit-item-note">{dep.note}</div>}
                </div>
                <button
                  type="button"
                  className="btn btn-danger-subtle btn-sm"
                  onClick={() => onRequestDeleteDeposit(goal.id, dep.id, dep.amount)}
                  aria-label="Delete deposit"
                  title="Delete this deposit"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
