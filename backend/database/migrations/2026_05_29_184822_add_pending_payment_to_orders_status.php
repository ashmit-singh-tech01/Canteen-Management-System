<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Modify the ENUM column to include 'pending_payment'
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending_payment', 'pending', 'cooking', 'ready', 'completed') DEFAULT 'pending'");
    }

    public function down()
    {
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'cooking', 'ready', 'completed') DEFAULT 'pending'");
    }
};