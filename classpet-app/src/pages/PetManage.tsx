import { useEffect, useState, useRef } from 'react';
import api from '../api/axiosClient';
import { useToast } from '../contexts/ToastContext';
import { Plus, Trash2, Edit, Search, Star, Image, Check, Upload, X } from 'lucide-react';
import { PageLoading } from '../components/ui';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

interface PetType {
    id: number;
    name: string;
    max_level: number;
    rarity: string;
    price: number;
    is_default: boolean;
    is_active: boolean;
    image_idle?: string;
    image_happy?: string;
    image_eating?: string;
    image_hungry?: string;
    image_sleeping?: string;
}

const petEmojis: Record<string, string> = {
    'Dragon': '🐉', 'Cat': '🐱', 'Dog': '🐕', 'Rabbit': '🐰', 'Fox': '🦊',
    'Unicorn': '🦄', 'Wolf': '🐺', 'Bear': '🐻', 'Panda': '🐼', 'Hamster': '🐹',
    'Fire Cat': '🔥', 'Water Dog': '💧', 'Earth Rabbit': '🌿', 'Wind Bird': '🌬️',
    'Tiger': '🐯', 'Lion': '🦁', 'Koala': '🐨', 'Owl': '🦉', 'Phoenix': '🔥',
};

const rarityConfig: Record<string, { label: string; color: string; bg: string }> = {
    normal: { label: 'Thường', color: 'text-gray-600', bg: 'bg-gray-100' },
    rare: { label: 'Hiếm', color: 'text-blue-600', bg: 'bg-blue-100' },
    epic: { label: 'Sử thi', color: 'text-purple-600', bg: 'bg-purple-100' },
    legendary: { label: 'Huyền thoại', color: 'text-yellow-600', bg: 'bg-yellow-100' },
};

const imageStates = [
    { key: 'image_idle', label: 'Bình thường', emoji: '🟢', color: 'green' },
    { key: 'image_happy', label: 'Vui vẻ', emoji: '😊', color: 'yellow' },
    { key: 'image_eating', label: 'Đang ăn', emoji: '🍖', color: 'orange' },
    { key: 'image_hungry', label: 'Đói', emoji: '😢', color: 'red' },
    { key: 'image_sleeping', label: 'Ngủ', emoji: '😴', color: 'purple' },
];

const defaultFormData = {
    name: '',
    max_level: 10,
    rarity: 'normal',
    price: 0,
    is_default: false,
    is_active: true,
    image_idle: '',
    image_happy: '',
    image_eating: '',
    image_hungry: '',
    image_sleeping: '',
};

export default function PetManage() {
    const [petTypes, setPetTypes] = useState<PetType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRarity, setFilterRarity] = useState<string>('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPet, setEditingPet] = useState<PetType | null>(null);
    const [formData, setFormData] = useState(defaultFormData);
    const [uploadingState, setUploadingState] = useState<string | null>(null);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const { success, error } = useToast();

    const loadPetTypes = async () => {
        try {
            const res = await api.get('/pet-types');
            setPetTypes(res.data);
        } catch (err) {
            error('Không thể tải danh sách loại pet');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPetTypes();
    }, []);

    // Upload image handler
    const handleImageUpload = async (state: string, file: File) => {
        if (!file) return;

        setUploadingState(state);
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        formDataUpload.append('state', state.replace('image_', ''));
        formDataUpload.append('pet_name', formData.name || 'pet');

        try {
            const res = await api.post('/upload/pet-image', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setFormData(prev => ({ ...prev, [state]: res.data.url }));
                success(`Upload ảnh ${imageStates.find(s => s.key === state)?.label} thành công!`);
            }
        } catch (err: any) {
            error(err.response?.data?.message || 'Upload ảnh thất bại');
        } finally {
            setUploadingState(null);
        }
    };

    // Remove image
    const handleRemoveImage = (state: string) => {
        setFormData(prev => ({ ...prev, [state]: '' }));
    };

    const handleCreate = async () => {
        if (!formData.name.trim()) return;
        try {
            await api.post('/pet-types', formData);
            success('Thêm loại pet thành công!');
            setFormData(defaultFormData);
            setShowCreateModal(false);
            loadPetTypes();
        } catch (err: any) {
            error(err.response?.data?.message || 'Thêm loại pet thất bại');
        }
    };

    const handleUpdate = async () => {
        if (!editingPet || !formData.name.trim()) return;
        try {
            await api.put(`/pet-types/${editingPet.id}`, formData);
            success('Cập nhật loại pet thành công!');
            setFormData(defaultFormData);
            setEditingPet(null);
            loadPetTypes();
        } catch (err: any) {
            error(err.response?.data?.message || 'Cập nhật thất bại');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa loại pet này?')) return;
        try {
            await api.delete(`/pet-types/${id}`);
            success('Xóa loại pet thành công!');
            loadPetTypes();
        } catch (err: any) {
            error(err.response?.data?.message || 'Xóa thất bại');
        }
    };

    const openEditModal = (pet: PetType) => {
        setEditingPet(pet);
        setFormData({
            name: pet.name,
            max_level: pet.max_level,
            rarity: pet.rarity || 'normal',
            price: pet.price || 0,
            is_default: pet.is_default || false,
            is_active: pet.is_active ?? true,
            image_idle: pet.image_idle || '',
            image_happy: pet.image_happy || '',
            image_eating: pet.image_eating || '',
            image_hungry: pet.image_hungry || '',
            image_sleeping: pet.image_sleeping || '',
        });
    };

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}${path}`;
    };

    const filteredPets = petTypes.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRarity = !filterRarity || p.rarity === filterRarity;
        return matchSearch && matchRarity;
    });

    if (isLoading) return <PageLoading message="Đang tải danh sách loại pet..." />;

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Pet</h1>
                    <p className="text-gray-500">{petTypes.length} loại pet trong hệ thống</p>
                </div>
                <button
                    onClick={() => {
                        setFormData(defaultFormData);
                        setShowCreateModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} />
                    Thêm loại pet
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm loại pet..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <select
                    value={filterRarity}
                    onChange={(e) => setFilterRarity(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">Tất cả độ hiếm</option>
                    <option value="normal">Thường</option>
                    <option value="rare">Hiếm</option>
                    <option value="epic">Sử thi</option>
                    <option value="legendary">Huyền thoại</option>
                </select>
            </div>

            {/* Pet Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredPets.map((pet) => {
                    const rarity = rarityConfig[pet.rarity] || rarityConfig.normal;
                    return (
                        <div key={pet.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow relative">
                            {/* Badges */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                {pet.is_default && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs font-medium rounded-full flex items-center gap-1">
                                        <Check size={10} /> Mặc định
                                    </span>
                                )}
                                <span className={`px-2 py-0.5 ${rarity.bg} ${rarity.color} text-xs font-medium rounded-full`}>
                                    {rarity.label}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="absolute top-2 right-2 flex gap-1">
                                <button
                                    onClick={() => openEditModal(pet)}
                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                >
                                    <Edit size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(pet.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {/* Avatar */}
                            <div className="w-20 h-20 mx-auto mt-6 mb-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center overflow-hidden">
                                {pet.image_idle ? (
                                    <img src={getImageUrl(pet.image_idle)} alt={pet.name} className="w-16 h-16 object-contain" />
                                ) : (
                                    <span className="text-4xl">{petEmojis[pet.name] || '🐾'}</span>
                                )}
                            </div>

                            <h3 className="font-semibold text-gray-900 text-center">{pet.name}</h3>

                            <div className="mt-2 space-y-1 text-center">
                                <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                    Max Lv.{pet.max_level}
                                </p>
                                {pet.price > 0 && (
                                    <p className="text-sm text-yellow-600 font-medium">
                                        🪙 {pet.price} xu
                                    </p>
                                )}
                            </div>

                            {/* Images indicator */}
                            <div className="mt-2 flex justify-center gap-1">
                                {imageStates.map(state => (
                                    <span
                                        key={state.key}
                                        className={`w-2 h-2 rounded-full ${pet[state.key as keyof PetType]
                                                ? `bg-${state.color}-400`
                                                : 'bg-gray-200'
                                            }`}
                                        title={`${state.label}: ${pet[state.key as keyof PetType] ? 'Có' : 'Không'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredPets.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🐾</div>
                    <p className="text-gray-500">Không tìm thấy loại pet nào</p>
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || editingPet) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-3xl my-8 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            {editingPet ? <Edit size={20} /> : <Plus size={20} />}
                            {editingPet ? 'Chỉnh sửa loại pet' : 'Thêm loại pet mới'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="font-medium text-gray-800 border-b pb-2">Thông tin cơ bản</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên loại pet *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="VD: Dragon, Cat, Dog..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        autoFocus
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Level tối đa</label>
                                        <input
                                            type="number"
                                            value={formData.max_level}
                                            onChange={(e) => setFormData({ ...formData, max_level: Number(e.target.value) })}
                                            min={1}
                                            max={100}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá (xu)</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                            min={0}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Độ hiếm</label>
                                    <select
                                        value={formData.rarity}
                                        onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="normal">Thường (Normal)</option>
                                        <option value="rare">Hiếm (Rare)</option>
                                        <option value="epic">Sử thi (Epic)</option>
                                        <option value="legendary">Huyền thoại (Legendary)</option>
                                    </select>
                                </div>

                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_default}
                                            onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700">Pet mặc định</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700">Kích hoạt</span>
                                    </label>
                                </div>
                            </div>

                            {/* Image Uploads */}
                            <div className="space-y-3">
                                <h3 className="font-medium text-gray-800 border-b pb-2 flex items-center gap-2">
                                    <Image size={16} />
                                    Ảnh trạng thái
                                </h3>

                                <div className="grid grid-cols-1 gap-3">
                                    {imageStates.map(state => {
                                        const imageUrl = formData[state.key as keyof typeof formData] as string;
                                        const isUploading = uploadingState === state.key;

                                        return (
                                            <div key={state.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                {/* Preview */}
                                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed ${imageUrl ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-white'
                                                    }`}>
                                                    {imageUrl ? (
                                                        <img
                                                            src={getImageUrl(imageUrl)}
                                                            alt={state.label}
                                                            className="w-14 h-14 object-contain"
                                                        />
                                                    ) : (
                                                        <span className="text-2xl opacity-50">{state.emoji}</span>
                                                    )}
                                                </div>

                                                {/* Info & Actions */}
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {state.emoji} {state.label}
                                                    </p>

                                                    <div className="flex gap-2 mt-1">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            ref={el => { fileInputRefs.current[state.key] = el; }}
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleImageUpload(state.key, file);
                                                            }}
                                                            className="hidden"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => fileInputRefs.current[state.key]?.click()}
                                                            disabled={isUploading}
                                                            className={`flex items-center gap-1 px-3 py-1 text-xs rounded-lg transition-colors ${isUploading
                                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                                                }`}
                                                        >
                                                            {isUploading ? (
                                                                <>
                                                                    <span className="animate-spin">⏳</span> Đang tải...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Upload size={12} />
                                                                    {imageUrl ? 'Đổi ảnh' : 'Tải lên'}
                                                                </>
                                                            )}
                                                        </button>

                                                        {imageUrl && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveImage(state.key)}
                                                                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Preview All */}
                                {(formData.image_idle || formData.image_happy || formData.image_eating) && (
                                    <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-2 font-medium">Preview tất cả ảnh:</p>
                                        <div className="flex justify-center gap-2 flex-wrap">
                                            {imageStates.map(state => {
                                                const imgUrl = formData[state.key as keyof typeof formData] as string;
                                                if (!imgUrl) return null;
                                                return (
                                                    <div key={state.key} className="text-center">
                                                        <img
                                                            src={getImageUrl(imgUrl)}
                                                            alt={state.label}
                                                            className="w-12 h-12 object-contain rounded-lg bg-white shadow"
                                                        />
                                                        <p className="text-[10px] text-gray-500 mt-1">{state.emoji}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingPet(null);
                                    setFormData(defaultFormData);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={editingPet ? handleUpdate : handleCreate}
                                disabled={!formData.name.trim()}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {editingPet ? 'Cập nhật' : 'Thêm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
