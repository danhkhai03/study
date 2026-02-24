<?php

namespace App\Policies;

use App\Models\Classroom;
use App\Models\User;

class ClassroomPolicy
{
    public function view(User $user, Classroom $classroom): bool
    {
        return $classroom->teacher_id === $user->id;
    }

    public function update(User $user, Classroom $classroom): bool
    {
        return $classroom->teacher_id === $user->id;
    }

    public function delete(User $user, Classroom $classroom): bool
    {
        return $classroom->teacher_id === $user->id;
    }
}
