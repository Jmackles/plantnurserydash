import React from 'react';

interface BulkActionsBarProps {
    onClose: () => void;
    onBulkClose: () => void;
    bulkCloseData: { initial: string, notes: string };
    setBulkCloseData: (data: { initial: string, notes: string }) => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({ onClose, onBulkClose, bulkCloseData, setBulkCloseData }) => {
    return (
        <div className="flex justify-between items-center">
            <div className="flex items-center">
                <input
                    type="text"
                    placeholder="Initial"
                    value={bulkCloseData.initial}
                    onChange={(e) => setBulkCloseData({ ...bulkCloseData, initial: e.target.value })}
                    className="input-field mr-2"
                />
                <input
                    type="text"
                    placeholder="Notes"
                    value={bulkCloseData.notes}
                    onChange={(e) => setBulkCloseData({ ...bulkCloseData, notes: e.target.value })}
                    className="input-field"
                />
            </div>
            <div className="flex items-center">
                <button onClick={onBulkClose} className="btn-primary mr-2">Close Selected</button>
                <button onClick={onClose} className="btn-secondary">Cancel</button>
            </div>
        </div>
    );
};

export default BulkActionsBar;
