<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Thêm các trường ảnh cho từng trạng thái pet (đơn giản hóa - không dùng sprite)
     */
    public function up(): void
    {
        Schema::table('pet_types', function (Blueprint $table) {
            // Ảnh cho từng trạng thái (thay thế sprite_sheet_url và sprite_config)
            $table->string('image_idle')->nullable()->after('base_asset_url'); // Ảnh bình thường
            $table->string('image_happy')->nullable()->after('image_idle'); // Ảnh vui vẻ (khi cho ăn, chơi)
            $table->string('image_eating')->nullable()->after('image_happy'); // Ảnh đang ăn
            $table->string('image_hungry')->nullable()->after('image_eating'); // Ảnh đói
            $table->string('image_sleeping')->nullable()->after('image_hungry'); // Ảnh ngủ
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pet_types', function (Blueprint $table) {
            $table->dropColumn([
                'image_idle',
                'image_happy', 
                'image_eating',
                'image_hungry',
                'image_sleeping',
            ]);
        });
    }
};
