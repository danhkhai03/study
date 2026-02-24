import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';
import { 
    Plus, Gift, Utensils, ArrowLeft, ExternalLink, Search, Crown, Sparkles, 
    ShoppingBag, Minus, Star, TrendingUp
} from 'lucide-react';
import { Button, Modal, Input, PageLoading, EmptyState } from '../components/ui';
import { useToast } from '../contexts/ToastContext';
import type { Student, Classroom } from '../types';

// Pet emoji mapping
const petEmojis: Record<string, string> = {
    'Dragon': '🐉',
    'Cat': '🐱',
    'Dog': '🐕',
    'Rabbit': '🐰',
    'Fox': '🦊',
    'Unicorn': '🦄',
    'Phoenix': '🔥',
    'Wolf': '🐺',
    'Bear': '🐻',
    'Panda': '🐼',
    'Hamster': '🐹',
    'Koala': '🐨',
    'Tiger': '🐯',
    'Lion': '🦁',
    'Owl': '🦉',
};

const getPetEmoji = (typeName?: string) => {
    if (!typeName) return '🥚';
    return petEmojis[typeName] || '🐾';
};

export default function ClassManage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { success, error: showError } = useToast();

    // Modal states
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [newStudentName, setNewStudentName] = useState('');
    const [isAddingStudent, setIsAddingStudent] = useState(false);

    // Point modal
    const [pointModal, setPointModal] = useState<{ student: Student; type: 'add' | 'subtract' } | null>(null);
    const [pointAmount, setPointAmount] = useState('10');
    const [pointReason, setPointReason] = useState('');

    // Animation state for level up
    const [levelUpStudent, setLevelUpStudent] = useState<number | null>(null);

    const loadData = useCallback(async () => {
        try {
            const [clsRes, stuRes] = await Promise.all([
                api.get(`/classrooms/${id}`),
                api.get(`/classrooms/${id}/students`),
            ]);
            setClassroom(clsRes.data);
            setStudents(stuRes.data);
        } catch (err) {
            console.error('Failed to load class data', err);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStudentName.trim()) return;

        setIsAddingStudent(true);
        try {
            await api.post(`/classrooms/${id}/students`, { name: newStudentName });
            setNewStudentName('');
            setShowAddStudent(false);
            success('Student added successfully!');
            loadData();
        } catch (err) {
            showError('Failed to add student');
        } finally {
            setIsAddingStudent(false);
        }
    };

    const handleFeed = async (studentId: number) => {
        try {
            const response = await api.post(`/students/${studentId}/feed`, { food_amount: 1 });
            success('Cho ăn thành công! +50 EXP');
            
            // Update local state immediately (optimistic update)
            setStudents(prev => prev.map(s => {
                if (s.id === studentId) {
                    const newExp = (s.pet?.current_exp || 0) + 50;
                    const expForLevelUp = (s.pet?.level || 1) * 100;
                    const leveledUp = newExp >= expForLevelUp;
                    
                    return {
                        ...s,
                        points_balance: s.points_balance - 10,
                        pet: s.pet ? {
                            ...s.pet,
                            current_exp: leveledUp ? newExp - expForLevelUp : newExp,
                            level: leveledUp ? s.pet.level + 1 : s.pet.level,
                        } : null,
                    };
                }
                return s;
            }));
            
            // Check for level up
            if (response.data.leveledUp) {
                setLevelUpStudent(studentId);
                success(`🎉 Lên cấp! Level ${response.data.newLevel}!`);
                setTimeout(() => setLevelUpStudent(null), 3000);
            }
        } catch (err: any) {
            showError(err.response?.data?.message || 'Không thể cho ăn');
            loadData(); // Reload on error to sync state
        }
    };

    const handleQuickPoint = async (studentId: number, amount: number) => {
        // Optimistic update - update UI immediately
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                return {
                    ...s,
                    points_balance: s.points_balance + amount,
                    total_points_earned: amount > 0 ? s.total_points_earned + amount : s.total_points_earned,
                };
            }
            return s;
        }));
        
        try {
            await api.post(`/students/${studentId}/points`, { amount, reason: 'Thưởng/Phạt nhanh' });
            success(`${amount > 0 ? '+' : ''}${amount} xu!`);
        } catch (err) {
            showError('Thao tác thất bại');
            loadData(); // Reload on error to sync state
        }
    };

    const handleCustomPoint = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pointModal) return;

        const amount = pointModal.type === 'subtract' ? -Math.abs(Number(pointAmount)) : Math.abs(Number(pointAmount));
        const studentId = pointModal.student.id;
        
        // Optimistic update
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                return {
                    ...s,
                    points_balance: s.points_balance + amount,
                    total_points_earned: amount > 0 ? s.total_points_earned + amount : s.total_points_earned,
                };
            }
            return s;
        }));
        
        try {
            await api.post(`/students/${studentId}/points`, { 
                amount, 
                reason: pointReason || 'Điều chỉnh thủ công' 
            });
            success(`${amount > 0 ? '+' : ''}${amount} xu!`);
            setPointModal(null);
            setPointAmount('10');
            setPointReason('');
        } catch (err) {
            showError('Thao tác thất bại');
            loadData(); // Reload on error to sync state
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort by points for ranking
    const rankedStudents = [...filteredStudents].sort((a, b) => b.total_points_earned - a.total_points_earned);

    if (isLoading) {
        return <PageLoading message="Loading classroom..." />;
    }

    if (!classroom) {
        return (
            <EmptyState
                title="Không tìm thấy lớp học"
                description="Lớp học bạn tìm không tồn tại hoặc bạn không có quyền truy cập."
                action={{ label: 'Về Dashboard', onClick: () => window.location.href = '/teacher/dashboard' }}
            />
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <Link to="/teacher/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
                    <ArrowLeft size={16} className="mr-1" />
                    Quay lại Dashboard
                </Link>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {classroom.name}
                            <span className="text-2xl">🏫</span>
                        </h1>
                        <div className="flex items-center gap-4 mt-2">
                            <p className="text-sm text-gray-500">
                                🐾 {students.length} học sinh
                            </p>
                            <button
                                onClick={() => window.open(`/public/${classroom.public_slug}`, '_blank')}
                                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                            >
                                <ExternalLink size={14} className="mr-1" />
                                Mở TV View
                            </button>
                        </div>
                    </div>
                    <Button onClick={() => setShowAddStudent(true)} leftIcon={<Plus size={20} />}>
                        Thêm học sinh
                    </Button>
                </div>
            </div>

            {/* Search */}
            {students.length > 0 && (
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm học sinh..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
            )}

            {/* Students Grid */}
            {rankedStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rankedStudents.map((student, index) => (
                        <div
                            key={student.id}
                            className={`bg-white rounded-xl shadow-sm border transition-all duration-300 ${
                                levelUpStudent === student.id
                                    ? 'border-yellow-400 ring-2 ring-yellow-200 animate-pulse'
                                    : 'border-gray-200 hover:shadow-md hover:border-indigo-200'
                            }`}
                        >
                            <div className="p-6">
                                {/* Rank Badge */}
                                {index < 3 && (
                                    <div className="flex justify-end mb-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                            index === 1 ? 'bg-gray-100 text-gray-700' :
                                            'bg-orange-100 text-orange-800'
                                        }`}>
                                            <Crown size={12} className="mr-1" />
                                            #{index + 1}
                                        </span>
                                    </div>
                                )}

                                {/* Student Info */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        {/* Pet Avatar */}
                                        <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-2xl shadow-inner border-2 border-white">
                                            {getPetEmoji(student.pet?.type?.name)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                                            {student.pet ? (
                                                <p className="text-sm text-indigo-600 font-medium flex items-center">
                                                    <Star size={14} className="mr-1 fill-yellow-400 text-yellow-400" />
                                                    Lv.{student.pet.level} {student.pet.type?.name || 'Pet'}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-gray-400">🥚 Chưa có Pet</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="flex items-center gap-1 text-2xl font-bold text-yellow-500">
                                            <span className="text-lg">🪙</span>
                                            {student.points_balance}
                                        </span>
                                        <span className="text-xs text-gray-400">XU</span>
                                    </div>
                                </div>

                                {/* Pet EXP Bar */}
                                {student.pet && (
                                    <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>EXP</span>
                                            <span>{student.pet.current_exp} / {student.pet.level * 100}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min((student.pet.current_exp / (student.pet.level * 100)) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {/* Quick Points Row */}
                                    <button
                                        onClick={() => handleQuickPoint(student.id, 10)}
                                        className="flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all font-semibold text-sm border border-green-200"
                                    >
                                        <Plus size={16} />
                                        +10 xu
                                    </button>
                                    <button
                                        onClick={() => handleQuickPoint(student.id, -10)}
                                        className="flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-red-50 to-rose-50 text-red-600 hover:from-red-100 hover:to-rose-100 rounded-xl transition-all font-semibold text-sm border border-red-200"
                                    >
                                        <Minus size={16} />
                                        -10 xu
                                    </button>
                                </div>

                                {/* Custom Points Row */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <button
                                        onClick={() => setPointModal({ student, type: 'add' })}
                                        className="flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all font-medium text-sm border border-blue-200"
                                    >
                                        <Gift size={16} />
                                        Thưởng xu
                                    </button>
                                    <button
                                        onClick={() => setPointModal({ student, type: 'subtract' })}
                                        className="flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 hover:from-orange-100 hover:to-amber-100 rounded-xl transition-all font-medium text-sm border border-orange-200"
                                    >
                                        <TrendingUp size={16} className="rotate-180" />
                                        Trừ xu
                                    </button>
                                </div>

                                {/* Feed & Shop Row */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleFeed(student.id)}
                                        disabled={!student.pet || student.points_balance < 10}
                                        className="flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 hover:from-orange-200 hover:to-yellow-200 rounded-xl transition-all font-medium text-sm border border-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={!student.pet ? 'Chưa có pet' : student.points_balance < 10 ? 'Cần 10 xu' : 'Cho ăn (10 xu = 50 EXP)'}
                                    >
                                        <Utensils size={16} />
                                        Cho ăn
                                    </button>
                                    <button
                                        onClick={() => navigate(`/teacher/class/${id}/student/${student.id}/shop`)}
                                        className="flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-200 hover:to-pink-200 rounded-xl transition-all font-medium text-sm border border-purple-200"
                                    >
                                        <ShoppingBag size={16} />
                                        Cửa hàng
                                    </button>
                                </div>
                            </div>

                            {/* Stats Footer */}
                            <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-100 rounded-b-xl flex justify-between items-center">
                                <p className="text-xs text-gray-500">
                                    Tổng đã kiếm: <span className="font-semibold text-gray-700">{student.total_points_earned}</span> xu
                                </p>
                                <div className="flex items-center gap-1 text-xs text-purple-500">
                                    <Sparkles size={12} />
                                    #{index + 1} trong lớp
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : students.length > 0 ? (
                <EmptyState
                    title="Không tìm thấy học sinh"
                    description={`Không có học sinh nào khớp với "${searchQuery}"`}
                    action={{ label: 'Xóa tìm kiếm', onClick: () => setSearchQuery('') }}
                />
            ) : (
                <EmptyState
                    icon={<Plus className="w-16 h-16" />}
                    title="Chưa có học sinh"
                    description="Thêm học sinh đầu tiên để bắt đầu sử dụng ClassPet!"
                    action={{ label: 'Thêm học sinh', onClick: () => setShowAddStudent(true) }}
                />
            )}

            {/* Add Student Modal */}
            <Modal
                isOpen={showAddStudent}
                onClose={() => setShowAddStudent(false)}
                title="Thêm học sinh mới"
            >
                <form onSubmit={handleAddStudent}>
                    <Input
                        label="Tên học sinh"
                        placeholder="Nhập tên học sinh"
                        value={newStudentName}
                        onChange={e => setNewStudentName(e.target.value)}
                        autoFocus
                        required
                    />
                    <p className="text-sm text-gray-500 mt-2">
                        🐾 Học sinh sẽ được tự động nhận một thú cưng ngẫu nhiên.
                    </p>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="secondary" onClick={() => setShowAddStudent(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" isLoading={isAddingStudent}>
                            Thêm học sinh
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Custom Point Modal */}
            <Modal
                isOpen={!!pointModal}
                onClose={() => setPointModal(null)}
                title={pointModal ? `${pointModal.type === 'add' ? '🎁 Thưởng' : '📉 Trừ'} Xu - ${pointModal.student.name}` : ''}
            >
                <form onSubmit={handleCustomPoint}>
                    <div className="space-y-4">
                        <Input
                            label="Số xu"
                            type="number"
                            min="1"
                            value={pointAmount}
                            onChange={e => setPointAmount(e.target.value)}
                            required
                        />
                        <Input
                            label="Lý do (không bắt buộc)"
                            placeholder="VD: Làm bài tốt, Đi học trễ..."
                            value={pointReason}
                            onChange={e => setPointReason(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="secondary" onClick={() => setPointModal(null)}>
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant={pointModal?.type === 'subtract' ? 'danger' : 'primary'}
                        >
                            {pointModal?.type === 'add' ? 'Thưởng xu' : 'Trừ xu'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
