import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

// Trạng thái của pet
export type PetState = 'idle' | 'happy' | 'eating' | 'hungry' | 'sleeping';

interface PetImages {
    idle?: string;
    happy?: string;
    eating?: string;
    hungry?: string;
    sleeping?: string;
}

interface StaticPetProps {
    // Ảnh cho từng trạng thái
    images?: PetImages;
    // Emoji fallback khi không có ảnh
    fallbackEmoji?: string;
    // Trạng thái hiện tại
    state?: PetState;
    // Kích thước
    size?: 'sm' | 'md' | 'lg' | 'xl';
    // Class bổ sung
    className?: string;
    // Animation khi thay đổi state
    animate?: boolean;
    // Click handler
    onClick?: () => void;
}

// Mapping size
const sizeMap = {
    sm: { container: 'w-16 h-16', emoji: 'text-4xl', img: 'w-14 h-14' },
    md: { container: 'w-24 h-24', emoji: 'text-6xl', img: 'w-20 h-20' },
    lg: { container: 'w-32 h-32', emoji: 'text-7xl', img: 'w-28 h-28' },
    xl: { container: 'w-40 h-40', emoji: 'text-8xl', img: 'w-36 h-36' },
};

// Animation classes cho từng state
const stateAnimations: Record<PetState, string> = {
    idle: 'animate-float',
    happy: 'animate-bounce',
    eating: 'animate-pulse',
    hungry: 'animate-shake',
    sleeping: 'animate-pulse-slow',
};

// Helper function to get full image URL
const getFullImageUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
};

export default function StaticPet({
    images,
    fallbackEmoji = '🐾',
    state = 'idle',
    size = 'md',
    className = '',
    animate = true,
    onClick,
}: StaticPetProps) {
    const [currentState, setCurrentState] = useState<PetState>(state);
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    const sizeConfig = sizeMap[size];
    
    // Lấy ảnh theo state, fallback về idle nếu không có
    const getImageForState = (s: PetState): string | undefined => {
        if (!images) return undefined;
        const imageUrl = images[s] || images.idle;
        return getFullImageUrl(imageUrl);
    };
    
    const currentImage = getImageForState(currentState);
    
    // Handle state change với animation
    useEffect(() => {
        if (state !== currentState) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentState(state);
                setIsTransitioning(false);
            }, 150);
        }
    }, [state, currentState]);

    return (
        <div 
            className={`
                ${sizeConfig.container} 
                flex items-center justify-center
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
            onClick={onClick}
        >
            {currentImage ? (
                <img 
                    src={currentImage}
                    alt="Pet"
                    className={`
                        ${sizeConfig.img}
                        object-contain
                        transition-all duration-300
                        ${isTransitioning ? 'scale-90 opacity-50' : 'scale-100 opacity-100'}
                        ${animate ? stateAnimations[currentState] : ''}
                    `}
                    draggable={false}
                />
            ) : (
                <span 
                    className={`
                        ${sizeConfig.emoji}
                        transition-all duration-300
                        ${isTransitioning ? 'scale-90 opacity-50' : 'scale-100 opacity-100'}
                        ${animate ? stateAnimations[currentState] : ''}
                    `}
                >
                    {fallbackEmoji}
                </span>
            )}
        </div>
    );
}

// Hook để quản lý state pet
export function usePetState(initialState: PetState = 'idle') {
    const [state, setState] = useState<PetState>(initialState);
    const [tempState, setTempState] = useState<PetState | null>(null);

    // Hiển thị state tạm thời rồi quay về state chính
    const showTemporaryState = (newState: PetState, duration: number = 2000) => {
        setTempState(newState);
        setTimeout(() => {
            setTempState(null);
        }, duration);
    };

    // State hiển thị (ưu tiên temp state)
    const displayState = tempState || state;

    return {
        state,
        displayState,
        setState,
        showTemporaryState,
        // Shortcuts
        showHappy: (duration?: number) => showTemporaryState('happy', duration),
        showEating: (duration?: number) => showTemporaryState('eating', duration),
    };
}

// CSS Animations (thêm vào global CSS hoặc dùng inline)
export const petAnimationStyles = `
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
    }
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
    }
    @keyframes pulse-slow {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    .animate-float { animation: float 2s ease-in-out infinite; }
    .animate-shake { animation: shake 0.5s ease-in-out infinite; }
    .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
`;
