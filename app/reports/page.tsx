'use client';
import React, { useState, useEffect } from 'react';
import { fetchWantListEntries } from './../lib/api';  // Update this path
import { WantListEntry, Plant } from '../lib/types';

const Reports = () => {
    const [wantListEntries, setWantListEntries] = useState<WantListEntry[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredEntries, setFilteredEntries] = useState<WantListEntry[]>([]);
    const [plantReport, setPlantReport] = useState<Record<string, { size: string; quantity: number, details: Plant }[]>>({});
    const [sortField, setSortField] = useState<'name' | 'quantity'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const entries = await fetchWantListEntries();
                setWantListEntries(entries);
            } catch (err) {
                console.error('Error fetching want list entries:', err);
                setError('Failed to fetch data. Please try again later.');
            }
        };

        fetchEntries();
    }, []);

    const handleFilter = () => {
        const filtered = wantListEntries.filter((entry) => {
            const entryDate = new Date(entry.created_at);
            return (!startDate || entryDate >= new Date(startDate)) && (!endDate || entryDate <= new Date(endDate));
        });
        setFilteredEntries(filtered);
        generatePlantReport(filtered);
    };

    const generatePlantReport = (entries: WantListEntry[]) => {
        const report: Record<string, { size: string; quantity: number, details: Plant }[]> = {};

        entries.forEach((entry) => {
            entry.plants.forEach((plant) => {
                const plantName = plant.name.toLowerCase();
                if (!report[plantName]) {
                    report[plantName] = [];
                }
                const existingPlant = report[plantName].find((p) => p.size === plant.size);
                const plantDetails: Plant = {
                    ...plant,
                    botanical: plant.botanical,
                    price: plant.price,
                    matureSize: plant.matureSize,
                    growthRate: plant.growthRate,
                    deerResistance: plant.deerResistance,
                    sun: plant.sun,
                    shade: plant.shade,
                    native: plant.native
                };
                if (existingPlant) {
                    existingPlant.quantity += plant.quantity;
                } else {
                    report[plantName].push({ size: plant.size, quantity: plant.quantity, details: plantDetails });
                }
            });
        });

        setPlantReport(report);
    };

    const handlePrint = () => {
        const reportContent = document.getElementById('report-content');
        if (reportContent) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Plant Report</title></head><body>');
                printWindow.document.write(reportContent.outerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    const handleExportCSV = () => {
        const csvRows = [
            ['Plant Name', 'Size', 'Quantity Requested', 'Botanical Name', 'Price', 'Mature Size', 'Growth Rate', 'Deer Resistance', 'Sun', 'Shade', 'Native'],
            ...Object.entries(plantReport).flatMap(([plantName, sizes]) =>
                sizes.map((sizeInfo) => [
                    plantName,
                    sizeInfo.size,
                    sizeInfo.quantity,
                    sizeInfo.details.botanical,
                    sizeInfo.details.price,
                    sizeInfo.details.matureSize,
                    sizeInfo.details.growthRate,
                    sizeInfo.details.deerResistance,
                    sizeInfo.details.sun === 1 ? 'Yes' : 'No',
                    sizeInfo.details.shade === 1 ? 'Yes' : 'No',
                    sizeInfo.details.native === 1 ? 'Yes' : 'No'
                ])
            ),
        ];

        const csvContent = csvRows.map((row) => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plant_report.csv';
        a.click();
        URL.revokeObjectURL(url);
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

    if (error) {
        return <div className="p-6 max-w-7xl mx-auto text-red-600">{error}</div>;
    }

    return (
        <main className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-sage-700 mb-8">Reports</h1>
            <div className="flex flex-wrap gap-4 mb-4">
                <div>
                    <label className="form-label">Start Date:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="input-field"
                    />
                </div>
                <div>
                    <label className="form-label">End Date:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="input-field"
                    />
                </div>
                <div className="flex items-end">
                    <button onClick={handleFilter} className="btn-primary mr-2">
                        Filter
                    </button>
                    <button onClick={handlePrint} className="btn-secondary mr-2">
                        Print
                    </button>
                    <button onClick={handleExportCSV} className="btn-secondary">
                        Export CSV
                    </button>
                </div>
            </div>
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
            <div id="report-content" className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Plant Name</th>
                            <th className="py-2 px-4 border-b">Size</th>
                            <th className="py-2 px-4 border-b">Quantity Requested</th>
                            <th className="py-2 px-4 border-b">Botanical Name</th>
                            <th className="py-2 px-4 border-b">Price</th>
                            <th className="py-2 px-4 border-b">Mature Size</th>
                            <th className="py-2 px-4 border-b">Growth Rate</th>
                            <th className="py-2 px-4 border-b">Deer Resistance</th>
                            <th className="py-2 px-4 border-b">Sun</th>
                            <th className="py-2 px-4 border-b">Shade</th>
                            <th className="py-2 px-4 border-b">Native</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPlantReport.length > 0 ? (
                            sortedPlantReport.map(([plantName, sizes]) =>
                                sizes.map((sizeInfo, index) => (
                                    <tr key={`${plantName}-${sizeInfo.size}-${index}`}>
                                        <td className="py-2 px-4 border-b">{plantName.charAt(0).toUpperCase() + plantName.slice(1)}</td>
                                        <td className="py-2 px-4 border-b">{sizeInfo.size}</td>
                                        <td className="py-2 px-4 border-b">{sizeInfo.quantity}</td>
                                        <td className="py-2 px-4 border-b">{sizeInfo.details.botanical}</td>
                                        <td className="py-2 px-4 border-b">{sizeInfo.details.price}</td>
                                        <td className="py-2 px-4 border-b">{sizeInfo.details.matureSize}</td>
                                        <td className="py-2 px-4 border-b">{sizeInfo.details.growthRate}</td>
                                        <td className="py-2 px-4 border-b">{sizeInfo.details.deerResistance}</td>
                                        <td className="py-2 px-4 border-b">{sizeInfo.details.sun === 1 ? 'Yes' : 'No'}</td>
                                        <td className="py-2 px-4 border-b">{sizeInfo.details.shade === 1 ? 'Yes' : 'No'}</td>
                                        <td className="py-2 px-4 border-b">{sizeInfo.details.native === 1 ? 'Yes' : 'No'}</td>
                                    </tr>
                                ))
                            )
                        ) : (
                            <tr>
                                <td colSpan={11} className="py-4 text-center text-gray-500">
                                    No data available for the selected range.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
};

export default Reports;
