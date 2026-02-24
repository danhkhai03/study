<?php

namespace Database\Seeders;

use App\Models\ShopItem;
use Illuminate\Database\Seeder;

class ShopItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            // ===== PETS =====
            [
                'name' => 'Hamster',
                'description' => 'Một chú chuột hamster siêu đáng yêu!',
                'type' => 'pet',
                'price' => 50,
                'preview_emoji' => '🐹',
                'rarity' => 1,
            ],
            [
                'name' => 'Rabbit',
                'description' => 'Thỏ trắng dễ thương với đôi tai dài.',
                'type' => 'pet',
                'price' => 80,
                'preview_emoji' => '🐰',
                'rarity' => 1,
            ],
            [
                'name' => 'Cat',
                'description' => 'Mèo con ngoan ngoãn, biết kêu meo meo.',
                'type' => 'pet',
                'price' => 100,
                'preview_emoji' => '🐱',
                'rarity' => 2,
            ],
            [
                'name' => 'Dog',
                'description' => 'Cún con trung thành, luôn vẫy đuôi chào bạn.',
                'type' => 'pet',
                'price' => 100,
                'preview_emoji' => '🐕',
                'rarity' => 2,
            ],
            [
                'name' => 'Fox',
                'description' => 'Cáo nhỏ thông minh với bộ lông cam rực rỡ.',
                'type' => 'pet',
                'price' => 150,
                'preview_emoji' => '🦊',
                'rarity' => 2,
            ],
            [
                'name' => 'Panda',
                'description' => 'Gấu trúc béo ú, thích ăn tre.',
                'type' => 'pet',
                'price' => 200,
                'preview_emoji' => '🐼',
                'rarity' => 3,
            ],
            [
                'name' => 'Tiger',
                'description' => 'Hổ con dũng mãnh nhưng rất hiền.',
                'type' => 'pet',
                'price' => 250,
                'preview_emoji' => '🐯',
                'rarity' => 3,
            ],
            [
                'name' => 'Unicorn',
                'description' => 'Kỳ lân huyền bí với sừng phát sáng!',
                'type' => 'pet',
                'price' => 500,
                'preview_emoji' => '🦄',
                'rarity' => 4,
            ],
            [
                'name' => 'Dragon',
                'description' => 'Rồng con biết phun lửa, cực kỳ hiếm!',
                'type' => 'pet',
                'price' => 800,
                'preview_emoji' => '🐉',
                'rarity' => 4,
            ],

            // ===== AVATAR FRAMES =====
            [
                'name' => 'Khung Sao Vàng',
                'description' => 'Khung avatar với những ngôi sao lấp lánh.',
                'type' => 'avatar_frame',
                'price' => 30,
                'preview_emoji' => '⭐',
                'rarity' => 1,
            ],
            [
                'name' => 'Khung Trái Tim',
                'description' => 'Khung avatar hình trái tim đáng yêu.',
                'type' => 'avatar_frame',
                'price' => 40,
                'preview_emoji' => '💖',
                'rarity' => 1,
            ],
            [
                'name' => 'Khung Cầu Vồng',
                'description' => 'Khung avatar 7 sắc cầu vồng rực rỡ.',
                'type' => 'avatar_frame',
                'price' => 80,
                'preview_emoji' => '🌈',
                'rarity' => 2,
            ],
            [
                'name' => 'Khung Vương Miện',
                'description' => 'Khung avatar với vương miện hoàng gia.',
                'type' => 'avatar_frame',
                'price' => 150,
                'preview_emoji' => '👑',
                'rarity' => 3,
            ],
            [
                'name' => 'Khung Kim Cương',
                'description' => 'Khung avatar kim cương lấp lánh sang trọng.',
                'type' => 'avatar_frame',
                'price' => 300,
                'preview_emoji' => '💎',
                'rarity' => 4,
            ],
            [
                'name' => 'Khung Lửa',
                'description' => 'Khung avatar với ngọn lửa bùng cháy.',
                'type' => 'avatar_frame',
                'price' => 200,
                'preview_emoji' => '🔥',
                'rarity' => 3,
            ],

            // ===== BACKGROUNDS =====
            [
                'name' => 'Nền Bãi Cỏ',
                'description' => 'Bãi cỏ xanh mướt dưới ánh nắng.',
                'type' => 'background',
                'price' => 50,
                'preview_emoji' => '🌿',
                'rarity' => 1,
            ],
            [
                'name' => 'Nền Biển Xanh',
                'description' => 'Bãi biển với sóng vỗ rì rào.',
                'type' => 'background',
                'price' => 70,
                'preview_emoji' => '🏖️',
                'rarity' => 1,
            ],
            [
                'name' => 'Nền Rừng Hoa',
                'description' => 'Khu rừng đầy hoa đủ màu sắc.',
                'type' => 'background',
                'price' => 100,
                'preview_emoji' => '🌸',
                'rarity' => 2,
            ],
            [
                'name' => 'Nền Vũ Trụ',
                'description' => 'Không gian vũ trụ với các hành tinh.',
                'type' => 'background',
                'price' => 180,
                'preview_emoji' => '🌌',
                'rarity' => 3,
            ],
            [
                'name' => 'Nền Lâu Đài',
                'description' => 'Lâu đài cổ tích với những tòa tháp cao.',
                'type' => 'background',
                'price' => 200,
                'preview_emoji' => '🏰',
                'rarity' => 3,
            ],
            [
                'name' => 'Nền Cầu Vồng',
                'description' => 'Cầu vồng rực rỡ trên bầu trời xanh.',
                'type' => 'background',
                'price' => 250,
                'preview_emoji' => '🌈',
                'rarity' => 3,
            ],
            [
                'name' => 'Nền Kẹo Ngọt',
                'description' => 'Vùng đất kẹo ngọt với bánh và kem.',
                'type' => 'background',
                'price' => 300,
                'preview_emoji' => '🍭',
                'rarity' => 4,
            ],
        ];

        foreach ($items as $item) {
            ShopItem::create($item);
        }
    }
}
