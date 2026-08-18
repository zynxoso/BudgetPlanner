<?php

namespace App\Providers;

use App\Models\Allowance;
use App\Models\BankAccount;
use App\Models\Budget;
use App\Models\Loan;
use App\Models\LoanPayment;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Policies\OwnedByUserPolicy;
use App\Services\FinanceSummaryService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Allowance::class, OwnedByUserPolicy::class);
        Gate::policy(BankAccount::class, OwnedByUserPolicy::class);
        Gate::policy(Loan::class, OwnedByUserPolicy::class);
        Gate::policy(SavingsGoal::class, OwnedByUserPolicy::class);
        Gate::policy(Transaction::class, OwnedByUserPolicy::class);

        // Invalidate FinanceSummaryService user cache on write actions
        Transaction::saved(fn (Transaction $m) => FinanceSummaryService::clearUserCache($m->user_id));
        Transaction::deleted(fn (Transaction $m) => FinanceSummaryService::clearUserCache($m->user_id));

        Budget::saved(fn (Budget $m) => FinanceSummaryService::clearUserCache($m->user_id));
        Budget::deleted(fn (Budget $m) => FinanceSummaryService::clearUserCache($m->user_id));

        Loan::saved(fn (Loan $m) => FinanceSummaryService::clearUserCache($m->user_id));
        Loan::deleted(fn (Loan $m) => FinanceSummaryService::clearUserCache($m->user_id));

        LoanPayment::saved(fn (LoanPayment $m) => FinanceSummaryService::clearUserCache($m->loan?->user_id ?? (int) Loan::where('id', $m->loan_id)->value('user_id')));
        LoanPayment::deleted(fn (LoanPayment $m) => FinanceSummaryService::clearUserCache($m->loan?->user_id ?? (int) Loan::where('id', $m->loan_id)->value('user_id')));

        SavingsGoal::saved(fn (SavingsGoal $m) => FinanceSummaryService::clearUserCache($m->user_id));
        SavingsGoal::deleted(fn (SavingsGoal $m) => FinanceSummaryService::clearUserCache($m->user_id));

        Allowance::saved(fn (Allowance $m) => FinanceSummaryService::clearUserCache($m->user_id));
        Allowance::deleted(fn (Allowance $m) => FinanceSummaryService::clearUserCache($m->user_id));
        // 1. AI Rate Limiter: Max 15 prompts/min (burst) and 100 prompts/day (daily quota protection)
        RateLimiter::for('ai', function (Request $request) {
            $userKey = $request->user()?->id ?: $request->ip();

            return [
                Limit::perMinute(15)
                    ->by($userKey)
                    ->response(function () {
                        return response()->json([
                            'ok' => false,
                            'message' => 'You are sending AI prompts too quickly. Please wait a few seconds.',
                        ], 429);
                    }),
                Limit::perDay(100)
                    ->by($userKey)
                    ->response(function () {
                        return response()->json([
                            'ok' => false,
                            'message' => 'Daily AI request limit reached. Please try again tomorrow.',
                        ], 429);
                    }),
            ];
        });

        // 2. Heavy Export Limiter: Max 6 CSV exports/min (prevents DB streaming read spikes)
        RateLimiter::for('exports', function (Request $request) {
            return Limit::perMinute(6)->by($request->user()?->id ?: $request->ip());
        });

        // 3. Financial Mutations Limiter: Max 60 writes/min per user (prevents bot spam)
        RateLimiter::for('mutations', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }
}

