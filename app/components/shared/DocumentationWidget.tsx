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

    const renderNote = (note: EntityNote) => (
        <div key={note.id} className={`note-item note-${note.note_type}`}>
            <div className="note-header">
                <span className="note-type">{note.note_type}</span>
                <span className="note-date">{new Date(note.created_at).toLocaleDateString()}</span>
                {note.note_type === 'memo' && !note.dismissed_at && (
                    <button onClick={() => onDismiss(note.id)}>Dismiss</button>
                )}
            </div>
            <div className="note-content">{note.note_text}</div>
            {note.children?.map(child => (
                <div key={child.id} className="note-reply">
                    {child.note_text}
                </div>
            ))}
        </div>
    );

    return (
        <div className={`documentation-widget ${className}`}>
            <div className="note-controls">
                <select 
                    value={newNoteType}
                    onChange={e => setNewNoteType(e.target.value as typeof newNoteType)}
                >
                    <option value="note">Note</option>
                    <option value="flag">Flag</option>
                    <option value="memo">Memo</option>
                    <option value="comment">Comment</option>
                </select>
                <button onClick={() => onAddDoc(newNoteType)}>Add</button>
            </div>
            <div className="notes-list">
                {docs.map(renderNote)}
            </div>
        </div>
    );
};

export default DocumentationWidget;