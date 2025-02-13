'use client'
import React, { createContext, useContext, useState, useCallback } from 'react';
import { EntityNote } from '@/app/lib/types/EntityNote';

interface DocumentationContextType {
    notes: EntityNote[];
    loadNotes: (type: string, id: number) => Promise<void>;
    addNote: (note: Partial<EntityNote>) => Promise<void>;
    dismissNote: (noteId: number) => Promise<void>;
    replyToNote: (parentId: number, text: string) => Promise<void>;
}

const DocumentationContext = createContext<DocumentationContextType>({} as DocumentationContextType);

export const DocumentationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notes, setNotes] = useState<EntityNote[]>([]);

    const loadNotes = useCallback(async (type: string, id: number) => {
        const response = await fetch(`/api/entity-notes?notable_type=${type}&notable_id=${id}`);
        if (response.ok) {
            const data = await response.json();
            setNotes(data);
        }
    }, []);

    const addNote = useCallback(async (note: Partial<EntityNote>) => {
        console.log('Adding note:', note);
        try {
            const response = await fetch('/api/entity-notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(note)
            });
            
            const responseData = await response.json();
            console.log('API response:', responseData);
            
            if (!response.ok) {
                console.error('API error:', responseData);
                throw new Error(responseData.error || 'Failed to add note');
            }
            
            setNotes(prev => [responseData, ...prev]);
            return responseData;
        } catch (error) {
            console.error('Error adding note:', error);
            throw error;
        }
    }, []);

    const dismissNote = useCallback(async (noteId: number) => {
        const response = await fetch(`/api/entity-notes/${noteId}/dismiss`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            setNotes(prev => prev.filter(note => note.id !== noteId));
        }
    }, []);

    const replyToNote = useCallback(async (parentId: number, text: string) => {
        const parentNote = notes.find(n => n.id === parentId);
        if (!parentNote) return;

        await addNote({
            notable_type: parentNote.notable_type,
            notable_id: parentNote.notable_id,
            note_type: 'comment',
            note_text: text,
            parent_note_id: parentId
        });
    }, [notes, addNote]);

    return (
        <DocumentationContext.Provider value={{ 
            notes, loadNotes, addNote, dismissNote, replyToNote 
        }}>
            {children}
        </DocumentationContext.Provider>
    );
};

export const useDocumentation = () => useContext(DocumentationContext);
