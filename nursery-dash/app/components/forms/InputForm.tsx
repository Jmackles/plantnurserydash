'use client'

import React, { useState } from 'react';
import { FormData, ApiResponse } from '../../lib/types';

const InputForm = ({ onSubmit, onClose }: { onSubmit: (formData: FormData) => Promise<ApiResponse>, onClose: () => void }) => {
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        initial: '',
        notes: '',
        plants: [],
    });
    const [errors, setErrors] = useState({ firstName: false, lastName: false, initial: false });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddPlant = () => {
        setFormData({
            ...formData,
            plants: [...formData.plants, { name: '', size: '', quantity: 1 }],
        });
    };

    const handlePlantChange = (index: number, field: keyof Plant, value: string | number) => {
        const updatedPlants = [...formData.plants];
        updatedPlants[index] = { ...updatedPlants[index], [field]: value };
        setFormData({ ...formData, plants: updatedPlants });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors = {
            firstName: !formData.firstName,
            lastName: !formData.lastName,
            initial: !formData.initial,
        };
        setErrors(newErrors);

        if (Object.values(newErrors).some(Boolean)) return;

        try {
            const res = await onSubmit(formData);

            if (!res || typeof res !== 'object') {
                throw new Error('No response received or invalid response from the server.');
            }

            if (res.conflict) {
                const confirmUseExisting = window.confirm(res.message || 'Conflict detected. Use existing customer?');
                if (confirmUseExisting) {
                    formData.spokenTo = `${formData.firstName} ${formData.lastName}`;
                    formData.customer_id = res.customer?.id;
                    const finalRes = await onSubmit(formData);

                    if (!finalRes || !finalRes.success) {
                        throw new Error('Failed to submit form for the existing customer.');
                    }
                } else {
                    // alert('Customer creation aborted.');
                }
            } else if (!res.success) {
                throw new Error(res.error || 'Failed to submit form.');
            } else {
                alert('Form submitted successfully!');
                onClose();
            }
        } catch (error) {
            console.error('Error during submission:', (error as Error).message || error);
            alert((error as Error).message || 'An unexpected error occurred during form submission.');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
                <form onSubmit={handleSubmit} className="card-section max-w-2xl mx-auto">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="form-label">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="First Name"
                                className={`input-field ${errors.firstName ? 'border-red-400' : ''}`}
                            />
                            {errors.firstName && <p className="text-red-500 text-sm mt-1">First name is required.</p>}
                        </div>
                        <div>
                            <label className="form-label">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Last Name"
                                className={`input-field ${errors.lastName ? 'border-red-400' : ''}`}
                            />
                            {errors.lastName && <p className="text-red-500 text-sm mt-1">Last name is required.</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="form-label">Phone</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Phone"
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="form-label">Initial</label>
                        <input
                            type="text"
                            name="initial"
                            value={formData.initial}
                            onChange={handleChange}
                            placeholder="Initial"
                            className={`input-field ${errors.initial ? 'border-red-400' : ''}`}
                        />
                        {errors.initial && <p className="text-red-500 text-sm mt-1">Initial is required.</p>}
                    </div>

                    <div className="mb-6">
                        <label className="form-label">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Notes"
                            className="input-field min-h-[100px]"
                        ></textarea>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <label className="form-label m-0">Plants</label>
                            <button type="button" onClick={handleAddPlant} className="btn-secondary">
                                Add Plant
                            </button>
                        </div>
                        
                        {formData.plants.map((plant, index) => (
                            <div key={index} className="p-4 mb-4 bg-sage-50 rounded-lg border border-sage-200">
                                <div className="grid grid-cols-3 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Plant Name"
                                        value={plant.name}
                                        onChange={(e) => handlePlantChange(index, 'name', e.target.value)}
                                        className="input-field"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Size"
                                        value={plant.size}
                                        onChange={(e) => handlePlantChange(index, 'size', e.target.value)}
                                        className="input-field"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Quantity"
                                        value={plant.quantity}
                                        onChange={(e) => handlePlantChange(index, 'quantity', parseInt(e.target.value))}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" className="btn-primary">
                            Submit
                        </button>
                    </div>
                </form>
                <button
                    className="absolute top-2 right-2 text-gray-600"
                    onClick={onClose}
                >
                    X
                </button>
            </div>
        </div>
    );
};

export default InputForm;
