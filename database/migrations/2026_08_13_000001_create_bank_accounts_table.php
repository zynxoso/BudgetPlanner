<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('bank_name');
            $table->string('account_name');
            $table->string('account_number_last4')->nullable();
            $table->enum('account_type', ['checking', 'savings', 'credit_card', 'investment', 'e_wallet'])->default('checking');
            $table->string('currency', 10)->default('PHP');
            $table->decimal('balance', 12, 2)->default(0)->check('balance >= 0');
            $table->decimal('credit_limit', 12, 2)->nullable();
            $table->string('color')->default('emerald');
            $table->string('card_type')->nullable(); // debit, credit, virtual, none
            $table->string('card_network')->nullable(); // visa, mastercard, jcb, amex
            $table->string('status')->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'account_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_accounts');
    }
};
