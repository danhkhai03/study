import { useEffect, useState } from 'react';
import api from '../api/axiosClient';
import { useToast } from '../contexts/ToastContext';
import { Plus, Trash2, Edit, Search, Palette } from 'lucide-react';
import { PageLoading } from '../components/ui';

interface ShopItem {
    id: number;
    name: string;
    description: string;
    type: string;
    price: number;
    preview_emoji: string;
    rarity: number;
    is_active: boolean;
}

const rarityLabels: Record<number, { label: string; color: string }> = {
    1: { label: 'Thường', color: 'bg-gray-100 text-gray-600' },
    2: { label: 'Hiếm', color: 'bg-blue-100 text-blue-600' },
    3: { label: 'Sử Thi', color: 'bg-purple-100 text-purple-600' },
    4: { label: 'Huyền Thoại', color: 'bg-yellow-100 text-yellow-700' },
};

const bgGradients: Record<string, string> = {
    '🌿': 'from-green-200 to-emerald-300',
    '🏖️': 'from-cyan-200 to-blue-300',
    '🌸': 'from-pink-200 to-rose-300',
    '🌌': 'from-indigo-300 to-purple-400',
    '🏰': 'from-amber-200 to-stone-300',
    '🌈': 'from-red-200 via-yellow-200 to-blue-200',
    '🍭': 'from-pink-300 to-purple-300',
};

export default function BackgroundManage() {
    const [backgrounds, setBackgrounds] = useState<ShopItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingBg, setEditingBg] = useState<ShopItem | null>(null);
    const [formData, setFormData] = useState({
        name: '', description: '', price: 50, preview_emoji: '🌿', rarity: 1
    });
    const { success, error } = useToast();

    const loadBackgrounds = async () => {
        try {
            const res = await api.get('/shop/items?type=background');
            setBackgrounds(res.data);
        } catch (err) {
            error('Không thể tải danh sách nền avatar');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadBackgrounds();
    }, []);

    const handleCreate = async () => {
        if (!formData.name.trim()) return;
        try {
            await api.post('/shop/items', { ...formData, type: 'background' });
            success('Thêm nền avatar thành công!');
            setFormData({ name: '', description: '', price: 50, preview_emoji: '🌿', rarity: 1 });
            setShowCreateModal(false);
            loadBackgrounds();
        } catch (err: any) {
            error(err.response?.data?.message || 'Thêm nền thất bại');
        }
    };

    const handleUpdate = async () => {
        if (!editingBg || !formData.name.trim()) return;
        try {
            await api.put(`/shop/items/${editingBg.id}`, { ...formData, type: 'background' });
            success('Cập nhật nền avatar thành công!');
            setFormData({ name: '', description: '', price: 50, preview_emoji: '🌿', rarity: 1 });
            setEditingBg(null);
            loadBackgrounds();
        } catch (err: any) {
            error(err.response?.data?.message || 'Cập nhật thất bại');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa nền avatar này?')) return;
        try {
            await api.delete(`/shop/items/${id}`);
            success('Xóa nền avatar thành công!');
            loadBackgrounds();
        } catch (err: any) {
            error(err.response?.data?.message || 'Xóa thất bại');
        }
    };

    const filteredBackgrounds = backgrounds.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <PageLoading message="Đang tải danh sách nền avatar..." />;

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý nền avatar</h1>
                    <p className="text-gray-500">{backgrounds.length} nền avatar trong cửa hàng</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} />
                    Thêm nền avatar
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Tìm kiếm nền avatar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            {/* Backgrounds Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredBackgrounds.map((bg) => (
                    <div key={bg.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                        {/* Preview */}
                        <div className={`h-24 bg-gradient-to-br ${bgGradients[bg.preview_emoji] || 'from-gray-100 to-gray-200'} flex items-center justify-center`}>
                            <span className="text-5xl">{bg.preview_emoji}</span>
                        </div>
                        
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-900">{bg.name}</h3>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => {
                                            setEditingBg(bg);
                                            setFormData({
                                                name: bg.name,
                                                description: bg.description || '',
                                                price: bg.price,
                                                preview_emoji: bg.preview_emoji,
                                                rarity: bg.rarity
                                            });
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(bg.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rarityLabels[bg.rarity]?.color}`}>
                                    {rarityLabels[bg.rarity]?.label}
                                </span>
                                <span className="flex items-center gap-1 text-yellow-600 font-medium text-sm">
                                    🪙 {bg.price}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredBackgrounds.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-gray-500">Không tìm thấy nền avatar nào</p>
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || editingBg) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Palette className="text-pink-500" size={20} />
                            {editingBg ? 'Chỉnh sửa nền' : 'Thêm nền mới'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên nền</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="VD: Nền Bãi Biển"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Mô tả về nền avatar..."
                                    rows={2}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Emoji hiển thị</label>
                                    <input
                                        type="text"
                                        value={formData.preview_emoji}
                                        onChange={(e) => setFormData({ ...formData, preview_emoji: e.target.value })}
                                        placeholder="🌿"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-2xl text-center"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá (xu)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        min={1}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Độ hiếm</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 2, 3, 4].map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rarity: r })}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                formData.rarity === r
                                                    ? rarityLabels[r].color + ' ring-2 ring-offset-1 ring-indigo-500'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                        >
                                            {rarityLabels[r].label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingBg(null);
                                    setFormData({ name: '', description: '', price: 50, preview_emoji: '🌿', rarity: 1 });
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={editingBg ? handleUpdate : handleCreate}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                {editingBg ? 'Cập nhật' : 'Thêm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
