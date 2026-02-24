import { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import type { LottieRefCurrentProps } from 'lottie-react';

// Các animation URL từ LottieFiles - đã test và hoạt động
const LOTTIE_URLS = {
    // Cute pets với nhiều động tác
    dogs: [
        'https://lottie.host/f6a6c8ab-d352-4540-9f59-7e14bf32ba99/ZwHaZVqVYF.json', // Cute puppy
        'https://assets4.lottiefiles.com/packages/lf20_syqnfe7c.json', // Running dog
        'https://assets9.lottiefiles.com/packages/lf20_xlmz9xwm.json', // Happy dog
    ],
    cats: [
        'https://lottie.host/d2c48e09-0d13-4f93-8aae-34c9d4a3d6a5/fAV4Y0HBAT.json', // Cute cat
        'https://assets2.lottiefiles.com/packages/lf20_yzoqyyqf.json', // Cat idle
        'https://assets9.lottiefiles.com/packages/lf20_tll0j4bb.json', // Sleeping cat
    ],
    rabbits: [
        'https://lottie.host/a8d12c5c-93f3-4a55-9d0c-21ebbd1e27a3/sF6Kh3jtJy.json', // Bunny
        'https://assets3.lottiefiles.com/packages/lf20_kyu0wwlr.json', // Hopping bunny
    ],
    bears: [
        'https://assets6.lottiefiles.com/packages/lf20_4j5xmwtb.json', // Panda
        'https://lottie.host/9ccb68d8-1a74-4c6f-b8b4-be9c2c5c9e7a/cute-bear.json',
    ],
    dragons: [
        'https://lottie.host/e997cd84-2ca4-4021-9a9f-ad834365bde6/6gyk0StqUs.lottie',
        'https://assets1.lottiefiles.com/packages/lf20_xiixj2cu.json', // Flying dragon
    ],
    foxes: [
        'https://lottie.host/98b7c0e2-9c12-4a57-8e61-8a9b93c4e8c7/fox.json',
    ],
    unicorns: [
        'https://assets5.lottiefiles.com/packages/lf20_qzr7frm3.json', // Unicorn
    ],
    // Effects
    effects: {
        hearts: 'https://assets4.lottiefiles.com/packages/lf20_6uxwprps.json',
        stars: 'https://assets9.lottiefiles.com/packages/lf20_obhph3sh.json',
        sparkle: 'https://assets10.lottiefiles.com/packages/lf20_fJ7CVd.json',
        confetti: 'https://assets1.lottiefiles.com/packages/lf20_u4yrau.json',
        celebration: 'https://assets2.lottiefiles.com/packages/lf20_rovf9gzu.json',
        levelUp: 'https://assets3.lottiefiles.com/packages/lf20_touohxv0.json',
    },
};

// Fallback emojis
const FALLBACK_EMOJIS: Record<string, string> = {
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

// Map pet type to animation URL
const getPetAnimationUrl = (petType: string): string | null => {
    const type = petType.toLowerCase();
    if (type.includes('dog') || type.includes('puppy')) {
        return LOTTIE_URLS.dogs[Math.floor(Math.random() * LOTTIE_URLS.dogs.length)];
    }
    if (type.includes('cat') || type.includes('kitty')) {
        return LOTTIE_URLS.cats[Math.floor(Math.random() * LOTTIE_URLS.cats.length)];
    }
    if (type.includes('rabbit') || type.includes('bunny')) {
        return LOTTIE_URLS.rabbits[0];
    }
    if (type.includes('bear') || type.includes('panda')) {
        return LOTTIE_URLS.bears[0];
    }
    if (type.includes('dragon')) {
        return LOTTIE_URLS.dragons[0];
    }
    if (type.includes('fox')) {
        return LOTTIE_URLS.foxes[0];
    }
    if (type.includes('unicorn')) {
        return LOTTIE_URLS.unicorns[0];
    }
    return null;
};

interface PetAvatarProps {
    petType?: string;
    petEmoji?: string;
    level?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showLevel?: boolean;
    showEffects?: boolean;
    isHungry?: boolean;
    isAnimating?: boolean;
    onClick?: () => void;
    className?: string;
}

export default function PetAvatar({
    petType = 'Dog',
    petEmoji,
    level = 1,
    size = 'md',
    showLevel = true,
    showEffects = true,
    isHungry = false,
    isAnimating = false,
    onClick,
    className = '',
}: PetAvatarProps) {
    const [animationData, setAnimationData] = useState<object | null>(null);
    const [effectData, setEffectData] = useState<object | null>(null);
    const [loading, setLoading] = useState(true);
    const [useFallback, setUseFallback] = useState(false);
    const lottieRef = useRef<LottieRefCurrentProps>(null);

    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
        xl: 'w-48 h-48',
    };

    const emojiSizes = {
        sm: 'text-3xl',
        md: 'text-5xl',
        lg: 'text-6xl',
        xl: 'text-8xl',
    };

    // Load pet animation
    useEffect(() => {
        const url = getPetAnimationUrl(petType);
        if (!url) {
            setUseFallback(true);
            setLoading(false);
            return;
        }

        setLoading(true);
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Failed');
                return res.json();
            })
            .then(data => {
                setAnimationData(data);
                setLoading(false);
            })
            .catch(() => {
                setUseFallback(true);
                setLoading(false);
            });
    }, [petType]);

    // Load effect for high level pets
    useEffect(() => {
        if (level >= 5 && showEffects) {
            const effectUrl = level >= 10 
                ? LOTTIE_URLS.effects.stars 
                : LOTTIE_URLS.effects.sparkle;
            
            fetch(effectUrl)
                .then(res => res.json())
                .then(setEffectData)
                .catch(() => {});
        }
    }, [level, showEffects]);

    const emoji = petEmoji || FALLBACK_EMOJIS[petType] || '🐾';

    // Render Lottie or Emoji
    const renderPet = () => {
        if (loading) {
            return (
                <div className={`${sizeClasses[size]} flex items-center justify-center`}>
                    <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
                </div>
            );
        }

        if (useFallback || !animationData) {
            // Beautiful emoji fallback with animations
            return (
                <div className={`
                    ${sizeClasses[size]} flex items-center justify-center relative
                    ${isHungry ? 'grayscale opacity-70' : ''}
                `}>
                    <span className={`
                        ${emojiSizes[size]}
                        ${isAnimating ? 'animate-bounce' : 'animate-float'}
                        ${isHungry ? '' : 'drop-shadow-lg'}
                        transition-all duration-300
                    `}>
                        {emoji}
                    </span>
                    
                    {/* Hungry indicator */}
                    {isHungry && (
                        <span className="absolute -top-1 -right-1 text-lg animate-pulse">💤</span>
                    )}
                </div>
            );
        }

        return (
            <div className={`${sizeClasses[size]} relative`}>
                <Lottie
                    lottieRef={lottieRef}
                    animationData={animationData}
                    loop
                    autoplay
                    style={{ width: '100%', height: '100%' }}
                    className={isHungry ? 'grayscale opacity-70' : ''}
                />
                
                {/* Hungry indicator */}
                {isHungry && (
                    <span className="absolute -top-1 -right-1 text-lg animate-pulse">💤</span>
                )}
            </div>
        );
    };

    return (
        <div 
            onClick={onClick}
            className={`relative inline-flex flex-col items-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
        >
            {/* Main pet container with glow effect */}
            <div className={`
                relative rounded-full p-2
                ${level >= 10 ? 'bg-gradient-to-br from-yellow-200 to-amber-300 shadow-lg shadow-yellow-400/50' : ''}
                ${level >= 5 && level < 10 ? 'bg-gradient-to-br from-purple-200 to-pink-200 shadow-lg shadow-purple-400/30' : ''}
                ${isAnimating ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
                transition-all duration-300 hover:scale-110
            `}>
                {renderPet()}

                {/* Effects overlay for high level pets */}
                {effectData && showEffects && !isHungry && (
                    <div className="absolute inset-0 pointer-events-none">
                        <Lottie
                            animationData={effectData}
                            loop
                            autoplay
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                )}
            </div>

            {/* Level badge */}
            {showLevel && (
                <div className={`
                    mt-1 px-2 py-0.5 rounded-full text-xs font-bold text-white
                    ${level >= 10 ? 'bg-gradient-to-r from-yellow-500 to-amber-600 shadow-lg' :
                      level >= 5 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                      'bg-gradient-to-r from-blue-500 to-cyan-500'}
                `}>
                    Lv.{level}
                </div>
            )}

            {/* Animation celebration effect */}
            {isAnimating && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="text-xl animate-ping">✨</span>
                </div>
            )}
        </div>
    );
}

// Styles for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
    }
    .animate-float {
        animation: float 2s ease-in-out infinite;
    }
`;
if (!document.querySelector('#pet-avatar-styles')) {
    style.id = 'pet-avatar-styles';
    document.head.appendChild(style);
}

export { LOTTIE_URLS, FALLBACK_EMOJIS };
