<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\PointTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PointController extends Controller
{
    /**
     * Get recent point transactions
     */
    public function index()
    {
        $user = auth()->user();
        
        $transactions = PointTransaction::whereHas('student.classroom', function ($q) use ($user) {
            $q->where('teacher_id', $user->id);
        })
        ->with('student')
        ->orderBy('created_at', 'desc')
        ->limit(50)
        ->get();

        return response()->json($transactions);
    }

    public function award(Request $request, Student $student)
    {
        $this->authorize('update', $student->classroom);

        $validated = $request->validate([
            'amount' => 'required|integer',  // Can be negative
            'reason' => 'nullable|string',
        ]);

        DB::transaction(function () use ($student, $validated) {
            // Update student balance
            $student->points_balance += $validated['amount'];
            if ($validated['amount'] > 0) {
                $student->total_points_earned += $validated['amount'];
            }
            $student->save();

            // Log transaction
            $student->transactions()->create([
                'amount' => $validated['amount'],
                'reason' => $validated['reason'],
            ]);
        });

        return response()->json($student);
    }
}
