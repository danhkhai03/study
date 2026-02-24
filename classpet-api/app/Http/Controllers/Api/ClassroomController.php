<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ClassroomController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->classrooms()
            ->withCount('students')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'theme' => 'nullable|string',
        ]);

        $classroom = $request->user()->classrooms()->create([
            'name' => $validated['name'],
            'theme' => $validated['theme'] ?? null,
            'public_slug' => Str::uuid(),
        ]);

        return response()->json($classroom, 201);
    }

    public function show(Classroom $classroom)
    {
        $this->authorize('view', $classroom);
        return $classroom->load('students.pet.type');
    }

    public function update(Request $request, Classroom $classroom)
    {
        $this->authorize('update', $classroom);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'theme' => 'nullable|string',
        ]);

        $classroom->update($validated);

        return response()->json($classroom);
    }

    public function destroy(Classroom $classroom)
    {
        $this->authorize('delete', $classroom);
        $classroom->delete();
        return response()->json(null, 204);
    }
}
