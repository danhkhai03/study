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
        // Cập nhật bảng pet_types - thêm thông tin chi tiết hơn
        Schema::table('pet_types', function (Blueprint $table) {
            $table->enum('rarity', ['normal', 'rare', 'epic', 'legendary'])->default('normal')->after('name');
            $table->integer('price')->default(0)->after('rarity'); // 0 = free (5 pet mặc định)
            $table->string('sprite_sheet_url')->nullable()->after('base_asset_url'); // URL sprite sheet
            $table->json('sprite_config')->nullable()->after('sprite_sheet_url'); // Config cho các animation frames
            $table->boolean('is_default')->default(false)->after('sprite_config'); // 5 pet mặc định
            $table->boolean('is_active')->default(true)->after('is_default');
        });

        // Cập nhật bảng student_pets - thêm trạng thái pet
        Schema::table('student_pets', function (Blueprint $table) {
            $table->enum('mood', ['happy', 'normal', 'hungry', 'sad'])->default('normal')->after('is_hungry');
            $table->integer('hunger_level')->default(100)->after('mood'); // 0-100, giảm theo thời gian
            $table->integer('happiness_level')->default(100)->after('hunger_level'); // 0-100
            $table->timestamp('last_fed_at')->nullable()->after('happiness_level');
            $table->timestamp('last_played_at')->nullable()->after('last_fed_at');
        });

        // Bảng mới: Pet Foods (thức ăn cho pet)
        Schema::create('pet_foods', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Tên thức ăn
            $table->string('emoji')->default('🍖'); // Emoji hiển thị
            $table->string('image_url')->nullable(); // Hình ảnh
            $table->integer('hunger_restore')->default(20); // Phục hồi bao nhiêu hunger
            $table->integer('happiness_boost')->default(10); // Tăng bao nhiêu happiness
            $table->integer('price')->default(5); // Giá mua bằng xu
            $table->enum('rarity', ['common', 'rare', 'epic'])->default('common');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Bảng mới: Student Inventory (túi đồ của học sinh)
        Schema::create('student_inventory', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('pet_food_id')->constrained()->onDelete('cascade');
            $table->integer('quantity')->default(0);
            $table->timestamps();

            $table->unique(['student_id', 'pet_food_id']);
        });

        // Bảng mới: Pet Feed Logs (lịch sử cho ăn)
        Schema::create('pet_feed_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_pet_id')->constrained()->onDelete('cascade');
            $table->foreignId('pet_food_id')->constrained()->onDelete('cascade');
            $table->integer('hunger_before');
            $table->integer('hunger_after');
            $table->integer('happiness_before');
            $table->integer('happiness_after');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pet_feed_logs');
        Schema::dropIfExists('student_inventory');
        Schema::dropIfExists('pet_foods');

        Schema::table('student_pets', function (Blueprint $table) {
            $table->dropColumn(['mood', 'hunger_level', 'happiness_level', 'last_fed_at', 'last_played_at']);
        });

        Schema::table('pet_types', function (Blueprint $table) {
            $table->dropColumn(['rarity', 'price', 'sprite_sheet_url', 'sprite_config', 'is_default', 'is_active']);
        });
    }
};
