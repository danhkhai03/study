<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    protected $fillable = [
        'classroom_id', 
        'name', 
        'points_balance', 
        'total_points_earned',
        'equipped_frame_id',
        'equipped_background_id',
    ];

    protected $casts = [
        'points_balance' => 'integer',
        'total_points_earned' => 'integer',
    ];

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function pet(): HasOne
    {
        return $this->hasOne(StudentPet::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(PointTransaction::class);
    }

    public function ownedItems(): HasMany
    {
        return $this->hasMany(StudentItem::class);
    }

    public function equippedFrame(): BelongsTo
    {
        return $this->belongsTo(ShopItem::class, 'equipped_frame_id');
    }

    public function equippedBackground(): BelongsTo
    {
        return $this->belongsTo(ShopItem::class, 'equipped_background_id');
    }

    /**
     * Check if student owns an item
     */
    public function ownsItem(int $shopItemId): bool
    {
        return $this->ownedItems()->where('shop_item_id', $shopItemId)->exists();
    }
}
