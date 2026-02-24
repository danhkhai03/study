<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PetFeedLog extends Model
{
    protected $fillable = [
        'student_pet_id',
        'pet_food_id',
        'hunger_before',
        'hunger_after',
        'happiness_before',
        'happiness_after',
    ];

    public function studentPet(): BelongsTo
    {
        return $this->belongsTo(StudentPet::class);
    }

    public function petFood(): BelongsTo
    {
        return $this->belongsTo(PetFood::class);
    }
}
