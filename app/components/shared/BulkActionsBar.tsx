import React from 'react';

interface BulkActionsBarProps {
    onClose: () => void;
    onBulkClose: () => void;
    bulkCloseData: { initial: string; notes: string };
    setBulkCloseData: (data: { initial: string; notes: string }) => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({ onClose, onBulkClose, bulkCloseData, setBulkCloseData }) => {
    return (
        <div className="bulk-actions-bar bg-sage-700 text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <label>
                    Initial:
                    <input
                        type="text"
                        value={bulkCloseData.initial}
                        onChange={(e) => setBulkCloseData({ ...bulkCloseData, initial: e.target.value })}
                        className="input-field ml-2"
                    />
                </label>
                <label>
                    Notes:
                    <input
                        type="text"
                        value={bulkCloseData.notes}
                        onChange={(e) => setBulkCloseData({ ...bulkCloseData, notes: e.target.value })}
                        className="input-field ml-2"
                    />
                </label>
            </div>
            <div className="flex space-x-4">
                <button onClick={onBulkClose} className="btn-primary">Bulk Close</button>
                <button onClick={onClose} className="btn-secondary">Cancel</button>
            </div>
        </div>
    );
};

export default BulkActionsBar;
