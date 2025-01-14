import React from 'react';

const Modal = ({ title, children, onClose }) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            {children}
            <button
                className="absolute top-2 right-2 text-gray-600"
                onClick={onClose}
            >
                X
            </button>
        </div>
    </div>
);

export default Modal;
