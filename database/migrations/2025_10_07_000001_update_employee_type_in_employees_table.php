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
        Schema::table('employees', function (Blueprint $table) {
            // Add employee_type enum
            $table->enum('employee_type', ['Regular', 'Contractor', 'Temporary'])
                  ->default('Regular')
                  ->after('email');

            // Remove old position column if it exists
            if (Schema::hasColumn('employees', 'position')) {
                $table->dropColumn('position');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Revert: add position back and remove employee_type
            $table->string('position')->nullable()->after('email');
            $table->dropColumn('employee_type');
        });
    }
};