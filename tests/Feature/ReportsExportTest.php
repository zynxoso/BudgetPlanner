<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportsExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_export_streams_large_transaction_dataset_without_memory_exhaustion(): void
    {
        $user = User::factory()->create();
        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Bulk Expenses',
            'type' => 'expense',
            'color' => 'red',
        ]);

        $now = Carbon::now();
        $records = [];
        for ($i = 1; $i <= 2000; $i++) {
            $records[] = [
                'user_id' => $user->id,
                'category_id' => $category->id,
                'amount' => 10.50,
                'type' => 'expense',
                'source' => null,
                'date' => $now->toDateString(),
                'notes' => "Item #{$i}",
                'is_spent' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Chunk insert 2000 rows
        foreach (array_chunk($records, 500) as $chunk) {
            Transaction::insert($chunk);
        }

        $this->assertEquals(2000, Transaction::where('user_id', $user->id)->count());

        $memoryBefore = memory_get_usage();

        $response = $this->actingAs($user)->get('/reports/export');
        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

        // Capture streamed output
        ob_start();
        $response->sendContent();
        $content = ob_get_clean();

        $memoryAfter = memory_get_usage();
        $memoryDeltaMB = ($memoryAfter - $memoryBefore) / (1024 * 1024);

        // Assert memory growth was strictly contained
        $this->assertLessThan(64, $memoryDeltaMB);

        // Verify CSV structure contains expected sections and row counts
        $this->assertStringContainsString('BUDGET PLANNER - COMPLETE FINANCIAL STATEMENT & ANALYTICS REPORT', $content);
        $this->assertStringContainsString('=== 6. CURRENT MONTH TRANSACTION DETAILS ===', $content);
        $this->assertStringContainsString('Item #1', $content);
        $this->assertStringContainsString('Item #2000', $content);
    }
}
