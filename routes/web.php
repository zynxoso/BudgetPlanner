<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\AllowanceController;
use App\Http\Controllers\SavingsGoalController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\BankAccountController;
use App\Http\Controllers\AiController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/welcome', function () {
    return Inertia::render('welcome');
})->name('welcome');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    Route::get('income', [TransactionController::class, 'incomeIndex'])->name('income.index');
    Route::post('income', [TransactionController::class, 'storeIncome'])->name('income.store');
    
    Route::get('expenses', [TransactionController::class, 'expenseIndex'])->name('expenses.index');
    Route::post('expenses', [TransactionController::class, 'storeExpense'])->name('expenses.store');
    
    Route::get('budget', [BudgetController::class, 'index'])->name('budget.index');
    Route::post('budget', [BudgetController::class, 'updateOrCreate'])->name('budget.updateOrCreate');
    
    Route::get('allowance', [AllowanceController::class, 'index'])->name('allowance.index');
    Route::post('allowance', [AllowanceController::class, 'store'])->name('allowance.store');
    Route::put('allowance/{allowance}', [AllowanceController::class, 'update'])->name('allowance.update');
    Route::delete('allowance/{allowance}', [AllowanceController::class, 'destroy'])->name('allowance.destroy');
    
    Route::get('savings-goals', [SavingsGoalController::class, 'index'])->name('savings-goals.index');
    Route::patch('savings-goals/{savingsGoal}/add-amount', [SavingsGoalController::class, 'updateAddAmount'])->name('savings-goals.updateAddAmount');
    Route::post('savings-goals', [SavingsGoalController::class, 'store'])->name('savings-goals.store');
    Route::post('savings-goals/{savingsGoal}', [SavingsGoalController::class, 'update'])->name('savings-goals.update');
    Route::delete('savings-goals/{savingsGoal}', [SavingsGoalController::class, 'destroy'])->name('savings-goals.destroy');
    
    Route::get('loans', [LoanController::class, 'index'])->name('loans.index');
    Route::post('loans', [LoanController::class, 'store'])->name('loans.store');
    Route::delete('loans/{loan}', [LoanController::class, 'destroy'])->name('loans.destroy');
    Route::patch('loans/{loan}/payment', [LoanController::class, 'makePayment'])->name('loans.payment');

    Route::get('transactions', [TransactionController::class, 'allIndex'])->name('transactions.index');
    Route::delete('transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');
    Route::put('transactions/{transaction}', [TransactionController::class, 'update'])->name('transactions.update');
    
    Route::get('reports/export', [ReportsController::class, 'export'])->middleware('throttle:exports')->name('reports.export');
    Route::get('reports/statement', [ReportsController::class, 'statement'])->name('reports.statement');
    Route::get('reports', [ReportsController::class, 'index'])->name('reports.index');

    Route::get('banks', [BankAccountController::class, 'index'])->name('banks.index');
    Route::post('banks', [BankAccountController::class, 'store'])->name('banks.store');
    Route::put('banks/{bankAccount}', [BankAccountController::class, 'update'])->name('banks.update');
    Route::delete('banks/{bankAccount}', [BankAccountController::class, 'destroy'])->name('banks.destroy');
    Route::post('banks/transfer', [BankAccountController::class, 'transfer'])->name('banks.transfer');

    Route::middleware('throttle:ai')->group(function () {
        Route::post('ai/chat', [AiController::class, 'chat'])->name('ai.chat');
        Route::post('ai/insights', [AiController::class, 'insights'])->name('ai.insights');
        Route::post('ai/categorize', [AiController::class, 'categorize'])->name('ai.categorize');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
