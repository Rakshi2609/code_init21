

# PRD — PensionGuard

Inflation-Aware Financial Companion for Pension-Dependent Elderly

---

# 1. Product Overview

PensionGuard is an accessible Progressive Web App (PWA) with a companion Chrome Extension that helps pension-dependent elderly individuals manage spending sustainably under inflation and fixed income constraints.

The system calculates safe monthly spending, projects lifetime financial sustainability, detects overspending risk, and provides actionable guidance in simple language.

The product is designed under the Human-First Tech theme: equity, accessibility, and protection of financially vulnerable seniors.

---

# 2. Problem Statement

Millions of elderly individuals rely on fixed pensions while inflation continuously erodes purchasing power. Existing budgeting tools are not designed for seniors, do not account for inflation, and do not project whether funds will last their lifetime.

As a result, elderly users often overspend unknowingly and face financial distress late in life.

There is a need for an accessible, inflation-aware financial safety tool specifically designed for pension-dependent populations.

---

# 3. Goals and Objectives

Primary Goals

* Ensure pension funds last through expected lifetime
* Provide inflation-adjusted safe spending guidance
* Reduce overspending risk
* Improve financial independence of elderly users
* Provide accessible, low-cognitive financial interface

Secondary Goals

* Enable caregiver oversight
* Provide cross-device usage (mobile + desktop)
* Demonstrate deployable real-world impact

---

# 4. Target Users

Primary Users

* Government pensioners
* Retired private sector employees
* Elderly widows with fixed income
* Seniors aged 60+

Secondary Users

* Caregivers
* Family members
* Social workers
* NGOs serving elderly populations

---

# 5. Key Value Proposition

PensionGuard answers four critical questions for seniors:

* How much can I safely spend each month?
* Will my money last my lifetime?
* How is inflation affecting my life?
* What should I change to stay financially safe?

---

# 6. Product Scope

Platforms

* Progressive Web App (primary)
* Chrome Extension (companion)

Core Capabilities

* Pension and savings onboarding
* Expense tracking
* Inflation-adjusted projections
* Lifetime sustainability modeling
* Safe monthly spending calculation
* Overspending alerts
* Simple recommendations
* Accessible UI

---

# 7. Technical Stack

Frontend (PWA)

* Next.js 14 (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui
* next-pwa
* Recharts
* Web Speech API (voice input)

Backend

* Next.js Server Actions / API Routes
* Supabase Edge Functions (optional)

Database

* Supabase PostgreSQL
* Row Level Security enabled

Auth

* Supabase Auth (OTP login)

Chrome Extension

* Manifest v3
* React + TypeScript
* Tailwind
* Supabase JS SDK

Intelligence Layer

* TypeScript simulation engine
* Inflation dataset (CPI categories)
* Deterministic projection algorithms

Deployment

* Vercel (frontend)
* Supabase Cloud (database + auth)

---

# 8. System Architecture

Clients

* PWA
* Chrome Extension

Backend Layer

* Next.js API
* Intelligence Engine

Data Layer

* Supabase Postgres
* Inflation datasets
* Benchmarks

Flow

User input → Supabase → Intelligence Engine → Projections → UI
Extension input → Supabase → same pipeline

---

# 9. Data Model

users

* id
* name
* age
* location
* pension_amount
* savings
* life_expectancy

expenses

* id
* user_id
* amount
* category
* date
* source (manual / extension / voice)

inflation_index

* category
* annual_rate
* region
* year

projections

* user_id
* safe_monthly_spend
* exhaustion_age
* risk_level
* last_calculated

benchmarks

* region
* category
* avg_monthly_cost

---

# 10. Intelligence Layer Specification

The intelligence layer is a deterministic financial simulation engine designed to model lifetime sustainability under inflation.

Modules

Inflation Adjustment Engine
Applies category-specific inflation rates to expense trajectories.

Lifetime Simulation Engine
Simulates yearly balance from current age to life expectancy.

Safe Spend Solver
Finds maximum sustainable monthly spend using iterative search.

Overspending Detector
Compares actual vs safe spending and classifies risk.

Recommendation Engine
Generates actionable adjustments using benchmarks and projections.

Core Inputs

* Age
* Savings
* Pension
* Monthly expenses
* Inflation rates
* Life expectancy

Core Outputs

* Safe monthly spend
* Fund exhaustion age
* Inflation impact
* Risk level
* Recommendations

---

# 11. Core Algorithms

Inflation Projection

future_cost = current_cost × (1 + inflation_rate)^years

Lifetime Simulation

balance = savings
for year in age → life_expectancy
 balance += pension × 12
 expenses *= (1 + inflation_rate)
 balance -= expenses
 if balance < 0 → exhaustion_age

Safe Spend Solver

Iteratively adjust monthly spend until exhaustion_age ≈ life_expectancy.

Overspend Detection

risk = actual_spend / safe_spend

---

# 12. Feature Specification

F1 Onboarding

Inputs

* Age
* Pension
* Savings
* Location
* Expenses

Output

* Initial safe spend
* Risk level

F2 Expense Tracking

Manual entry
Voice entry
Chrome extension entry

F3 Inflation Awareness

Category inflation display
Projected cost increases

F4 Lifetime Projection

Balance over time
Exhaustion age
Risk color state

F5 Safe Monthly Spend

Maximum sustainable spend
Real-time updates

F6 Alerts

Overspending
Inflation surge
High-risk projection

F7 Recommendations

Category reduction suggestions
Savings preservation advice

F8 Chrome Extension

Quick expense entry
Safe spend widget
Inflation alerts

---

# 13. User Workflow

PWA

1. User installs PWA
2. Onboarding inputs
3. Safe spend calculated
4. User logs expenses
5. Projection updates
6. Alerts shown
7. Recommendations shown

Extension

1. User installs extension
2. Login once
3. Quick add expense
4. Data syncs to Supabase
5. PWA updates projections

---

# 14. Accessibility Requirements

Large typography
High contrast
Low cognitive navigation
Voice input
Audio summaries
Simple language
3-tap max flows
No financial jargon

---

# 15. Novelty and Innovation

Inflation-aware budgeting for elderly
Lifetime sustainability modeling in consumer app
Pension-centric finance design
Cross-device elderly financial assistant
Deterministic safe spend solver
Human-first financial UX
Inflation impact visualization
Extension-based passive expense capture

No mainstream budgeting apps provide lifetime pension sustainability modeling.

---

# 16. Competitive Positioning

Traditional budgeting apps

* Track past spending
* Ignore inflation
* Not elderly-friendly
* No lifetime modeling

PensionGuard

* Predicts future affordability
* Models inflation
* Senior-accessible UX
* Pension-specific
* Cross-platform

---

# 17. Security and Privacy

Row-level security
Encrypted transport
No financial credentials stored
Minimal personal data
User-owned data model

---

# 18. Performance Requirements

Load under 2 seconds
Projection under 200 ms
Offline expense entry
Low memory footprint

---

# 19. Phase Plan

Phase 1 — Foundation

Supabase schema
Auth
Next.js setup
PWA installable

Phase 2 — Core Features

Onboarding
Expense tracking
Projection engine
Safe spend calculation

Phase 3 — Intelligence

Inflation adjustment
Overspend detection
Recommendations

Phase 4 — Extension

Popup expense entry
Safe spend display
Sync

Phase 5 — Polish

Accessibility
Charts
Alerts
Demo data

---

# 20. MVP Definition

User can:

Enter pension and savings
Log expenses
See safe monthly spend
See lifetime sustainability
Receive overspend alerts
Use Chrome extension to add expenses

---

# 21. Success Metrics

Projection accuracy
Safe spend adoption
Expense logging frequency
Overspend reduction
Retention
Accessibility usability

---

# 22. Demo Scenario

User age 68
Pension 25,000
Savings 4,00,000

App calculates safe spend 18,200

User logs expense 20,000

Risk alert appears

Projection shows exhaustion at 84

User reduces spending

Projection updates to 91

---

# 23. Risks

Inflation dataset accuracy
Life expectancy estimation
User data completeness
Financial sensitivity

Mitigation

Conservative modeling
Transparent assumptions
User override

---

# 24. Future Roadmap

Bank SMS parsing
Govt pension sync
Medical inflation modeling
Caregiver dashboard
Regional price index API
AI anomaly detection
Policy benefit eligibility

---

# 25. Hackathon Winning Factors

Clear vulnerable population impact
Novel financial modeling
Accessible UX
Cross-platform delivery
Real-world deployability
Strong demo narrative
Human-first design

---

# 26. Definition of Done

PWA installable
User onboarding works
Expenses persist
Projection accurate
Safe spend shown
Alerts trigger
Extension sync works
Demo scenario reproducible
