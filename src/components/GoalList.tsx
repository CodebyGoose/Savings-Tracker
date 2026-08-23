import React from 'react';
import { Target, CheckCircle2, Edit3, Trash2, ArrowRight, Plus } from 'lucide-react';
import { Goal } from '../types';
import { calculateGoalMetrics, formatCurrency } from '../utils/calculations';

interface GoalListProps {
  goals: Goal[];
  currentGoalId: number | null;
  onSelectGoal: (id: number) => void;
  onEditGoal: (goal: Goal) => void;
  onRequestDeleteGoal: (goal: Goal) => void;
  onOpenNewGoalModal: () => void;
}

export const GoalList: React.FC<GoalListProps> = ({
  goals,
  currentGoalId,
  onSelectGoal,
  onEditGoal,
  onRequestDeleteGoal,
  onOpenNewGoalModal,
}) => {
  if (goals.length === 0) {
    return (
      <div className="empty-state-box">
        <div className="empty-icon-wrap">
          <Target size={26} />
        </div>
        <h2 className="empty-state-title">No Savings Goals Yet</h2>
        <p className="empty-state-text">
          Create your first savings goal to set your target, customize your weekly deposit schedule, and track progress.
        </p>
        <button type="button" className="btn btn-primary" onClick={onOpenNewGoalModal} style={{ marginTop: '8px' }}>
          <Plus size={16} />
          <span>Create Your First Goal</span>
        </button>
      </div>
    );
  }

  return (
    <div className="goal-list-view">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            All Savings Goals
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Managing {goals.length} active {goals.length === 1 ? 'goal' : 'goals'}
          </p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={onOpenNewGoalModal}>
          <Plus size={15} />
          <span>New Goal</span>
        </button>
      </div>

      <div className="goals-grid">
        {goals.map(g => {
          const metrics = calculateGoalMetrics(g);
          const isActive = g.id === currentGoalId;
          const isCompleted = metrics.progressPercent >= 100;

          return (
            <div key={g.id} className={`goal-card-item ${isActive ? 'active-goal' : ''}`}>
              <div className="goal-card-header">
                <div>
                  <h3 className="goal-card-title">{g.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Target: {g.timeValue} {g.timeUnit}
                  </span>
                </div>
                {isCompleted ? (
                  <span
                    className="goal-badge"
                    style={{
                      backgroundColor: 'var(--accent-primary-subtle)',
                      color: 'var(--accent-primary)',
                      border: '1px solid var(--accent-primary-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCircle2 size={12} /> Done
                  </span>
                ) : isActive ? (
                  <span className="goal-badge badge-active">Active</span>
                ) : null}
              </div>

              {/* Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {metrics.progressPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="progress-track" style={{ height: '8px' }}>
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${Math.min(metrics.progressPercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Key Metrics */}
              <div className="goal-card-metrics">
                <div className="goal-card-metric-col">
                  <span className="goal-card-metric-label">Saved</span>
                  <span className="goal-card-metric-val" style={{ color: 'var(--accent-primary)' }}>
                    {formatCurrency(metrics.totalDeposited)}
                  </span>
                </div>
                <div className="goal-card-metric-col">
                  <span className="goal-card-metric-label">Target</span>
                  <span className="goal-card-metric-val">{formatCurrency(g.targetAmount)}</span>
                </div>
                <div className="goal-card-metric-col">
                  <span className="goal-card-metric-label">Remaining</span>
                  <span className="goal-card-metric-val" style={{ color: 'var(--status-warning)' }}>
                    {formatCurrency(metrics.remainingAmount)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="goal-card-actions">
                <button
                  type="button"
                  className="btn btn-icon-only"
                  onClick={() => onEditGoal(g)}
                  title="Edit goal"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  type="button"
                  className="btn btn-danger-subtle btn-sm"
                  style={{ padding: '6px' }}
                  onClick={() => onRequestDeleteGoal(g)}
                  title="Delete goal"
                >
                  <Trash2 size={15} />
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => onSelectGoal(g.id)}
                >
                  <span>View Details</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
