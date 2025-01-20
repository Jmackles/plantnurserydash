'use client'
import React, { useState, useEffect } from 'react';
import { fetchWantListEntries } from '../lib/api';
import { WantListEntry } from '../lib/types';

const Reports = () => {
    const [wantListEntries, setWantListEntries] = useState<WantListEntry[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredEntries, setFilteredEntries] = useState<WantListEntry[]>([]);
    const [plantReport, setPlantReport] = useState<{ [key: string]: { size: string, quantity: number }[] }>({});
    const [sortField, setSortField] = useState<'name' | 'quantity'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const entries = await fetchWantListEntries();
                setWantListEntries(entries);
            } catch (error) {
                console.error('Error fetching want list entries:', error);
            }
        };

        fetchEntries();
    }, []);

    const handleFilter = () => {
        const filtered = wantListEntries.filter(entry => {
            const entryDate = new Date(entry.created_at);
            return (!startDate || entryDate >= new Date(startDate)) && (!endDate || entryDate <= new Date(endDate));
        });
        setFilteredEntries(filtered);
        generatePlantReport(filtered);
    };

    const generatePlantReport = (entries: WantListEntry[]) => {
        const report: { [key: string]: { size: string, quantity: number }[] } = {};

        entries.forEach(entry => {
            entry.plants.forEach(plant => {
                if (!report[plant.name]) {
                    report[plant.name] = [];
                }
                const existingPlant = report[plant.name].find(p => p.size === plant.size);
                if (existingPlant) {
                    existingPlant.quantity += plant.quantity;
                } else {
                    report[plant.name].push({ size: plant.size, quantity: plant.quantity });
                }
            });
        });

        setPlantReport(report);
    };

    const handlePrint = () => {
        window.print();
    };

    const sortedPlantReport = Object.entries(plantReport).sort(([nameA, sizesA], [nameB, sizesB]) => {
        if (sortField === 'name') {
            return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        } else {
            const totalQuantityA = sizesA.reduce((sum, size) => sum + size.quantity, 0);
            const totalQuantityB = sizesB.reduce((sum, size) => sum + size.quantity, 0);
            return sortOrder === 'asc' ? totalQuantityA - totalQuantityB : totalQuantityB - totalQuantityA;
        }
    });

    return (
        <main className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-sage-700 mb-8">Reports</h1>
            <div className="mb-4">
                <label className="form-label">Start Date:</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field"
                />
            </div>
            <div className="mb-4">
                <label className="form-label">End Date:</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field"
                />
            </div>
            <button onClick={handleFilter} className="btn-primary mb-4">Filter</button>
            <button onClick={handlePrint} className="btn-secondary mb-4 ml-2">Print</button>
            <div className="mb-4">
                <label className="form-label">Sort by:</label>
                <select value={sortField} onChange={(e) => setSortField(e.target.value as 'name' | 'quantity')} className="input-field">
                    <option value="name">Plant Name</option>
                    <option value="quantity">Quantity</option>
                </select>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')} className="input-field ml-2">
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Plant Name</th>
                            <th className="py-2 px-4 border-b">Size</th>
                            <th className="py-2 px-4 border-b">Quantity Requested</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPlantReport.map(([plantName, sizes]) => (
                            sizes.map((sizeInfo, index) => (
                                <tr key={`${plantName}-${sizeInfo.size}-${index}`}>
                                    <td className="py-2 px-4 border-b">{plantName}</td>
                                    <td className="py-2 px-4 border-b">{sizeInfo.size}</td>
                                    <td className="py-2 px-4 border-b">{sizeInfo.quantity}</td>
                                </tr>
                            ))
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
};

export default Reports;
