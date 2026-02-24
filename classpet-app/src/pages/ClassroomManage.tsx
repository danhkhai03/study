import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosClient';
import { useToast } from '../contexts/ToastContext';
import { Plus, Trash2, Edit, Users, ExternalLink, Copy, Check, Eye } from 'lucide-react';
import { PageLoading } from '../components/ui';

interface Classroom {
    id: number;
    name: string;
    public_slug: string;
    students_count?: number;
    created_at: string;
}

export default function ClassroomManage() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
    const [newName, setNewName] = useState('');
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const { success, error } = useToast();

    const loadClassrooms = async () => {
        try {
            const res = await api.get('/classrooms');
            setClassrooms(res.data);
        } catch (err) {
            error('Không thể tải danh sách lớp học');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadClassrooms();
    }, []);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        try {
            await api.post('/classrooms', { name: newName });
            success('Tạo lớp học thành công!');
            setNewName('');
            setShowCreateModal(false);
            loadClassrooms();
        } catch (err: any) {
            error(err.response?.data?.message || 'Tạo lớp học thất bại');
        }
    };

    const handleUpdate = async () => {
        if (!editingClassroom || !newName.trim()) return;
        try {
            await api.put(`/classrooms/${editingClassroom.id}`, { name: newName });
            success('Cập nhật lớp học thành công!');
            setNewName('');
            setEditingClassroom(null);
            loadClassrooms();
        } catch (err: any) {
            error(err.response?.data?.message || 'Cập nhật thất bại');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa lớp học này? Tất cả học sinh trong lớp sẽ bị xóa!')) return;
        try {
            await api.delete(`/classrooms/${id}`);
            success('Xóa lớp học thành công!');
            loadClassrooms();
        } catch (err: any) {
            error(err.response?.data?.message || 'Xóa thất bại');
        }
    };

    const copyPublicLink = (classroom: Classroom) => {
        const link = `${window.location.origin}/public/${classroom.public_slug}`;
        navigator.clipboard.writeText(link);
        setCopiedId(classroom.id);
        success('Đã copy link TV!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (isLoading) return <PageLoading message="Đang tải danh sách lớp học..." />;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý lớp học</h1>
                    <p className="text-gray-500">Tạo và quản lý các lớp học của bạn</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} />
                    Tạo lớp học
                </button>
            </div>

            {/* Classroom Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classrooms.map((classroom) => (
                    <div key={classroom.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{classroom.name}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Users size={14} />
                                    {classroom.students_count || 0} học sinh
                                </p>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => {
                                        setEditingClassroom(classroom);
                                        setNewName(classroom.name);
                                    }}
                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Chỉnh sửa"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(classroom.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Xóa"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link
                                to={`/teacher/class/${classroom.id}`}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                            >
                                <Eye size={16} />
                                Xem lớp
                            </Link>
                            <button
                                onClick={() => copyPublicLink(classroom)}
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                title="Copy link TV"
                            >
                                {copiedId === classroom.id ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                            <a
                                href={`/public/${classroom.public_slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                                title="Mở TV view"
                            >
                                <ExternalLink size={16} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {classrooms.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lớp học nào</h3>
                    <p className="text-gray-500 mb-4">Tạo lớp học đầu tiên của bạn để bắt đầu!</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Tạo lớp học
                    </button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || editingClassroom) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingClassroom ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}
                        </h2>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Tên lớp học (VD: Lớp 1A)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingClassroom(null);
                                    setNewName('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={editingClassroom ? handleUpdate : handleCreate}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                {editingClassroom ? 'Cập nhật' : 'Tạo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
