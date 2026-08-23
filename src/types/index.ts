export type TimeUnit = 'days' | 'months' | 'years';

export interface Deposit {
  id: number;
  amount: number;
  date: string;
  note?: string;
}

export interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  timeValue: number;
  timeUnit: TimeUnit;
  startDate: string;
  selectedDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  deposits: Deposit[];
}

export interface GoalFormData {
  name: string;
  targetAmount: number | '';
  timeValue: number | '';
  timeUnit: TimeUnit;
  selectedDays: number[];
}

export interface ScheduleEstimate {
  totalDeposited: number;
  remainingAmount: number;
  progressPercent: number;
  averageDeposit: number;
  remainingDepositsNeeded: number;
  depositsPerWeek: number;
  estimatedWeeks: number;
  estimatedDays: number;
  estimatedCompletionDate: Date | null;
  formattedEstimateText: string;
  targetRequiredPerDay: number | null;
}

export type ToastType = 'success' | 'warning' | 'info' | 'error';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}
