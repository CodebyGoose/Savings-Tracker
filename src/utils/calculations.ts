import { Goal, ScheduleEstimate, TimeUnit } from '../types';

export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Format a number as Philippine Peso currency (₱).
 */
export function formatCurrency(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `₱${safeAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format a date string to a localized readable format.
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

/**
 * Convert a given time value and unit to total approximate days.
 */
export function timeUnitToDays(value: number, unit: TimeUnit): number {
  const safeValue = Math.max(1, value || 1);
  switch (unit) {
    case 'days':
      return safeValue;
    case 'months':
      return Math.round(safeValue * 30.4375); // Average days per month
    case 'years':
      return Math.round(safeValue * 365.25);
    default:
      return safeValue;
  }
}

/**
 * Format human-readable estimated duration.
 */
export function formatDuration(totalDays: number): string {
  if (totalDays <= 0) return '0 days';
  if (totalDays === 1) return '1 day';
  if (totalDays < 14) return `${totalDays} days`;

  const totalWeeks = Math.ceil(totalDays / 7);
  if (totalDays < 60) {
    return `${totalWeeks} ${totalWeeks === 1 ? 'week' : 'weeks'}`;
  }

  const months = Math.floor(totalDays / 30.4375);
  const remainingDays = Math.round(totalDays % 30.4375);

  if (totalDays < 365) {
    if (remainingDays >= 7) {
      const extraWeeks = Math.round(remainingDays / 7);
      return `${months} ${months === 1 ? 'month' : 'months'}, ${extraWeeks} ${extraWeeks === 1 ? 'week' : 'weeks'}`;
    }
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }

  const years = Math.floor(totalDays / 365.25);
  const remMonths = Math.round((totalDays % 365.25) / 30.4375);
  if (remMonths > 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}, ${remMonths} ${remMonths === 1 ? 'month' : 'months'}`;
  }
  return `${years} ${years === 1 ? 'year' : 'years'}`;
}

/**
 * Calculate comprehensive schedule and estimation metrics for a goal.
 */
export function calculateGoalMetrics(goal: Goal): ScheduleEstimate {
  const deposits = Array.isArray(goal.deposits) ? goal.deposits : [];
  const targetAmount = Math.max(0, goal.targetAmount || 0);

  const totalDeposited = deposits.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const remainingAmount = Math.max(0, targetAmount - totalDeposited);
  const progressPercent = targetAmount > 0 ? Math.min((totalDeposited / targetAmount) * 100, 100) : 0;

  const selectedDays = goal.selectedDays && goal.selectedDays.length > 0 ? goal.selectedDays : [1, 2, 3, 4, 5];
  const depositsPerWeek = selectedDays.length;

  // Calculate target pace requirement (if goal time is set)
  const targetDays = timeUnitToDays(goal.timeValue, goal.timeUnit);
  const targetWeeks = Math.max(1, targetDays / 7);
  const totalScheduledDepositsInTarget = Math.max(1, Math.round(targetWeeks * depositsPerWeek));
  const targetRequiredPerDay = targetAmount > 0 ? targetAmount / totalScheduledDepositsInTarget : null;

  if (remainingAmount <= 0) {
    return {
      totalDeposited,
      remainingAmount: 0,
      progressPercent: 100,
      averageDeposit: deposits.length > 0 ? totalDeposited / deposits.length : 0,
      remainingDepositsNeeded: 0,
      depositsPerWeek,
      estimatedWeeks: 0,
      estimatedDays: 0,
      estimatedCompletionDate: new Date(),
      formattedEstimateText: 'Goal Reached',
      targetRequiredPerDay,
    };
  }

  if (deposits.length === 0) {
    return {
      totalDeposited: 0,
      remainingAmount,
      progressPercent: 0,
      averageDeposit: 0,
      remainingDepositsNeeded: 0,
      depositsPerWeek,
      estimatedWeeks: 0,
      estimatedDays: 0,
      estimatedCompletionDate: null,
      formattedEstimateText: 'No deposits yet',
      targetRequiredPerDay,
    };
  }

  const averageDeposit = totalDeposited / deposits.length;
  if (averageDeposit <= 0) {
    return {
      totalDeposited,
      remainingAmount,
      progressPercent,
      averageDeposit: 0,
      remainingDepositsNeeded: 0,
      depositsPerWeek,
      estimatedWeeks: 0,
      estimatedDays: 0,
      estimatedCompletionDate: null,
      formattedEstimateText: 'Awaiting valid deposits',
      targetRequiredPerDay,
    };
  }

  const remainingDepositsNeeded = Math.ceil(remainingAmount / averageDeposit);
  const estimatedWeeks = Math.ceil(remainingDepositsNeeded / depositsPerWeek);
  const estimatedDays = estimatedWeeks * 7;

  const estimatedCompletionDate = new Date();
  estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedDays);

  return {
    totalDeposited,
    remainingAmount,
    progressPercent,
    averageDeposit,
    remainingDepositsNeeded,
    depositsPerWeek,
    estimatedWeeks,
    estimatedDays,
    estimatedCompletionDate,
    formattedEstimateText: formatDuration(estimatedDays),
    targetRequiredPerDay,
  };
}
