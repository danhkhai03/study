import { useEffect, useState } from 'react';
import api from '../api/axiosClient';
import { Link } from 'react-router-dom';
import { Plus, Users, Search, MoreVertical, Trash2, ExternalLink } from 'lucide-react';
import { Button, Modal, Input, EmptyState, CardSkeleton } from '../components/ui';
import { ConfirmDialog } from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';
import type { Classroom } from '../types';

export default function Dashboard() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { success, error: showError } = useToast();

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<Classroom | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Dropdown menu
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    useEffect(() => {
        loadClassrooms();
    }, []);

    const loadClassrooms = async () => {
        try {
            const res = await api.get('/classrooms');
            setClassrooms(res.data);
        } catch (err) {
            showError('Failed to load classrooms');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClassName.trim()) return;

        setIsCreating(true);
        try {
            await api.post('/classrooms', { name: newClassName });
            setShowCreateModal(false);
            setNewClassName('');
            success('Classroom created successfully!');
            loadClassrooms();
        } catch (err) {
            showError('Failed to create classroom');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteClass = async () => {
        if (!deleteTarget) return;

        setIsDeleting(true);
        try {
            await api.delete(`/classrooms/${deleteTarget.id}`);
            success('Classroom deleted successfully');
            setClassrooms(prev => prev.filter(c => c.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) {
            showError('Failed to delete classroom');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredClassrooms = classrooms.filter(cls =>
        cls.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Stats
    const totalStudents = classrooms.reduce((acc, cls) => acc + (cls.students_count || 0), 0);

    if (isLoading) {
        return (
            <div>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Classrooms</h1>
                    <p className="text-gray-500 mt-1">
                        {classrooms.length} classroom{classrooms.length !== 1 ? 's' : ''} • {totalStudents} student{totalStudents !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus size={20} />}>
                    New Classroom
                </Button>
            </div>

            {/* Search */}
            {classrooms.length > 0 && (
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search classrooms..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
            )}

            {/* Classrooms Grid */}
            {filteredClassrooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClassrooms.map(cls => (
                        <div
                            key={cls.id}
                            className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
                        >
                            <Link to={`/teacher/class/${cls.id}`} className="block p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                        {cls.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div
                                        className="relative"
                                        onClick={e => e.preventDefault()}
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === cls.id ? null : cls.id);
                                            }}
                                            className="p-2 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <MoreVertical size={16} className="text-gray-400" />
                                        </button>

                                        {openMenuId === cls.id && (
                                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                                                <button
                                                    onClick={() => {
                                                        window.open(`/public/${cls.public_slug}`, '_blank');
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    <ExternalLink size={16} className="mr-2 text-gray-400" />
                                                    Open TV View
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setDeleteTarget(cls);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} className="mr-2" />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{cls.name}</h3>
                                <p className="text-sm text-gray-500 flex items-center">
                                    <Users size={14} className="mr-1" />
                                    {cls.students_count || 0} students
                                </p>
                            </Link>

                            {/* Quick Action Footer */}
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
                                <p className="text-xs text-gray-400 truncate">
                                    Code: <span className="font-mono">{cls.public_slug?.substring(0, 8)}...</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : classrooms.length > 0 ? (
                <EmptyState
                    title="No classrooms found"
                    description={`No classrooms match "${searchQuery}"`}
                    action={{ label: 'Clear Search', onClick: () => setSearchQuery('') }}
                />
            ) : (
                <EmptyState
                    icon={<Users className="w-16 h-16" />}
                    title="No classrooms yet"
                    description="Create your first classroom to get started with ClassPet!"
                    action={{ label: 'Create Classroom', onClick: () => setShowCreateModal(true) }}
                />
            )}

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Classroom"
            >
                <form onSubmit={handleCreateClass}>
                    <Input
                        label="Classroom Name"
                        placeholder="e.g., Grade 5A, Math Class"
                        value={newClassName}
                        onChange={e => setNewClassName(e.target.value)}
                        autoFocus
                        required
                    />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowCreateModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isCreating}>
                            Create
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteClass}
                title="Delete Classroom"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone and all students data will be lost.`}
                confirmText="Delete"
                variant="danger"
                isLoading={isDeleting}
            />

            {/* Click outside to close menu */}
            {openMenuId && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setOpenMenuId(null)}
                />
            )}
        </div>
    );
}
