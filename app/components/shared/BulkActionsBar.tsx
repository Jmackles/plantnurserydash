import React from 'react';

interface BulkActionsBarProps {
    selectedCount: number;
    onClose: () => void;
    onBulkAction: (action: 'complete' | 'cancel', data: { initial: string, notes: string }) => void;
    bulkActionData: { initial: string, notes: string };
    setBulkActionData: (data: { initial: string, notes: string }) => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
    selectedCount,
    onClose,
    onBulkAction,
    bulkActionData,
    setBulkActionData
}) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="font-semibold text-lg">
                        {selectedCount} items selected
                    </span>
                    <input
                        type="text"
                        placeholder="Your Initials"
                        value={bulkActionData.initial}
                        onChange={(e) => setBulkActionData({ ...bulkActionData, initial: e.target.value })}
                        className="input-field w-24 mb-0"
                    />
                    <input
                        type="text"
                        placeholder="Notes"
                        value={bulkActionData.notes}
                        onChange={(e) => setBulkActionData({ ...bulkActionData, notes: e.target.value })}
                        className="input-field w-64 mb-0"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onBulkAction('complete', bulkActionData)} 
                        className="btn-primary bg-green-600 hover:bg-green-700"
                    >
                        Complete All Selected
                    </button>
                    <button 
                        onClick={() => onBulkAction('cancel', bulkActionData)} 
                        className="btn-primary bg-red-600 hover:bg-red-700"
                    >
                        Cancel All Selected
                    </button>
                    <button 
                        onClick={onClose} 
                        className="btn-secondary"
                    >
                        Clear Selection
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkActionsBar;
