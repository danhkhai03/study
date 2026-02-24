<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentPet extends Model
{
    protected $fillable = [
        'student_id',
        'pet_type_id',
        'nickname',
        'level',
        'current_exp',
        'is_hungry',
        'mood',
        'hunger_level',
        'happiness_level',
        'last_fed_at',
        'last_played_at',
    ];

    protected $casts = [
        'is_hungry' => 'boolean',
        'last_fed_at' => 'datetime',
        'last_played_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(PetType::class, 'pet_type_id');
    }

    public function feedLogs(): HasMany
    {
        return $this->hasMany(PetFeedLog::class);
    }

    // Tính toán mood dựa trên hunger và happiness
    public function calculateMood(): string
    {
        if ($this->hunger_level <= 20) {
            return 'hungry';
        }
        if ($this->happiness_level <= 30) {
            return 'sad';
        }
        if ($this->happiness_level >= 80 && $this->hunger_level >= 60) {
            return 'happy';
        }
        return 'normal';
    }

    // Cho pet ăn
    public function feed(PetFood $food): array
    {
        $hungerBefore = $this->hunger_level;
        $happinessBefore = $this->happiness_level;

        // Tăng hunger và happiness
        $this->hunger_level = min(100, $this->hunger_level + $food->hunger_restore);
        $this->happiness_level = min(100, $this->happiness_level + $food->happiness_boost);
        $this->is_hungry = $this->hunger_level < 30;
        $this->mood = $this->calculateMood();
        $this->last_fed_at = now();
        $this->save();

        // Ghi log
        PetFeedLog::create([
            'student_pet_id' => $this->id,
            'pet_food_id' => $food->id,
            'hunger_before' => $hungerBefore,
            'hunger_after' => $this->hunger_level,
            'happiness_before' => $happinessBefore,
            'happiness_after' => $this->happiness_level,
        ]);

        return [
            'hunger_level' => $this->hunger_level,
            'happiness_level' => $this->happiness_level,
            'mood' => $this->mood,
        ];
    }

    // Giảm hunger theo thời gian (gọi từ scheduler/cron)
    public function decreaseHunger(int $amount = 5): void
    {
        $this->hunger_level = max(0, $this->hunger_level - $amount);
        $this->is_hungry = $this->hunger_level < 30;
        $this->mood = $this->calculateMood();
        $this->save();
    }
}
