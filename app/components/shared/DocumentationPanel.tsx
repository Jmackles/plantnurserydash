'use client';

import React, { useState, useEffect } from 'react';
import { Documentation } from '@/app/lib/types';
import { fetchDocumentation, addDocumentation, updateDocumentation, deleteDocumentation } from '@/app/lib/api';

interface DocumentationPanelProps {
    entityType: string;
    entityId: number;
    onUpdate?: () => void;
}

export default function DocumentationPanel({ entityType, entityId, onUpdate }: DocumentationPanelProps) {
    const [docs, setDocs] = useState<Documentation[]>([]);
    const [newDoc, setNewDoc] = useState({ content: '', doc_type: 'note' });
    const [loading, setLoading] = useState(true);

    const loadDocs = async () => {
        try {
            const data = await fetchDocumentation(entityType, entityId);
            setDocs(data);
        } catch (error) {
            console.error('Error loading documentation:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDocs();
    }, [entityType, entityId]);

    const handleAddDoc = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addDocumentation({
                entity_type: entityType,
                entity_id: entityId,
                doc_type: newDoc.doc_type,
                content: newDoc.content
            });
            setNewDoc({ content: '', doc_type: 'note' });
            loadDocs();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error adding documentation:', error);
        }
    };

    const handleAcknowledge = async (docId: number) => {
        try {
            await updateDocumentation({ id: docId, acknowledged: true });
            loadDocs();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error acknowledging documentation:', error);
        }
    };

    const handleDelete = async (docId: number) => {
        if (!confirm('Are you sure you want to delete this documentation?')) return;
        try {
            await deleteDocumentation(docId);
            loadDocs();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error deleting documentation:', error);
        }
    };

    if (loading) return <div>Loading documentation...</div>;

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Documentation</h3>
            
            <form onSubmit={handleAddDoc} className="mb-4">
                <select
                    value={newDoc.doc_type}
                    onChange={(e) => setNewDoc({ ...newDoc, doc_type: e.target.value })}
                    className="mb-2 mr-2 p-2 border rounded"
                >
                    <option value="note">Note</option>
                    <option value="alert">Alert</option>
                    <option value="history">History</option>
                </select>
                <input
                    type="text"
                    value={newDoc.content}
                    onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                    placeholder="Add new documentation..."
                    className="w-full p-2 border rounded"
                />
                <button type="submit" className="mt-2 btn-primary">
                    Add Documentation
                </button>
            </form>

            <div className="space-y-4">
                {docs.map((doc) => (
                    <div 
                        key={doc.id} 
                        className={`p-3 rounded border ${
                            doc.doc_type === 'alert' ? 'bg-red-50 border-red-200' :
                            doc.doc_type === 'history' ? 'bg-blue-50 border-blue-200' :
                            'bg-gray-50 border-gray-200'
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="font-medium">{doc.doc_type}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                    {new Date(doc.created_at).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                {!doc.acknowledged && (
                                    <button
                                        onClick={() => handleAcknowledge(doc.id)}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Acknowledge
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(doc.id)}
                                    className="text-sm text-red-600 hover:text-red-800"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        <p className="mt-1">{doc.content}</p>
                        {doc.acknowledged && (
                            <span className="text-sm text-green-600">✓ Acknowledged</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
