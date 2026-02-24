// ============================================
// ClassPet Type Definitions
// ============================================

export interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

export interface PetType {
    id: number;
    name: string;
    base_asset_url?: string;
    max_level: number;
    rarity: 'normal' | 'rare' | 'epic' | 'legendary';
    price: number;
    image_idle?: string;
    image_happy?: string;
    image_eating?: string;
    image_hungry?: string;
    image_sleeping?: string;
}

export interface Pet {
    id: number;
    nickname: string | null;
    level: number;
    current_exp: number;
    is_hungry: boolean;
    type: PetType;
}

export interface ShopItem {
    id: number;
    name: string;
    description: string;
    type: 'pet' | 'avatar_frame' | 'background';
    price: number;
    asset_url: string | null;
    preview_emoji: string;
    rarity: number;
    is_active: boolean;
}

export interface StudentItem {
    id: number;
    student_id: number;
    shop_item_id: number;
    is_equipped: boolean;
    shopItem?: ShopItem;
}

export interface Student {
    id: number;
    name: string;
    points_balance: number;
    total_points_earned: number;
    pet: Pet | null;
    equipped_frame_id: number | null;
    equipped_background_id: number | null;
    equippedFrame?: ShopItem | null;
    equippedBackground?: ShopItem | null;
    created_at: string;
}

export interface Classroom {
    id: number;
    name: string;
    public_slug: string;
    theme: string | null;
    students_count?: number;
    students?: Student[];
    created_at: string;
}

export interface PointTransaction {
    id: number;
    amount: number;
    reason: string | null;
    created_at: string;
}

// API Response Types
export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

// Rarity helpers
export const RARITY_COLORS: Record<number, string> = {
    1: 'from-gray-200 to-gray-300 border-gray-300',      // Common
    2: 'from-blue-200 to-blue-300 border-blue-400',     // Rare
    3: 'from-purple-200 to-purple-300 border-purple-400', // Epic
    4: 'from-yellow-200 to-amber-300 border-yellow-400', // Legendary
};

export const RARITY_LABELS: Record<number, string> = {
    1: 'Thường',
    2: 'Hiếm',
    3: 'Sử thi',
    4: 'Huyền thoại',
};

export const RARITY_TEXT_COLORS: Record<number, string> = {
    1: 'text-gray-600',
    2: 'text-blue-600',
    3: 'text-purple-600',
    4: 'text-yellow-600',
};
