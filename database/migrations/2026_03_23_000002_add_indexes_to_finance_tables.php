<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->index(['user_id', 'type', 'date'], 'transactions_user_type_date_idx');
            $table->index(['user_id', 'date'], 'transactions_user_date_idx');
        });

        Schema::table('loans', function (Blueprint $table) {
            $table->index(['user_id', 'status'], 'loans_user_status_idx');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('transactions_user_type_date_idx');
            $table->dropIndex('transactions_user_date_idx');
        });

        Schema::table('loans', function (Blueprint $table) {
            $table->dropIndex('loans_user_status_idx');
        });
    }
};
