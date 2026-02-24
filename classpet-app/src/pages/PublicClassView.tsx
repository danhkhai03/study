import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosClient';
import { Trophy, Sparkles, Star, X, TrendingUp, Package, Heart, Utensils } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

// Helper function to get full image URL
const getImageUrl = (path?: string): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
};

interface ShopItem {
    id: number;
    name: string;
    preview_emoji: string;
    type: string;
    rarity: number;
}

interface Student {
    id: number;
    name: string;
    points_balance: number;
    total_points_earned: number;
    equipped_frame_id: number | null;
    equipped_background_id: number | null;
    equipped_frame: ShopItem | null;
    equipped_background: ShopItem | null;
    pet: {
        id: number;
        nickname: string;
        level: number;
        current_exp: number;
        is_hungry: boolean;
        hunger_level: number;
        happiness_level: number;
        mood: string;
        type: {
            id: number;
            name: string;
            rarity: string;
            image_idle?: string;
            image_happy?: string;
            image_eating?: string;
            image_hungry?: string;
            image_sleeping?: string;
        }
    } | null;
}

interface InventoryItem {
    id: number;
    quantity: number;
    pet_food: {
        id: number;
        name: string;
        emoji: string;
        hunger_restore: number;
        happiness_boost: number;
    };
}

interface Classroom {
    id: number;
    name: string;
}

// Pet emoji mapping with cute animals
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

// Frame styles based on rarity - with beautiful effects!
const frameStyles: Record<number, { ring: string; glow: string; animation: string }> = {
    1: { 
        ring: 'ring-4 ring-gray-300', 
        glow: 'shadow-lg shadow-gray-300/50',
        animation: ''
    },
    2: { 
        ring: 'ring-4 ring-blue-400', 
        glow: 'shadow-lg shadow-blue-400/60',
        animation: 'animate-pulse-slow'
    },
    3: { 
        ring: 'ring-[6px] ring-purple-500', 
        glow: 'shadow-xl shadow-purple-500/70',
        animation: 'animate-glow-purple'
    },
    4: { 
        ring: 'ring-[8px] ring-yellow-400', 
        glow: 'shadow-2xl shadow-yellow-400/80',
        animation: 'animate-glow-gold'
    },
};

// Background colors based on emoji - vibrant and visible!
const backgroundStyles: Record<string, string> = {
    '🌿': 'from-green-300 via-emerald-200 to-lime-300',
    '🏖️': 'from-cyan-300 via-sky-200 to-blue-300',
    '🌸': 'from-pink-300 via-rose-200 to-fuchsia-300',
    '🌌': 'from-indigo-400 via-purple-300 to-violet-400',
    '🏰': 'from-amber-200 via-stone-200 to-slate-300',
    '🌈': 'from-red-300 via-yellow-200 via-green-200 to-blue-300',
    '🍭': 'from-pink-400 via-purple-300 to-fuchsia-400',
};

// Pastel colors for cards
const cardColors = [
    'from-pink-200 to-rose-300',
    'from-blue-200 to-cyan-300',
    'from-green-200 to-emerald-300',
    'from-yellow-200 to-amber-300',
    'from-purple-200 to-violet-300',
    'from-orange-200 to-red-300',
    'from-teal-200 to-cyan-300',
    'from-indigo-200 to-blue-300',
];

export default function PublicClassView() {
    const { slug } = useParams();
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [animatingStudent, setAnimatingStudent] = useState<number | null>(null);

    const loadData = useCallback(async () => {
        try {
            const res = await api.get(`/public/classrooms/${slug}`);
            
            // Check for changes to trigger animations
            const newStudents = res.data.students;
            
            // Debug: Log equipped items
            console.log('📺 TV View - Students with equipment:', newStudents.map((s: Student) => ({
                name: s.name,
                frame: s.equipped_frame?.name || 'None',
                frameEmoji: s.equipped_frame?.preview_emoji,
                background: s.equipped_background?.name || 'None',
                bgEmoji: s.equipped_background?.preview_emoji,
            })));
            
            if (students.length > 0) {
                newStudents.forEach((newS: Student) => {
                    const oldS = students.find(s => s.id === newS.id);
                    if (oldS && (
                        newS.points_balance !== oldS.points_balance ||
                        newS.pet?.level !== oldS.pet?.level ||
                        newS.equipped_frame_id !== oldS.equipped_frame_id ||
                        newS.equipped_background_id !== oldS.equipped_background_id
                    )) {
                        setAnimatingStudent(newS.id);
                        setTimeout(() => setAnimatingStudent(null), 2000);
                    }
                });
            }

            setClassroom(res.data);
            setStudents(newStudents);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [slug, students]);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, [slug]);

    // Sort by total points earned
    const rankedStudents = [...students].sort((a, b) => b.total_points_earned - a.total_points_earned);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-8xl animate-bounce mb-4">🐾</div>
                    <p className="text-2xl font-bold text-purple-600">Đang tải ClassPet...</p>
                    <div className="flex justify-center gap-2 mt-4">
                        {['🐱', '🐕', '🐰', '🦊'].map((emoji, i) => (
                            <span key={i} className="text-3xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                                {emoji}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!classroom) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 flex items-center justify-center">
                <div className="text-center bg-white/80 p-8 rounded-3xl shadow-xl">
                    <div className="text-6xl mb-4">😿</div>
                    <h1 className="text-2xl font-bold text-gray-700 mb-2">Không tìm thấy lớp học</h1>
                    <p className="text-gray-500">Đường dẫn không hợp lệ hoặc lớp học không tồn tại.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-cyan-100 overflow-hidden relative">
            {/* Animated Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 text-6xl animate-float">⭐</div>
                <div className="absolute top-20 right-20 text-5xl animate-float-delay">🌈</div>
                <div className="absolute bottom-20 left-20 text-6xl animate-float">🎈</div>
                <div className="absolute bottom-10 right-10 text-5xl animate-float-delay">🌟</div>
                <div className="absolute top-1/3 left-5 text-4xl animate-float">💫</div>
                <div className="absolute top-1/2 right-5 text-4xl animate-float-delay">✨</div>
                {/* Floating bubbles */}
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-8 h-8 bg-white/40 rounded-full animate-bubble"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 p-6 md:p-8">
                {/* Header */}
                <header className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 rounded-full shadow-lg mb-4 backdrop-blur-sm">
                        <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                        <span className="font-bold text-purple-600">Bảng Xếp Hạng Thú Cưng</span>
                        <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 drop-shadow-lg">
                            {classroom.name}
                        </span>
                        <span className="ml-3 text-5xl">🏫</span>
                    </h1>
                    
                    <p className="text-xl text-purple-600 font-medium">
                        🐾 {students.length} Bạn nhỏ • Nhấn vào để xem thú cưng!
                    </p>
                </header>

                {/* Top 3 Podium */}
                {rankedStudents.length >= 3 && (
                    <div className="flex justify-center items-end gap-4 mb-10">
                        {/* 2nd Place */}
                        <TopStudentCard 
                            student={rankedStudents[1]} 
                            rank={2} 
                            onClick={() => setSelectedStudent(rankedStudents[1])}
                            isAnimating={animatingStudent === rankedStudents[1].id}
                        />
                        
                        {/* 1st Place */}
                        <TopStudentCard 
                            student={rankedStudents[0]} 
                            rank={1} 
                            onClick={() => setSelectedStudent(rankedStudents[0])}
                            isAnimating={animatingStudent === rankedStudents[0].id}
                        />
                        
                        {/* 3rd Place */}
                        <TopStudentCard 
                            student={rankedStudents[2]} 
                            rank={3} 
                            onClick={() => setSelectedStudent(rankedStudents[2])}
                            isAnimating={animatingStudent === rankedStudents[2].id}
                        />
                    </div>
                )}

                {/* Other Students Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 max-w-7xl mx-auto">
                    {rankedStudents.slice(rankedStudents.length >= 3 ? 3 : 0).map((student, index) => (
                        <StudentCard 
                            key={student.id} 
                            student={student} 
                            rank={rankedStudents.length >= 3 ? index + 4 : index + 1}
                            colorIndex={index}
                            onClick={() => setSelectedStudent(student)}
                            isAnimating={animatingStudent === student.id}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {students.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-8xl mb-4">🥚</div>
                        <h2 className="text-2xl font-bold text-purple-600">Chưa có học sinh nào</h2>
                        <p className="text-gray-500">Lớp học đang chờ các bạn nhỏ!</p>
                    </div>
                )}
            </div>

            {/* Pet Detail Modal */}
            {selectedStudent && (
                <PetDetailModal 
                    student={selectedStudent} 
                    onClose={() => setSelectedStudent(null)}
                    onStudentUpdated={(updatedStudent) => {
                        setStudents(prev => prev.map(s => 
                            s.id === updatedStudent.id ? updatedStudent : s
                        ));
                    }}
                />
            )}

            {/* Custom CSS for animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(10deg); }
                }
                @keyframes float-delay {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(-10deg); }
                }
                @keyframes bubble {
                    0% { transform: translateY(100vh) scale(0); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(-100vh) scale(1); opacity: 0; }
                }
                @keyframes glow-gold {
                    0%, 100% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.8), 0 0 40px rgba(234, 179, 8, 0.6), 0 0 60px rgba(234, 179, 8, 0.4); }
                    50% { box-shadow: 0 0 30px rgba(234, 179, 8, 1), 0 0 60px rgba(234, 179, 8, 0.8), 0 0 90px rgba(234, 179, 8, 0.6); }
                }
                @keyframes glow-purple {
                    0%, 100% { box-shadow: 0 0 15px rgba(168, 85, 247, 0.7), 0 0 30px rgba(168, 85, 247, 0.5); }
                    50% { box-shadow: 0 0 25px rgba(168, 85, 247, 0.9), 0 0 50px rgba(168, 85, 247, 0.7); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.9; transform: scale(1.02); }
                }
                @keyframes sparkle {
                    0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
                    50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px) rotate(-2deg); }
                    75% { transform: translateX(4px) rotate(2deg); }
                }
                @keyframes particle {
                    0% { opacity: 1; }
                    100% { opacity: 0; transform: rotate(var(--r, 0deg)) translateY(-80px); }
                }
                .animate-float { animation: float 3s ease-in-out infinite; }
                .animate-float-delay { animation: float-delay 4s ease-in-out infinite; }
                .animate-bubble { animation: bubble 5s ease-in-out infinite; }
                .animate-glow-gold { animation: glow-gold 2s ease-in-out infinite; }
                .animate-glow-purple { animation: glow-purple 2s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
                .animate-sparkle { animation: sparkle 1.5s ease-in-out infinite; }
                .animate-shake { animation: shake 0.5s ease-in-out infinite; }
            `}</style>
        </div>
    );
}

// Top 3 Student Card (Podium)
function TopStudentCard({ student, rank, onClick, isAnimating }: { 
    student: Student; 
    rank: number; 
    onClick: () => void;
    isAnimating: boolean;
}) {
    const heights = { 1: 'h-32', 2: 'h-24', 3: 'h-20' };
    const podiumColors = {
        1: 'from-yellow-300 to-amber-400',
        2: 'from-gray-300 to-slate-400',
        3: 'from-orange-300 to-amber-500',
    };
    const sizes = { 1: 'w-44 md:w-52', 2: 'w-38 md:w-44', 3: 'w-38 md:w-44' };
    const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
    
    // Frame style with effects
    const frame = student.equipped_frame 
        ? frameStyles[student.equipped_frame.rarity] 
        : null;
    
    // Background style
    const bgEmoji = student.equipped_background?.preview_emoji;
    const bgStyle = bgEmoji && backgroundStyles[bgEmoji] ? backgroundStyles[bgEmoji] : 'from-white to-gray-50';

    return (
        <div className={`flex flex-col items-center ${rank === 1 ? 'order-2' : rank === 2 ? 'order-1' : 'order-3'}`}>
            {/* Student Card with Background */}
            <div 
                onClick={onClick}
                className={`${sizes[rank as 1 | 2 | 3]} bg-gradient-to-br ${bgStyle} rounded-3xl p-4 text-center shadow-xl cursor-pointer mb-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl border-4 border-white/80 relative overflow-hidden ${
                    isAnimating ? 'animate-bounce ring-4 ring-yellow-400' : ''
                }`}
            >
                {/* Background decoration emoji */}
                {student.equipped_background && (
                    <>
                        <span className="absolute top-1 right-1 text-2xl opacity-30">{bgEmoji}</span>
                        <span className="absolute bottom-1 left-1 text-2xl opacity-30">{bgEmoji}</span>
                    </>
                )}
                
                {/* Medal & Frame Indicator */}
                <div className="flex justify-center items-center gap-2 mb-2 relative z-10">
                    <span className="text-3xl">{medals[rank as 1 | 2 | 3]}</span>
                    {student.equipped_frame && (
                        <span className="text-xl animate-bounce">{student.equipped_frame.preview_emoji}</span>
                    )}
                </div>
                
                {/* Pet Avatar with Frame */}
                <div className={`w-18 h-18 md:w-22 md:h-22 mx-auto mb-3 rounded-full bg-gradient-to-br ${podiumColors[rank as 1 | 2 | 3]} flex items-center justify-center border-4 border-white relative z-10 overflow-hidden ${frame ? `${frame.ring} ${frame.glow} ${frame.animation}` : 'shadow-lg'}`}>
                    {getImageUrl(student.pet?.type?.image_idle) ? (
                        <img 
                            src={getImageUrl(student.pet?.type?.image_idle)!}
                            alt={student.pet?.type?.name}
                            className={`w-14 h-14 md:w-18 md:h-18 object-contain ${isAnimating ? 'animate-bounce' : 'animate-float'}`}
                        />
                    ) : (
                        <span className={`text-4xl md:text-5xl ${isAnimating ? 'animate-bounce' : 'animate-float'}`}>
                            {getPetEmoji(student.pet?.type?.name)}
                        </span>
                    )}
                </div>
                
                <h3 className="font-bold text-gray-800 text-lg truncate">{student.name}</h3>
                
                {student.pet && (
                    <p className="text-sm text-purple-500 font-medium flex items-center justify-center gap-1">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        Lv.{student.pet.level}
                    </p>
                )}
                
                <div className="mt-2 flex items-center justify-center gap-1 text-yellow-600 font-bold text-xl">
                    <span>🪙</span>
                    <span>{student.points_balance}</span>
                </div>
            </div>

            {/* Podium */}
            <div className={`${sizes[rank as 1 | 2 | 3]} ${heights[rank as 1 | 2 | 3]} bg-gradient-to-t ${podiumColors[rank as 1 | 2 | 3]} rounded-t-2xl flex items-start justify-center pt-3 shadow-lg`}>
                <div className="flex items-center gap-1 font-black text-white text-2xl drop-shadow-lg">
                    {rank === 1 && <Trophy className="w-6 h-6" />}
                    #{rank}
                </div>
            </div>
        </div>
    );
}

// Regular Student Card
function StudentCard({ student, rank, colorIndex, onClick, isAnimating }: { 
    student: Student; 
    rank: number; 
    colorIndex: number;
    onClick: () => void;
    isAnimating: boolean;
}) {
    // Use equipped background or default color
    const defaultColor = cardColors[colorIndex % cardColors.length];
    const bgEmoji = student.equipped_background?.preview_emoji;
    const bgColor = bgEmoji && backgroundStyles[bgEmoji] ? backgroundStyles[bgEmoji] : defaultColor;
    
    // Frame style with effects based on equipped frame
    const frame = student.equipped_frame 
        ? frameStyles[student.equipped_frame.rarity]
        : null;
    
    // Check if has any equipped items
    const hasEquippedItems = student.equipped_frame || student.equipped_background;
    
    return (
        <div 
            onClick={onClick}
            className={`bg-gradient-to-br ${bgColor} rounded-3xl p-5 flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg border-4 border-white/50 relative overflow-hidden ${
                isAnimating ? 'animate-bounce ring-4 ring-yellow-400' : ''
            } ${hasEquippedItems ? 'ring-2 ring-white/70' : ''}`}
        >
            {/* Background decoration emoji */}
            {student.equipped_background && (
                <>
                    <span className="absolute top-1 right-1 text-3xl opacity-20">{bgEmoji}</span>
                    <span className="absolute bottom-1 left-1 text-3xl opacity-20">{bgEmoji}</span>
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl opacity-10">{bgEmoji}</span>
                </>
            )}
            
            {/* Rank Badge & Frame indicator */}
            <div className="w-full flex justify-between items-center mb-2 relative z-10">
                <div className="bg-white/90 px-3 py-1 rounded-full text-sm font-bold text-gray-700 shadow">
                    #{rank}
                </div>
                {student.equipped_frame && (
                    <div className="bg-white/90 px-2 py-1 rounded-full text-sm shadow flex items-center gap-1 animate-pulse-slow">
                        <span>{student.equipped_frame.preview_emoji}</span>
                    </div>
                )}
            </div>

            {/* Pet Display with Frame */}
            <div className={`w-20 h-20 bg-white/90 rounded-full flex items-center justify-center mb-3 border-4 border-white relative z-10 overflow-hidden ${frame ? `${frame.ring} ${frame.glow} ${frame.animation}` : 'shadow-lg'}`}>
                {getImageUrl(student.pet?.type?.image_idle) ? (
                    <img 
                        src={getImageUrl(student.pet?.type?.image_idle)!}
                        alt={student.pet?.type?.name}
                        className={`w-16 h-16 object-contain ${isAnimating ? 'animate-bounce' : 'animate-float'}`}
                    />
                ) : (
                    <span className={`text-4xl ${isAnimating ? 'animate-bounce' : 'animate-float'}`}>
                        {getPetEmoji(student.pet?.type?.name)}
                    </span>
                )}
                {/* Frame decoration */}
                {student.equipped_frame?.rarity === 4 && (
                    <span className="absolute -top-2 -right-2 text-xl animate-bounce">{student.equipped_frame.preview_emoji}</span>
                )}
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-1 truncate w-full text-center">{student.name}</h3>
            
            {student.pet && (
                <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-full text-sm font-medium text-purple-600">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    Lv.{student.pet.level} {student.pet.type?.name}
                </div>
            )}

            {/* EXP Bar */}
            {student.pet && (
                <div className="w-full mt-3">
                    <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min((student.pet.current_exp / (student.pet.level * 100)) * 100, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 text-center">
                        {student.pet.current_exp}/{student.pet.level * 100} EXP
                    </p>
                </div>
            )}

            {/* Coins */}
            <div className="mt-3 flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full shadow">
                <span className="text-xl">🪙</span>
                <span className="font-bold text-yellow-700 text-lg">{student.points_balance}</span>
            </div>
        </div>
    );
}

// Pet Detail Modal with Feeding
function PetDetailModal({ student, onClose, onStudentUpdated }: { student: Student; onClose: () => void; onStudentUpdated?: (student: Student) => void }) {
    const [pet, setPet] = useState(student.pet);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [feedingFood, setFeedingFood] = useState<InventoryItem | null>(null);
    const [showParticles, setShowParticles] = useState(false);
    const [petState, setPetState] = useState<'idle' | 'happy' | 'eating' | 'hungry'>('idle');
    const expProgress = pet ? (pet.current_exp / (pet.level * 100)) * 100 : 0;

    // Xác định trạng thái pet dựa trên mood/hunger
    useEffect(() => {
        if (!pet) return;
        if (pet.hunger_level <= 30) {
            setPetState('hungry');
        } else if (pet.happiness_level >= 70) {
            setPetState('happy');
        } else {
            setPetState('idle');
        }
    }, [pet?.hunger_level, pet?.happiness_level]);

    // Load inventory
    useEffect(() => {
        loadInventory();
    }, [student.id]);

    const loadInventory = async () => {
        try {
            const res = await api.get(`/public/students/${student.id}/inventory`);
            setInventory(res.data);
        } catch (err) {
            console.error('Failed to load inventory:', err);
        }
    };

    // Handle feeding
    const handleFeed = async (item: InventoryItem) => {
        if (loading || item.quantity <= 0 || !pet) return;

        setLoading(true);
        setFeedingFood(item);
        setPetState('eating'); // Chuyển sang ảnh eating

        try {
            const res = await api.post(`/public/students/${student.id}/feed-pet`, {
                pet_food_id: item.pet_food.id,
            });

            // Show particles
            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 1500);

            // Update pet state
            setPet(res.data.pet);
            
            // Notify parent
            if (onStudentUpdated) {
                onStudentUpdated({ ...student, pet: res.data.pet });
            }

            // Update inventory
            setInventory(prev => prev.map(i => 
                i.id === item.id 
                    ? { ...i, quantity: i.quantity - 1 }
                    : i
            ).filter(i => i.quantity > 0));

            // Chuyển sang ảnh happy sau khi ăn xong
            setTimeout(() => {
                setPetState('happy');
                // Quay về idle sau 2 giây
                setTimeout(() => setPetState('idle'), 2000);
            }, 1000);

        } catch (err: any) {
            console.error('Feed failed:', err);
            alert(err.response?.data?.message || 'Không thể cho ăn!');
            setPetState('idle');
        } finally {
            setLoading(false);
            setFeedingFood(null);
        }
    };

    // Lấy ảnh theo trạng thái
    const getPetImage = () => {
        if (!pet?.type) return null;
        const { type } = pet;
        let imagePath = null;
        switch (petState) {
            case 'happy': imagePath = type.image_happy || type.image_idle; break;
            case 'eating': imagePath = type.image_eating || type.image_happy || type.image_idle; break;
            case 'hungry': imagePath = type.image_hungry || type.image_idle; break;
            default: imagePath = type.image_idle;
        }
        return getImageUrl(imagePath);
    };

    const getMoodEmoji = () => {
        if (!pet) return '😴';
        switch (petState) {
            case 'happy': return '😊';
            case 'eating': return '😋';
            case 'hungry': return '😢';
            default: return '😐';
        }
    };

    // Animation class dựa trên state
    const getPetAnimation = () => {
        switch (petState) {
            case 'happy': return 'animate-bounce';
            case 'eating': return 'animate-pulse';
            case 'hungry': return 'animate-shake';
            default: return 'animate-float';
        }
    };

    const petImage = getPetImage();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            
            {/* Modal */}
            <div 
                className="relative bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 rounded-[2rem] w-full max-w-lg shadow-2xl animate-bounce-in overflow-hidden max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg z-10"
                >
                    <X size={24} className="text-gray-600" />
                </button>

                {/* Header with Pet */}
                <div className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 pt-8 pb-16 px-6 text-center relative">
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute text-2xl"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    opacity: 0.3,
                                }}
                            >
                                ✨
                            </div>
                        ))}
                    </div>
                    
                    <h2 className="text-3xl font-black text-white drop-shadow-lg relative z-10">
                        {student.name}
                    </h2>
                    <p className="text-white/80 font-medium relative z-10">Thú cưng của tớ</p>
                </div>

                {/* Pet Avatar - Floating */}
                <div className="flex justify-center -mt-12 relative z-10">
                    <div className={`relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-white overflow-hidden`}>
                        {/* Hiển thị ảnh hoặc emoji */}
                        {petImage ? (
                            <img 
                                src={petImage}
                                alt={pet?.type?.name || 'Pet'}
                                className={`w-28 h-28 object-contain transition-all duration-300 ${getPetAnimation()}`}
                                draggable={false}
                            />
                        ) : (
                            <span className={`text-7xl transition-all duration-300 ${getPetAnimation()}`}>
                                {getPetEmoji(pet?.type?.name)}
                            </span>
                        )}
                        
                        {/* Food flying animation */}
                        {feedingFood && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-4xl animate-ping">
                                    {feedingFood.pet_food.emoji}
                                </span>
                            </div>
                        )}

                        {/* Particles */}
                        {showParticles && (
                            <div className="absolute inset-0 pointer-events-none">
                                {[...Array(8)].map((_, i) => (
                                    <span
                                        key={i}
                                        className="absolute text-2xl"
                                        style={{
                                            left: '50%',
                                            top: '50%',
                                            animation: `particle 1s ease-out forwards`,
                                            transform: `rotate(${i * 45}deg) translateY(-40px)`,
                                        }}
                                    >
                                        ✨
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Mood indicator */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-lg">
                            {getMoodEmoji()}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 pt-4">
                    {pet ? (
                        <>
                            {/* Pet Name & Level */}
                            <div className="text-center mb-4">
                                <h3 className="text-2xl font-bold text-gray-800">
                                    {pet.nickname || pet.type?.name}
                                </h3>
                                <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mt-2">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-bold text-purple-600">Level {pet.level}</span>
                                    <span className="text-purple-400">{pet.type?.name}</span>
                                </div>
                            </div>

                            {/* Hunger & Happiness Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {/* Hunger */}
                                <div className="bg-white/80 rounded-xl p-3 shadow">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Utensils className="text-orange-400" size={18} />
                                        <span className="text-sm font-medium text-gray-600">Độ no</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-3 rounded-full transition-all duration-500 ${
                                                (pet.hunger_level || 50) > 60 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                                                (pet.hunger_level || 50) > 30 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                                'bg-gradient-to-r from-red-400 to-rose-500'
                                            }`}
                                            style={{ width: `${pet.hunger_level || 50}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{pet.hunger_level || 50}/100</p>
                                </div>

                                {/* Happiness */}
                                <div className="bg-white/80 rounded-xl p-3 shadow">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Heart className="text-pink-400" size={18} />
                                        <span className="text-sm font-medium text-gray-600">Vui vẻ</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-3 rounded-full transition-all duration-500 ${
                                                (pet.happiness_level || 50) > 60 ? 'bg-gradient-to-r from-pink-400 to-rose-500' :
                                                (pet.happiness_level || 50) > 30 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                                'bg-gradient-to-r from-blue-400 to-indigo-500'
                                            }`}
                                            style={{ width: `${pet.happiness_level || 50}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{pet.happiness_level || 50}/100</p>
                                </div>
                            </div>

                            {/* EXP Progress */}
                            <div className="bg-white/80 rounded-xl p-3 mb-4 shadow">
                                <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                                    <span className="flex items-center gap-1">
                                        <TrendingUp size={16} className="text-green-500" />
                                        Kinh nghiệm
                                    </span>
                                    <span>{pet.current_exp} / {pet.level * 100} EXP</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-1000"
                                        style={{ width: `${expProgress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Inventory - Food Bag */}
                            <div className="bg-white/80 rounded-xl p-4 shadow mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Package className="text-purple-500" size={18} />
                                    <span className="font-bold text-gray-700">Túi đồ ăn ({inventory.length})</span>
                                </div>

                                {inventory.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-2">
                                        {inventory.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleFeed(item)}
                                                disabled={loading || item.quantity <= 0}
                                                className={`
                                                    relative group
                                                    bg-gradient-to-br from-amber-50 to-orange-50
                                                    hover:from-amber-100 hover:to-orange-100
                                                    border-2 border-amber-200 hover:border-amber-400
                                                    rounded-xl p-2 transition-all duration-200
                                                    disabled:opacity-50 disabled:cursor-not-allowed
                                                    ${loading ? 'animate-pulse' : ''}
                                                `}
                                                title={`${item.pet_food.name}\n🍖 +${item.pet_food.hunger_restore} | 💖 +${item.pet_food.happiness_boost}`}
                                            >
                                                <div className="text-2xl group-hover:scale-110 transition-transform">
                                                    {item.pet_food.emoji}
                                                </div>
                                                {/* Quantity badge */}
                                                <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                    {item.quantity}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <span className="text-3xl">🎒</span>
                                        <p className="text-sm text-gray-500 mt-1">Túi đồ trống! Hãy mua đồ ăn trong shop 🛒</p>
                                    </div>
                                )}

                                <p className="text-xs text-gray-400 mt-2 text-center">
                                    👆 Bấm vào đồ ăn để cho pet ăn
                                </p>
                            </div>

                            {/* Coins */}
                            <div className="bg-gradient-to-r from-yellow-200 to-amber-200 rounded-xl p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl">🪙</span>
                                    <div>
                                        <p className="text-xs text-yellow-700">Số xu</p>
                                        <p className="text-2xl font-black text-yellow-800">{student.points_balance}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-yellow-700">Tổng đã kiếm</p>
                                    <p className="text-lg font-bold text-yellow-800">{student.total_points_earned}</p>
                                </div>
                            </div>

                            {/* Equipped Items */}
                            {(student.equipped_frame || student.equipped_background) && (
                                <div className="mt-4 bg-white/80 rounded-xl p-3 shadow">
                                    <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                                        <Sparkles size={14} className="text-purple-500" />
                                        Vật phẩm đang trang bị
                                    </p>
                                    <div className="flex gap-2">
                                        {student.equipped_frame && (
                                            <div className="flex-1 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-2 text-center">
                                                <span className="text-2xl">{student.equipped_frame.preview_emoji}</span>
                                                <p className="text-xs text-gray-600">{student.equipped_frame.name}</p>
                                            </div>
                                        )}
                                        {student.equipped_background && (
                                            <div className="flex-1 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg p-2 text-center">
                                                <span className="text-2xl">{student.equipped_background.preview_emoji}</span>
                                                <p className="text-xs text-gray-600">{student.equipped_background.name}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4">🥚</div>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có thú cưng</h3>
                            <p className="text-gray-500">Bạn nhỏ này đang chờ được nhận thú cưng!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
