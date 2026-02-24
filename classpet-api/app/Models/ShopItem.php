<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ShopItem extends Model
{
    protected $fillable = [
        'name',
        'description',
        'type',
        'price',
        'asset_url',
        'preview_emoji',
        'rarity',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price' => 'integer',
        'rarity' => 'integer',
    ];

    // Rarity labels
    public const RARITY_COMMON = 1;
    public const RARITY_RARE = 2;
    public const RARITY_EPIC = 3;
    public const RARITY_LEGENDARY = 4;

    public static function rarityLabels(): array
    {
        return [
            self::RARITY_COMMON => 'Thường',
            self::RARITY_RARE => 'Hiếm',
            self::RARITY_EPIC => 'Sử thi',
            self::RARITY_LEGENDARY => 'Huyền thoại',
        ];
    }

    public function getRarityLabelAttribute(): string
    {
        return self::rarityLabels()[$this->rarity] ?? 'Unknown';
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'student_items')
            ->withPivot('is_equipped')
            ->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
