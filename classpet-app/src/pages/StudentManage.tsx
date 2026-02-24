import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosClient';
import { useToast } from '../contexts/ToastContext';
import { Plus, Trash2, Edit, Search, ShoppingBag, Star, Filter, Check } from 'lucide-react';
import { PageLoading } from '../components/ui';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
const getImageUrl = (path?: string): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
};

interface Classroom {
    id: number;
    name: string;
}

interface PetType {
    id: number;
    name: string;
    image_idle?: string;
    rarity: string;
    is_default: boolean;
}

interface Pet {
    id: number;
    nickname: string;
    level: number;
    current_exp: number;
    type: {
        id: number;
        name: string;
        image_idle?: string;
    };
}

interface Student {
    id: number;
    name: string;
    points_balance: number;
    total_points_earned: number;
    classroom_id: number;
    classroom?: Classroom;
    pet?: Pet;
}

const petEmojis: Record<string, string> = {
    'Dragon': '🐉', 'Cat': '🐱', 'Dog': '🐕', 'Rabbit': '🐰', 'Fox': '🦊',
    'Unicorn': '🦄', 'Wolf': '🐺', 'Bear': '🐻', 'Panda': '🐼', 'Hamster': '🐹',
    'Fire Cat': '🔥', 'Water Dog': '💧', 'Earth Rabbit': '🌿', 'Wind Bird': '🌬️',
    'Tiger': '🐯', 'Lion': '🦁', 'Koala': '🐨', 'Owl': '🦉', 'Phoenix': '🔥',
};

export default function StudentManage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [defaultPets, setDefaultPets] = useState<PetType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClassroom, setFilterClassroom] = useState<number | ''>('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState({ name: '', classroom_id: '', pet_type_id: '' });
    const { success, error } = useToast();

    const loadData = async () => {
        try {
            const [studentsRes, classroomsRes, petsRes] = await Promise.all([
                api.get('/students/all'),
                api.get('/classrooms'),
                api.get('/pet-types-default')
            ]);
            setStudents(studentsRes.data);
            setClassrooms(classroomsRes.data);
            setDefaultPets(petsRes.data);
        } catch (err) {
            error('Không thể tải dữ liệu');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = async () => {
        if (!formData.name.trim() || !formData.classroom_id) return;
        try {
            // Tạo học sinh với pet mặc định
            const payload: any = {
                name: formData.name,
                classroom_id: formData.classroom_id,
            };
            if (formData.pet_type_id) {
                payload.pet_type_id = formData.pet_type_id;
            }
            await api.post('/students', payload);
            success('Thêm học sinh thành công!');
            setFormData({ name: '', classroom_id: '', pet_type_id: '' });
            setShowCreateModal(false);
            loadData();
        } catch (err: any) {
            error(err.response?.data?.message || 'Thêm học sinh thất bại');
        }
    };

    const handleUpdate = async () => {
        if (!editingStudent || !formData.name.trim()) return;
        try {
            await api.put(`/students/${editingStudent.id}`, {
                name: formData.name,
                classroom_id: formData.classroom_id,
            });
            success('Cập nhật học sinh thành công!');
            setFormData({ name: '', classroom_id: '', pet_type_id: '' });
            setEditingStudent(null);
            loadData();
        } catch (err: any) {
            error(err.response?.data?.message || 'Cập nhật thất bại');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa học sinh này?')) return;
        try {
            await api.delete(`/students/${id}`);
            success('Xóa học sinh thành công!');
            loadData();
        } catch (err: any) {
            error(err.response?.data?.message || 'Xóa thất bại');
        }
    };

    const filteredStudents = students.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchClassroom = filterClassroom === '' || s.classroom_id === filterClassroom;
        return matchSearch && matchClassroom;
    });

    if (isLoading) return <PageLoading message="Đang tải danh sách học sinh..." />;

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý học sinh</h1>
                    <p className="text-gray-500">{students.length} học sinh trong hệ thống</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ name: '', classroom_id: '', pet_type_id: '' });
                        setShowCreateModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} />
                    Thêm học sinh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm học sinh..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-400" />
                    <select
                        value={filterClassroom}
                        onChange={(e) => setFilterClassroom(e.target.value ? Number(e.target.value) : '')}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Tất cả lớp</option>
                        {classrooms.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Học sinh</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Lớp</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Pet</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Xu</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tổng điểm</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                                                {student.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-900">{student.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                                            {classrooms.find(c => c.id === student.classroom_id)?.name || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {student.pet ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{petEmojis[student.pet.type?.name] || '🐾'}</span>
                                                <div>
                                                    <p className="text-sm font-medium">{student.pet.nickname || student.pet.type?.name}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                                        Lv.{student.pet.level}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Chưa có pet</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-1 text-yellow-600 font-medium">
                                            🪙 {student.points_balance}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-green-600 font-medium">{student.total_points_earned}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link
                                                to={`/teacher/class/${student.classroom_id}/student/${student.id}/shop`}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Cửa hàng"
                                            >
                                                <ShoppingBag size={16} />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setEditingStudent(student);
                                                    setFormData({ 
                                                        name: student.name, 
                                                        classroom_id: String(student.classroom_id),
                                                        pet_type_id: ''
                                                    });
                                                }}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(student.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredStudents.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">👨‍🎓</div>
                        <p className="text-gray-500">Không tìm thấy học sinh nào</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingStudent) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingStudent ? 'Chỉnh sửa học sinh' : 'Thêm học sinh mới'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên học sinh *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nhập tên học sinh"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lớp học *</label>
                                <select
                                    value={formData.classroom_id}
                                    onChange={(e) => setFormData({ ...formData, classroom_id: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">Chọn lớp học</option>
                                    {classrooms.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Pet Selection - Chỉ hiển thị khi tạo mới */}
                            {!editingStudent && defaultPets.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Chọn Pet khởi đầu (miễn phí) 🐾
                                    </label>
                                    <p className="text-xs text-gray-500 mb-3">
                                        💡 Chỉ có pet <span className="font-semibold text-green-600">Normal</span> là miễn phí. Pet hiếm hơn cần mua trong Shop!
                                    </p>
                                    <div className="grid grid-cols-5 gap-2">
                                        {defaultPets.map((pet) => {
                                            const isSelected = formData.pet_type_id === String(pet.id);
                                            return (
                                                <button
                                                    key={pet.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, pet_type_id: String(pet.id) })}
                                                    className={`relative p-3 rounded-xl border-2 transition-all ${
                                                        isSelected 
                                                            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' 
                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                                                            <Check size={12} className="text-white" />
                                                        </div>
                                                    )}
                                                    <div className="text-3xl mb-1">
                                                        {getImageUrl(pet.image_idle) ? (
                                                            <img src={getImageUrl(pet.image_idle)!} alt={pet.name} className="w-10 h-10 object-contain mx-auto" />
                                                        ) : (
                                                            petEmojis[pet.name] || '🐾'
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-600 truncate">{pet.name}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        * Nếu không chọn, hệ thống sẽ tự động gán pet ngẫu nhiên
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingStudent(null);
                                    setFormData({ name: '', classroom_id: '', pet_type_id: '' });
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={editingStudent ? handleUpdate : handleCreate}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                {editingStudent ? 'Cập nhật' : 'Thêm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
