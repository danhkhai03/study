import { useState, useEffect, useCallback } from 'react';
import Lottie from 'lottie-react';

// URLs animations đã test và hoạt động tốt
const ANIMATIONS = {
    // Cute characters
    happyPuppy: 'https://assets9.lottiefiles.com/packages/lf20_xlmz9xwm.json',
    cuteCat: 'https://assets2.lottiefiles.com/packages/lf20_yzoqyyqf.json',
    sleepyCat: 'https://assets9.lottiefiles.com/packages/lf20_tll0j4bb.json',
    panda: 'https://assets6.lottiefiles.com/packages/lf20_4j5xmwtb.json',
    bunny: 'https://assets3.lottiefiles.com/packages/lf20_kyu0wwlr.json',
    
    // Effects
    celebration: 'https://assets2.lottiefiles.com/packages/lf20_rovf9gzu.json',
    confetti: 'https://assets1.lottiefiles.com/packages/lf20_u4yrau.json',
    stars: 'https://assets9.lottiefiles.com/packages/lf20_obhph3sh.json',
    hearts: 'https://assets4.lottiefiles.com/packages/lf20_6uxwprps.json',
    sparkle: 'https://assets10.lottiefiles.com/packages/lf20_fJ7CVd.json',
    
    // Cảm xúc
    happy: 'https://assets3.lottiefiles.com/packages/lf20_v1yudlrx.json',
    sad: 'https://assets5.lottiefiles.com/packages/lf20_qwl4gi2d.json',
};

export type PetState = 'idle' | 'happy' | 'excited' | 'sad' | 'sleeping' | 'eating' | 'playing';

interface AnimatedPetProps {
    petEmoji?: string;
    petName?: string;
    level?: number;
    points?: number;
    maxPoints?: number;
    state?: PetState;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showEffects?: boolean;
    onPetClick?: () => void;
    className?: string;
}

export default function AnimatedPet({
    petEmoji = '🐕',
    petName = 'Pet',
    level = 1,
    points = 0,
    maxPoints = 100,
    state = 'idle',
    size = 'lg',
    showEffects = true,
    onPetClick,
    className = '',
}: AnimatedPetProps) {
    const [animationData, setAnimationData] = useState<Record<string, object>>({});
    const [currentState, setCurrentState] = useState<PetState>(state);
    const [showCelebration, setShowCelebration] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);
    const [bounceCount, setBounceCount] = useState(0);

    // Size classes
    const sizeClasses = {
        sm: 'w-24 h-24',
        md: 'w-32 h-32',
        lg: 'w-48 h-48',
        xl: 'w-64 h-64',
    };

    const petSizeClasses = {
        sm: 'text-4xl',
        md: 'text-5xl',
        lg: 'text-7xl',
        xl: 'text-8xl',
    };

    // Load animations
    useEffect(() => {
        const loadAnimation = async (key: string, url: string) => {
            try {
                const res = await fetch(url);
                const data = await res.json();
                setAnimationData(prev => ({ ...prev, [key]: data }));
            } catch (e) {
                console.warn(`Failed to load animation: ${key}`);
            }
        };

        // Load effects
        loadAnimation('celebration', ANIMATIONS.celebration);
        loadAnimation('hearts', ANIMATIONS.hearts);
        loadAnimation('stars', ANIMATIONS.stars);
    }, []);

    // Auto state based on points
    useEffect(() => {
        const ratio = points / maxPoints;
        if (ratio >= 0.8) {
            setCurrentState('excited');
        } else if (ratio >= 0.5) {
            setCurrentState('happy');
        } else if (ratio >= 0.2) {
            setCurrentState('idle');
        } else {
            setCurrentState('sad');
        }
    }, [points, maxPoints]);

    // Override with prop state
    useEffect(() => {
        if (state !== 'idle') {
            setCurrentState(state);
        }
    }, [state]);

    // Handle pet click interaction
    const handlePetClick = useCallback(() => {
        setIsInteracting(true);
        setBounceCount(prev => prev + 1);
        
        // Show celebration effect
        if (showEffects) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 2000);
        }

        setTimeout(() => setIsInteracting(false), 500);
        onPetClick?.();
    }, [onPetClick, showEffects]);

    // Get pet animation class based on state
    const getPetAnimationClass = () => {
        switch (currentState) {
            case 'excited':
                return 'animate-bounce';
            case 'happy':
                return 'animate-pulse';
            case 'sad':
                return 'opacity-70';
            case 'sleeping':
                return 'animate-pulse opacity-60';
            case 'eating':
                return 'animate-wiggle';
            case 'playing':
                return 'animate-spin-slow';
            default:
                return 'animate-float';
        }
    };

    // Pet mood face based on state
    const getMoodIndicator = () => {
        switch (currentState) {
            case 'excited':
                return '✨';
            case 'happy':
                return '💖';
            case 'sad':
                return '💧';
            case 'sleeping':
                return '💤';
            case 'eating':
                return '🍖';
            case 'playing':
                return '🎾';
            default:
                return '';
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Main pet container */}
            <div 
                className={`${sizeClasses[size]} relative cursor-pointer transform transition-all duration-300 hover:scale-110`}
                onClick={handlePetClick}
            >
                {/* Background glow effect */}
                <div className={`absolute inset-0 rounded-full blur-xl opacity-30 ${
                    currentState === 'excited' ? 'bg-yellow-400 animate-pulse' :
                    currentState === 'happy' ? 'bg-pink-400' :
                    currentState === 'sad' ? 'bg-blue-400' :
                    'bg-purple-400'
                }`} />

                {/* Pet emoji with animations */}
                <div className={`
                    absolute inset-0 flex items-center justify-center
                    ${petSizeClasses[size]}
                    ${getPetAnimationClass()}
                    ${isInteracting ? 'scale-125' : ''}
                    transition-transform duration-200
                `}>
                    {petEmoji}
                </div>

                {/* Mood indicator */}
                {getMoodIndicator() && (
                    <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
                        {getMoodIndicator()}
                    </div>
                )}

                {/* Level badge */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        Lv.{level}
                    </div>
                </div>

                {/* Celebration effect */}
                {showCelebration && animationData.celebration && (
                    <div className="absolute inset-0 -m-8 pointer-events-none">
                        <Lottie
                            animationData={animationData.celebration}
                            loop={false}
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                )}

                {/* Hearts effect when happy */}
                {currentState === 'happy' && showEffects && animationData.hearts && (
                    <div className="absolute -top-4 -right-4 w-16 h-16 pointer-events-none opacity-70">
                        <Lottie
                            animationData={animationData.hearts}
                            loop
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                )}

                {/* Stars effect when excited */}
                {currentState === 'excited' && showEffects && animationData.stars && (
                    <div className="absolute inset-0 -m-4 pointer-events-none">
                        <Lottie
                            animationData={animationData.stars}
                            loop
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                )}
            </div>

            {/* Pet name */}
            {petName && (
                <div className="text-center mt-2">
                    <span className="text-sm font-medium text-gray-700 bg-white/80 px-3 py-1 rounded-full">
                        {petName}
                    </span>
                </div>
            )}

            {/* Points bar */}
            <div className="mt-3 w-full max-w-[150px] mx-auto">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 rounded-full ${
                            currentState === 'excited' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                            currentState === 'happy' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                            currentState === 'sad' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                            'bg-gradient-to-r from-purple-400 to-pink-500'
                        }`}
                        style={{ width: `${Math.min(100, (points / maxPoints) * 100)}%` }}
                    />
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">
                    {points}/{maxPoints} XP
                </p>
            </div>

            {/* Interaction feedback */}
            {bounceCount > 0 && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
                    <span className="text-2xl animate-ping">💕</span>
                </div>
            )}
        </div>
    );
}

// Custom CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    
    @keyframes wiggle {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-5deg); }
        75% { transform: rotate(5deg); }
    }
    
    @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .animate-float {
        animation: float 3s ease-in-out infinite;
    }
    
    .animate-wiggle {
        animation: wiggle 0.5s ease-in-out infinite;
    }
    
    .animate-spin-slow {
        animation: spin-slow 3s linear infinite;
    }
`;
document.head.appendChild(styleSheet);
