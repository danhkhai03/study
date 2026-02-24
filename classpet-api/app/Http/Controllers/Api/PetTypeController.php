<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PetType;
use Illuminate\Http\Request;

class PetTypeController extends Controller
{
    /**
     * Display a listing of the pet types.
     */
    public function index()
    {
        return response()->json(PetType::all());
    }

    /**
     * Store a newly created pet type.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:pet_types',
            'base_asset_url' => 'nullable|string',
            'max_level' => 'integer|min:1|max:100',
            'rarity' => 'nullable|string|in:normal,rare,epic,legendary',
            'price' => 'nullable|integer|min:0',
            'is_default' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'image_idle' => 'nullable|string',
            'image_happy' => 'nullable|string',
            'image_eating' => 'nullable|string',
            'image_hungry' => 'nullable|string',
            'image_sleeping' => 'nullable|string',
        ]);

        $petType = PetType::create([
            'name' => $validated['name'],
            'base_asset_url' => $validated['base_asset_url'] ?? null,
            'max_level' => $validated['max_level'] ?? 10,
            'rarity' => $validated['rarity'] ?? 'normal',
            'price' => $validated['price'] ?? 0,
            'is_default' => $validated['is_default'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'image_idle' => $validated['image_idle'] ?? null,
            'image_happy' => $validated['image_happy'] ?? null,
            'image_eating' => $validated['image_eating'] ?? null,
            'image_hungry' => $validated['image_hungry'] ?? null,
            'image_sleeping' => $validated['image_sleeping'] ?? null,
        ]);

        return response()->json($petType, 201);
    }

    /**
     * Display the specified pet type.
     */
    public function show(PetType $petType)
    {
        return response()->json($petType);
    }

    /**
     * Update the specified pet type.
     */
    public function update(Request $request, PetType $petType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:pet_types,name,' . $petType->id,
            'base_asset_url' => 'nullable|string',
            'max_level' => 'integer|min:1|max:100',
            'rarity' => 'nullable|string|in:normal,rare,epic,legendary',
            'price' => 'nullable|integer|min:0',
            'is_default' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'image_idle' => 'nullable|string',
            'image_happy' => 'nullable|string',
            'image_eating' => 'nullable|string',
            'image_hungry' => 'nullable|string',
            'image_sleeping' => 'nullable|string',
        ]);

        $petType->update($validated);

        return response()->json($petType);
    }

    /**
     * Remove the specified pet type.
     */
    public function destroy(PetType $petType)
    {
        // Check if any pets are using this type
        if ($petType->pets()->count() > 0) {
            return response()->json([
                'message' => 'Không thể xóa loại pet này vì đang có pet sử dụng!',
            ], 400);
        }

        $petType->delete();

        return response()->json([
            'message' => 'Xóa loại pet thành công!',
        ]);
    }
}
