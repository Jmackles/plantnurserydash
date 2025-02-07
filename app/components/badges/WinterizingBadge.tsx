import React from 'react';

const winterizingInfo = {
    'Indoor': '🏠 Must be brought indoors for winter protection',
    'Protected': '🏕️ Needs protection (mulch, cover, etc.) to survive winter',
    'Hardy': '❄️ Can survive winter without special protection',
    'Semi-Hardy': '🌡️ May survive winter with minimal protection',
    'Tender': '🌱 Very sensitive to cold, needs indoor protection',
} as const;

type WinterizingType = keyof typeof winterizingInfo;

const WinterizingBadge = ({ type }: { type: string }) => {
    const winterType = type as WinterizingType;
    const info = winterizingInfo[winterType] || type;

    return (
        <div className="relative group">
            <span className="badge bg-blue-100 text-blue-800 group-hover:bg-blue-200 transition-colors">
                {winterType}
            </span>
            <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 bg-gray-900 text-white text-sm rounded-lg p-2 shadow-lg">
                {info}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
            </div>
        </div>
    );
};

export default WinterizingBadge;
