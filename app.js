// ============================================================================
// SAVINGS TRACKER - JAVASCRIPT FUNCTIONALITY
// ============================================================================

// ===== LocalStorage Helper Functions =====
const Storage = {
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to localStorage:', e);
            return false;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    }
};

// ===== Savings Tracker Application =====
const SavingsTracker = {
    goals: [], // Array of goals
    currentGoalId: null, // ID of currently selected goal

    // Initialize the application
    init() {
        this.loadData();
        this.setupEventListeners();
        // Calendar will be initialized when goal form is shown
        this.updateUI();
    },

    // Load data from localStorage
    loadData() {
        // Try to load new format (multiple goals)
        const savedGoals = Storage.get('savingsGoals');
        const savedCurrentGoalId = Storage.get('currentGoalId');
        
        if (savedGoals && Array.isArray(savedGoals)) {
            this.goals = savedGoals;
        } else {
            // Migrate from old format (single goal)
            const oldGoal = Storage.get('savingsGoal');
            const oldDeposits = Storage.get('savingsDeposits');
            
            if (oldGoal) {
                const migratedGoal = {
                    id: Date.now(),
                    ...oldGoal,
                    deposits: oldDeposits || []
                };
                this.goals = [migratedGoal];
                this.currentGoalId = migratedGoal.id;
                this.saveData();
                // Clean up old storage
                Storage.remove('savingsGoal');
                Storage.remove('savingsDeposits');
            }
        }
        
        if (savedCurrentGoalId) {
            this.currentGoalId = savedCurrentGoalId;
        } else if (this.goals.length > 0) {
            // If no current goal is saved, select the first goal
            this.currentGoalId = this.goals[0].id;
            this.saveData();
        }
    },

    // Save data to localStorage
    saveData() {
        Storage.set('savingsGoals', this.goals);
        if (this.currentGoalId) {
            Storage.set('currentGoalId', this.currentGoalId);
        }
    },

    // Get current goal
    getCurrentGoal() {
        return this.goals.find(g => g.id === this.currentGoalId) || null;
    },

    // Get current goal deposits
    getCurrentDeposits() {
        const goal = this.getCurrentGoal();
        return goal ? (goal.deposits || []) : [];
    },

    // Setup event listeners
    setupEventListeners() {
        // Goal form submission
        const goalForm = document.getElementById('goalForm');
        if (goalForm) {
            goalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.setGoal();
            });
        }

        // Deposit form submission
        const depositForm = document.getElementById('depositForm');
        if (depositForm) {
            depositForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addDeposit();
            });
        }

        // Edit goal button
        const editGoalBtn = document.getElementById('editGoalBtn');
        if (editGoalBtn) {
            editGoalBtn.addEventListener('click', () => {
                this.editGoal();
            });
        }

        // Add new goal button
        const addNewGoalBtn = document.getElementById('addNewGoalBtn');
        if (addNewGoalBtn) {
            addNewGoalBtn.addEventListener('click', () => {
                this.showGoalForm();
            });
        }

        // Add new goal from progress button
        const addNewGoalFromProgressBtn = document.getElementById('addNewGoalFromProgressBtn');
        if (addNewGoalFromProgressBtn) {
            addNewGoalFromProgressBtn.addEventListener('click', () => {
                this.showGoalForm();
            });
        }

        // Back to goals list button
        const backToGoalsBtn = document.getElementById('backToGoalsBtn');
        if (backToGoalsBtn) {
            backToGoalsBtn.addEventListener('click', () => {
                this.showGoalsList();
            });
        }
        // Back to goals list button from goal form
        const backToGoalListFromFormBtn = document.getElementById('backToGoalListFromFormBtn');
        if (backToGoalListFromFormBtn) {
            backToGoalListFromFormBtn.addEventListener('click', () => {
                this.showGoalsList();
            });
        }
    },

    // Show toast notification
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        const toastIcon = document.getElementById('toastIcon');
        
        toastMessage.textContent = message;
        toastIcon.textContent = type === 'success' ? 'check_circle' : 'warning';
        toastIcon.className = `toast-icon material-icons`;
        
        // Remove previous type classes
        toast.classList.remove('warning');
        if (type === 'warning') {
            toast.classList.add('warning');
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    // Initialize calendar
    initCalendar(selectedDaysArray = []) {
        const calendarDays = document.getElementById('calendarDays');
        if (!calendarDays) {
            console.warn('Calendar days container not found');
            // Retry after a short delay
            setTimeout(() => {
                this.initCalendar(selectedDaysArray);
            }, 100);
            return;
        }

        // Create day buttons (0 = Sunday, 6 = Saturday)
        calendarDays.innerHTML = '';
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for (let i = 0; i < 7; i++) {
            const dayBtn = document.createElement('button');
            dayBtn.type = 'button';
            dayBtn.className = `calendar-day-btn ${selectedDaysArray.includes(i) ? 'selected' : ''}`;
            dayBtn.dataset.day = i;
            dayBtn.textContent = dayNames[i];
            dayBtn.setAttribute('aria-label', `Select ${dayNames[i]}`);
            dayBtn.setAttribute('role', 'button');
            dayBtn.setAttribute('tabindex', '0');
            dayBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDay(i);
            });
            // Also support keyboard
            dayBtn.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleDay(i);
                }
            });
            calendarDays.appendChild(dayBtn);
        }

        // Setup select all and clear all buttons (remove old listeners first)
        const selectAllBtn = document.getElementById('selectAllDaysBtn');
        const clearAllBtn = document.getElementById('clearAllDaysBtn');
        
        if (selectAllBtn) {
            // Remove old event listeners by cloning and replacing
            const newSelectAllBtn = selectAllBtn.cloneNode(true);
            selectAllBtn.parentNode.replaceChild(newSelectAllBtn, selectAllBtn);
            newSelectAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectAllDays();
            });
        }
        
        if (clearAllBtn) {
            const newClearAllBtn = clearAllBtn.cloneNode(true);
            clearAllBtn.parentNode.replaceChild(newClearAllBtn, clearAllBtn);
            newClearAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearAllDays();
            });
        }
    },

    // Toggle day selection
    toggleDay(dayIndex) {
        const dayBtn = document.querySelector(`.calendar-day-btn[data-day="${dayIndex}"]`);
        if (!dayBtn) return;

        dayBtn.classList.toggle('selected');
    },

    // Select all days
    selectAllDays() {
        document.querySelectorAll('.calendar-day-btn').forEach(btn => {
            btn.classList.add('selected');
        });
    },

    // Clear all days
    clearAllDays() {
        document.querySelectorAll('.calendar-day-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    },

    // Get selected days from calendar
    getSelectedDays() {
        const selected = [];
        document.querySelectorAll('.calendar-day-btn.selected').forEach(btn => {
            selected.push(parseInt(btn.dataset.day));
        });
        return selected;
    },

    // Calculate estimated time to reach goal
    calculateEstimatedTime(goalAmount, dailyAmount, selectedDays) {
        if (!goalAmount || !dailyAmount || dailyAmount <= 0) {
            return null;
        }

        // Calculate total deposits needed
        const totalDepositsNeeded = Math.ceil(goalAmount / dailyAmount);

        // If no days selected, assume daily deposits
        if (!selectedDays || selectedDays.length === 0) {
            // Daily deposits
            const totalDays = totalDepositsNeeded;
            return {
                totalDays: totalDays,
                totalWeeks: Math.ceil(totalDays / 7),
                totalMonths: Math.ceil(totalDays / 30),
                totalYears: Math.ceil(totalDays / 365),
                depositsPerWeek: 7,
                displayText: this.formatTimeEstimate(totalDays)
            };
        }

        // Calculate deposits per week based on selected days
        const depositsPerWeek = selectedDays.length;
        
        // Calculate total weeks needed
        const totalWeeks = Math.ceil(totalDepositsNeeded / depositsPerWeek);
        
        // Calculate total days (approximate, based on weeks)
        const totalDays = totalWeeks * 7;

        return {
            totalDays: totalDays,
            totalWeeks: totalWeeks,
            totalMonths: Math.ceil(totalDays / 30),
            totalYears: Math.ceil(totalDays / 365),
            depositsPerWeek: depositsPerWeek,
            totalDepositsNeeded: totalDepositsNeeded,
            displayText: this.formatTimeEstimate(totalDays, totalWeeks, depositsPerWeek)
        };
    },

    // Format time estimate for display
    formatTimeEstimate(totalDays, totalWeeks = null, depositsPerWeek = null) {
        if (totalDays < 7) {
            return `${totalDays} ${totalDays === 1 ? 'day' : 'days'}`;
        } else if (totalDays < 30) {
            const weeks = totalWeeks || Math.ceil(totalDays / 7);
            return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
        } else if (totalDays < 365) {
            const months = Math.ceil(totalDays / 30);
            return `${months} ${months === 1 ? 'month' : 'months'}`;
        } else {
            const years = Math.floor(totalDays / 365);
            const remainingMonths = Math.ceil((totalDays % 365) / 30);
            if (remainingMonths > 0) {
                return `${years} ${years === 1 ? 'year' : 'years'} ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
            }
            return `${years} ${years === 1 ? 'year' : 'years'}`;
        }
    },

    // Calculate end date based on selected days
    calculateEndDate(startDate, totalDepositsNeeded, depositsPerWeek) {
        // Calculate total weeks needed
        const totalWeeks = Math.ceil(totalDepositsNeeded / depositsPerWeek);
        
        // Calculate end date (approximate - add weeks)
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + (totalWeeks * 7));
        
        return endDate;
    },

    // Calculate remaining schedule and end date dynamically based on current progress
    calculateRemainingSchedule(goal = null) {
        const targetGoal = goal || this.getCurrentGoal();
        if (!targetGoal) return null;

        const today = new Date();

        const remainingAmount = this.getRemainingAmount(targetGoal);
        if (remainingAmount <= 0) {
            return {
                remainingDeposits: 0,
                depositsPerWeek: (targetGoal.selectedDays && targetGoal.selectedDays.length > 0) ? targetGoal.selectedDays.length : 7,
                totalWeeks: 0,
                totalDays: 0,
                endDate: today,
                displayText: '0 days'
            };
        }

        const deposits = Array.isArray(targetGoal.deposits) ? targetGoal.deposits : [];
        if (deposits.length === 0) {
            return null; // no estimate until deposits exist
        }
        const totalDeposited = deposits.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
        const avgPerDeposit = totalDeposited / deposits.length;
        if (avgPerDeposit <= 0) return null;

        const remainingDeposits = Math.ceil(remainingAmount / avgPerDeposit);
        const depositsPerWeek = (targetGoal.selectedDays && targetGoal.selectedDays.length > 0) ? targetGoal.selectedDays.length : 7;

        const totalWeeks = Math.ceil(remainingDeposits / depositsPerWeek);
        const totalDays = totalWeeks * 7;
        const endDate = this.calculateEndDate(today, remainingDeposits, depositsPerWeek);

        return {
            remainingDeposits,
            depositsPerWeek,
            totalWeeks,
            totalDays,
            endDate,
            displayText: this.formatTimeEstimate(totalDays, totalWeeks, depositsPerWeek)
        };
    },

    // Update estimated time display
    updateEstimatedTimeDisplay() {
        const goalAmount = parseFloat(document.getElementById('goalAmount')?.value) || 0;
        const dailyAmount = parseFloat(document.getElementById('dailyAmount')?.value) || 0;
        const selectedDays = this.getSelectedDays();
        const estimatedTimeDisplay = document.getElementById('estimatedTimeDisplay');
        const estimatedTimeValue = document.getElementById('estimatedTimeValue');

        if (!estimatedTimeDisplay || !estimatedTimeValue) return;

        if (goalAmount > 0 && dailyAmount > 0) {
            const estimate = this.calculateEstimatedTime(goalAmount, dailyAmount, selectedDays);
            if (estimate) {
                estimatedTimeValue.textContent = estimate.displayText;
                estimatedTimeDisplay.style.display = 'block';
            } else {
                estimatedTimeDisplay.style.display = 'none';
            }
        } else {
            estimatedTimeDisplay.style.display = 'none';
        }
    },

    // Set or update the savings goal
    setGoal() {
        const goalName = document.getElementById('goalName').value.trim();
        const goalAmount = parseFloat(document.getElementById('goalAmount').value);
        const timeValue = parseInt(document.getElementById('timeValue').value);
        const timeUnit = document.getElementById('timeUnit').value;
        const selectedDays = this.getSelectedDays();

        if (!goalName || !goalAmount) {
            this.showToast('Please fill in all required fields', 'warning');
            return;
        }

        if (selectedDays.length === 0) {
            this.showToast('Please select at least one day for deposits', 'warning');
            return;
        }

        const startDate = new Date();

        const goalData = {
            name: goalName,
            targetAmount: goalAmount,
            timeValue: timeValue,
            timeUnit: timeUnit,
            startDate: startDate.toISOString(),
            endDate: null,
            deposits: [],
            selectedDays: selectedDays
        };

        // Check if we're editing an existing goal
        const editingGoalId = document.getElementById('goalForm').dataset.editingGoalId;
        
        if (editingGoalId) {
            // Update existing goal
            const goalIndex = this.goals.findIndex(g => g.id === parseInt(editingGoalId));
            if (goalIndex !== -1) {
                goalData.id = this.goals[goalIndex].id;
                goalData.deposits = this.goals[goalIndex].deposits || [];
                this.goals[goalIndex] = goalData;
                this.currentGoalId = goalData.id;
                this.showToast(`Goal "${goalName}" updated successfully!`);
            }
        } else {
            // Create new goal
            const newGoal = {
                id: Date.now(),
                ...goalData
            };
            this.goals.push(newGoal);
            this.currentGoalId = newGoal.id;
            this.showToast(`Goal "${goalName}" created successfully! Start adding deposits.`);
        }

        // Clear form
        document.getElementById('goalForm').reset();
        document.getElementById('goalForm').removeAttribute('data-editing-goal-id');

        this.saveData();
        // After saving, navigate to progress view for the current goal
        this.showProgressView();
        this.updateUI();
    },

    // Add a deposit
    addDeposit() {
        const goal = this.getCurrentGoal();
        if (!goal) {
            this.showToast('Please select a savings goal first', 'warning');
            return;
        }

        const depositInput = document.getElementById('depositAmount');
        const amount = parseFloat(depositInput.value);

        if (!amount || amount <= 0) {
            this.showToast('Please enter a valid deposit amount', 'warning');
            return;
        }

        const deposit = {
            id: Date.now(),
            amount: amount,
            date: new Date().toISOString()
        };

        if (!goal.deposits) {
            goal.deposits = [];
        }
        goal.deposits.push(deposit);
        this.saveData();
        this.updateUI();

        // Show success message
        this.showToast(`Deposit of ${this.formatCurrency(amount)} added successfully!`);

        // Clear input
        depositInput.value = '';
        depositInput.focus();
    },

    // Delete a deposit
    deleteDeposit(depositId) {
        const goal = this.getCurrentGoal();
        if (!goal || !goal.deposits) return;

        const deposit = goal.deposits.find(d => d.id === depositId);
        if (confirm(`Are you sure you want to delete the deposit of ${this.formatCurrency(deposit.amount)}?`)) {
            goal.deposits = goal.deposits.filter(d => d.id !== depositId);
            this.saveData();
            this.updateUI();
            this.showToast('Deposit deleted successfully');
        }
    },

    // Edit goal (show goal form with current goal data)
    editGoal() {
        const goal = this.getCurrentGoal();
        if (!goal) return;

        document.getElementById('goalName').value = goal.name;
        document.getElementById('goalAmount').value = goal.targetAmount;
        document.getElementById('goalForm').dataset.editingGoalId = goal.id;
        document.getElementById('goalFormTitle').textContent = 'Edit Savings Goal';

        // Show form first
        this.showGoalForm();

        // Initialize calendar with selected days if they exist
        const selectedDays = (goal.selectedDays && Array.isArray(goal.selectedDays)) ? goal.selectedDays : [];
        this.initCalendar(selectedDays);
    },

    // Delete a goal
    deleteGoal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        if (confirm(`Are you sure you want to delete the goal "${goal.name}"? All deposits will be lost.`)) {
            this.goals = this.goals.filter(g => g.id !== goalId);
            
            // If we deleted the current goal, switch to another or clear
            if (this.currentGoalId === goalId) {
                if (this.goals.length > 0) {
                    this.currentGoalId = this.goals[0].id;
                } else {
                    this.currentGoalId = null;
                }
            }

            this.saveData();
            this.updateUI();
            this.showToast('Goal deleted successfully');
        }
    },

    // Switch to a different goal
    switchGoal(goalId) {
        this.currentGoalId = goalId;
        this.saveData();
        this.updateUI();
        this.showProgressView();
    },

    // Show goals list view
    showGoalsList() {
        document.getElementById('goalsListSection').style.display = 'block';
        document.getElementById('goalSection').style.display = 'none';
        document.getElementById('progressSection').style.display = 'none';
        this.updateGoalsList();
    },

    // Show goal form
    showGoalForm() {
        document.getElementById('goalsListSection').style.display = 'none';
        document.getElementById('goalSection').style.display = 'block';
        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('goalForm').reset();
        document.getElementById('goalForm').removeAttribute('data-editing-goal-id');
        document.getElementById('goalFormTitle').textContent = 'Set Your Savings Goal';
        
        // Initialize calendar after a small delay to ensure DOM is ready
        setTimeout(() => {
            this.initCalendar();
        }, 50);
    },

    // Show progress view
    showProgressView() {
        document.getElementById('goalsListSection').style.display = 'none';
        document.getElementById('goalSection').style.display = 'none';
        document.getElementById('progressSection').style.display = 'block';
    },

    // Calculate current savings for a goal
    getCurrentSavings(goal = null) {
        const targetGoal = goal || this.getCurrentGoal();
        if (!targetGoal || !targetGoal.deposits) return 0;
        return targetGoal.deposits.reduce((total, deposit) => total + deposit.amount, 0);
    },

    // Calculate remaining amount
    getRemainingAmount(goal = null) {
        const targetGoal = goal || this.getCurrentGoal();
        if (!targetGoal) return 0;
        const remaining = targetGoal.targetAmount - this.getCurrentSavings(targetGoal);
        return remaining > 0 ? remaining : 0;
    },

    // Calculate progress percentage
    getProgressPercent(goal = null) {
        const targetGoal = goal || this.getCurrentGoal();
        if (!targetGoal) return 0;
        const percent = (this.getCurrentSavings(targetGoal) / targetGoal.targetAmount) * 100;
        return Math.min(percent, 100);
    },

    // Calculate days remaining (dynamic based on current progress and schedule)
    getDaysRemaining(goal = null) {
        const targetGoal = goal || this.getCurrentGoal();
        if (!targetGoal) return null;
        const schedule = this.calculateRemainingSchedule(targetGoal);
        if (!schedule || !schedule.endDate) return null;
        const today = new Date();
        const diffTime = schedule.endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    },

    // Format currency
    formatCurrency(amount) {
        return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Update goals list
    updateGoalsList() {
        const goalsGrid = document.getElementById('goalsGrid');
        if (!goalsGrid) return;

        if (this.goals.length === 0) {
            goalsGrid.innerHTML = `
                <div class="empty-goals-state">
                    <div class="empty-icon material-icons">inbox</div>
                    <p>No goals yet</p>
                    <p class="empty-subtitle">Create your first savings goal to get started!</p>
                    <button class="btn btn-primary" onclick="SavingsTracker.showGoalForm()">
                        <span class="material-icons">add</span>
                        Create Your First Goal
                    </button>
                </div>
            `;
            return;
        }

        goalsGrid.innerHTML = this.goals.map(goal => {
            const progress = this.getProgressPercent(goal);
            const currentSavings = this.getCurrentSavings(goal);
            const remaining = this.getRemainingAmount(goal);
            const isActive = goal.id === this.currentGoalId;

            return `
                <div class="goal-card ${isActive ? 'active' : ''}" data-goal-id="${goal.id}">
                    <div class="goal-card-header">
                        <h3>${goal.name}</h3>
                        <div class="goal-card-actions">
                            <button class="icon-btn" onclick="SavingsTracker.switchGoal(${goal.id})" title="View Goal">
                                <span class="material-icons">visibility</span>
                            </button>
                            <button class="icon-btn" onclick="SavingsTracker.editGoalById(${goal.id})" title="Edit Goal">
                                <span class="material-icons">edit</span>
                            </button>
                            <button class="icon-btn delete" onclick="SavingsTracker.deleteGoal(${goal.id})" title="Delete Goal">
                                <span class="material-icons">delete</span>
                            </button>
                        </div>
                    </div>
                    <div class="goal-card-progress">
                        <div class="goal-progress-bar">
                            <div class="goal-progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="goal-progress-text">${progress.toFixed(1)}%</span>
                    </div>
                    <div class="goal-card-stats">
                        <div class="goal-stat">
                            <span class="goal-stat-label">Saved</span>
                            <span class="goal-stat-value success">${this.formatCurrency(currentSavings)}</span>
                        </div>
                        <div class="goal-stat">
                            <span class="goal-stat-label">Target</span>
                            <span class="goal-stat-value">${this.formatCurrency(goal.targetAmount)}</span>
                        </div>
                        <div class="goal-stat">
                            <span class="goal-stat-label">Remaining</span>
                            <span class="goal-stat-value">${this.formatCurrency(remaining)}</span>
                        </div>
                    </div>
                    ${isActive ? '<div class="active-badge">Active</div>' : ''}
                </div>
            `;
        }).join('');
    },

    // Edit goal by ID
    editGoalById(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        this.currentGoalId = goalId;
        this.editGoal();
    },

    // Update the UI
    updateUI() {
        // Update goals list if visible
        this.updateGoalsList();

        if (this.goals.length === 0) {
            // No goals - show goal form (landing page)
            this.showGoalForm();
            return;
        }

        // Has goals - show current goal's progress (landing page)
        // If no current goal selected, select the first one
        let goal = this.getCurrentGoal();
        if (!goal && this.goals.length > 0) {
            this.currentGoalId = this.goals[0].id;
            this.saveData();
            goal = this.getCurrentGoal();
        }
        
        // Show progress view for current goal
        if (goal) {
            this.showProgressView();

            const deposits = this.getCurrentDeposits();

            // Update goal name
            document.getElementById('currentGoalName').textContent = goal.name;

            // Calculate values
            const currentSavings = this.getCurrentSavings();
            const remaining = this.getRemainingAmount();
            const progress = this.getProgressPercent();
            const daysRemaining = this.getDaysRemaining();
            const schedule = this.calculateRemainingSchedule(goal);

            // Update stats
            document.getElementById('targetAmount').textContent = this.formatCurrency(goal.targetAmount);
            document.getElementById('currentSavings').textContent = this.formatCurrency(currentSavings);
            document.getElementById('remainingAmount').textContent = this.formatCurrency(remaining);
            document.getElementById('progressPercent').textContent = `${progress.toFixed(1)}%`;

            // Update progress bar
            const progressFill = document.getElementById('progressFill');
            const progressPercentText = document.getElementById('progressPercentText');
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
                if (progress >= 100) {
                    progressFill.textContent = 'Goal Reached!';
                } else {
                    progressFill.textContent = '';
                }
            }
            if (progressPercentText) {
                progressPercentText.textContent = `${progress.toFixed(1)}%`;
            }

            // Display estimated time period (dynamic based on remaining progress)
            let calculatedTimeDisplay = '-';
            if (schedule) {
                calculatedTimeDisplay = schedule.totalDays === 0
                    ? '0 days'
                    : this.formatTimeEstimate(schedule.totalDays, schedule.totalWeeks, schedule.depositsPerWeek);
            }
            document.getElementById('displayTimePeriod').textContent = calculatedTimeDisplay;

            // Display user-set target time period if available
            const userTargetTimePeriodElement = document.getElementById('userTargetTimePeriod');
            if (userTargetTimePeriodElement) {
                if (goal.timeValue && goal.timeUnit) {
                    userTargetTimePeriodElement.textContent = `${goal.timeValue} ${goal.timeUnit} (Your Target)`;
                    userTargetTimePeriodElement.parentNode.style.display = 'flex'; // Show parent div
                } else {
                    userTargetTimePeriodElement.parentNode.style.display = 'none'; // Hide parent div
                }
            }
            
            document.getElementById('daysRemaining').textContent = daysRemaining !== null ? `${daysRemaining} days` : '-';
            
            const endDate = schedule && schedule.endDate ? schedule.endDate : (goal.endDate ? new Date(goal.endDate) : null);
            document.getElementById('estimatedCompletion').textContent = endDate
                ? endDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })
                : '-';

            // Update selected days display
            this.updateSelectedDaysDisplay(goal);

            // Update deposit list
            this.updateDepositList();

            // Update deposit count
            const depositCount = document.getElementById('depositCount');
            if (depositCount) {
                const count = deposits.length;
                depositCount.textContent = `${count} ${count === 1 ? 'deposit' : 'deposits'}`;
            }

            // Check if goal is reached
            if (progress >= 100) {
                document.getElementById('achievementMessage').style.display = 'block';
            } else {
                document.getElementById('achievementMessage').style.display = 'none';
            }
        } else {
            // Fallback: show goals list if something went wrong
            this.showGoalsList();
        }
    },

    // Update selected days display
    updateSelectedDaysDisplay(goal) {
        const selectedDaysSection = document.getElementById('selectedDaysSection');
        const selectedDaysDisplay = document.getElementById('selectedDaysDisplay');
        
        if (!selectedDaysSection || !selectedDaysDisplay) return;

        if (goal.selectedDays && goal.selectedDays.length > 0) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const selectedDayNames = goal.selectedDays
                .sort((a, b) => a - b)
                .map(dayIndex => dayNames[dayIndex]);
            
            selectedDaysDisplay.innerHTML = selectedDayNames.map(dayName => `
                <span class="selected-day-badge">
                    <span class="material-icons">event</span>
                    ${dayName}
                </span>
            `).join('');
            
            selectedDaysSection.style.display = 'block';
        } else {
            selectedDaysSection.style.display = 'none';
        }
    },

    // Update deposit list
    updateDepositList() {
        const depositList = document.getElementById('depositList');
        if (!depositList) return;

        const deposits = this.getCurrentDeposits();
        
        if (deposits.length === 0) {
            depositList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon material-icons">inbox</div>
                    <p>No deposits yet</p>
                    <p class="empty-subtitle">Start saving today to see your progress!</p>
                </div>
            `;
            return;
        }

        // Sort deposits by date (newest first)
        const sortedDeposits = [...deposits].sort((a, b) => new Date(b.date) - new Date(a.date));

        depositList.innerHTML = sortedDeposits.map(deposit => `
            <div class="deposit-item">
                <div class="deposit-item-info">
                    <div class="deposit-amount">${this.formatCurrency(deposit.amount)}</div>
                    <div class="deposit-date">${this.formatDate(deposit.date)}</div>
                </div>
                <button onclick="SavingsTracker.deleteDeposit(${deposit.id})" aria-label="Delete deposit">
                    <span class="material-icons">delete</span>
                    Delete
                </button>
            </div>
        `).join('');
    }
};

// ===== Initialize the application when DOM is loaded =====
document.addEventListener('DOMContentLoaded', () => {
    SavingsTracker.init();
});