import React, { useState } from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseEnter = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: rect.left + (rect.width / 2),
            y: rect.top - 10
        });
        setIsVisible(true);
    };

    return (
        <div 
            className={`relative inline-block ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div
                    className="fixed z-[9999] pointer-events-none"
                    style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <div className="bg-gray-900/95 text-white px-4 py-2 rounded-lg shadow-xl 
                                backdrop-blur-sm border border-gray-700/50 
                                animate-fade-in max-w-[300px] text-sm leading-relaxed">
                        {content}
                        <div className="absolute left-1/2 bottom-0 w-3 h-3 bg-gray-900/95 
                                    transform -translate-x-1/2 translate-y-1/2 rotate-45 
                                    border-r border-b border-gray-700/50"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tooltip;
