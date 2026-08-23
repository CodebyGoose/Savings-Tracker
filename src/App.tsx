import React, { useState } from 'react';
import { useSavingsTracker } from './hooks/useSavingsTracker';
import { Header } from './components/Header';
import { GoalOverview } from './components/GoalOverview';
import { GoalList } from './components/GoalList';
import { GoalFormModal } from './components/GoalFormModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Toast } from './components/Toast';
import { Goal, GoalFormData } from './types';
import { formatCurrency } from './utils/calculations';

export const App: React.FC = () => {
  const {
    goals,
    activeGoal,
    currentGoalId,
    theme,
    toasts,
    toggleTheme,
    removeToast,
    createGoal,
    updateGoal,
    deleteGoal,
    selectGoal,
    addDeposit,
    deleteDeposit,
  } = useSavingsTracker();

  const [viewMode, setViewMode] = useState<'overview' | 'list'>('overview');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Deletion confirm modal state
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    isDestructive: true,
    onConfirm: () => {},
  });

  const handleOpenNewGoalModal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleOpenEditGoalModal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleGoalFormSubmit = (data: GoalFormData) => {
    if (editingGoal) {
      return updateGoal(editingGoal.id, data);
    } else {
      const success = createGoal(data);
      if (success) {
        setViewMode('overview');
      }
      return success;
    }
  };

  const handleRequestDeleteGoal = (goal: Goal) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Delete Savings Goal',
      message: `Are you sure you want to delete "${goal.name}"? All ${goal.deposits.length} recorded deposits totaling ${formatCurrency(
        goal.deposits.reduce((s, d) => s + d.amount, 0)
      )} will be permanently removed.`,
      isDestructive: true,
      onConfirm: () => {
        deleteGoal(goal.id);
        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleRequestDeleteDeposit = (goalId: number, depositId: number, amount: number) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Delete Deposit',
      message: `Are you sure you want to remove the deposit of ${formatCurrency(amount)}?`,
      isDestructive: true,
      onConfirm: () => {
        deleteDeposit(goalId, depositId);
        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleSelectGoal = (id: number) => {
    selectGoal(id);
    setViewMode('overview');
  };

  const handleToggleViewMode = () => {
    setViewMode(prev => (prev === 'overview' ? 'list' : 'overview'));
  };

  return (
    <div className="app-wrapper">
      <Header
        goals={goals}
        theme={theme}
        viewMode={viewMode}
        onToggleTheme={toggleTheme}
        onOpenNewGoalModal={handleOpenNewGoalModal}
        onToggleViewMode={handleToggleViewMode}
      />

      <main className="container" style={{ flex: 1 }}>
        {goals.length === 0 ? (
          <GoalList
            goals={goals}
            currentGoalId={currentGoalId}
            onSelectGoal={handleSelectGoal}
            onEditGoal={handleOpenEditGoalModal}
            onRequestDeleteGoal={handleRequestDeleteGoal}
            onOpenNewGoalModal={handleOpenNewGoalModal}
          />
        ) : viewMode === 'overview' && activeGoal ? (
          <GoalOverview
            goal={activeGoal}
            goals={goals}
            onSelectGoal={handleSelectGoal}
            onEditGoal={handleOpenEditGoalModal}
            onRequestDeleteGoal={handleRequestDeleteGoal}
            onAddDeposit={addDeposit}
            onRequestDeleteDeposit={handleRequestDeleteDeposit}
          />
        ) : (
          <GoalList
            goals={goals}
            currentGoalId={currentGoalId}
            onSelectGoal={handleSelectGoal}
            onEditGoal={handleOpenEditGoalModal}
            onRequestDeleteGoal={handleRequestDeleteGoal}
            onOpenNewGoalModal={handleOpenNewGoalModal}
          />
        )}
      </main>

      <GoalFormModal
        isOpen={isGoalModalOpen}
        editingGoal={editingGoal}
        onClose={() => setIsGoalModalOpen(false)}
        onSubmit={handleGoalFormSubmit}
      />

      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        isDestructive={confirmModalConfig.isDestructive}
        confirmLabel="Delete"
        onConfirm={confirmModalConfig.onConfirm}
        onCancel={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
