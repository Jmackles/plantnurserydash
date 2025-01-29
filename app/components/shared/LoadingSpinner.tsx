import React from 'react';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    size = 'medium',
    color = 'sage',
    className = ''
}) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    const colorClasses = {
        sage: 'border-sage-600',
        gray: 'border-gray-600',
        white: 'border-white'
    };

    return (
        <div className="flex justify-center items-center w-full h-full min-h-[100px]">
            <div
                className={`
                    ${sizeClasses[size]}
                    ${colorClasses[color as keyof typeof colorClasses] || 'border-sage-600'}
                    border-4
                    border-t-transparent
                    rounded-full
                    animate-spin
                    opacity-0
                    animate-fade-in
                    ${className}
                `}
                role="status"
                aria-label="Loading"
            />
        </div>
    );
};
