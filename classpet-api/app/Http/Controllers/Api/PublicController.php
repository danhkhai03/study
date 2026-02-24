<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classroom;

class PublicController extends Controller
{
    public function show($slug)
    {
        $classroom = Classroom::where('public_slug', $slug)
            ->with(['students.pet.type', 'students.equippedFrame', 'students.equippedBackground'])
            ->firstOrFail();

        return response()->json($classroom);
    }
}
