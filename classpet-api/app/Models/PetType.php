<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PetType extends Model
{
    protected $fillable = [
        'name',
        'base_asset_url',
        'max_level',
        'rarity',
        'price',
        'sprite_sheet_url',
        'sprite_config',
        'is_default',
        'is_active',
        // Ảnh cho từng trạng thái
        'image_idle',
        'image_happy',
        'image_eating',
        'image_hungry',
        'image_sleeping',
    ];

    protected $casts = [
        'sprite_config' => 'array',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Scope: Chỉ lấy active
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope: 5 Pet mặc định
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    // Scope: Pet có thể mua (tất cả pet active trừ pet miễn phí đầu tiên)
    public function scopePurchasable($query)
    {
        return $query->where('price', '>', 0);
    }

    // Scope: Theo rarity
    public function scopeByRarity($query, string $rarity)
    {
        return $query->where('rarity', $rarity);
    }

    public function pets(): HasMany
    {
        return $this->hasMany(StudentPet::class);
    }
}
