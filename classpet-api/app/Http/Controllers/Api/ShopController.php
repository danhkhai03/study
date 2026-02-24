<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShopItem;
use App\Models\Student;
use App\Models\PetType;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    /**
     * Get all shop items
     */
    public function index(Request $request)
    {
        $query = ShopItem::query();

        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        $items = $query->orderBy('rarity')->orderBy('price')->get();

        return response()->json($items);
    }

    /**
     * Store a new shop item (Admin)
     */
    public function storeItem(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:pet,avatar_frame,background',
            'price' => 'required|integer|min:1',
            'preview_emoji' => 'required|string|max:10',
            'rarity' => 'required|integer|min:1|max:4',
        ]);

        $item = ShopItem::create($validated);

        return response()->json($item, 201);
    }

    /**
     * Update a shop item (Admin)
     */
    public function updateItem(Request $request, ShopItem $shopItem)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:pet,avatar_frame,background',
            'price' => 'required|integer|min:1',
            'preview_emoji' => 'required|string|max:10',
            'rarity' => 'required|integer|min:1|max:4',
        ]);

        $shopItem->update($validated);

        return response()->json($shopItem);
    }

    /**
     * Delete a shop item (Admin)
     */
    public function destroyItem(ShopItem $shopItem)
    {
        $shopItem->delete();

        return response()->json(['message' => 'Xóa vật phẩm thành công!']);
    }

    /**
     * Get available pet types for purchase
     */
    public function petTypes()
    {
        $petTypes = PetType::all();
        return response()->json($petTypes);
    }

    /**
     * Get items owned by a student
     */
    public function studentItems(Student $student)
    {
        $items = $student->ownedItems()->with('shopItem')->get();
        
        return response()->json([
            'items' => $items,
            'equipped_frame_id' => $student->equipped_frame_id,
            'equipped_background_id' => $student->equipped_background_id,
        ]);
    }

    /**
     * Purchase an item for a student
     */
    public function purchase(Request $request, Student $student)
    {
        $validated = $request->validate([
            'shop_item_id' => 'required|exists:shop_items,id',
        ]);

        $item = ShopItem::findOrFail($validated['shop_item_id']);

        // Check if already owned
        if ($student->ownedItems()->where('shop_item_id', $item->id)->exists()) {
            return response()->json([
                'message' => 'Bạn đã sở hữu vật phẩm này rồi!',
            ], 400);
        }

        // Check if enough coins
        if ($student->points_balance < $item->price) {
            return response()->json([
                'message' => 'Không đủ xu! Cần ' . $item->price . ' xu.',
            ], 400);
        }

        // Deduct coins
        $student->decrement('points_balance', $item->price);

        // Add item to inventory
        $student->ownedItems()->create([
            'shop_item_id' => $item->id,
            'is_equipped' => false,
        ]);

        return response()->json([
            'message' => 'Mua thành công! 🎉',
            'item' => $item,
            'new_balance' => $student->points_balance,
        ]);
    }

    /**
     * Equip an item
     */
    public function equip(Request $request, Student $student)
    {
        $validated = $request->validate([
            'shop_item_id' => 'required|exists:shop_items,id',
        ]);

        $item = ShopItem::findOrFail($validated['shop_item_id']);

        // Check if owned
        $ownedItem = $student->ownedItems()->where('shop_item_id', $item->id)->first();
        if (!$ownedItem) {
            return response()->json([
                'message' => 'Bạn chưa sở hữu vật phẩm này!',
            ], 400);
        }

        // Equip based on type
        if ($item->type === 'avatar_frame') {
            $student->update(['equipped_frame_id' => $item->id]);
        } elseif ($item->type === 'background') {
            $student->update(['equipped_background_id' => $item->id]);
        } elseif ($item->type === 'pet') {
            // For pet, we change the pet type
            $petType = PetType::where('name', $item->name)->first();
            if ($petType && $student->pet) {
                $student->pet->update(['pet_type_id' => $petType->id]);
            }
        }

        return response()->json([
            'message' => 'Đã trang bị thành công!',
            'student' => $student->fresh()->load(['pet.type', 'equippedFrame', 'equippedBackground']),
        ]);
    }

    /**
     * Unequip an item
     */
    public function unequip(Request $request, Student $student)
    {
        $validated = $request->validate([
            'type' => 'required|in:avatar_frame,background',
        ]);

        if ($validated['type'] === 'avatar_frame') {
            $student->update(['equipped_frame_id' => null]);
        } elseif ($validated['type'] === 'background') {
            $student->update(['equipped_background_id' => null]);
        }

        return response()->json([
            'message' => 'Đã gỡ trang bị!',
            'student' => $student->fresh()->load(['pet.type', 'equippedFrame', 'equippedBackground']),
        ]);
    }

    /**
     * Change student's pet type (with owned pet item)
     */
    public function changePet(Request $request, Student $student)
    {
        $validated = $request->validate([
            'pet_type_id' => 'required|exists:pet_types,id',
        ]);

        if (!$student->pet) {
            return response()->json(['message' => 'Học sinh chưa có thú cưng!'], 400);
        }

        $student->pet->update([
            'pet_type_id' => $validated['pet_type_id'],
        ]);

        return response()->json([
            'message' => 'Đã đổi thú cưng thành công!',
            'pet' => $student->pet->fresh()->load('type'),
        ]);
    }
}
