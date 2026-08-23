import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckSquare, Square, Target, Clock, Info } from 'lucide-react';
import { Goal, GoalFormData, TimeUnit } from '../types';
import { DAY_NAMES_SHORT, formatCurrency, timeUnitToDays } from '../utils/calculations';

interface GoalFormModalProps {
  isOpen: boolean;
  editingGoal: Goal | null;
  onClose: () => void;
  onSubmit: (data: GoalFormData) => boolean;
}

export const GoalFormModal: React.FC<GoalFormModalProps> = ({
  isOpen,
  editingGoal,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [timeValue, setTimeValue] = useState<number | ''>(6);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('months');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default Mon-Fri

  useEffect(() => {
    if (editingGoal) {
      setName(editingGoal.name);
      setTargetAmount(editingGoal.targetAmount);
      setTimeValue(editingGoal.timeValue || 6);
      setTimeUnit(editingGoal.timeUnit || 'months');
      setSelectedDays(editingGoal.selectedDays || [1, 2, 3, 4, 5]);
    } else {
      setName('');
      setTargetAmount('');
      setTimeValue(6);
      setTimeUnit('months');
      setSelectedDays([1, 2, 3, 4, 5]);
    }
  }, [editingGoal, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev =>
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex].sort()
    );
  };

  const selectAllDays = () => {
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const clearAllDays = () => {
    setSelectedDays([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onSubmit({
      name,
      targetAmount,
      timeValue,
      timeUnit,
      selectedDays,
    });
    if (success) {
      onClose();
    }
  };

  // Compute live recommendation
  const numericTarget = Number(targetAmount) || 0;
  const numericTime = Number(timeValue) || 1;
  const totalDays = timeUnitToDays(numericTime, timeUnit);
  const totalWeeks = Math.max(1, totalDays / 7);
  const totalScheduledDays = Math.max(1, Math.round(totalWeeks * (selectedDays.length || 1)));
  const suggestedPacePerScheduledDay = numericTarget > 0 ? numericTarget / totalScheduledDays : 0;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-modal-title"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h2 id="goal-modal-title" className="modal-title">
            {editingGoal ? 'Edit Savings Goal' : 'Create New Savings Goal'}
          </h2>
          <button onClick={onClose} className="btn-icon-only" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="goal-name-input">
              <Target size={16} /> Goal Name
            </label>
            <input
              id="goal-name-input"
              type="text"
              className="input-field"
              placeholder="e.g. Emergency Fund, Laptop, Vacation"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="input-row">
            <div className="form-group">
              <label className="form-label" htmlFor="target-amount-input">
                Target Amount
              </label>
              <div className="input-prefix-wrapper">
                <span className="input-prefix">₱</span>
                <input
                  id="target-amount-input"
                  type="number"
                  step="0.01"
                  min="1"
                  className="input-field"
                  placeholder="50000"
                  value={targetAmount}
                  onChange={e => setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="time-value-input">
                <Clock size={16} /> Target Duration
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  id="time-value-input"
                  type="number"
                  min="1"
                  className="input-field"
                  style={{ width: '80px' }}
                  value={timeValue}
                  onChange={e => setTimeValue(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                />
                <select
                  className="input-field"
                  value={timeUnit}
                  onChange={e => setTimeUnit(e.target.value as TimeUnit)}
                  aria-label="Time duration unit"
                >
                  <option value="days">Days</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                <Calendar size={16} /> Scheduled Deposit Days
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={selectAllDays}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                >
                  <CheckSquare size={12} /> All
                </button>
                <button
                  type="button"
                  onClick={clearAllDays}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                >
                  <Square size={12} /> None
                </button>
              </div>
            </div>

            <div className="weekday-selector">
              {DAY_NAMES_SHORT.map((dayName, idx) => {
                const isSelected = selectedDays.includes(idx);
                return (
                  <button
                    key={dayName}
                    type="button"
                    className={`weekday-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleDay(idx)}
                    aria-pressed={isSelected}
                  >
                    <span>{dayName}</span>
                  </button>
                );
              })}
            </div>
            {selectedDays.length === 0 && (
              <p style={{ color: 'var(--status-warning)', fontSize: '0.75rem', marginTop: '4px' }}>
                Select at least 1 day per week to calculate your timeline accurately.
              </p>
            )}
          </div>

          {/* Dynamic Projection Preview Card */}
          {numericTarget > 0 && selectedDays.length > 0 && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginTop: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <Info size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <span>To reach </span>
                <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(numericTarget)}</strong>
                <span> in </span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {numericTime} {timeUnit}
                </strong>
                <span> with </span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {selectedDays.length} {selectedDays.length === 1 ? 'day' : 'days'}/week
                </strong>
                <span>, save approx. </span>
                <strong style={{ color: 'var(--accent-primary)' }}>
                  {formatCurrency(suggestedPacePerScheduledDay)}
                </strong>
                <span> per scheduled day.</span>
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingGoal ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
