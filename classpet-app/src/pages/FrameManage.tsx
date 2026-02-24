import { useEffect, useState } from 'react';
import api from '../api/axiosClient';
import { useToast } from '../contexts/ToastContext';
import { Plus, Trash2, Edit, Search, Sparkles } from 'lucide-react';
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

export default function FrameManage() {
    const [frames, setFrames] = useState<ShopItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingFrame, setEditingFrame] = useState<ShopItem | null>(null);
    const [formData, setFormData] = useState({
        name: '', description: '', price: 50, preview_emoji: '⭐', rarity: 1
    });
    const { success, error } = useToast();

    const loadFrames = async () => {
        try {
            const res = await api.get('/shop/items?type=avatar_frame');
            setFrames(res.data);
        } catch (err) {
            error('Không thể tải danh sách khung avatar');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFrames();
    }, []);

    const handleCreate = async () => {
        if (!formData.name.trim()) return;
        try {
            await api.post('/shop/items', { ...formData, type: 'avatar_frame' });
            success('Thêm khung avatar thành công!');
            setFormData({ name: '', description: '', price: 50, preview_emoji: '⭐', rarity: 1 });
            setShowCreateModal(false);
            loadFrames();
        } catch (err: any) {
            error(err.response?.data?.message || 'Thêm khung thất bại');
        }
    };

    const handleUpdate = async () => {
        if (!editingFrame || !formData.name.trim()) return;
        try {
            await api.put(`/shop/items/${editingFrame.id}`, { ...formData, type: 'avatar_frame' });
            success('Cập nhật khung avatar thành công!');
            setFormData({ name: '', description: '', price: 50, preview_emoji: '⭐', rarity: 1 });
            setEditingFrame(null);
            loadFrames();
        } catch (err: any) {
            error(err.response?.data?.message || 'Cập nhật thất bại');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa khung avatar này?')) return;
        try {
            await api.delete(`/shop/items/${id}`);
            success('Xóa khung avatar thành công!');
            loadFrames();
        } catch (err: any) {
            error(err.response?.data?.message || 'Xóa thất bại');
        }
    };

    const filteredFrames = frames.filter(f => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <PageLoading message="Đang tải danh sách khung avatar..." />;

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý khung avatar</h1>
                    <p className="text-gray-500">{frames.length} khung avatar trong cửa hàng</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} />
                    Thêm khung avatar
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Tìm kiếm khung avatar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            {/* Frames Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredFrames.map((frame) => (
                    <div key={frame.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                                frame.rarity === 4 ? 'bg-gradient-to-br from-yellow-200 to-amber-300 ring-4 ring-yellow-400 animate-pulse' :
                                frame.rarity === 3 ? 'bg-gradient-to-br from-purple-200 to-violet-300 ring-4 ring-purple-400' :
                                frame.rarity === 2 ? 'bg-gradient-to-br from-blue-200 to-cyan-300 ring-4 ring-blue-400' :
                                'bg-gray-100 ring-4 ring-gray-300'
                            }`}>
                                {frame.preview_emoji}
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => {
                                        setEditingFrame(frame);
                                        setFormData({
                                            name: frame.name,
                                            description: frame.description || '',
                                            price: frame.price,
                                            preview_emoji: frame.preview_emoji,
                                            rarity: frame.rarity
                                        });
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                >
                                    <Edit size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(frame.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <h3 className="font-semibold text-gray-900">{frame.name}</h3>
                        <div className="flex items-center justify-between mt-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rarityLabels[frame.rarity]?.color}`}>
                                {rarityLabels[frame.rarity]?.label}
                            </span>
                            <span className="flex items-center gap-1 text-yellow-600 font-medium text-sm">
                                🪙 {frame.price}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredFrames.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🖼️</div>
                    <p className="text-gray-500">Không tìm thấy khung avatar nào</p>
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || editingFrame) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Sparkles className="text-purple-500" size={20} />
                            {editingFrame ? 'Chỉnh sửa khung' : 'Thêm khung mới'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khung</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="VD: Khung Vàng Kim"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Mô tả về khung avatar..."
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
                                        placeholder="⭐"
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
                                    setEditingFrame(null);
                                    setFormData({ name: '', description: '', price: 50, preview_emoji: '⭐', rarity: 1 });
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={editingFrame ? handleUpdate : handleCreate}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                {editingFrame ? 'Cập nhật' : 'Thêm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
