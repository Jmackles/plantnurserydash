import React from 'react';

export interface FilterState {
	// Define filter keys based on usage in page.tsx
	sunExposure: string[];
	foliageType: string[];
	lifespan: string[];
	zones: string[];
	departments: string[];
	botanicalNames: string[];
	searchQuery: string;
}

interface PlantSearchFilterPanelProps {
	filters: FilterState;
	setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
	isVisible: boolean;
	toggleVisibility: () => void;
}

const PlantSearchFilterPanel: React.FC<PlantSearchFilterPanelProps> = ({
	filters,
	setFilters,
	isVisible,
	toggleVisibility
}) => {
	if (!isVisible) return null;

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFilters({ ...filters, searchQuery: e.target.value });
	};

	// Example: Toggle a sample filter for sunExposure (this can be expanded)
	const toggleSunExposure = (value: string) => {
		const current = filters.sunExposure;
		setFilters({
			...filters,
			sunExposure: current.includes(value)
				? current.filter(v => v !== value)
				: [...current, value]
		});
	};

	return (
		<aside className="w-80 p-4 border-r border-gray-200 bg-white fixed h-full overflow-y-auto">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-bold">Filters</h2>
				<button onClick={toggleVisibility} className="text-sm text-blue-600 hover:underline">
					Hide
				</button>
			</div>
			{/* Search Query Input */}
			<div className="mb-4">
				<label className="block font-medium mb-1">Search</label>
				<input 
					type="text" 
					value={filters.searchQuery} 
					onChange={handleSearchChange}
					placeholder="Search plants..."
					className="w-full p-2 border border-gray-300 rounded"
				/>
			</div>
			{/* Sample Filter for Sun Exposure */}
			<div className="mb-4">
				<label className="block font-medium mb-1">Sun Exposure</label>
				<div className="flex flex-wrap gap-2">
					{['Full', 'Partial', 'Shade'].map(option => (
						<button
							key={option}
							onClick={() => toggleSunExposure(option)}
							className={`px-3 py-1 border rounded ${
								filters.sunExposure.includes(option)
									? 'bg-blue-600 text-white'
									: 'bg-white text-gray-600'
							}`}
						>
							{option}
						</button>
					))}
				</div>
			</div>
			{/* ...other filters can be implemented similarly... */}
		</aside>
	);
};

export default PlantSearchFilterPanel;
