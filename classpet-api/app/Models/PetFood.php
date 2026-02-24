<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PetFood extends Model
{
    protected $table = 'pet_foods';
    
    protected $fillable = [
        'name',
        'emoji',
        'image_url',
        'hunger_restore',
        'happiness_boost',
        'price',
        'rarity',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Scope: Chỉ lấy active
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope: Theo rarity
    public function scopeByRarity($query, string $rarity)
    {
        return $query->where('rarity', $rarity);
    }

    // Inventory items
    public function inventoryItems(): HasMany
    {
        return $this->hasMany(StudentInventory::class);
    }
}
