# Klarheit

Klarheit is a minimalist personal finance cockpit built with Next.js. It helps track income, expenses, budget limits, debt payoff progress, savings targets, and monthly financial recovery plans.

The goal is simple: stop guessing, set the plan, and execute the system.

## Overview

Klarheit is designed around monthly financial clarity. Instead of only logging transactions, the app helps answer the questions that actually matter:

- How much money came in this month?
- How much has been spent?
- Which categories are leaking money?
- How much debt has been paid down?
- How much has been saved?
- Is the current recovery plan realistic?
- What action should be taken next?

The interface is built with a dark, minimal, command-center style inspired by German precision, iOS-style layout, and futuristic financial dashboards.

## Features

### Monthly Operating Cycle

Klarheit filters transactions by selected month, allowing each month to act as its own financial period.

### Transaction Tracking

Users can add, edit, and delete transactions.

Supported transaction types:

- Income
- Expense

Transaction details include:

- Description
- Amount
- Category
- Account or card used
- Date
- Necessary or discretionary classification

### Dashboard / Zentrale

The dashboard summarizes the most important financial data:

- Income
- Expenses
- Net cashflow
- Savings rate
- Expense ratio
- Discretionary ratio
- Active recovery plan
- Debt target
- Savings target
- Safe remaining cash
- Mission progress
- Action recommendations

### Recovery Plan / Tilgung

Users can create and save a monthly recovery plan with:

- Plan name
- Debt payoff target
- Savings target

The recovery plan is saved locally and used by the dashboard to judge whether the current month’s cashflow supports the plan.

### Safe Spending

Klarheit calculates safe remaining spending using:

text Income - Expenses - Debt Payoff Target - Savings Target 

It also calculates daily allowance based on the number of days left in the month.

Financial status labels include:

- GRÜN
- GELB
- ROT
- SCHWARZ

### Recovery Progress

Debt payoff and savings progress are tracked automatically based on transaction categories.

- Expenses categorized as Debt Payment count toward debt progress.
- Expenses categorized as Savings count toward savings progress.

The app displays:

- Debt paid
- Debt target
- Remaining debt mission
- Savings added
- Savings target
- Remaining savings mission

### Budget Limits / Rahmen

Users can set monthly category limits for spending categories such as:

- Food
- Transportation
- Clothing
- Subscriptions
- Fun
- Debt Payment
- Savings
- Investing

Budget limits are editable and saved locally.

### Plan Adjustment Suggestions

If the monthly recovery plan exceeds available cashflow, Klarheit generates adjustment options:

- Fit the debt target
- Fit the savings target
- Increase income
- Extend the timeline

Some suggestions can be applied directly from the dashboard.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React
- LocalStorage for local persistence

## Local Development

Install dependencies:

bash npm install 

Run the development server:

bash npm run dev 

Open the app locally:

text http://localhost:3000 

If port 3000 is already in use, Next.js may run on another port such as:

text http://localhost:3001 

## Production Build

Run:

bash npm run build 

If the build completes successfully, the app is ready for deployment.

## Deployment

Klarheit is designed to deploy easily on Vercel.

Recommended deployment flow:

bash git add . git commit -m "Update Klarheit" git push 

Then import the GitHub repository into Vercel as a Next.js project.

## Current Persistence Model

Klarheit currently uses browser localStorage for:

- Transactions
- Monthly recovery plan
- Category budget limits

This keeps the app simple and fast for the first version.

Future versions may add:

- Supabase database
- Authentication
- Cross-device syncing
- Export to CSV
- Recurring transactions
- Multi-month forecasting
- Investment tracking
- Net worth dashboard

## Project Philosophy

Klarheit is not just a budgeting app.

It is a financial execution system.

The goal is to create clarity around money, remove emotional fog, and turn financial recovery into a structured monthly plan.

text Plan gespeichert – System ausführen. 

## Status

Klarheit v1 is functional and includes the core dashboard, transaction system, recovery plan, budget limits, and financial action logic.
