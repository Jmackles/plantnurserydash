import { useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`toast toast-${type} animate-fade-in-up`}>
            {message}
            <button 
                onClick={onClose}
                className="ml-4 text-white/80 hover:text-white transition-colors"
            >
                ×
            </button>
        </div>
    );
};
