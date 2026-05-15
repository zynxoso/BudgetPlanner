# BudgetPlanner

Personal finance planner built with Laravel 12, Inertia, and React to track income, expenses, budgets, allowances, savings goals, loans, and reports.

## Features
- Track income and expenses
- Set budgets and allowances
- Manage savings goals and loan payments
- Review all transactions in one place
- View summary reports
- Authenticated user experience

## Tech Stack
- Laravel 12
- Inertia.js + React 19
- Vite + TypeScript
- Tailwind CSS

## Requirements
- PHP 8.2+
- Composer
- Node.js 18+ and npm
- A database (SQLite, MySQL, or Postgres)

## Getting Started
1. Install PHP dependencies:
   ```bash
   composer install
   ```
2. Install JS dependencies:
   ```bash
   npm install
   ```
3. Create your environment file:
   ```bash
   copy .env.example .env
   ```
4. Generate app key:
   ```bash
   php artisan key:generate
   ```
5. Configure the database in `.env`, then migrate:
   ```bash
   php artisan migrate
   ```
6. Start the dev servers:
   ```bash
   composer dev
   ```

Visit http://127.0.0.1:8000 after the server starts.

## Useful Scripts
- `composer dev` - Run Laravel server, queue listener, and Vite dev server
- `npm run dev` - Start Vite dev server only
- `npm run build` - Build frontend assets
- `npm run lint` - Lint and fix JS/TS
- `npm run format` - Format frontend code

## Routes Overview
See [routes/web.php](routes/web.php) for the full list. Core areas include dashboard, income, expenses, budgets, allowances, savings goals, loans, transactions, and reports.

## Testing
```bash
php artisan test
```

## License
MIT
