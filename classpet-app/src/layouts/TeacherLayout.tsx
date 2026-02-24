import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Settings, User, Menu, X, ChevronDown, School, Users, PawPrint, Image, Frame, Coins } from 'lucide-react';
import { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';

export default function TeacherLayout() {
    const { user, logout } = useAuthContext();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
        { name: 'Quản lý lớp học', href: '/teacher/classrooms', icon: School },
        { name: 'Quản lý học sinh', href: '/teacher/students', icon: Users },
        { name: 'Quản lý Pet', href: '/teacher/pets', icon: PawPrint },
        { name: 'Quản lý khung avatar', href: '/teacher/frames', icon: Frame },
        { name: 'Quản lý nền avatar', href: '/teacher/backgrounds', icon: Image },
        { name: 'Quản lý điểm', href: '/teacher/points', icon: Coins },
        { name: 'Cài đặt', href: '/teacher/settings', icon: Settings },
    ];

    const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200">
                {/* Logo */}
                <div className="flex items-center h-16 px-6 border-b border-gray-200">
                    <Link to="/teacher/dashboard" className="flex items-center space-x-2">
                        <span className="text-2xl">🐾</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            ClassPet
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                    active
                                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <Icon size={20} className={active ? 'text-indigo-600' : 'text-gray-400'} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-200">
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                {user?.name?.charAt(0).toUpperCase() || 'T'}
                            </div>
                            <div className="flex-1 ml-3 text-left">
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Teacher'}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown */}
                        {isProfileOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                                <Link
                                    to="/teacher/profile"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <User size={16} className="mr-2 text-gray-400" />
                                    My Profile
                                </Link>
                                <button
                                    onClick={logout}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <LogOut size={16} className="mr-2" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between h-16 px-4">
                    <Link to="/teacher/dashboard" className="flex items-center space-x-2">
                        <span className="text-2xl">🐾</span>
                        <span className="text-lg font-bold text-indigo-600">ClassPet</span>
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
                    <div
                        className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg"
                        onClick={e => e.stopPropagation()}
                    >
                        <nav className="px-4 py-4 space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                                            active
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Icon size={20} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                            <hr className="my-2" />
                            <div className="px-4 py-2">
                                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                <LogOut size={20} className="mr-3" />
                                Logout
                            </button>
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-auto lg:pt-0 pt-16">
                <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
