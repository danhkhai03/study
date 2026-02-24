import { useEffect, useState, useRef } from 'react';
import Lottie from 'lottie-react';
import type { LottieRefCurrentProps } from 'lottie-react';

// Các animation URLs từ LottieFiles (miễn phí)
const PET_ANIMATIONS = {
    // Mèo
    cat: {
        idle: 'https://lottie.host/e8a0c8a0-8b0a-4b0a-8b0a-8b0a8b0a8b0a/cat-idle.json',
        happy: 'https://assets2.lottiefiles.com/packages/lf20_yzoqyyqf.json', // Cat happy
        sad: 'https://assets5.lottiefiles.com/packages/lf20_qwl4gi2d.json', // Cat sad
        sleep: 'https://assets9.lottiefiles.com/packages/lf20_tll0j4bb.json', // Cat sleep
        celebrate: 'https://assets2.lottiefiles.com/packages/lf20_rovf9gzu.json', // Celebration
    },
    // Chó
    dog: {
        idle: 'https://assets4.lottiefiles.com/packages/lf20_syqnfe7c.json', // Dog idle
        happy: 'https://assets9.lottiefiles.com/packages/lf20_xlmz9xwm.json', // Dog happy
        sad: 'https://assets5.lottiefiles.com/packages/lf20_qwl4gi2d.json',
        sleep: 'https://assets8.lottiefiles.com/packages/lf20_lbmnplac.json', // Dog sleep
        celebrate: 'https://assets2.lottiefiles.com/packages/lf20_rovf9gzu.json',
    },
    // Thỏ
    rabbit: {
        idle: 'https://assets3.lottiefiles.com/packages/lf20_kyu0wwlr.json', // Rabbit
        happy: 'https://assets3.lottiefiles.com/packages/lf20_kyu0wwlr.json',
        sad: 'https://assets5.lottiefiles.com/packages/lf20_qwl4gi2d.json',
        sleep: 'https://assets9.lottiefiles.com/packages/lf20_tll0j4bb.json',
        celebrate: 'https://assets2.lottiefiles.com/packages/lf20_rovf9gzu.json',
    },
    // Gấu
    bear: {
        idle: 'https://assets6.lottiefiles.com/packages/lf20_4j5xmwtb.json', // Bear
        happy: 'https://assets6.lottiefiles.com/packages/lf20_4j5xmwtb.json',
        sad: 'https://assets5.lottiefiles.com/packages/lf20_qwl4gi2d.json',
        sleep: 'https://assets9.lottiefiles.com/packages/lf20_tll0j4bb.json',
        celebrate: 'https://assets2.lottiefiles.com/packages/lf20_rovf9gzu.json',
    },
    // Mặc định - cute character
    default: {
        idle: 'https://assets4.lottiefiles.com/packages/lf20_syqnfe7c.json',
        happy: 'https://assets9.lottiefiles.com/packages/lf20_xlmz9xwm.json',
        sad: 'https://assets5.lottiefiles.com/packages/lf20_qwl4gi2d.json',
        sleep: 'https://assets9.lottiefiles.com/packages/lf20_tll0j4bb.json',
        celebrate: 'https://assets2.lottiefiles.com/packages/lf20_rovf9gzu.json',
    },
};

// Các animations cute có sẵn và hoạt động tốt
const WORKING_ANIMATIONS = {
    // Cute pets
    happyDog: 'https://assets9.lottiefiles.com/packages/lf20_xlmz9xwm.json',
    cutecat: 'https://assets2.lottiefiles.com/packages/lf20_yzoqyyqf.json',
    sleepyCat: 'https://assets9.lottiefiles.com/packages/lf20_tll0j4bb.json',
    
    // Cảm xúc
    heartEyes: 'https://assets4.lottiefiles.com/packages/lf20_6uxwprps.json',
    celebration: 'https://assets2.lottiefiles.com/packages/lf20_rovf9gzu.json',
    confetti: 'https://assets1.lottiefiles.com/packages/lf20_u4yrau.json',
    stars: 'https://assets9.lottiefiles.com/packages/lf20_obhph3sh.json',
    
    // Cute characters  
    panda: 'https://assets6.lottiefiles.com/packages/lf20_4j5xmwtb.json',
    bunny: 'https://assets3.lottiefiles.com/packages/lf20_kyu0wwlr.json',
    puppy: 'https://assets4.lottiefiles.com/packages/lf20_syqnfe7c.json',
    
    // Actions
    jumping: 'https://assets8.lottiefiles.com/packages/lf20_w98qte06.json',
    dancing: 'https://assets3.lottiefiles.com/packages/lf20_v1yudlrx.json',
    waving: 'https://assets9.lottiefiles.com/packages/lf20_3vbOcw.json',
};

export type PetMood = 'idle' | 'happy' | 'sad' | 'sleep' | 'celebrate';
export type PetType = 'cat' | 'dog' | 'rabbit' | 'bear' | 'default';

interface LottiePetProps {
    petType?: PetType;
    mood?: PetMood;
    size?: number;
    className?: string;
    onComplete?: () => void;
    loop?: boolean;
    autoplay?: boolean;
    // Hoặc dùng URL trực tiếp
    animationUrl?: string;
}

export default function LottiePet({
    petType = 'default',
    mood = 'idle',
    size = 200,
    className = '',
    onComplete,
    loop = true,
    autoplay = true,
    animationUrl,
}: LottiePetProps) {
    const [animationData, setAnimationData] = useState<object | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const lottieRef = useRef<LottieRefCurrentProps>(null);

    // Lấy URL animation
    const getAnimationUrl = () => {
        if (animationUrl) return animationUrl;
        
        const petAnimations = PET_ANIMATIONS[petType] || PET_ANIMATIONS.default;
        return petAnimations[mood] || petAnimations.idle;
    };

    useEffect(() => {
        const url = getAnimationUrl();
        setLoading(true);
        setError(false);

        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load');
                return res.json();
            })
            .then((data) => {
                setAnimationData(data);
                setLoading(false);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, [petType, mood, animationUrl]);

    if (loading) {
        return (
            <div 
                className={`flex items-center justify-center ${className}`}
                style={{ width: size, height: size }}
            >
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !animationData) {
        // Fallback to emoji pet
        return (
            <div 
                className={`flex items-center justify-center text-6xl animate-bounce ${className}`}
                style={{ width: size, height: size }}
            >
                {petType === 'cat' ? '🐱' : 
                 petType === 'dog' ? '🐕' : 
                 petType === 'rabbit' ? '🐰' : 
                 petType === 'bear' ? '🐻' : '🐾'}
            </div>
        );
    }

    return (
        <div className={className} style={{ width: size, height: size }}>
            <Lottie
                lottieRef={lottieRef}
                animationData={animationData}
                loop={loop}
                autoplay={autoplay}
                onComplete={onComplete}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
}

// Export các animations có sẵn để dùng trực tiếp
export { WORKING_ANIMATIONS, PET_ANIMATIONS };

// Component đơn giản hơn với URL trực tiếp
export function SimpleLottiePet({ 
    url, 
    size = 150,
    className = '',
}: { 
    url: string; 
    size?: number;
    className?: string;
}) {
    const [animationData, setAnimationData] = useState<object | null>(null);

    useEffect(() => {
        fetch(url)
            .then(res => res.json())
            .then(setAnimationData)
            .catch(console.error);
    }, [url]);

    if (!animationData) {
        return (
            <div className={`animate-pulse bg-purple-100 rounded-full ${className}`} 
                 style={{ width: size, height: size }} />
        );
    }

    return (
        <Lottie
            animationData={animationData}
            loop
            autoplay
            style={{ width: size, height: size }}
            className={className}
        />
    );
}
