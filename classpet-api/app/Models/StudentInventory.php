<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentInventory extends Model
{
    protected $table = 'student_inventory';

    protected $fillable = [
        'student_id',
        'pet_food_id',
        'quantity',
    ];

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function petFood(): BelongsTo
    {
        return $this->belongsTo(PetFood::class);
    }

    // Thêm item vào inventory
    public static function addItem(int $studentId, int $petFoodId, int $quantity = 1): self
    {
        $inventory = self::firstOrCreate(
            ['student_id' => $studentId, 'pet_food_id' => $petFoodId],
            ['quantity' => 0]
        );

        $inventory->increment('quantity', $quantity);
        return $inventory->fresh();
    }

    // Dùng item từ inventory
    public static function useItem(int $studentId, int $petFoodId, int $quantity = 1): bool
    {
        $inventory = self::where('student_id', $studentId)
            ->where('pet_food_id', $petFoodId)
            ->first();

        if (!$inventory || $inventory->quantity < $quantity) {
            return false;
        }

        $inventory->decrement('quantity', $quantity);

        if ($inventory->quantity <= 0) {
            $inventory->delete();
        }

        return true;
    }
}
