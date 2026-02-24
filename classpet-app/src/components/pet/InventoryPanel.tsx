import { Package } from 'lucide-react';

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

interface InventoryPanelProps {
    inventory: InventoryItem[];
    onFeed: (item: InventoryItem) => void;
    loading?: boolean;
    emptyMessage?: string;
    compact?: boolean;
}

export default function InventoryPanel({
    inventory,
    onFeed,
    loading = false,
    emptyMessage = "Túi đồ trống!",
    compact = false,
}: InventoryPanelProps) {
    if (inventory.length === 0) {
        return (
            <div className={`bg-white/80 rounded-2xl ${compact ? 'p-3' : 'p-6'} shadow text-center`}>
                <div className={`${compact ? 'text-3xl' : 'text-5xl'} mb-2`}>🎒</div>
                <p className="text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="bg-white/80 rounded-2xl p-4 shadow">
            <div className="flex items-center gap-2 mb-4">
                <Package className="text-purple-500" size={compact ? 18 : 22} />
                <span className={`font-bold text-gray-700 ${compact ? 'text-sm' : 'text-base'}`}>
                    Túi đồ ({inventory.length})
                </span>
            </div>

            <div className={`grid ${compact ? 'grid-cols-4 gap-2' : 'grid-cols-3 gap-3'}`}>
                {inventory.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onFeed(item)}
                        disabled={loading || item.quantity <= 0}
                        className={`
                            relative group
                            bg-gradient-to-br from-amber-50 to-orange-50
                            hover:from-amber-100 hover:to-orange-100
                            border-2 border-amber-200 hover:border-amber-400
                            rounded-xl transition-all duration-200
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${compact ? 'p-2' : 'p-3'}
                            ${loading ? 'animate-pulse' : ''}
                        `}
                        title={`${item.pet_food.name}\n🍖 +${item.pet_food.hunger_restore} | 💖 +${item.pet_food.happiness_boost}`}
                    >
                        {/* Food emoji */}
                        <div className={`${compact ? 'text-2xl' : 'text-3xl'} mb-1 group-hover:scale-110 transition-transform`}>
                            {item.pet_food.emoji}
                        </div>

                        {/* Food name */}
                        {!compact && (
                            <p className="text-xs text-gray-600 font-medium truncate">
                                {item.pet_food.name}
                            </p>
                        )}

                        {/* Quantity badge */}
                        <div className={`
                            absolute -top-2 -right-2
                            bg-gradient-to-r from-purple-500 to-pink-500
                            text-white font-bold rounded-full
                            min-w-6 h-6 flex items-center justify-center
                            shadow-lg text-xs px-1.5
                        `}>
                            {item.quantity}
                        </div>

                        {/* Hover tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                            <div className="bg-gray-800 text-white text-xs rounded-lg py-1.5 px-3 whitespace-nowrap shadow-xl">
                                <p className="font-medium">{item.pet_food.name}</p>
                                <p className="text-gray-300">
                                    🍖 +{item.pet_food.hunger_restore} | 💖 +{item.pet_food.happiness_boost}
                                </p>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800" />
                        </div>
                    </button>
                ))}
            </div>

            {/* Instructions */}
            {!compact && (
                <p className="text-xs text-gray-400 mt-3 text-center">
                    👆 Bấm vào đồ ăn để cho pet ăn
                </p>
            )}
        </div>
    );
}
