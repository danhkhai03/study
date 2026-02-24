<?php

namespace Database\Seeders;

use App\Models\PetType;
use App\Models\PetFood;
use Illuminate\Database\Seeder;

class PetSystemSeeder extends Seeder
{
    /**
     * Seed 5 default pets và pet foods
     */
    public function run(): void
    {
        // 5 Pet mặc định (Normal - Free)
        $defaultPets = [
            [
                'name' => 'Chó Con',
                'base_asset_url' => '🐕',
                'rarity' => 'normal',
                'price' => 0,
                'is_default' => true,
                'max_level' => 10,
                'sprite_config' => json_encode([
                    'idle' => ['frames' => 4, 'speed' => 0.5],
                    'happy' => ['frames' => 6, 'speed' => 0.3],
                    'eating' => ['frames' => 4, 'speed' => 0.4],
                    'sleeping' => ['frames' => 2, 'speed' => 1],
                    'hungry' => ['frames' => 4, 'speed' => 0.6],
                ]),
            ],
            [
                'name' => 'Mèo Con',
                'base_asset_url' => '🐱',
                'rarity' => 'normal',
                'price' => 0,
                'is_default' => true,
                'max_level' => 10,
                'sprite_config' => json_encode([
                    'idle' => ['frames' => 4, 'speed' => 0.5],
                    'happy' => ['frames' => 6, 'speed' => 0.3],
                    'eating' => ['frames' => 4, 'speed' => 0.4],
                    'sleeping' => ['frames' => 2, 'speed' => 1],
                    'hungry' => ['frames' => 4, 'speed' => 0.6],
                ]),
            ],
            [
                'name' => 'Thỏ Con',
                'base_asset_url' => '🐰',
                'rarity' => 'normal',
                'price' => 0,
                'is_default' => true,
                'max_level' => 10,
                'sprite_config' => json_encode([
                    'idle' => ['frames' => 4, 'speed' => 0.5],
                    'happy' => ['frames' => 6, 'speed' => 0.3],
                    'eating' => ['frames' => 4, 'speed' => 0.4],
                    'sleeping' => ['frames' => 2, 'speed' => 1],
                    'hungry' => ['frames' => 4, 'speed' => 0.6],
                ]),
            ],
            [
                'name' => 'Gấu Bông',
                'base_asset_url' => '🐻',
                'rarity' => 'normal',
                'price' => 0,
                'is_default' => true,
                'max_level' => 10,
                'sprite_config' => json_encode([
                    'idle' => ['frames' => 4, 'speed' => 0.5],
                    'happy' => ['frames' => 6, 'speed' => 0.3],
                    'eating' => ['frames' => 4, 'speed' => 0.4],
                    'sleeping' => ['frames' => 2, 'speed' => 1],
                    'hungry' => ['frames' => 4, 'speed' => 0.6],
                ]),
            ],
            [
                'name' => 'Cáo Con',
                'base_asset_url' => '🦊',
                'rarity' => 'normal',
                'price' => 0,
                'is_default' => true,
                'max_level' => 10,
                'sprite_config' => json_encode([
                    'idle' => ['frames' => 4, 'speed' => 0.5],
                    'happy' => ['frames' => 6, 'speed' => 0.3],
                    'eating' => ['frames' => 4, 'speed' => 0.4],
                    'sleeping' => ['frames' => 2, 'speed' => 1],
                    'hungry' => ['frames' => 4, 'speed' => 0.6],
                ]),
            ],
        ];

        // Pet có thể mua (Rare, Epic, Legendary)
        $shopPets = [
            // Rare Pets (50 xu)
            [
                'name' => 'Kỳ Lân',
                'base_asset_url' => '🦄',
                'rarity' => 'rare',
                'price' => 50,
                'is_default' => false,
                'max_level' => 15,
            ],
            [
                'name' => 'Gấu Trúc',
                'base_asset_url' => '🐼',
                'rarity' => 'rare',
                'price' => 50,
                'is_default' => false,
                'max_level' => 15,
            ],
            [
                'name' => 'Sói Con',
                'base_asset_url' => '🐺',
                'rarity' => 'rare',
                'price' => 50,
                'is_default' => false,
                'max_level' => 15,
            ],
            // Epic Pets (100 xu)
            [
                'name' => 'Rồng Con',
                'base_asset_url' => '🐉',
                'rarity' => 'epic',
                'price' => 100,
                'is_default' => false,
                'max_level' => 20,
            ],
            [
                'name' => 'Phượng Hoàng',
                'base_asset_url' => '🔥',
                'rarity' => 'epic',
                'price' => 100,
                'is_default' => false,
                'max_level' => 20,
            ],
            // Legendary Pets (200 xu)
            [
                'name' => 'Sư Tử Vàng',
                'base_asset_url' => '🦁',
                'rarity' => 'legendary',
                'price' => 200,
                'is_default' => false,
                'max_level' => 25,
            ],
            [
                'name' => 'Hổ Trắng',
                'base_asset_url' => '🐯',
                'rarity' => 'legendary',
                'price' => 200,
                'is_default' => false,
                'max_level' => 25,
            ],
        ];

        foreach (array_merge($defaultPets, $shopPets) as $pet) {
            PetType::updateOrCreate(
                ['name' => $pet['name']],
                $pet
            );
        }

        // Thức ăn cho Pet
        $foods = [
            // Common Foods
            [
                'name' => 'Bánh Quy',
                'emoji' => '🍪',
                'hunger_restore' => 15,
                'happiness_boost' => 5,
                'price' => 3,
                'rarity' => 'common',
            ],
            [
                'name' => 'Cà Rốt',
                'emoji' => '🥕',
                'hunger_restore' => 20,
                'happiness_boost' => 5,
                'price' => 5,
                'rarity' => 'common',
            ],
            [
                'name' => 'Táo',
                'emoji' => '🍎',
                'hunger_restore' => 20,
                'happiness_boost' => 10,
                'price' => 5,
                'rarity' => 'common',
            ],
            [
                'name' => 'Xương',
                'emoji' => '🦴',
                'hunger_restore' => 25,
                'happiness_boost' => 15,
                'price' => 8,
                'rarity' => 'common',
            ],
            // Rare Foods
            [
                'name' => 'Thịt Nướng',
                'emoji' => '🍖',
                'hunger_restore' => 40,
                'happiness_boost' => 20,
                'price' => 15,
                'rarity' => 'rare',
            ],
            [
                'name' => 'Pizza',
                'emoji' => '🍕',
                'hunger_restore' => 35,
                'happiness_boost' => 25,
                'price' => 15,
                'rarity' => 'rare',
            ],
            [
                'name' => 'Kem',
                'emoji' => '🍦',
                'hunger_restore' => 20,
                'happiness_boost' => 35,
                'price' => 12,
                'rarity' => 'rare',
            ],
            // Epic Foods
            [
                'name' => 'Bánh Sinh Nhật',
                'emoji' => '🎂',
                'hunger_restore' => 50,
                'happiness_boost' => 50,
                'price' => 30,
                'rarity' => 'epic',
            ],
            [
                'name' => 'Kẹo Cầu Vồng',
                'emoji' => '🌈',
                'hunger_restore' => 30,
                'happiness_boost' => 60,
                'price' => 25,
                'rarity' => 'epic',
            ],
        ];

        foreach ($foods as $food) {
            PetFood::updateOrCreate(
                ['name' => $food['name']],
                $food
            );
        }
    }
}
