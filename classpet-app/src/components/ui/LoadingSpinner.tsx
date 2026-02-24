interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-3',
    };

    return (
        <div
            className={`animate-spin rounded-full border-indigo-600 border-t-transparent ${sizeClasses[size]} ${className}`}
        />
    );
}

// Full page loading
export function PageLoading({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-500 text-sm">{message}</p>
        </div>
    );
}

// Skeleton loader
interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
    );
}

// Card skeleton
export function CardSkeleton() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-2/3" />
        </div>
    );
}
