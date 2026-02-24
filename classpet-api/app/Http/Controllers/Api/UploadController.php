<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Upload pet state image
     */
    public function uploadPetImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,gif,webp|max:5120', // Max 5MB
            'state' => 'required|in:idle,happy,eating,hungry,sleeping',
            'pet_name' => 'nullable|string|max:100',
        ]);

        $file = $request->file('image');
        $state = $request->input('state');
        $petName = $request->input('pet_name', 'pet');
        
        // Tạo tên file unique
        $fileName = Str::slug($petName) . '_' . $state . '_' . time() . '.' . $file->getClientOriginalExtension();
        
        // Lưu vào storage/app/public/pets
        $path = $file->storeAs('pets', $fileName, 'public');
        
        // Trả về URL public
        $url = Storage::url($path);
        
        return response()->json([
            'success' => true,
            'url' => $url,
            'path' => $path,
            'state' => $state,
        ]);
    }

    /**
     * Delete pet image
     */
    public function deletePetImage(Request $request)
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        $path = $request->input('path');
        
        // Chỉ xóa file trong thư mục pets
        if (str_starts_with($path, 'pets/') && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
            return response()->json(['success' => true, 'message' => 'Đã xóa ảnh']);
        }

        return response()->json(['success' => false, 'message' => 'Không tìm thấy file'], 404);
    }

    /**
     * Upload food image
     */
    public function uploadFoodImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,gif,webp|max:2048', // Max 2MB
            'food_name' => 'nullable|string|max:100',
        ]);

        $file = $request->file('image');
        $foodName = $request->input('food_name', 'food');
        
        $fileName = Str::slug($foodName) . '_' . time() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('foods', $fileName, 'public');
        $url = Storage::url($path);
        
        return response()->json([
            'success' => true,
            'url' => $url,
            'path' => $path,
        ]);
    }
}
