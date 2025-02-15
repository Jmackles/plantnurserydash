// ...existing imports...

const WantListCard: React.FC<WantListCardProps> = ({
    entry,
    customer,
    onClick,
    onSelect,
    isSelected,
    onStatusChange
}) => {
    // ...existing state...

    return (
        <div className={`relative bg-white rounded-lg shadow-md p-4 ${
            isSelected ? 'ring-2 ring-blue-500' : ''
        }`}>
            <div className="absolute top-4 left-4">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect?.(e.target.checked)}
                    className="h-5 w-5 text-blue-600"
                />
            </div>

            <div className="ml-8">
                {/* ...existing header... */}

                {/* Plants Section */}
                {entry.plants && entry.plants.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                        <h4 className="text-sm font-medium mb-2">Requested Plants:</h4>
                        <div className="space-y-2">
                            {entry.plants.map((plant, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                    <div>
                                        <span className="font-medium">{plant.name}</span>
                                        {plant.size && <span className="ml-2 text-gray-600">({plant.size})</span>}
                                    </div>
                                    <span>Qty: {plant.quantity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                {entry.status === 'pending' && (
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            onClick={() => onStatusChange?.('completed', { initial: '', notes: '' })}
                            className="btn-success"
                        >
                            Complete
                        </button>
                        <button
                            onClick={() => onStatusChange?.('canceled', { initial: '', notes: '' })}
                            className="btn-danger"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
