import React from 'react';

export interface FilterState {
	// Updated filter keys including new ones
	sunExposure: string[];
	foliageType: string[];
	lifespan: string[];
	zones: string[];
	departments: string[];
	botanicalNames: string[];
	searchQuery: string;
	winterizing: string[];
	carNative: string[];
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

	// Toggle mechanism for array-based filters 
	const toggleFilter = (key: keyof FilterState, value: string) => {
		const current = filters[key] as string[];
		setFilters({
			...filters,
			[key]: current.includes(value) ? current.filter(v => v !== value) : [...current, value]
		});
	};

	// Options for winterizing and updated sun exposure
	const sunOptions = [
		{ label: 'Melting Sun', value: 'MeltingSun' },
		{ label: 'Full Sun', value: 'Full' },
		{ label: 'Partial Sun', value: 'Partial' },
		{ label: 'Shade', value: 'Shade' }
	];
	const winterizingOptions = [
		'Evergreen', 'Deciduous', 'Semi-Evergreen', 'Perennial', 'Tender Perennial',
		'Perennial Evergreen', 'Perennial Semi-Evergreen', 'Tropical', 'Annual',
		'Variable', 'Perennial/Winter Annual', 'Winter Annual'
	];
	const carNativeOptions = [
		'1', // Carolina Native
		'0'  // Not Carolina Native
	];

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
			{/* Sun Exposure Filter */}
			<div className="mb-4">
				<label className="block font-medium mb-1">Sun Exposure</label>
				<div className="flex flex-wrap gap-2">
					{sunOptions.map(option => (
						<button
							key={option.value}
							onClick={() => toggleFilter('sunExposure', option.value)}
							className={`px-3 py-1 border rounded ${
								filters.sunExposure.includes(option.value)
									? 'bg-blue-600 text-white'
									: 'bg-white text-gray-600'
							}`}
						>
							{option.label}
						</button>
					))}
				</div>
			</div>
			{/* Winterizing Filter */}
			<div className="mb-4">
				<label className="block font-medium mb-1">Winterizing Habit</label>
				<div className="flex flex-wrap gap-2">
					{winterizingOptions.map(option => (
						<button
							key={option}
							onClick={() => toggleFilter('winterizing', option)}
							className={`px-3 py-1 border rounded text-xs ${
								filters.winterizing.includes(option)
									? 'bg-green-600 text-white'
									: 'bg-white text-gray-600'
							}`}
						>
							{option}
						</button>
					))}
				</div>
			</div>
			{/* CarNative Filter */}
			<div className="mb-4">
				<label className="block font-medium mb-1">Carolina Native</label>
				<div className="flex flex-wrap gap-2">
					{carNativeOptions.map(option => (
						<button
							key={option}
							onClick={() => toggleFilter('carNative', option)}
							className={`px-3 py-1 border rounded ${
								filters.carNative.includes(option)
									? 'bg-purple-600 text-white'
									: 'bg-white text-gray-600'
							}`}
						>
							{option === '1' ? 'Native' : 'Not Native'}
						</button>
					))}
				</div>
			</div>
			{/* ...other filters can be implemented similarly... */}
		</aside>
	);
};

export default PlantSearchFilterPanel;
