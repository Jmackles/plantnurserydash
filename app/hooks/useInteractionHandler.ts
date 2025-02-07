import { useState, useCallback, useRef } from 'react';

interface InteractionState {
    isSelecting: boolean;
    isDragging: boolean;
    isEditing: boolean;
}

export const useInteractionHandler = (onEdit?: () => void) => {
    const [state, setState] = useState<InteractionState>({
        isSelecting: false,
        isDragging: false,
        isEditing: false,
    });
    
    const timeoutRef = useRef<NodeJS.Timeout>();
    const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const moveThreshold = 5; // pixels of movement to consider it a drag

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Store initial position
        startPosRef.current = { x: e.clientX, y: e.clientY };
        
        // Set a timeout to detect long press
        timeoutRef.current = setTimeout(() => {
            setState(prev => ({ ...prev, isSelecting: true }));
        }, 200); // 200ms threshold for considering it a potential selection
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!timeoutRef.current) return;

        const deltaX = Math.abs(e.clientX - startPosRef.current.x);
        const deltaY = Math.abs(e.clientY - startPosRef.current.y);
        
        // If moved more than threshold, consider it a drag
        if (deltaX > moveThreshold || deltaY > moveThreshold) {
            clearTimeout(timeoutRef.current);
            setState(prev => ({ ...prev, isDragging: true, isSelecting: false }));
        }
    }, []);

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        const deltaX = Math.abs(e.clientX - startPosRef.current.x);
        const deltaY = Math.abs(e.clientY - startPosRef.current.y);
        
        // Clear any pending timeouts
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // If minimal movement and quick release, trigger edit
        if (deltaX < moveThreshold && deltaY < moveThreshold && !state.isSelecting) {
            onEdit?.();
        }

        // Reset state
        setState({
            isSelecting: false,
            isDragging: false,
            isEditing: false,
        });
    }, [onEdit, state.isSelecting]);

    const handleMouseLeave = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setState({
            isSelecting: false,
            isDragging: false,
            isEditing: false,
        });
    }, []);

    return {
        handlers: {
            onMouseDown: handleMouseDown,
            onMouseMove: handleMouseMove,
            onMouseUp: handleMouseUp,
            onMouseLeave: handleMouseLeave,
        },
        state,
    };
};
