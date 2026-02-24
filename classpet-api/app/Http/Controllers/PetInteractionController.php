<?php

namespace App\Http\Controllers;

use App\Models\PetFood;
use App\Models\Student;
use App\Models\StudentInventory;
use App\Models\StudentPet;
use Illuminate\Http\Request;

class PetInteractionController extends Controller
{
    /**
     * Lấy danh sách thức ăn (shop)
     */
    public function getFoods()
    {
        $foods = PetFood::active()->orderBy('price')->get();
        return response()->json($foods);
    }

    /**
     * Lấy inventory của học sinh
     */
    public function getInventory(Student $student)
    {
        $this->authorize('view', $student->classroom);

        $inventory = StudentInventory::with('petFood')
            ->where('student_id', $student->id)
            ->where('quantity', '>', 0)
            ->get();

        return response()->json($inventory);
    }

    /**
     * Lấy inventory cho TV view (public, không cần auth)
     */
    public function getPublicInventory(Student $student)
    {
        $inventory = StudentInventory::with('petFood')
            ->where('student_id', $student->id)
            ->where('quantity', '>', 0)
            ->get();

        return response()->json($inventory);
    }

    /**
     * Mua thức ăn cho học sinh
     */
    public function buyFood(Request $request, Student $student)
    {
        $this->authorize('update', $student->classroom);

        $request->validate([
            'pet_food_id' => 'required|exists:pet_foods,id',
            'quantity' => 'required|integer|min:1|max:10',
        ]);

        $food = PetFood::findOrFail($request->pet_food_id);
        $totalCost = $food->price * $request->quantity;

        // Kiểm tra đủ xu không
        if ($student->points_balance < $totalCost) {
            return response()->json([
                'message' => 'Không đủ xu để mua!',
                'required' => $totalCost,
                'balance' => $student->points_balance,
            ], 400);
        }

        // Trừ xu
        $student->decrement('points_balance', $totalCost);

        // Thêm vào inventory
        $inventory = StudentInventory::addItem($student->id, $food->id, $request->quantity);

        return response()->json([
            'message' => "Đã mua {$request->quantity} {$food->name}!",
            'inventory' => $inventory->load('petFood'),
            'new_balance' => $student->fresh()->points_balance,
        ]);
    }

    /**
     * Cho pet ăn
     */
    public function feedPet(Request $request, Student $student)
    {
        $request->validate([
            'pet_food_id' => 'required|exists:pet_foods,id',
        ]);

        // Kiểm tra có pet không
        $pet = $student->pet;
        if (!$pet) {
            return response()->json(['message' => 'Học sinh chưa có pet!'], 400);
        }

        // Kiểm tra inventory
        $inventory = StudentInventory::where('student_id', $student->id)
            ->where('pet_food_id', $request->pet_food_id)
            ->first();

        if (!$inventory || $inventory->quantity < 1) {
            return response()->json(['message' => 'Không có thức ăn này trong túi!'], 400);
        }

        // Dùng item
        $food = PetFood::find($request->pet_food_id);
        StudentInventory::useItem($student->id, $food->id);

        // Cho pet ăn
        $result = $pet->feed($food);

        return response()->json([
            'message' => "Đã cho {$pet->nickname} ăn {$food->name}! 🍖",
            'pet' => $pet->fresh()->load('type'),
            'stats' => $result,
        ]);
    }

    /**
     * Lấy thông tin pet chi tiết (cho TV view)
     */
    public function getPetDetails(Student $student)
    {
        $pet = $student->pet;
        
        if (!$pet) {
            return response()->json(['message' => 'Học sinh chưa có pet'], 404);
        }

        $pet->load('type');

        // Tính toán trạng thái hiện tại
        $pet->mood = $pet->calculateMood();
        $pet->save();

        return response()->json([
            'pet' => $pet,
            'inventory' => StudentInventory::with('petFood')
                ->where('student_id', $student->id)
                ->where('quantity', '>', 0)
                ->get(),
        ]);
    }

    /**
     * Lấy pet rarity normal cho chọn khi tạo học sinh (miễn phí)
     */
    public function getDefaultPets()
    {
        $pets = \App\Models\PetType::active()
            ->where('rarity', 'normal')
            ->get();
        return response()->json($pets);
    }

    /**
     * Lấy tất cả pet có thể mua trong shop (bao gồm cả normal)
     */
    public function getShopPets()
    {
        $pets = \App\Models\PetType::active()
            ->where('price', '>', 0)
            ->orderBy('rarity')
            ->orderBy('price')
            ->get();
        return response()->json($pets);
    }

    /**
     * Mua pet mới (thay đổi pet của học sinh)
     */
    public function buyPet(Request $request, Student $student)
    {
        $this->authorize('update', $student->classroom);

        $request->validate([
            'pet_type_id' => 'required|exists:pet_types,id',
        ]);

        $petType = \App\Models\PetType::findOrFail($request->pet_type_id);

        // Kiểm tra pet có giá > 0 không (tránh mua pet miễn phí qua shop)
        if ($petType->price <= 0) {
            return response()->json([
                'message' => 'Pet này không thể mua!',
            ], 400);
        }

        // Kiểm tra học sinh đã có pet này chưa
        $currentPet = $student->pet;
        if ($currentPet && $currentPet->pet_type_id === $petType->id) {
            return response()->json([
                'message' => 'Bạn đang có pet này rồi!',
            ], 400);
        }

        // Kiểm tra đủ xu không
        if ($student->points_balance < $petType->price) {
            return response()->json([
                'message' => 'Không đủ xu để mua pet này!',
                'required' => $petType->price,
                'balance' => $student->points_balance,
            ], 400);
        }

        // Trừ xu
        $student->decrement('points_balance', $petType->price);

        // Cập nhật hoặc tạo pet mới
        $pet = $student->pet;
        if ($pet) {
            $pet->update([
                'pet_type_id' => $petType->id,
                'nickname' => $petType->name,
                'level' => 1,
                'current_exp' => 0,
                'hunger_level' => 100,
                'happiness_level' => 100,
                'mood' => 'happy',
            ]);
        } else {
            $pet = StudentPet::create([
                'student_id' => $student->id,
                'pet_type_id' => $petType->id,
                'nickname' => $petType->name,
                'level' => 1,
                'current_exp' => 0,
                'hunger_level' => 100,
                'happiness_level' => 100,
                'mood' => 'happy',
            ]);
        }

        return response()->json([
            'message' => "Đã nhận được {$petType->name}! 🎉",
            'pet' => $pet->fresh()->load('type'),
            'new_balance' => $student->fresh()->points_balance,
        ]);
    }
}
