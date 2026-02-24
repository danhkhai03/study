<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\Student;
use App\Models\PetType;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    /**
     * Get all students (for admin management)
     */
    public function all()
    {
        $user = auth()->user();
        
        return Student::whereHas('classroom', function ($q) use ($user) {
            $q->where('teacher_id', $user->id);
        })->with(['pet.type', 'classroom'])->get();
    }

    public function store(Request $request, Classroom $classroom)
    {
        $this->authorize('update', $classroom);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'pet_type_id' => 'nullable|exists:pet_types,id',
        ]);

        $student = $classroom->students()->create([
            'name' => $validated['name'],
            'points_balance' => 0,
            'total_points_earned' => 0,
        ]);

        // Nếu có chọn pet_type_id, kiểm tra phải là normal rarity
        if (!empty($validated['pet_type_id'])) {
            $petType = PetType::where('id', $validated['pet_type_id'])
                ->where('rarity', 'normal')
                ->first();
            
            if (!$petType) {
                // Nếu pet không phải normal, lấy pet normal ngẫu nhiên
                $petType = PetType::where('rarity', 'normal')->inRandomOrder()->first();
            }
        } else {
            // Lấy pet normal ngẫu nhiên
            $petType = PetType::where('rarity', 'normal')->inRandomOrder()->first() 
                       ?? PetType::inRandomOrder()->first();
        }
        
        if ($petType) {
            $student->pet()->create([
                'pet_type_id' => $petType->id,
                'nickname' => null,
                'level' => 1,
                'current_exp' => 0,
            ]);
        }

        return response()->json($student->load('pet.type'), 201);
    }

    /**
     * Create student from management page (with classroom_id)
     */
    public function createStudent(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'classroom_id' => 'required|exists:classrooms,id',
            'pet_type_id' => 'nullable|exists:pet_types,id',
        ]);

        $classroom = Classroom::findOrFail($validated['classroom_id']);
        $this->authorize('update', $classroom);

        $student = $classroom->students()->create([
            'name' => $validated['name'],
            'points_balance' => 0,
            'total_points_earned' => 0,
        ]);

        // Nếu có chọn pet_type_id, kiểm tra phải là normal rarity
        if (!empty($validated['pet_type_id'])) {
            $petType = PetType::where('id', $validated['pet_type_id'])
                ->where('rarity', 'normal')
                ->first();
            
            if (!$petType) {
                // Nếu pet không phải normal, lấy pet normal ngẫu nhiên
                $petType = PetType::where('rarity', 'normal')->inRandomOrder()->first();
            }
        } else {
            // Lấy pet normal ngẫu nhiên
            $petType = PetType::where('rarity', 'normal')->inRandomOrder()->first() 
                       ?? PetType::inRandomOrder()->first();
        }
        
        if ($petType) {
            $student->pet()->create([
                'pet_type_id' => $petType->id,
                'nickname' => null,
                'level' => 1,
                'current_exp' => 0,
            ]);
        }

        return response()->json($student->load(['pet.type', 'classroom']), 201);
    }

    /**
     * Update a student
     */
    public function update(Request $request, Student $student)
    {
        $this->authorize('update', $student->classroom);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'classroom_id' => 'sometimes|exists:classrooms,id',
        ]);

        // If changing classroom, verify ownership
        if (isset($validated['classroom_id'])) {
            $newClassroom = Classroom::findOrFail($validated['classroom_id']);
            $this->authorize('update', $newClassroom);
        }

        $student->update($validated);

        return response()->json($student->load(['pet.type', 'classroom']));
    }

    /**
     * Delete a student
     */
    public function destroy(Student $student)
    {
        $this->authorize('update', $student->classroom);

        $student->delete();

        return response()->json(['message' => 'Xóa học sinh thành công!']);
    }

    public function assignPet(Request $request, Student $student)
    {
        $this->authorize('update', $student->classroom);

        $validated = $request->validate([
            'pet_type_id' => 'required|exists:pet_types,id',
            'nickname' => 'nullable|string',
        ]);

        $pet = $student->pet;
        if ($pet) {
            $pet->update([
                'pet_type_id' => $validated['pet_type_id'],
                'nickname' => $validated['nickname'],
                'level' => 1,
                'current_exp' => 0,
                'is_hungry' => false,
            ]);
        } else {
            $pet = $student->pet()->create([
                'pet_type_id' => $validated['pet_type_id'],
                'nickname' => $validated['nickname'],
                'level' => 1,
                'current_exp' => 0,
            ]);
        }

        return response()->json($pet->load('type'), 201);
    }

    public function index(Classroom $classroom)
    {
        $this->authorize('view', $classroom);

        return $classroom->students()->with(['pet.type', 'equippedFrame', 'equippedBackground'])->get();
    }
}
