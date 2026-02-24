<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PetController extends Controller
{
    public function feed(Request $request, Student $student)
    {
        $this->authorize('update', $student->classroom);

        $validated = $request->validate([
            'food_amount' => 'required|integer|min:1|max:10',
        ]);

        $costPerFood = 10;
        $expPerFood = 50;
        $totalCost = $validated['food_amount'] * $costPerFood;

        if ($student->points_balance < $totalCost) {
            return response()->json([
                'message' => 'Not enough coins! Need ' . $totalCost . ' coins.',
                'required' => $totalCost,
                'current' => $student->points_balance
            ], 400);
        }

        $pet = $student->pet;
        if (!$pet) {
            return response()->json([
                'message' => 'This student has no pet yet!'
            ], 400);
        }

        $result = DB::transaction(function () use ($student, $pet, $totalCost, $expPerFood, $validated) {
            // Deduct Points
            $student->decrement('points_balance', $totalCost);

            // Log Transaction
            $student->transactions()->create([
                'amount' => -$totalCost,
                'reason' => 'Fed pet ' . $validated['food_amount'] . ' items',
            ]);

            // Add EXP
            $totalExp = $validated['food_amount'] * $expPerFood;
            $pet->current_exp += $totalExp;
            $previousLevel = $pet->level;

            // Check Level Up
            // Level N requires (N * 100) EXP. 
            // Simple logic: EXP threshold for next level = current_level * 100
            // Loop in case of multiple level ups
            $leveledUp = false;
            while ($pet->current_exp >= ($pet->level * 100) && $pet->level < 10) { // Max level 10
                $pet->current_exp -= ($pet->level * 100);
                $pet->increment('level');
                $leveledUp = true;
            }

            $pet->save();
            $student->refresh();

            return [
                'student' => $student->load('pet.type'),
                'leveledUp' => $leveledUp,
                'newLevel' => $pet->level,
                'previousLevel' => $previousLevel,
                'expGained' => $totalExp,
            ];
        });

        return response()->json($result);
    }
}
