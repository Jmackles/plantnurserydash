import React, { useState } from 'react';
import { EntityNote } from '@/app/lib/types';

interface DocumentationWidgetProps {
    docs: EntityNote[];
    referenceType: string;
    referenceId: number;
    onAddDoc: (type: 'flag' | 'memo' | 'comment' | 'note') => void;
    onDismiss: (noteId: number) => void;
    className?: string;
}

export const DocumentationWidget: React.FC<DocumentationWidgetProps> = ({
    docs,
    referenceType,
    referenceId,
    onAddDoc,
    onDismiss,
    className = ''
}) => {
    const [newNoteType, setNewNoteType] = useState<'flag' | 'memo' | 'comment' | 'note'>('note');

    const getNoteIcon = (type: string) => {
        switch (type) {
            case 'flag':
                return '🚩';
            case 'note':
                return '📝';
            case 'comment':
                return '💬';
            case 'memo':
                return '📌';
            default:
                return '💭';
        }
    };

    return (
        <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700">Documentation</h3>
                <div className="flex gap-2">
                    <select 
                        value={newNoteType}
                        onChange={(e) => setNewNoteType(e.target.value as any)}
                        className="text-xs px-2 py-1 border rounded"
                    >
                        <option value="note">📝 Note</option>
                        <option value="flag">🚩 Flag</option>
                        <option value="alert">⚠️ Alert</option>
                        <option value="memo">📌 Memo</option>
                    </select>
                    <button
                        onClick={() => onAddDoc(newNoteType)}
                        className="text-xs px-2 py-1 bg-sage-100 text-sage-700 rounded hover:bg-sage-200"
                    >
                        Add
                    </button>
                </div>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
                {docs.map((doc) => (
                    <div 
                        key={doc.id}
                        className={`p-2 rounded text-sm ${
                            doc.note_type === 'flag' ? 'bg-yellow-50 border-yellow-200' :
                            doc.note_type === 'alert' ? 'bg-red-50 border-red-200' :
                            doc.note_type === 'memo' ? 'bg-blue-50 border-blue-200' :
                            'bg-gray-50 border-gray-200'
                        } border`}
                    >
                        <div className="flex justify-between items-start">
                            <span className="font-medium">
                                {getNoteIcon(doc.note_type)} {doc.note_type}
                            </span>
                            <button
                                onClick={() => onDismiss(doc.id)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>
                        <p className="mt-1 text-gray-600">{doc.note_text}</p>
                        <span className="text-xs text-gray-400">
                            {new Date(doc.created_at).toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocumentationWidget;