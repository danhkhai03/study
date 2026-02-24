<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shop_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['pet', 'avatar_frame', 'background'])->default('pet');
            $table->integer('price')->default(100);
            $table->string('asset_url')->nullable();
            $table->string('preview_emoji')->nullable(); // For display purposes
            $table->integer('rarity')->default(1); // 1=common, 2=rare, 3=epic, 4=legendary
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Pivot table for student owned items
        Schema::create('student_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('shop_item_id')->constrained()->onDelete('cascade');
            $table->boolean('is_equipped')->default(false);
            $table->timestamps();
            
            $table->unique(['student_id', 'shop_item_id']);
        });

        // Add equipped items columns to students table
        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('equipped_frame_id')->nullable()->constrained('shop_items')->nullOnDelete();
            $table->foreignId('equipped_background_id')->nullable()->constrained('shop_items')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['equipped_frame_id']);
            $table->dropForeign(['equipped_background_id']);
            $table->dropColumn(['equipped_frame_id', 'equipped_background_id']);
        });
        
        Schema::dropIfExists('student_items');
        Schema::dropIfExists('shop_items');
    }
};
