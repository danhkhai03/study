import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosClient';
import { 
    ArrowLeft, ShoppingBag, Sparkles, Star, Check, 
    Crown, Gem, Flame, Package 
} from 'lucide-react';
import { Button, Modal, PageLoading } from '../components/ui';
import { useToast } from '../contexts/ToastContext';
import type { Student, ShopItem, PetType } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
const getImageUrl = (path?: string): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
};

// Rarity styling
const rarityColors: Record<number, string> = {
    1: 'from-gray-100 to-gray-200 border-gray-300',
    2: 'from-blue-100 to-cyan-100 border-blue-400',
    3: 'from-purple-100 to-pink-100 border-purple-400',
    4: 'from-yellow-100 to-amber-100 border-yellow-400',
};

const rarityBadgeColors: Record<number, string> = {
    1: 'bg-gray-200 text-gray-700',
    2: 'bg-blue-200 text-blue-700',
    3: 'bg-purple-200 text-purple-700',
    4: 'bg-yellow-200 text-yellow-700',
};

const rarityLabels: Record<number, string> = {
    1: 'Thường',
    2: 'Hiếm',
    3: 'Sử thi',
    4: 'Huyền thoại',
};

const rarityIcons: Record<number, React.ReactNode> = {
    1: <Star size={12} />,
    2: <Gem size={12} />,
    3: <Crown size={12} />,
    4: <Flame size={12} />,
};

interface PetFood {
    id: number;
    name: string;
    description: string;
    emoji: string;
    price: number;
    exp_amount: number;
    happiness_amount: number;
    hunger_restore: number;
    rarity: string;
}

interface FoodInventoryItem {
    id: number;
    pet_food_id: number;
    quantity: number;
    pet_food: PetFood;
}

type TabType = 'all' | 'pet' | 'avatar_frame' | 'background' | 'food';

export default function StudentShop() {
    const { classId, studentId } = useParams();
    const [student, setStudent] = useState<Student | null>(null);
    const [shopItems, setShopItems] = useState<ShopItem[]>([]);
    const [ownedItems, setOwnedItems] = useState<number[]>([]);
    const [petTypes, setPetTypes] = useState<PetType[]>([]);
    const [petFoods, setPetFoods] = useState<PetFood[]>([]);
    const [foodInventory, setFoodInventory] = useState<FoodInventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
    const [selectedFood, setSelectedFood] = useState<PetFood | null>(null);
    const [buyQuantity, setBuyQuantity] = useState(1);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const { success, error: showError } = useToast();

    useEffect(() => {
        loadData();
    }, [studentId]);

    const loadData = async () => {
        try {
            const [studentsRes, shopRes, itemsRes, petTypesRes, foodsRes, inventoryRes] = await Promise.all([
                api.get(`/classrooms/${classId}/students`),
                api.get('/shop/items'),
                api.get(`/students/${studentId}/items`),
                api.get('/shop/pet-types'),
                api.get('/pet-foods'),
                api.get(`/students/${studentId}/inventory`).catch(() => ({ data: [] })),
            ]);

            const foundStudent = studentsRes.data.find((s: Student) => s.id === Number(studentId));
            setStudent(foundStudent);
            setShopItems(shopRes.data);
            setOwnedItems(itemsRes.data.items.map((i: any) => i.shop_item_id));
            setPetTypes(petTypesRes.data);
            setPetFoods(foodsRes.data);
            setFoodInventory(inventoryRes.data);
        } catch (err) {
            showError('Không thể tải dữ liệu cửa hàng');
        } finally {
            setIsLoading(false);
        }
    };

    // Check if item is currently equipped
    const isEquipped = (item: ShopItem) => {
        if (!student) return false;
        if (item.type === 'avatar_frame') return student.equipped_frame_id === item.id;
        if (item.type === 'background') return student.equipped_background_id === item.id;
        return false;
    };

    const handlePurchase = async () => {
        if (!selectedItem || !student) return;

        setIsPurchasing(true);
        try {
            await api.post(`/students/${studentId}/purchase`, {
                shop_item_id: selectedItem.id,
            });
            
            if (selectedItem.type === 'avatar_frame' || selectedItem.type === 'background') {
                await api.post(`/students/${studentId}/equip`, {
                    shop_item_id: selectedItem.id,
                });
                success(`Mua và trang bị ${selectedItem.name} thành công! 🎉`);
            } else {
                success(`Mua ${selectedItem.name} thành công! 🎉`);
            }
            
            setSelectedItem(null);
            loadData();
        } catch (err: any) {
            showError(err.response?.data?.message || 'Mua hàng thất bại');
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleBuyFood = async () => {
        if (!selectedFood || !student) return;

        setIsPurchasing(true);
        try {
            await api.post(`/students/${studentId}/buy-food`, {
                pet_food_id: selectedFood.id,
                quantity: buyQuantity,
            });
            success(`Mua ${buyQuantity}x ${selectedFood.name} thành công! 🎉`);
            setSelectedFood(null);
            setBuyQuantity(1);
            loadData();
        } catch (err: any) {
            showError(err.response?.data?.message || 'Mua đồ ăn thất bại');
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleEquip = async (item: ShopItem) => {
        try {
            const res = await api.post(`/students/${studentId}/equip`, {
                shop_item_id: item.id,
            });
            success(res.data.message);
            loadData();
        } catch (err: any) {
            showError(err.response?.data?.message || 'Trang bị thất bại');
        }
    };

    const handleChangePet = async (petTypeId: number) => {
        try {
            const res = await api.post(`/students/${studentId}/change-pet`, {
                pet_type_id: petTypeId,
            });
            success(res.data.message);
            loadData();
        } catch (err: any) {
            showError(err.response?.data?.message || 'Đổi thú cưng thất bại');
        }
    };

    // Lọc bỏ type 'pet' vì đã có phần "Cửa Hàng Thú Cưng" riêng
    const filteredItems = shopItems.filter(item => 
        item.type !== 'pet' && (activeTab === 'all' || item.type === activeTab)
    );

    const tabs = [
        { id: 'all' as TabType, label: 'Tất cả', icon: <Package size={18} /> },
        { id: 'pet' as TabType, label: 'Thú cưng', icon: '🐾' },
        { id: 'food' as TabType, label: 'Đồ ăn', icon: '🍖' },
        { id: 'avatar_frame' as TabType, label: 'Khung avatar', icon: '🖼️' },
        { id: 'background' as TabType, label: 'Nền', icon: '🎨' },
    ];

    const foodRarityColors: Record<string, string> = {
        'common': 'from-gray-100 to-gray-200 border-gray-300',
        'uncommon': 'from-green-100 to-emerald-100 border-green-400',
        'rare': 'from-blue-100 to-cyan-100 border-blue-400',
        'epic': 'from-purple-100 to-pink-100 border-purple-400',
        'legendary': 'from-yellow-100 to-amber-100 border-yellow-400',
    };

    const foodRarityLabels: Record<string, string> = {
        'common': 'Thường',
        'uncommon': 'Tốt',
        'rare': 'Hiếm',
        'epic': 'Sử thi',
        'legendary': 'Huyền thoại',
    };

    if (isLoading) {
        return <PageLoading message="Đang tải cửa hàng..." />;
    }

    if (!student) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Không tìm thấy học sinh</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <Link 
                        to={`/teacher/class/${classId}`} 
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-3"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Quay lại lớp học
                    </Link>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl shadow-lg overflow-hidden">
                                {student.pet?.type?.image_idle ? (
                                    <img src={getImageUrl(student.pet.type.image_idle)!} alt={student.pet.type.name} className="w-10 h-10 object-contain" />
                                ) : (
                                    <span>🐾</span>
                                )}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">{student.name}</h1>
                                <p className="text-sm text-purple-600">
                                    <Sparkles size={14} className="inline mr-1" />
                                    Lv.{student.pet?.level || 1} {student.pet?.type?.name || 'Chưa có pet'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-amber-100 px-5 py-2.5 rounded-full shadow">
                            <span className="text-2xl">🪙</span>
                            <span className="text-2xl font-bold text-yellow-700">{student.points_balance}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Shop Header */}
                <div className="text-center mb-6">
                    <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
                        🛍️ Cửa Hàng ClassPet
                    </h2>
                    <p className="text-gray-600 mt-2">Mua thú cưng, đồ ăn, khung avatar và nền trang trí!</p>
                </div>

                {/* Currently Equipped Items */}
                <div className="bg-white/80 rounded-2xl p-4 mb-6 shadow-lg">
                    <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <Sparkles size={18} className="text-purple-500" />
                        Đang trang bị
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-xl">
                            <span className="text-2xl">🖼️</span>
                            <div>
                                <p className="text-xs text-gray-500">Khung avatar</p>
                                <p className="font-medium text-purple-700">
                                    {shopItems.find(i => i.id === student.equipped_frame_id)?.name || 'Chưa có'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 rounded-xl">
                            <span className="text-2xl">🎨</span>
                            <div>
                                <p className="text-xs text-gray-500">Nền trang trí</p>
                                <p className="font-medium text-blue-700">
                                    {shopItems.find(i => i.id === student.equipped_background_id)?.name || 'Chưa có'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Food Inventory */}
                {foodInventory.length > 0 && (
                    <div className="bg-white/80 rounded-2xl p-4 mb-6 shadow-lg">
                        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                            🎒 Túi đồ ăn
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {foodInventory.map((item) => (
                                <div key={item.id} className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-yellow-100 px-4 py-2 rounded-xl">
                                    <span className="text-2xl">{item.pet_food?.emoji || '🍖'}</span>
                                    <div>
                                        <p className="font-medium text-orange-700">{item.pet_food?.name}</p>
                                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all ${
                                activeTab === tab.id
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow'
                            }`}
                        >
                            <span>{typeof tab.icon === 'string' ? tab.icon : tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Food Tab Content */}
                {activeTab === 'food' && (
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            🍖 Đồ ăn cho Pet
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {petFoods.map(food => {
                                const canAfford = student.points_balance >= food.price;
                                const ownedQuantity = foodInventory.find(i => i.pet_food_id === food.id)?.quantity || 0;
                                
                                return (
                                    <div
                                        key={food.id}
                                        className={`relative bg-gradient-to-br ${foodRarityColors[food.rarity] || foodRarityColors['common']} rounded-2xl p-4 border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer`}
                                        onClick={() => {
                                            setSelectedFood(food);
                                            setBuyQuantity(1);
                                        }}
                                    >
                                        {/* Rarity Badge */}
                                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold bg-white/80">
                                            {foodRarityLabels[food.rarity] || 'Thường'}
                                        </div>

                                        {/* Owned quantity */}
                                        {ownedQuantity > 0 && (
                                            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                                Có: {ownedQuantity}
                                            </div>
                                        )}

                                        {/* Food Preview */}
                                        <div className="w-20 h-20 mx-auto mb-3 bg-white/80 rounded-full flex items-center justify-center text-5xl shadow-inner">
                                            {food.emoji || '🍖'}
                                        </div>

                                        {/* Food Info */}
                                        <h3 className="font-bold text-gray-800 text-center truncate">{food.name}</h3>
                                        <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2">{food.description}</p>

                                        {/* Stats */}
                                        <div className="flex justify-center gap-2 mt-2 text-xs">
                                            {food.exp_amount > 0 && (
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                    +{food.exp_amount} EXP
                                                </span>
                                            )}
                                            {food.happiness_amount > 0 && (
                                                <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full">
                                                    +{food.happiness_amount} 💖
                                                </span>
                                            )}
                                        </div>

                                        {/* Price */}
                                        <div className={`mt-3 flex items-center justify-center gap-1 py-2 rounded-full ${
                                            canAfford ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                            <span>🪙</span>
                                            <span className="font-bold">{food.price}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {petFoods.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🍽️</div>
                                <p className="text-gray-500">Chưa có đồ ăn nào trong cửa hàng</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pet Shop Section - show when tab is 'all' or 'pet' */}
                {(activeTab === 'all' || activeTab === 'pet') && (
                    <div>
                        {activeTab === 'all' && (
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                🐾 Thú Cưng
                            </h3>
                        )}
                        
                        {petTypes.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {petTypes.map(petType => {
                                    const isCurrentPet = student?.pet?.type?.id === petType.id;
                                    const canAfford = student && student.points_balance >= petType.price;
                                    const petImage = getImageUrl(petType.image_idle);

                                    const petRarityColor = 
                                        petType.rarity === 'legendary' ? 'from-yellow-100 to-amber-100 border-yellow-400' :
                                        petType.rarity === 'epic' ? 'from-purple-100 to-pink-100 border-purple-400' :
                                        petType.rarity === 'rare' ? 'from-blue-100 to-cyan-100 border-blue-400' :
                                        'from-gray-100 to-gray-200 border-gray-300';

                                    const petRarityLabel = 
                                        petType.rarity === 'legendary' ? 'Huyền Thoại' :
                                        petType.rarity === 'epic' ? 'Sử Thi' :
                                        petType.rarity === 'rare' ? 'Hiếm' :
                                        'Thường';

                                    const petRarityBadgeColor = 
                                        petType.rarity === 'legendary' ? 'bg-yellow-200 text-yellow-700' :
                                        petType.rarity === 'epic' ? 'bg-purple-200 text-purple-700' :
                                        petType.rarity === 'rare' ? 'bg-blue-200 text-blue-700' :
                                        'bg-gray-200 text-gray-700';

                                    return (
                                        <div
                                            key={`pet-${petType.id}`}
                                            onClick={() => !isCurrentPet && canAfford && handleChangePet(petType.id)}
                                            className={`relative bg-gradient-to-br ${petRarityColor} rounded-2xl p-4 border-2 transition-all duration-300 ${
                                                isCurrentPet 
                                                    ? 'ring-4 ring-green-500 border-green-400' 
                                                    : canAfford
                                                        ? 'hover:scale-105 hover:shadow-xl cursor-pointer'
                                                        : 'opacity-60 cursor-not-allowed'
                                            }`}
                                        >
                                            {/* Rarity Badge */}
                                            <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${petRarityBadgeColor}`}>
                                                {petType.rarity === 'legendary' && <Flame size={12} />}
                                                {petType.rarity === 'epic' && <Crown size={12} />}
                                                {petType.rarity === 'rare' && <Gem size={12} />}
                                                {petType.rarity === 'normal' && <Star size={12} />}
                                                {petRarityLabel}
                                            </div>

                                            {/* Current Pet Badge */}
                                            {isCurrentPet && (
                                                <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                                                    ✨ Đang dùng
                                                </div>
                                            )}
                                            
                                            {/* Pet Preview */}
                                            <div className="w-20 h-20 mx-auto mb-3 bg-white/80 rounded-full flex items-center justify-center shadow-inner overflow-hidden">
                                                {petImage ? (
                                                    <img src={petImage} alt={petType.name} className="w-16 h-16 object-contain" />
                                                ) : (
                                                    <span className="text-5xl">🐾</span>
                                                )}
                                            </div>

                                            {/* Pet Info */}
                                            <h3 className="font-bold text-gray-800 text-center truncate">{petType.name}</h3>
                                            
                                            {/* Price */}
                                            {!isCurrentPet && (
                                                <div className={`mt-3 flex items-center justify-center gap-1 py-2 rounded-full ${
                                                    canAfford ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-500'
                                                }`}>
                                                    <span>🪙</span>
                                                    <span className="font-bold">{petType.price}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🐾</div>
                                <p className="text-gray-500">Chưa có thú cưng nào trong cửa hàng</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Items Grid (for avatar_frame, background tabs, and 'all' tab) */}
                {activeTab !== 'food' && activeTab !== 'pet' && filteredItems.length > 0 && (
                    <div className={activeTab === 'all' ? 'mt-8' : ''}>
                        {activeTab === 'all' && (
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                🎨 Trang trí
                            </h3>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredItems.map(item => {
                                const isOwned = ownedItems.includes(item.id);
                                const canAfford = student.points_balance >= item.price;
                                const equipped = isEquipped(item);
                                
                                return (
                                    <div
                                        key={item.id}
                                        className={`relative bg-gradient-to-br ${rarityColors[item.rarity]} rounded-2xl p-4 border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${
                                            equipped ? 'ring-4 ring-green-500 border-green-400' : isOwned ? 'ring-2 ring-green-400' : ''
                                        }`}
                                        onClick={() => !isOwned && setSelectedItem(item)}
                                    >
                                        {/* Rarity Badge */}
                                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${rarityBadgeColors[item.rarity]}`}>
                                        {rarityIcons[item.rarity]}
                                        {rarityLabels[item.rarity]}
                                    </div>

                                    {/* Equipped/Owned Badge */}
                                    {equipped ? (
                                        <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                                            ✨ Đang dùng
                                        </div>
                                    ) : isOwned && (
                                        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                                            <Check size={12} />
                                            Đã có
                                        </div>
                                    )}

                                    {/* Item Preview */}
                                    <div className={`w-20 h-20 mx-auto mb-3 bg-white/80 rounded-full flex items-center justify-center text-5xl shadow-inner ${equipped ? 'ring-4 ring-green-400' : ''}`}>
                                        {item.preview_emoji}
                                    </div>

                                    {/* Item Info */}
                                    <h3 className="font-bold text-gray-800 text-center truncate">{item.name}</h3>
                                    <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2">{item.description}</p>

                                    {/* Price */}
                                    {!isOwned && (
                                        <div className={`mt-3 flex items-center justify-center gap-1 py-2 rounded-full ${
                                            canAfford ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                            <span>🪙</span>
                                            <span className="font-bold">{item.price}</span>
                                        </div>
                                    )}

                                    {/* Equip/Equipped Button for owned items */}
                                    {isOwned && item.type !== 'pet' && (
                                        equipped ? (
                                            <div className="w-full mt-3 py-2 bg-green-500 text-white rounded-full font-medium text-sm text-center">
                                                ✅ Đang trang bị
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEquip(item);
                                                }}
                                                className="w-full mt-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-medium text-sm transition-colors"
                                            >
                                                Trang bị
                                            </button>
                                        )
                                    )}
                                </div>
                            );
                        })}
                        </div>
                    </div>
                )}

                {activeTab !== 'food' && activeTab !== 'pet' && filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-gray-500">Không có vật phẩm nào trong danh mục này</p>
                    </div>
                )}
            </div>

            {/* Purchase Item Modal */}
            <Modal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                title="Xác nhận mua hàng"
            >
                {selectedItem && (
                    <div className="text-center">
                        <div className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-br ${rarityColors[selectedItem.rarity]} rounded-full flex items-center justify-center text-6xl shadow-lg`}>
                            {selectedItem.preview_emoji}
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-800">{selectedItem.name}</h3>
                        <p className={`text-sm ${rarityBadgeColors[selectedItem.rarity]} inline-block px-3 py-1 rounded-full mt-2`}>
                            {rarityLabels[selectedItem.rarity]}
                        </p>
                        <p className="text-gray-500 mt-3">{selectedItem.description}</p>
                        
                        <div className="flex items-center justify-center gap-2 mt-4 py-3 bg-yellow-50 rounded-lg">
                            <span className="text-2xl">🪙</span>
                            <span className="text-2xl font-bold text-yellow-700">{selectedItem.price}</span>
                        </div>

                        {student && student.points_balance < selectedItem.price && (
                            <p className="text-red-500 mt-3 text-sm">
                                ⚠️ Bạn không đủ xu! Cần thêm {selectedItem.price - student.points_balance} xu.
                            </p>
                        )}

                        <div className="flex gap-3 mt-6">
                            <Button 
                                variant="secondary" 
                                className="flex-1"
                                onClick={() => setSelectedItem(null)}
                            >
                                Hủy
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handlePurchase}
                                isLoading={isPurchasing}
                                disabled={!student || student.points_balance < selectedItem.price}
                            >
                                <ShoppingBag size={18} className="mr-2" />
                                Mua ngay
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Buy Food Modal */}
            <Modal
                isOpen={!!selectedFood}
                onClose={() => {
                    setSelectedFood(null);
                    setBuyQuantity(1);
                }}
                title="Mua đồ ăn cho Pet"
            >
                {selectedFood && (
                    <div className="text-center">
                        <div className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-br ${foodRarityColors[selectedFood.rarity] || foodRarityColors['common']} rounded-full flex items-center justify-center text-6xl shadow-lg`}>
                            {selectedFood.emoji || '🍖'}
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-800">{selectedFood.name}</h3>
                        <p className="text-sm bg-orange-100 text-orange-700 inline-block px-3 py-1 rounded-full mt-2">
                            {foodRarityLabels[selectedFood.rarity] || 'Thường'}
                        </p>
                        <p className="text-gray-500 mt-3">{selectedFood.description}</p>

                        {/* Stats */}
                        <div className="flex justify-center gap-3 mt-4">
                            {selectedFood.exp_amount > 0 && (
                                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-medium">
                                    +{selectedFood.exp_amount} EXP
                                </span>
                            )}
                            {selectedFood.happiness_amount > 0 && (
                                <span className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-lg font-medium">
                                    +{selectedFood.happiness_amount} 💖
                                </span>
                            )}
                            {selectedFood.hunger_restore > 0 && (
                                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg font-medium">
                                    +{selectedFood.hunger_restore} 🍖
                                </span>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <button
                                onClick={() => setBuyQuantity(Math.max(1, buyQuantity - 1))}
                                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full text-xl font-bold"
                            >
                                -
                            </button>
                            <span className="text-2xl font-bold w-12">{buyQuantity}</span>
                            <button
                                onClick={() => setBuyQuantity(Math.min(99, buyQuantity + 1))}
                                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full text-xl font-bold"
                            >
                                +
                            </button>
                        </div>
                        
                        {/* Total Price */}
                        <div className="flex items-center justify-center gap-2 mt-4 py-3 bg-yellow-50 rounded-lg">
                            <span className="text-2xl">🪙</span>
                            <span className="text-2xl font-bold text-yellow-700">{selectedFood.price * buyQuantity}</span>
                            <span className="text-gray-500">({selectedFood.price} × {buyQuantity})</span>
                        </div>

                        {student && student.points_balance < selectedFood.price * buyQuantity && (
                            <p className="text-red-500 mt-3 text-sm">
                                ⚠️ Bạn không đủ xu! Cần thêm {(selectedFood.price * buyQuantity) - student.points_balance} xu.
                            </p>
                        )}

                        <div className="flex gap-3 mt-6">
                            <Button 
                                variant="secondary" 
                                className="flex-1"
                                onClick={() => {
                                    setSelectedFood(null);
                                    setBuyQuantity(1);
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleBuyFood}
                                isLoading={isPurchasing}
                                disabled={!student || student.points_balance < selectedFood.price * buyQuantity}
                            >
                                <ShoppingBag size={18} className="mr-2" />
                                Mua {buyQuantity}x
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
