<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PointTransaction extends Model
{
    protected $fillable = ['student_id', 'amount', 'reason'];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
