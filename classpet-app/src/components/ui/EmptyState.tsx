import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            {icon && <div className="text-gray-300 mb-4">{icon}</div>}
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            {description && <p className="text-gray-500 text-center max-w-sm mb-6">{description}</p>}
            {action && (
                <Button onClick={action.onClick}>{action.label}</Button>
            )}
        </div>
    );
}

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({
    title = 'Something went wrong',
    message = 'An error occurred while loading the data.',
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 text-center max-w-sm mb-6">{message}</p>
            {onRetry && (
                <Button onClick={onRetry} variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />}>
                    Try Again
                </Button>
            )}
        </div>
    );
}
