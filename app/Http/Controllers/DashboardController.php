<?php

namespace App\Http\Controllers;

use App\Services\FinanceSummaryService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly FinanceSummaryService $financeSummary)
    {
    }

    public function index(): Response
    {
        $dashboardData = $this->financeSummary->getDashboardData((int) Auth::id());

        return Inertia::render('dashboard', $dashboardData);
    }
}

