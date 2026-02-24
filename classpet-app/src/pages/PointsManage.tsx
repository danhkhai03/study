import { useEffect, useState } from 'react';
import api from '../api/axiosClient';
import { useToast } from '../contexts/ToastContext';
import { Search, Filter, Plus, Minus, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { PageLoading } from '../components/ui';

interface Classroom {
    id: number;
    name: string;
}

interface Student {
    id: number;
    name: string;
    points_balance: number;
    total_points_earned: number;
    classroom_id: number;
}

interface PointTransaction {
    id: number;
    student_id: number;
    amount: number;
    reason: string;
    created_at: string;
    student?: Student;
}

export default function PointsManage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [transactions, setTransactions] = useState<PointTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClassroom, setFilterClassroom] = useState<number | ''>('');
    const [showAddPointsModal, setShowAddPointsModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [pointAmount, setPointAmount] = useState(10);
    const [pointReason, setPointReason] = useState('');
    const [isAdding, setIsAdding] = useState(true);
    const { success, error } = useToast();

    const loadData = async () => {
        try {
            const [studentsRes, classroomsRes, transactionsRes] = await Promise.all([
                api.get('/students/all'),
                api.get('/classrooms'),
                api.get('/point-transactions')
            ]);
            setStudents(studentsRes.data);
            setClassrooms(classroomsRes.data);
            setTransactions(transactionsRes.data);
        } catch (err) {
            error('Không thể tải dữ liệu');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddPoints = async () => {
        if (!selectedStudent || pointAmount <= 0) return;
        try {
            const amount = isAdding ? pointAmount : -pointAmount;
            await api.post(`/students/${selectedStudent.id}/points`, {
                amount,
                reason: pointReason || (isAdding ? 'Thưởng điểm' : 'Trừ điểm'),
            });
            success(`${isAdding ? 'Cộng' : 'Trừ'} ${pointAmount} xu cho ${selectedStudent.name} thành công!`);
            setShowAddPointsModal(false);
            setSelectedStudent(null);
            setPointAmount(10);
            setPointReason('');
            loadData();
        } catch (err: any) {
            error(err.response?.data?.message || 'Thao tác thất bại');
        }
    };

    const quickAddPoints = async (student: Student, amount: number) => {
        try {
            await api.post(`/students/${student.id}/points`, {
                amount,
                reason: amount > 0 ? 'Thưởng nhanh' : 'Trừ nhanh',
            });
            success(`${amount > 0 ? '+' : ''}${amount} xu cho ${student.name}!`);
            loadData();
        } catch (err: any) {
            error(err.response?.data?.message || 'Thao tác thất bại');
        }
    };

    const filteredStudents = students.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchClassroom = filterClassroom === '' || s.classroom_id === filterClassroom;
        return matchSearch && matchClassroom;
    });

    if (isLoading) return <PageLoading message="Đang tải dữ liệu điểm..." />;

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý điểm</h1>
                <p className="text-gray-500">Cộng/trừ xu cho học sinh</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Students List */}
                <div className="lg:col-span-2">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
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

                    {/* Students Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredStudents.map((student) => (
                            <div key={student.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                                            {student.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{student.name}</h3>
                                            <p className="text-xs text-gray-500">
                                                {classrooms.find(c => c.id === student.classroom_id)?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-yellow-600 flex items-center gap-1">
                                            🪙 {student.points_balance}
                                        </p>
                                        <p className="text-xs text-gray-500">Tổng: {student.total_points_earned}</p>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => quickAddPoints(student, -5)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                    >
                                        <Minus size={14} /> 5
                                    </button>
                                    <button
                                        onClick={() => quickAddPoints(student, 5)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                    >
                                        <Plus size={14} /> 5
                                    </button>
                                    <button
                                        onClick={() => quickAddPoints(student, 10)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                    >
                                        <Plus size={14} /> 10
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedStudent(student);
                                            setShowAddPointsModal(true);
                                        }}
                                        className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                                    >
                                        Tùy chỉnh
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredStudents.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                            <div className="text-5xl mb-4">👨‍🎓</div>
                            <p className="text-gray-500">Không tìm thấy học sinh nào</p>
                        </div>
                    )}
                </div>

                {/* Right: Recent Transactions */}
                <div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-gray-400" />
                            Giao dịch gần đây
                        </h2>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            {transactions.slice(0, 20).map((tx) => (
                                <div key={tx.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                        {tx.amount > 0 ? (
                                            <TrendingUp size={14} className="text-green-600" />
                                        ) : (
                                            <TrendingDown size={14} className="text-red-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {tx.student?.name || `Student #${tx.student_id}`}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">{tx.reason}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(tx.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {transactions.length === 0 && (
                                <p className="text-center text-gray-500 py-8">Chưa có giao dịch nào</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Points Modal */}
            {showAddPointsModal && selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            {isAdding ? 'Cộng' : 'Trừ'} xu cho {selectedStudent.name}
                        </h2>
                        <p className="text-gray-500 mb-4">Số xu hiện tại: 🪙 {selectedStudent.points_balance}</p>

                        {/* Toggle Add/Subtract */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setIsAdding(true)}
                                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                                    isAdding
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <Plus size={16} className="inline mr-1" /> Cộng xu
                            </button>
                            <button
                                onClick={() => setIsAdding(false)}
                                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                                    !isAdding
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <Minus size={16} className="inline mr-1" /> Trừ xu
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số xu</label>
                                <input
                                    type="number"
                                    value={pointAmount}
                                    onChange={(e) => setPointAmount(Number(e.target.value))}
                                    min={1}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xl text-center"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do (tùy chọn)</label>
                                <input
                                    type="text"
                                    value={pointReason}
                                    onChange={(e) => setPointReason(e.target.value)}
                                    placeholder="VD: Làm bài tập tốt"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddPointsModal(false);
                                    setSelectedStudent(null);
                                    setPointAmount(10);
                                    setPointReason('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAddPoints}
                                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                                    isAdding
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {isAdding ? 'Cộng' : 'Trừ'} {pointAmount} xu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
