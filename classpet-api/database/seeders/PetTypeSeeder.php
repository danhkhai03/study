<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PetTypeSeeder extends Seeder
{
    public function run(): void
    {
        $pets = [
            ['name' => 'Fire Dragon', 'base_asset_url' => 'assets/pets/dragon', 'max_level' => 10],
            ['name' => 'Water Cat', 'base_asset_url' => 'assets/pets/cat', 'max_level' => 10],
            ['name' => 'Earth Bear', 'base_asset_url' => 'assets/pets/bear', 'max_level' => 10],
            ['name' => 'Wind Bird', 'base_asset_url' => 'assets/pets/bird', 'max_level' => 10],
            ['name' => 'Electric Robot', 'base_asset_url' => 'assets/pets/robot', 'max_level' => 10],
        ];

        DB::table('pet_types')->insert($pets);
    }
}
