# 💰 Savings Tracker

An intuitive web application to plan and track savings across one or more goals. Estimates are calculated from your actual deposit history and weekly deposit schedule, not from a preset daily amount.

## Features

- 🗂️ Multiple goals: Create, switch, edit, and delete savings goals
- 📅 Weekly schedule: Select specific days of the week for deposits (e.g., Mon/Wed/Fri)
- ⏱️ Post-deposit estimates: Time estimates are based on your average deposit size and selected weekly schedule
- 💵 Deposit tracking: Add deposits with timestamps and view a full history
- 📊 Visual progress: Progress bar, percentage, saved/remaining amounts
- 🔔 Goal achievements: Celebrate when you reach 100%
- 💾 Local persistence: Data stored in your browser (LocalStorage)
- 📱 Responsive design: Works on desktop and mobile

## How to use

1) Open the application
- Open index.html in your browser (no server required)

2) Create a goal
- Enter Goal name (e.g., “Computer”)
- Enter Target amount in pesos (e.g., 60000)
- Select deposit days in the weekly calendar (pick at least one day)
- Optionally set a target time value/unit; shown as “Your Target” for reference
- Click Save Goal

3) Add deposits
- Enter an amount and click Add Deposit
- Your progress, remaining amount, and estimates update automatically based on your deposit history

4) Manage goals
- View all goals on the goals list
- Switch active goal (visibility icon)
- Edit goal (edit icon). Editing updates schedule and recalculations
- Delete goal (delete icon). This removes the goal and its deposits

## How estimation works now

- The app estimates remaining time using your actual deposits:
  - Average deposit amount = total deposited ÷ number of deposits
  - Remaining deposits needed = remaining amount ÷ average deposit amount
  - Deposits per week = number of selected weekly days
  - Estimated weeks = remaining deposits needed ÷ deposits per week (rounded up)
  - Estimated days ≈ estimated weeks × 7
- Estimates appear after you add at least one deposit for the goal

## Example

- Goal: Buy a Computer
- Target: ₱60,000
- Selected Days: Mon–Fri (5 days/week)
- First three deposits: ₱200, ₱150, ₱250 → average ₱200

Remaining amount example: ₱60,000 − ₱600 = ₱59,400
- Remaining deposits needed ≈ 59,400 ÷ 200 = 297
- Estimated weeks ≈ 297 ÷ 5 = 60
- Estimated days ≈ 60 × 7 = 420 days

The estimate updates as you add deposits and adjust scheduled days.

## Technical details

- HTML, CSS, and Vanilla JavaScript
- LocalStorage keys: savingsGoals, currentGoalId (auto-migrates older single-goal data)
- Currency display: Peso (₱) with localized formatting
- Accessible controls with keyboard support for day selection

## Files

- index.html — UI structure
- styles.css — Styling and responsive layout
- app.js — Application logic (multi-goal, weekly scheduling, deposit-based estimates)
- README.md — Project documentation

## Browser compatibility

- Chrome, Firefox, Safari, Edge (latest versions)

## Privacy

All data is stored locally in your browser. No servers or external APIs are used.

Enjoy tracking your savings! 🎉
