import React from 'react';

const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-2/3 relative">
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
