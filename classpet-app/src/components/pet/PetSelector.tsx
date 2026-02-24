import { useState, useEffect } from 'react';
import { Check, Star, Lock } from 'lucide-react';
import api from '../../api/axiosClient';

interface PetType {
    id: number;
    name: string;
    base_asset_url: string;
    rarity: string;
    price: number;
    is_default: boolean;
}

interface PetSelectorProps {
    selectedPetId: number | null;
    onSelect: (petTypeId: number) => void;
    mode?: 'default' | 'shop' | 'all';
    studentPoints?: number;
    classroomId?: number;
}

export default function PetSelector({
    selectedPetId,
    onSelect,
    mode = 'default',
    studentPoints = 0,
    classroomId,
}: PetSelectorProps) {
    const [pets, setPets] = useState<PetType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPets();
    }, [mode, classroomId]);

    const loadPets = async () => {
        try {
            setLoading(true);
            let endpoint = '/pet-types';
            
            if (mode === 'default') {
                endpoint = '/pet-types-default';
            } else if (mode === 'shop' && classroomId) {
                endpoint = `/classrooms/${classroomId}/pet-types-shop`;
            }

            const res = await api.get(endpoint);
            setPets(res.data);
        } catch (err) {
            console.error('Failed to load pets:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRarityConfig = (rarity: string) => {
        switch (rarity) {
            case 'legendary':
                return {
                    bg: 'from-yellow-400 via-amber-400 to-yellow-500',
                    border: 'border-yellow-400',
                    badge: 'bg-yellow-500',
                    glow: 'shadow-yellow-400/50',
                    label: 'Huyền thoại',
                };
            case 'epic':
                return {
                    bg: 'from-purple-400 via-violet-400 to-purple-500',
                    border: 'border-purple-400',
                    badge: 'bg-purple-500',
                    glow: 'shadow-purple-400/50',
                    label: 'Sử thi',
                };
            case 'rare':
                return {
                    bg: 'from-blue-400 via-cyan-400 to-blue-500',
                    border: 'border-blue-400',
                    badge: 'bg-blue-500',
                    glow: 'shadow-blue-400/50',
                    label: 'Hiếm',
                };
            default:
                return {
                    bg: 'from-green-400 via-emerald-400 to-green-500',
                    border: 'border-green-400',
                    badge: 'bg-green-500',
                    glow: 'shadow-green-400/30',
                    label: 'Thường',
                };
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {mode === 'default' && (
                <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-700 mb-1">Chọn Pet cho học sinh</h3>
                    <p className="text-sm text-gray-500">Chọn 1 trong 5 pet mặc định</p>
                </div>
            )}

            <div className="grid grid-cols-5 gap-4">
                {pets.map((pet) => {
                    const config = getRarityConfig(pet.rarity);
                    const isSelected = selectedPetId === pet.id;
                    const canAfford = mode !== 'shop' || studentPoints >= pet.price;

                    return (
                        <button
                            key={pet.id}
                            onClick={() => canAfford && onSelect(pet.id)}
                            disabled={!canAfford && mode === 'shop'}
                            className={`
                                relative group rounded-2xl p-4 transition-all duration-300
                                ${isSelected 
                                    ? `bg-gradient-to-br ${config.bg} ring-4 ring-white shadow-xl ${config.glow}` 
                                    : `bg-white/80 border-2 ${config.border} hover:shadow-lg hover:-translate-y-1`
                                }
                                ${!canAfford && mode === 'shop' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            {/* Selected indicator */}
                            {isSelected && (
                                <div className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg z-10">
                                    <Check className="text-green-500" size={18} strokeWidth={3} />
                                </div>
                            )}

                            {/* Lock for unaffordable */}
                            {!canAfford && mode === 'shop' && (
                                <div className="absolute -top-2 -right-2 w-7 h-7 bg-gray-500 rounded-full flex items-center justify-center shadow-lg z-10">
                                    <Lock className="text-white" size={14} />
                                </div>
                            )}

                            {/* Pet emoji */}
                            <div className={`
                                text-5xl mb-3 
                                ${isSelected ? 'animate-bounce' : 'group-hover:scale-110'} 
                                transition-transform duration-300
                            `}>
                                {pet.base_asset_url}
                            </div>

                            {/* Pet name */}
                            <p className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                {pet.name}
                            </p>

                            {/* Rarity badge */}
                            <div className={`mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${config.badge} text-white inline-block`}>
                                {config.label}
                            </div>

                            {/* Price for shop mode */}
                            {mode === 'shop' && pet.price > 0 && (
                                <div className="mt-2 flex items-center justify-center gap-1">
                                    <Star className="text-yellow-400 fill-yellow-400" size={14} />
                                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                                        {pet.price}
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Current points display for shop mode */}
            {mode === 'shop' && (
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-500">
                        Điểm hiện có: <span className="font-bold text-yellow-600">{studentPoints} ⭐</span>
                    </p>
                </div>
            )}
        </div>
    );
}
