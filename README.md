# 💰 Savings Tracker

An intuitive web application to plan and track savings across one or more goals, with weekly deposit scheduling and dynamic time estimates.

## Features

- 🗂️ Multiple goals: Create, switch, edit, and delete savings goals
- 📅 Weekly schedule: Select specific days of the week for deposits (e.g., Mon/Wed/Fri)
- ⏱️ Dynamic time estimates: Estimated time updates based on your schedule and remaining amount
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
- Enter Daily deposit amount (the amount you plan to deposit per scheduled day)
- Select deposit days in the weekly calendar (must pick at least one day)
- Optionally set a target time value/unit; this is shown as “Your Target” for reference
- Click Start Saving

3) Add deposits
- Enter an amount and click Add Deposit
- Your progress, remaining amount, and estimates update automatically

4) Manage goals
- View all goals on the goals list
- Switch active goal (visibility icon)
- Edit goal (edit icon). Editing updates schedule and recalculations
- Delete goal (delete icon). This removes the goal and its deposits

## How time estimation works

- The app calculates how many deposits are needed (remaining amount ÷ daily deposit amount)
- Your selected weekly days determine deposits per week
- The total time is estimated from the current remaining amount and schedule
- Estimates include days/weeks/months/years (approximate based on 7 and 30-day months)

## Example

- Goal: Buy a Computer
- Target: ₱60,000
- Daily Deposit: ₱100
- Selected Days: Mon–Fri (5 days/week)

Total deposits needed: 600
Estimated weeks (approx.): 600 ÷ 5 = 120 weeks
Estimated days (approx.): 120 × 7 = 840 days
Displayed estimate adapts as you add deposits

## Technical details

- HTML, CSS, and Vanilla JavaScript
- LocalStorage keys: savingsGoals, currentGoalId (auto-migrates older single-goal data)
- Currency display: Peso (₱) with localized formatting
- Accessible controls with keyboard support for day selection

## Files

- index.html — UI structure
- styles.css — Styling and responsive layout
- app.js — Application logic (multi-goal, weekly scheduling, persistence)
- README.md — Project documentation

## Browser compatibility

- Chrome, Firefox, Safari, Edge (latest versions)

## Privacy

All data is stored locally in your browser. No servers or external APIs are used.

Enjoy tracking your savings! 🎉
