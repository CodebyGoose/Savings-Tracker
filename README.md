# Savings Tracker

A modern, deliberate web application built with React, TypeScript, and Vite to plan, schedule, and achieve your financial savings targets with precision.

---

## Overview

Savings Tracker removes guesswork from personal savings. Instead of assuming arbitrary daily amounts, the app dynamically models your completion timeline using your **actual deposit history** and your **selected weekly deposit schedule**.

Designed with a high-contrast, solid design system (no gradients, no clutter), the interface provides immediate clarity on where your money goes and when you will reach your targets.

---

## Features

- **Multi-Goal Architecture**: Manage multiple independent savings targets with individualized timelines and progress tracking.
- **Weekly Schedule Customization**: Choose active deposit days per week (e.g., Mon/Wed/Fri) to align with income cycles and personal saving routines.
- **Deposit-Driven Estimation**: Completion dates and required timelines dynamically adapt as you record deposits of varying sizes.
- **Target Pace Projections**: Real-time feedback calculating the exact amount needed per scheduled deposit day to meet your deadline.
- **Granular Transaction History**: Timestamped deposit records with optional memo notes and one-click quick presets.
- **Milestone & Progress Tracking**: Real-time percentage breakdowns, remaining balance indicators, and goal achievement recognition.
- **Deliberate Design System**: Solid dark and light modes, 5-step grayscale ramp, purposeful emerald accents, and zero emoji decoration.
- **Private & Local-First**: 100% client-side data persistence with automatic schema migration in `localStorage`.

---

## Quick Start Tutorial

Follow this step-by-step guide to set up and use Savings Tracker effectively.

### Step 1: Create a Savings Goal

1. Click **New Goal** in the navigation header.
2. Enter the **Goal Name** (e.g., `Emergency Fund`, `Workstation Upgrade`, or `Annual Insurance`).
3. Set your **Target Amount** in Philippine Pesos (₱).
4. Define your **Target Duration** (e.g., `6 Months` or `1 Year`).
5. Select your **Deposit Days** on the weekday selector (e.g., select `Mon`, `Wed`, `Fri` for 3 deposits per week).
6. Review the **Live Projection Preview** at the bottom of the modal to see the recommended amount per scheduled day.
7. Click **Create Goal**.

---

### Step 2: Record Deposits

1. From the **Active Goal** overview, locate the **Record New Deposit** card.
2. Enter your deposit amount or click one of the quick presets (`+₱100`, `+₱500`, `+₱1,000`, `+₱5,000`).
3. (Optional) Click **Add note** to attach a description (e.g., `Bi-weekly payroll contribution`).
4. Click **Add Deposit**.

Your current savings, remaining amount, progress percentage, and timeline projection will recalculate immediately.

---

### Step 3: Interpret Your Projections

The app calculates two synchronized metrics:

| Metric | Description | Formula / Source |
| :--- | :--- | :--- |
| **Estimated Timeline** | Projected completion date based on real behavior | `Current Date + (Remaining Amount / Avg Deposit / Scheduled Days Per Week * 7)` |
| **Target Pace** | Recommended deposit size to meet target duration | `Target Amount / Total Scheduled Days in Target Duration` |
| **Average Deposit** | Rolling mean of all recorded deposits | `Total Saved / Total Deposit Count` |
| **Remaining Balance** | Total amount left to reach 100% | `Target Amount - Total Saved` |

---

### Step 4: Manage Multiple Goals

- Click **All Goals** in the header to view an aggregated portfolio overview with comparison cards.
- Use the **Active Goal Dropdown** or click **View Details** on any goal card to switch focus.
- Edit target parameters (name, amount, duration, active days) at any time by clicking **Edit**.
- Use the sun/moon toggle in the top-right corner to switch between **Dark** and **Light** themes.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **UI Framework** | React 19 | Declarative UI and component lifecycle |
| **Language** | TypeScript 5.7 | Static typing and compile-time correctness |
| **Build Tool** | Vite 6 | Fast local HMR and optimized production bundles |
| **Icons** | Lucide React | Clean, scalable vector iconography |
| **Styling** | Vanilla CSS Tokens | Solid, deliberate monochromatic design system |
| **Persistence** | LocalStorage API | Local-first, private client-side data store |

---

## Project Structure

```text
c:/Code/Saving-Tracker/
├── src/
│   ├── components/
│   │   ├── ConfirmModal.tsx      # Accessible confirmation dialogs
│   │   ├── GoalFormModal.tsx     # Goal creation and editing modal
│   │   ├── GoalList.tsx          # Multi-goal dashboard grid
│   │   ├── GoalOverview.tsx      # Active goal view & deposit manager
│   │   ├── Header.tsx            # App bar, portfolio total, theme toggle
│   │   └── Toast.tsx             # Notification banner component
│   ├── hooks/
│   │   └── useSavingsTracker.ts  # State management and storage sync
│   ├── types/
│   │   └── index.ts              # TypeScript domain types and schemas
│   ├── utils/
│   │   ├── calculations.ts       # Mathematical models and formatters
│   │   └── storage.ts            # LocalStorage migrations and handlers
│   ├── App.tsx                   # Main layout and view routing
│   ├── index.css                 # Deliberate solid CSS design system
│   └── main.tsx                  # Application entry point
├── index.html                    # HTML shell
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite bundler configuration
```

---

## Development Workflow

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Installation
```bash
# Clone or navigate to the project directory
cd c:/Code/Saving-Tracker

# Install dependencies
npm install
```

### Running Locally
```bash
# Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

### Production Build
```bash
# Compile TypeScript and bundle with Vite
npm run build

# Preview the production build locally
npm run preview
```

---

## Mathematical Specification

### Estimation Engine

1. **Average Deposit ($\bar{D}$)**:
   $$\bar{D} = \frac{\sum_{i=1}^{n} D_i}{n}$$
   *(where $D_i$ is the amount of deposit $i$, and $n$ is the total deposit count)*

2. **Remaining Balance ($R$)**:
   $$R = \max(0, T - \sum_{i=1}^{n} D_i)$$
   *(where $T$ is the target amount)*

3. **Required Deposits Needed ($k$)**:
   $$k = \lceil \frac{R}{\bar{D}} \rceil$$

4. **Estimated Weeks ($W$)**:
   $$W = \lceil \frac{k}{S} \rceil$$
   *(where $S$ is the number of scheduled deposit days per week, $1 \le S \le 7$)*

5. **Estimated Days ($E$)**:
   $$E = W \times 7$$

---

## Privacy & Security

- **Zero Remote Telemetry**: All data remains exclusively within the user's browser storage.
- **Client-Side Sanitation**: Inputs and values are parsed with strict floating-point sanitizers and defensive schema guards.
- **No External CDN Dependencies**: Bundled locally with zero tracking scripts or analytics cookies.

---

## License

MIT License. Open source and free for personal or commercial use.
